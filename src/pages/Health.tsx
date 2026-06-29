import { useState, useEffect, useRef } from 'react'
import { Upload, Heart, Activity, Moon, Footprints, Wind, TrendingUp, TrendingDown, FileText, X, RefreshCw } from 'lucide-react'
import { healthDB } from '@/db'
import { todayKey, addDays, formatLongDate } from '@/utils/date'
import { parseHealthExport, getHealthSummary, inferEmotionFromHealth, getWeeklyHealthTrend, generateDemoHealthData } from '@/utils/health'
import { HEALTH_METRIC_META } from '@/types'
import type { DayHealthData } from '@/types'

const METRIC_KEYS: (keyof DayHealthData)[] = ['heartRate', 'stress', 'steps', 'spo2', 'exercise', 'sleep']

export default function HealthPage() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [healthData, setHealthData] = useState<DayHealthData | null>(null)
  const [weeklyData, setWeeklyData] = useState<{ date: string; data: DayHealthData }[]>([])
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [importMessage, setImportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadHealthData(selectedDate)
  }, [selectedDate])

  useEffect(() => {
    loadWeeklyData()
  }, [])

  const loadHealthData = async (date: string) => {
    const data = await healthDB.getByDate(date)
    if (data) {
      setHealthData(data)
    } else {
      setHealthData(null)
    }
  }

  const loadWeeklyData = async () => {
    const data = await healthDB.getRecentDays(7)
    setWeeklyData(data)
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImportStatus('loading')
    setImportMessage('正在解析健康数据...')

    try {
      const text = await file.text()
      const result = parseHealthExport(text)

      if (result.success && result.data) {
        await healthDB.setByDate(selectedDate, result.data)
        setImportStatus('success')
        setImportMessage('健康数据导入成功！')
        await loadHealthData(selectedDate)
        await loadWeeklyData()
      } else {
        setImportStatus('error')
        setImportMessage(result.error || '导入失败')
      }
    } catch (error) {
      setImportStatus('error')
      setImportMessage('文件读取失败')
    }

    setTimeout(() => {
      setShowImportDialog(false)
      setImportStatus('idle')
      setImportMessage('')
    }, 2000)
  }

  const handleGenerateDemo = async () => {
    const demoData = generateDemoHealthData(selectedDate)
    await healthDB.setByDate(selectedDate, demoData)
    await loadHealthData(selectedDate)
    await loadWeeklyData()
  }

  const healthSummary = healthData ? getHealthSummary(healthData) : null
  const emotionInference = healthSummary ? inferEmotionFromHealth(healthSummary, 'life') : null

  const getMetricIcon = (key: keyof DayHealthData) => {
    switch (key) {
      case 'heartRate': return Heart
      case 'stress': return Activity
      case 'steps': return Footprints
      case 'spo2': return Wind
      case 'exercise': return Activity
      case 'sleep': return Moon
      default: return Activity
    }
  }

  const getMetricValue = (key: keyof DayHealthData): string => {
    if (!healthSummary) return '-'
    
    switch (key) {
      case 'heartRate':
        return healthSummary.heartRate ? `${healthSummary.heartRate.avg} bpm` : '-'
      case 'stress':
        return healthSummary.stress ? `${healthSummary.stress.avg}` : '-'
      case 'steps':
        return healthSummary.steps ? `${healthSummary.steps.total.toLocaleString()}步` : '-'
      case 'spo2':
        return healthSummary.spo2 ? `${healthSummary.spo2.avg}%` : '-'
      case 'exercise':
        return healthSummary.exercise ? `${healthSummary.exercise.totalMinutes}分钟` : '-'
      case 'sleep':
        return healthSummary.sleep ? `${healthSummary.sleep.duration}小时` : '-'
      default:
        return '-'
    }
  }

  const weeklyTrend = getWeeklyHealthTrend(weeklyData, 'heartRate')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <TrendingDown size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yuji-800">健康数据</h1>
            <p className="text-sm text-yuji-500">{formatLongDate(selectedDate)}</p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <TrendingUp size={20} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateDemo}
            className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <RefreshCw size={16} />
            生成示例
          </button>
          <button
            onClick={() => setShowImportDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yuji-600 text-white rounded-lg hover:bg-yuji-700 transition-colors"
          >
            <Upload size={18} />
            导入数据
          </button>
        </div>
      </div>

      {emotionInference && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="text-4xl">{emotionInference.icon}</div>
            <div>
              <div className="text-lg font-bold text-yuji-800">
                情绪推断：{emotionInference.label}
              </div>
              <div className="text-sm text-yuji-600">
                {emotionInference.description}
              </div>
              <div className="mt-1">
                <div className="w-32 bg-yuji-200 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{ width: `${emotionInference.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-yuji-500 ml-2">
                  置信度 {Math.round(emotionInference.confidence * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {METRIC_KEYS.map((key) => {
          const meta = HEALTH_METRIC_META[key]
          const Icon = getMetricIcon(key)
          const value = getMetricValue(key)
          const hasData = value !== '-'

          return (
            <div
              key={key}
              className={`bg-white rounded-xl p-4 border transition-all ${
                hasData ? 'border-yuji-100 shadow-sm' : 'border-yuji-50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  key === 'heartRate' ? 'bg-red-100 text-red-600' :
                  key === 'stress' ? 'bg-orange-100 text-orange-600' :
                  key === 'steps' ? 'bg-green-100 text-green-600' :
                  key === 'spo2' ? 'bg-blue-100 text-blue-600' :
                  key === 'exercise' ? 'bg-purple-100 text-purple-600' :
                  'bg-indigo-100 text-indigo-600'
                }`}>
                  <Icon size={20} />
                </div>
                <div>
                  <div className="text-sm text-yuji-500">{meta.label}</div>
                  <div className="text-xl font-bold text-yuji-800">{value}</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-yuji-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-yuji-800 mb-4">心率周趋势</h3>
        {weeklyTrend.length > 0 ? (
          <div className="flex items-end justify-between h-48 gap-2">
            {weeklyTrend.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-gradient-to-t from-blue-400 to-blue-200 rounded-t-lg transition-all hover:from-blue-500 hover:to-blue-300"
                  style={{ height: `${Math.max(day.avg / 150 * 100, 5)}%` }}
                />
                <div className="mt-2 text-xs text-yuji-500">
                  {day.date.slice(5)}
                </div>
                <div className="text-sm font-medium text-yuji-700">
                  {day.avg > 0 ? `${day.avg} bpm` : '-'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-yuji-400">
            <Heart size={48} className="mx-auto mb-3 opacity-50" />
            <p>暂无周趋势数据</p>
            <p className="text-sm mt-1">导入健康数据后查看趋势</p>
          </div>
        )}
      </div>

      {healthData?.sleep && (
        <div className="bg-white rounded-xl border border-yuji-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-yuji-800 mb-4">睡眠详情</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-sm text-indigo-600">入睡时间</div>
              <div className="text-xl font-bold text-indigo-700">
                {Math.floor(healthData.sleep.bedtime / 60)}:{(healthData.sleep.bedtime % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-sm text-indigo-600">起床时间</div>
              <div className="text-xl font-bold text-indigo-700">
                {Math.floor(healthData.sleep.wakeupTime / 60)}:{(healthData.sleep.wakeupTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 text-center">
              <div className="text-sm text-indigo-600">睡眠质量</div>
              <div className="text-xl font-bold text-indigo-700">
                {healthData.sleep.quality}/10
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="text-sm text-yuji-600 mb-2">睡眠阶段分布</div>
            <div className="flex h-10 rounded-lg overflow-hidden">
              <div
                className="bg-indigo-600"
                style={{ width: `${(healthData.sleep.deepSleepMinutes / healthData.sleep.totalMinutes) * 100}%` }}
                title={`深度睡眠: ${healthData.sleep.deepSleepMinutes}分钟`}
              />
              <div
                className="bg-indigo-300"
                style={{ width: `${(healthData.sleep.lightSleepMinutes / healthData.sleep.totalMinutes) * 100}%` }}
                title={`浅度睡眠: ${healthData.sleep.lightSleepMinutes}分钟`}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-yuji-500">
              <span>深度睡眠 {Math.round(healthData.sleep.deepSleepMinutes / healthData.sleep.totalMinutes * 100)}%</span>
              <span>浅度睡眠 {Math.round(healthData.sleep.lightSleepMinutes / healthData.sleep.totalMinutes * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      {healthData?.exercise && healthData.exercise.length > 0 && (
        <div className="bg-white rounded-xl border border-yuji-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-yuji-800 mb-4">运动记录</h3>
          <div className="space-y-3">
            {healthData.exercise.map((ex, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Activity size={20} className="text-purple-600" />
                  <div>
                    <div className="font-medium text-yuji-800">{ex.type}</div>
                    <div className="text-sm text-yuji-500">
                      {Math.floor(ex.startMinute / 60)}:{(ex.startMinute % 60).toString().padStart(2, '0')} - {Math.floor(ex.endMinute / 60)}:{(ex.endMinute % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                {ex.calories && (
                  <div className="text-sm text-purple-600">
                    消耗 {ex.calories} 千卡
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {showImportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-yuji-800">导入健康数据</h2>
              <button
                onClick={() => setShowImportDialog(false)}
                className="p-1 hover:bg-yuji-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="border-2 border-dashed border-yuji-200 rounded-lg p-8 text-center">
              <FileText size={48} className="mx-auto text-yuji-300 mb-3" />
              <p className="text-yuji-600 mb-2">点击或拖拽上传 CSV 文件</p>
              <p className="text-sm text-yuji-400">支持心率、压力、步数、血氧等数据</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-6 py-2 bg-yuji-600 text-white rounded-lg hover:bg-yuji-700 transition-colors"
              >
                选择文件
              </button>
            </div>

            {importStatus !== 'idle' && (
              <div className={`mt-4 p-3 rounded-lg text-center ${
                importStatus === 'success' ? 'bg-green-50 text-green-700' :
                importStatus === 'error' ? 'bg-red-50 text-red-700' :
                'bg-yuji-50 text-yuji-700'
              }`}>
                {importMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
