import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, TrendingUp, Heart, Brain, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { moodDB, taskDB, healthDB, reportDB } from '@/db'
import { todayKey, addDays, formatLongDate, isToday } from '@/utils/date'
import { getDaySummary } from '@/utils/schedule'
import { getHealthSummary, inferEmotionFromHealth } from '@/utils/health'
import { buildAnalysisPrompt, generateDailyReport } from '@/utils/ai'
import type { MoodRecord, DailyReport as DailyReportType } from '@/types'

interface AnnualReport {
  year: number
  totalRecords: number
  moodAvg: number
  moodDistribution: Record<number, number>
  categoryFrequency: Record<string, number>
  topEvents: string[]
  monthlyTrend: Record<string, number[]>
  insights: string[]
}

type ReportView = 'daily' | 'annual'

export default function ReportPage() {
  const [view, setView] = useState<ReportView>('daily')
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [dailyReport, setDailyReport] = useState<DailyReportType | null>(null)
  const [annualReport, setAnnualReport] = useState<AnnualReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (view === 'daily') {
      loadDailyReport()
    } else {
      generateAnnualReport()
    }
  }, [view, selectedDate])

  const loadDailyReport = async () => {
    const report = await reportDB.getByDate(selectedDate)
    setDailyReport(report || null)
  }

  const handleGenerateDailyReport = async () => {
    setGenerating(true)

    try {
      const moodRecords = await moodDB.getByDateRange(selectedDate, selectedDate)
      const tasks = await taskDB.getAll()
      const healthData = await healthDB.getByDate(selectedDate)

      const taskSummary = getDaySummary(tasks, selectedDate)
      const healthSummary = healthData ? getHealthSummary(healthData) : null
      const emotionInference = healthSummary ? inferEmotionFromHealth(healthSummary, 'life') : null

      const prompt = buildAnalysisPrompt({
        date: selectedDate,
        moodRecords,
        taskSummary: {
          busyMinutes: taskSummary.busyMinutes,
          freeMinutes: taskSummary.freeMinutes,
          focusMinutes: taskSummary.focusMinutes,
          taskCount: taskSummary.taskCount,
          nextTask: taskSummary.nextTask || undefined,
        },
        healthSummary: healthSummary || undefined,
        emotionInference: emotionInference ? {
          label: emotionInference.label,
          description: emotionInference.description,
          confidence: emotionInference.confidence,
        } : undefined,
      })

      const reportContent = await generateDailyReport(prompt)

      const newReport: DailyReportType = {
        date: selectedDate,
        content: reportContent,
        taskSummary: {
          busyMinutes: taskSummary.busyMinutes,
          freeMinutes: taskSummary.freeMinutes,
          focusMinutes: taskSummary.focusMinutes,
          taskCount: taskSummary.taskCount,
          nextTask: taskSummary.nextTask || undefined,
        },
        healthSummary: healthSummary || undefined,
        createdAt: Date.now(),
      }

      await reportDB.add(newReport)
      setDailyReport(newReport)
    } catch (error) {
      console.error('生成日报失败:', error)
    }

    setGenerating(false)
  }

  async function generateAnnualReport() {
    setLoading(true)

    try {
      const records = await moodDB.getAll()

      if (records.length === 0) {
        setAnnualReport(null)
        setLoading(false)
        return
      }

      const recordsByYear = records.reduce((acc, record) => {
        const year = new Date(record.createdAt).getFullYear()
        if (!acc[year]) acc[year] = []
        acc[year].push(record)
        return acc
      }, {} as Record<number, MoodRecord[]>)

      const latestYear = Math.max(...Object.keys(recordsByYear).map(Number))
      const yearRecords = recordsByYear[latestYear]

      const moodAvg = yearRecords.reduce((sum, r) => sum + r.mood, 0) / yearRecords.length

      const moodDistribution: Record<number, number> = {}
      for (let i = 1; i <= 5; i++) moodDistribution[i] = 0
      yearRecords.forEach(r => {
        moodDistribution[r.mood] = (moodDistribution[r.mood] || 0) + 1
      })

      const categoryFrequency: Record<string, number> = {}
      const categoryLabels: Record<string, string> = {
        'work': '工作/学业',
        'relationship': '人际关系',
        'family': '家庭/原生',
        'health': '身体健康',
        'money': '金钱/物质',
        'future': '未来规划',
        'self': '自我价值',
        'other': '其他',
      }
      yearRecords.forEach(r => {
        const label = categoryLabels[r.category] || r.category
        categoryFrequency[label] = (categoryFrequency[label] || 0) + 1
      })

      const topEvents = yearRecords
        .filter(r => r.event)
        .map(r => r.event!)
        .slice(0, 5)

      const monthlyTrend: Record<string, number[]> = {}
      yearRecords.forEach(r => {
        const month = new Date(r.createdAt).toLocaleString('zh-CN', { month: 'short' })
        if (!monthlyTrend[month]) monthlyTrend[month] = []
        monthlyTrend[month].push(r.mood)
      })

      const insights = generateInsights(yearRecords, moodAvg, categoryFrequency)

      setAnnualReport({
        year: latestYear,
        totalRecords: yearRecords.length,
        moodAvg,
        moodDistribution,
        categoryFrequency,
        topEvents,
        monthlyTrend,
        insights,
      })
    } catch (error) {
      console.error('生成报告失败:', error)
    }

    setLoading(false)
  }

  function generateInsights(records: MoodRecord[], moodAvg: number, categoryFrequency: Record<string, number>): string[] {
    const insights: string[] = []

    if (moodAvg >= 4) {
      insights.push('这一年你的整体情绪状态非常好，保持这份心态！')
    } else if (moodAvg >= 3) {
      insights.push('你的情绪状态总体平稳，有一些波动的日子是正常的。')
    } else {
      insights.push('这一年你经历了不少情绪低谷，请对自己温柔一些。')
    }

    const topCategories = Object.entries(categoryFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)

    if (topCategories.length > 0) {
      insights.push(`你最常面对的课题是：${topCategories.map(([cat]) => cat).join('、')}。`)
    }

    const sortedRecords = [...records].sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    if (sortedRecords.length >= 2) {
      const halfIndex = Math.floor(sortedRecords.length / 2)
      const firstHalf = sortedRecords.slice(0, halfIndex)
      const secondHalf = sortedRecords.slice(halfIndex)

      const firstAvg = firstHalf.reduce((sum, r) => sum + r.mood, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, r) => sum + r.mood, 0) / secondHalf.length

      if (secondAvg > firstAvg + 0.3) {
        insights.push('下半年你的情绪状态比上半年有所提升，继续加油！')
      } else if (secondAvg < firstAvg - 0.3) {
        insights.push('下半年你似乎面临了更多挑战，别忘了照顾好自己。')
      }
    }

    insights.push(`你一共记录了 ${records.length} 天的情绪，每一天都是自我觉察的见证。`)

    return insights
  }

  function getMoodLabel(mood: number): string {
    const labels: Record<number, string> = {
      1: '低落',
      2: '不太好',
      3: '一般',
      4: '不错',
      5: '很好',
    }
    return labels[mood] || ''
  }

  function getMoodColor(mood: number): string {
    const colors: Record<number, string> = {
      1: 'bg-gray-400',
      2: 'bg-orange-400',
      3: 'bg-yellow-400',
      4: 'bg-green-400',
      5: 'bg-emerald-500',
    }
    return colors[mood] || 'bg-gray-400'
  }

  const renderDailyReport = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yuji-800">
              {isToday(selectedDate) ? '今天' : formatLongDate(selectedDate)}
            </h1>
            <p className="text-sm text-yuji-500">每日觉察报告</p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('annual')}
            className="px-4 py-2 bg-yuji-50 text-yuji-700 rounded-lg hover:bg-yuji-100 transition-colors"
          >
            年度报告
          </button>
          <button
            onClick={handleGenerateDailyReport}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
            {generating ? '生成中...' : '生成报告'}
          </button>
        </div>
      </div>

      {generating ? (
        <div className="text-center py-16">
          <Zap size={48} className="mx-auto text-emerald-400 mb-4 animate-pulse" />
          <p className="text-yuji-600">AI正在分析你的数据...</p>
          <p className="text-sm text-yuji-400 mt-2">这可能需要几秒钟</p>
        </div>
      ) : dailyReport ? (
        <div className="bg-white rounded-xl border border-yuji-100 shadow-sm p-6">
          <div className="prose prose-sm max-w-none">
            <div dangerouslySetInnerHTML={{ 
              __html: dailyReport.content
                .replace(/\n/g, '<br>')
                .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-yuji-800 mt-6 mb-2">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold text-yuji-800 mt-8 mb-3">$1</h2>')
                .replace(/^\- (.*$)/gim, '<li class="ml-4 text-yuji-600">$1</li>')
                .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 text-yuji-600">$1</li>')
            }} />
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-yuji-800 mb-2">暂无今日报告</h2>
          <p className="text-yuji-500 mb-6">点击上方按钮生成AI分析报告</p>
          <p className="text-sm text-yuji-400">报告将基于你的情绪记录、时间管理和健康数据生成</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-600">忙碌时间</div>
          <div className="text-xl font-bold text-blue-700">
            {dailyReport?.taskSummary ? `${Math.round(dailyReport.taskSummary.busyMinutes / 60 * 10) / 10}h` : '-'}
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm text-green-600">专注时间</div>
          <div className="text-xl font-bold text-green-700">
            {dailyReport?.taskSummary ? `${Math.round(dailyReport.taskSummary.focusMinutes / 60 * 10) / 10}h` : '-'}
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-sm text-purple-600">任务完成</div>
          <div className="text-xl font-bold text-purple-700">
            {dailyReport?.taskSummary ? `${dailyReport.taskSummary.taskCount}个` : '-'}
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-sm text-orange-600">健康数据</div>
          <div className="text-xl font-bold text-orange-700">
            {dailyReport?.healthSummary?.hasData ? '有数据' : '暂无'}
          </div>
        </div>
      </div>
    </div>
  )

  const renderAnnualReport = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-yuji-500">生成年度报告...</div>
        </div>
      )
    }

    if (!annualReport) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setView('daily')} className="flex items-center gap-1 text-yuji-500 hover:text-yuji-700">
              <ArrowLeft size={18} />
              返回日报
            </button>
          </div>

          <div className="text-center py-16">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-xl font-bold text-yuji-800 mb-2">暂无年度报告</h2>
            <p className="text-yuji-500 mb-6">开始记录你的情绪，积累数据后年度报告会自动生成</p>
            <Link
              to="/mood"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium"
            >
              开始记录
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => setView('daily')} className="flex items-center gap-1 text-yuji-500 hover:text-yuji-700">
            <ArrowLeft size={18} />
            返回日报
          </button>
          <button
            onClick={generateAnnualReport}
            className="flex items-center gap-2 px-4 py-2 bg-yuji-50 text-yuji-700 rounded-lg hover:bg-yuji-100 transition-colors"
          >
            <RefreshCw size={16} />
            刷新报告
          </button>
        </div>

        <div className="text-center py-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-sm mb-4">
            <Calendar size={16} />
            {annualReport.year} 年度报告
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-yuji-800 mb-2">
            你的觉察之旅
          </h1>
          <p className="text-yuji-500">
            {annualReport.totalRecords} 天的情绪记录，见证你的成长
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-100">
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Heart size={18} />
              <span className="text-sm font-medium">平均心情</span>
            </div>
            <div className="text-4xl font-bold text-emerald-700">{annualReport.moodAvg.toFixed(1)}</div>
            <div className="text-sm text-emerald-500 mt-1">/ 5.0 · {getMoodLabel(Math.round(annualReport.moodAvg))}</div>
          </div>

          <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
            <div className="flex items-center gap-2 text-violet-600 mb-2">
              <Calendar size={18} />
              <span className="text-sm font-medium">记录天数</span>
            </div>
            <div className="text-4xl font-bold text-violet-700">{annualReport.totalRecords}</div>
            <div className="text-sm text-violet-500 mt-1">天</div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
          <h3 className="font-semibold text-yuji-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-yuji-500" />
            情绪分布
          </h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((mood) => {
              const count = annualReport.moodDistribution[mood] || 0
              const percentage = (count / annualReport.totalRecords) * 100
              return (
                <div key={mood} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-yuji-500">{getMoodLabel(mood)}</span>
                  <div className="flex-1 h-4 bg-yuji-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getMoodColor(mood)} rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-sm text-yuji-500 text-right">{count}天</span>
                </div>
              )
            })}
          </div>
        </div>

        {Object.keys(annualReport.categoryFrequency).length > 0 && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
            <h3 className="font-semibold text-yuji-800 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-yuji-500" />
              你关注的课题
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(annualReport.categoryFrequency)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(([category]) => (
                  <span
                    key={category}
                    className="px-3 py-1.5 bg-yuji-50 text-yuji-600 rounded-full text-sm"
                  >
                    {category}
                  </span>
                ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
          <h3 className="font-semibold text-amber-800 mb-4 flex items-center gap-2">
            <Brain size={18} />
            觉察洞察
          </h3>
          <ul className="space-y-3">
            {annualReport.insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-700 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                <span className="text-amber-700 leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
          <h3 className="font-semibold text-yuji-800 mb-4">新的一年，继续觉察</h3>
          <div className="grid gap-3">
            <Link
              to="/mood"
              className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors"
            >
              <span className="text-emerald-700 font-medium">继续记录今天的情绪</span>
              <ArrowRight size={18} className="text-emerald-500" />
            </Link>
            <Link
              to="/decision"
              className="flex items-center justify-between p-4 bg-violet-50 rounded-xl hover:bg-violet-100 transition-colors"
            >
              <span className="text-violet-700 font-medium">思考一个人生决定</span>
              <ArrowRight size={18} className="text-violet-500" />
            </Link>
          </div>
        </div>

        <div className="text-center py-6 text-sm text-yuji-400">
          <p>遇己 · {annualReport.year} 年度觉察报告</p>
          <p className="mt-1">愿你在新的一年，继续遇见真实的自己</p>
        </div>
      </div>
    )
  }

  return view === 'daily' ? renderDailyReport() : renderAnnualReport()
}
