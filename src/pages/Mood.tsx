import { useState, useEffect } from 'react'
import { Plus, Calendar, BarChart3, Trash2, Cloud, CloudOff, RefreshCw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { moodDB } from '@/db'
import type { MoodRecord, MoodLevel } from '@/types'
import { MOOD_LABELS, CATEGORIES } from '@/types'
import { isLoggedIn, syncMoodRecords, getCurrentUserId, getSyncStatus } from '@/supabase/sync'

export default function MoodPage() {
  const [showForm, setShowForm] = useState(false)
  const [records, setRecords] = useState<MoodRecord[]>([])
  const [selectedMood, setSelectedMood] = useState<MoodLevel>(3)
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0].id)
  const [eventText, setEventText] = useState('')
  const [noteText, setNoteText] = useState('')
  const [isLogged, setIsLogged] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    loadRecords()
    checkLoginStatus()
  }, [])

  async function checkLoginStatus() {
    const logged = await isLoggedIn()
    setIsLogged(logged)
    if (logged) {
      const status = getSyncStatus()
      setLastSync(status.lastSyncTime)
    }
  }

  async function loadRecords() {
    const data = await moodDB.getAll()
    setRecords(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!eventText.trim()) return

    const now = new Date()
    const record: Omit<MoodRecord, 'id'> = {
      date: now.toISOString().split('T')[0],
      mood: selectedMood,
      event: eventText.trim(),
      category: selectedCategory,
      note: noteText.trim() || undefined,
      createdAt: now.getTime(),
      local_only: !isLogged,
    }

    await moodDB.add(record)
    await loadRecords()

    // 如果已登录，自动同步到云端
    if (isLogged) {
      const userId = await getCurrentUserId()
      if (userId) {
        setSyncing(true)
        await syncMoodRecords(userId)
        setSyncing(false)
        setLastSync(new Date())
      }
    }

    setEventText('')
    setNoteText('')
    setSelectedMood(3)
    setShowForm(false)
  }

  async function handleDelete(id: number) {
    if (confirm('确定要删除这条记录吗？')) {
      await moodDB.delete(id)
      await loadRecords()
    }
  }

  async function handleManualSync() {
    if (!isLogged) return
    const userId = await getCurrentUserId()
    if (!userId) return

    setSyncing(true)
    await syncMoodRecords(userId)
    setSyncing(false)
    setLastSync(new Date())
    await loadRecords()
  }

  const chartData = [...records]
    .reverse()
    .slice(-30)
    .map((r) => ({
      date: r.date.slice(5),
      mood: r.mood,
      label: MOOD_LABELS[r.mood].label,
    }))

  const avgMood =
    records.length > 0
      ? (records.reduce((sum, r) => sum + r.mood, 0) / records.length).toFixed(1)
      : '0'

  const categoryStats = CATEGORIES.map((cat) => {
    const catRecords = records.filter((r) => r.category === cat.id)
    const avg =
      catRecords.length > 0
        ? catRecords.reduce((sum, r) => sum + r.mood, 0) / catRecords.length
        : 0
    return {
      ...cat,
      count: catRecords.length,
      avg: avg ? avg.toFixed(1) : '-',
    }
  }).filter((c) => c.count > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-yuji-800">情绪记录</h1>
          <p className="text-sm text-yuji-500 mt-1">用客观数据，打破主观自我否定</p>
        </div>
        <div className="flex items-center gap-2">
          {isLogged && (
            <button
              onClick={handleManualSync}
              disabled={syncing}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors text-sm"
              title={lastSync ? `上次同步: ${lastSync.toLocaleTimeString()}` : '点击同步到云端'}
            >
              <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">{syncing ? '同步中...' : '同步'}</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-yuji-500 text-white rounded-xl hover:bg-yuji-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <span>记录心情</span>
          </button>
        </div>
      </div>

      {/* 同步状态提示 */}
      {isLogged && (
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-sm">
          <Cloud size={16} />
          <span>已开启云端同步，你的记录会安全保存</span>
        </div>
      )}
      {!isLogged && records.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <CloudOff size={16} />
            <span>数据仅保存在本地，登录后可开启云端同步</span>
          </div>
          <a href="/auth" className="underline hover:no-underline">去登录</a>
        </div>
      )}

      {showForm && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-3">
                今天心情怎么样？
              </label>
              <div className="flex justify-between gap-2">
                {(Object.keys(MOOD_LABELS) as unknown as MoodLevel[]).map((level) => {
                  const info = MOOD_LABELS[level]
                  const selected = selectedMood === level
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedMood(level)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                        selected
                          ? `${info.color} text-white scale-105 shadow-md`
                          : 'bg-yuji-50 text-yuji-600 hover:bg-yuji-100'
                      }`}
                    >
                      <span className="text-2xl">{info.emoji}</span>
                      <span className="text-xs">{info.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-2">
                发生了什么事？
              </label>
              <input
                type="text"
                value={eventText}
                onChange={(e) => setEventText(e.target.value)}
                placeholder="比如：和同学对比了工资，有点焦虑..."
                className="w-full px-4 py-3 rounded-xl border border-yuji-200 bg-white focus:outline-none focus:ring-2 focus:ring-yuji-300 focus:border-transparent text-yuji-700 placeholder-yuji-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-2">
                属于哪一类？
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-yuji-500 text-white'
                        : 'bg-yuji-50 text-yuji-600 hover:bg-yuji-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-2">
                想说点什么？（可选）
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="记录一下当下的感受..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-yuji-200 bg-white focus:outline-none focus:ring-2 focus:ring-yuji-300 focus:border-transparent text-yuji-700 placeholder-yuji-300 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-xl border border-yuji-200 text-yuji-600 hover:bg-yuji-50 transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-yuji-500 text-white hover:bg-yuji-600 transition-colors"
              >
                保存记录
              </button>
            </div>
          </form>
        </div>
      )}

      {records.length > 0 && (
        <>
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={20} className="text-yuji-500" />
              <h2 className="font-semibold text-yuji-700">情绪趋势</h2>
              <span className="text-sm text-yuji-400 ml-auto">近30天</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3d5c8" opacity={0.5} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#86402d' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e9b8a3' }}
                  />
                  <YAxis
                    domain={[0, 5]}
                    tick={{ fontSize: 11, fill: '#86402d' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e9b8a3' }}
                    ticks={[1, 2, 3, 4, 5]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #f3d5c8',
                      borderRadius: '12px',
                      fontSize: '13px',
                    }}
                    labelStyle={{ color: '#86402d', fontWeight: 500 }}
                    formatter={(value) => [
                      MOOD_LABELS[Number(value) as MoodLevel]?.label || '',
                      '心情',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    stroke="#d17452"
                    strokeWidth={2.5}
                    dot={{ fill: '#d17452', r: 4 }}
                    activeDot={{ r: 6, fill: '#c25e3d' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100">
              <p className="text-xs text-yuji-500 mb-1">累计记录</p>
              <p className="text-2xl font-bold text-yuji-700">{records.length}</p>
              <p className="text-xs text-yuji-400">天</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100">
              <p className="text-xs text-yuji-500 mb-1">平均心情</p>
              <p className="text-2xl font-bold text-yuji-700">{avgMood}</p>
              <p className="text-xs text-yuji-400">/ 5.0</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100">
              <p className="text-xs text-yuji-500 mb-1">最好心情</p>
              <p className="text-2xl font-bold text-green-500">
                {Math.max(...records.map((r) => r.mood))}
              </p>
              <p className="text-xs text-yuji-400">分</p>
            </div>
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100">
              <p className="text-xs text-yuji-500 mb-1">最差心情</p>
              <p className="text-2xl font-bold text-orange-500">
                {Math.min(...records.map((r) => r.mood))}
              </p>
              <p className="text-xs text-yuji-400">分</p>
            </div>
          </div>

          {categoryStats.length > 0 && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
              <h3 className="font-semibold text-yuji-700 mb-3">分类情绪统计</h3>
              <div className="space-y-2">
                {categoryStats.map((cat) => (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-sm text-yuji-700 w-20">{cat.label}</span>
                    <div className="flex-1 h-2 bg-yuji-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yuji-400 rounded-full"
                        style={{ width: `${(parseFloat(cat.avg) / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-yuji-600 w-12 text-right">{cat.avg}分</span>
                    <span className="text-xs text-yuji-400 w-10 text-right">{cat.count}次</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} className="text-yuji-500" />
              <h2 className="font-semibold text-yuji-700">历史记录</h2>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {records.map((record) => {
                const moodInfo = MOOD_LABELS[record.mood]
                const cat = CATEGORIES.find((c) => c.id === record.category)
                return (
                  <div
                    key={record.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-yuji-50/50 hover:bg-yuji-50 transition-colors group"
                  >
                    <div
                      className={`w-10 h-10 rounded-full ${moodInfo.color} flex items-center justify-center text-lg flex-shrink-0`}
                    >
                      {moodInfo.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-yuji-700">{record.event}</span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded-full text-yuji-500">
                          {cat?.icon} {cat?.label}
                        </span>
                      </div>
                      {record.note && (
                        <p className="text-sm text-yuji-500 mt-1 line-clamp-2">{record.note}</p>
                      )}
                      <p className="text-xs text-yuji-400 mt-1">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <button
                      onClick={() => record.id && handleDelete(record.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-yuji-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {records.length === 0 && !showForm && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-yuji-700 mb-2">还没有记录</h3>
          <p className="text-sm text-yuji-500 mb-4">
            开始记录你的心情吧，10秒就能完成
            <br />
            数据积累得越多，越能看清自己的情绪模式
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2.5 bg-yuji-500 text-white rounded-xl hover:bg-yuji-600 transition-colors"
          >
            开始记录
          </button>
        </div>
      )}
    </div>
  )
}
