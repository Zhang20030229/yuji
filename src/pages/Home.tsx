import { Link } from 'react-router-dom'
import { HeartPulse, Brain, Users, ShieldCheck, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { moodDB } from '@/db'
import type { MoodRecord } from '@/types'

export default function Home() {
  const [recentMoods, setRecentMoods] = useState<MoodRecord[]>([])
  const [avgMood, setAvgMood] = useState<number | null>(null)

  useEffect(() => {
    loadRecentMoods()
  }, [])

  async function loadRecentMoods() {
    const records = await moodDB.getRecent(7)
    setRecentMoods(records)
    if (records.length > 0) {
      const avg = records.reduce((sum, r) => sum + r.mood, 0) / records.length
      setAvgMood(Math.round(avg * 10) / 10)
    }
  }

  const features = [
    {
      icon: HeartPulse,
      title: '情绪客观观测',
      desc: '用数据打破自我PUA，看见真实的情绪模式',
      path: '/mood',
      color: 'from-pink-400 to-rose-400',
    },
    {
      icon: Brain,
      title: '人生决策推演',
      desc: '听见内心的五个声音，找到属于自己的答案',
      path: '/decision',
      color: 'from-violet-400 to-purple-400',
    },
    {
      icon: Users,
      title: '同频封闭社区',
      desc: '和千万同类人一起，消解孤独与内耗',
      path: '/community',
      color: 'from-teal-400 to-emerald-400',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="text-center py-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-yuji-100 text-yuji-700 rounded-full text-sm mb-4">
          <Sparkles size={16} />
          <span>小镇做题家的自我觉察工具</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-yuji-800 mb-3">
          遇见真实的自己
        </h1>
        <p className="text-yuji-600 max-w-lg mx-auto leading-relaxed">
          不灌鸡汤，不教内卷。
          <br />
          只是帮你剥离外界评价的枷锁，
          <br />
          找到属于自己的自洽与幸福。
        </p>
      </section>

      {recentMoods.length > 0 && (
        <section className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-yuji-700">本周心情概览</h3>
            <Link to="/mood" className="text-sm text-yuji-500 hover:text-yuji-700">
              查看详情 →
            </Link>
          </div>
          <div className="flex items-end gap-6">
            <div>
              <p className="text-sm text-yuji-500 mb-1">平均心情</p>
              <p className="text-3xl font-bold text-yuji-700">{avgMood}</p>
              <p className="text-xs text-yuji-400">/ 5.0</p>
            </div>
            <div className="flex-1">
              <div className="flex justify-between gap-1">
                {[...Array(7)].map((_, i) => {
                  const record = recentMoods[i]
                  const height = record ? `${(record.mood / 5) * 100}%` : '20%'
                  const color = record
                    ? record.mood >= 4
                      ? 'bg-green-400'
                      : record.mood >= 3
                      ? 'bg-yellow-400'
                      : 'bg-orange-400'
                    : 'bg-yuji-100'
                  return (
                    <div
                      key={i}
                      className={`flex-1 rounded-t ${color} transition-all`}
                      style={{ height: `calc(${height} * 60px + 10px)` }}
                      title={record ? record.event : '暂无记录'}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between text-xs text-yuji-400 mt-2">
                {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
                  <span key={d}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Link
              key={feature.path}
              to={feature.path}
              className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100 hover:border-yuji-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} text-white shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-yuji-800 mb-1 group-hover:text-yuji-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-yuji-500">{feature.desc}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </section>

      <section className="bg-sage-50/50 rounded-2xl p-5 border border-sage-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-sage-100 rounded-lg text-sage-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h3 className="font-medium text-sage-700 mb-1">你的数据，只属于你</h3>
            <p className="text-sm text-sage-600 leading-relaxed">
              所有情绪日记、对话记录都存储在你本地的设备中，不上传云端。
              <br />
              端侧AI推理，你的脆弱只有你自己能看见。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
