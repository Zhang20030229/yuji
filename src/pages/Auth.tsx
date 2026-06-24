import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Mail, User, ArrowRight, Sparkles, Cloud, CloudOff } from 'lucide-react'
import { signInAnonymously, signInWithEmail, signUpWithEmail } from '@/supabase/sync'

type AuthMode = 'choice' | 'login' | 'signup'

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('choice')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleAnonymousLogin = async () => {
    setLoading(true)
    setError('')

    const result = await signInAnonymously()

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || '登录失败')
    }

    setLoading(false)
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signInWithEmail(email, password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || '登录失败')
    }

    setLoading(false)
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signUpWithEmail(email, password)

    if (result.success) {
      navigate('/')
    } else {
      setError(result.error || '注册失败')
    }

    setLoading(false)
  }

  // 选择页面
  if (mode === 'choice') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yuji-50 via-white to-sage-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl shadow-lg mb-4">
              <Heart className="text-white" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-yuji-800">遇己</h1>
            <p className="text-yuji-500 mt-1">遇见真实的自己</p>
          </div>

          {/* 功能介绍 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yuji-100 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Cloud size={20} className="text-emerald-500" />
              <span className="font-medium text-yuji-700">开启云端同步</span>
            </div>
            <p className="text-sm text-yuji-600 leading-relaxed">
              登录后将开启数据云端同步功能，让你在不同设备间无缝继续自我觉察的旅程。
              <br />
              <span className="text-yuji-400">也可以先跳过，直接体验产品。</span>
            </p>
          </div>

          {/* 登录选项 */}
          <div className="space-y-3">
            <button
              onClick={handleAnonymousLogin}
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              快速体验（匿名登录）
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-yuji-200 w-full"></div>
              <span className="absolute bg-white px-3 text-sm text-yuji-400">或</span>
            </div>

            <button
              onClick={() => setMode('login')}
              className="w-full py-3 px-4 bg-white border border-yuji-200 text-yuji-700 rounded-xl font-medium hover:bg-yuji-50 transition-all flex items-center justify-center gap-2"
            >
              <Mail size={18} />
              使用邮箱登录
            </button>

            <button
              onClick={() => setMode('signup')}
              className="w-full py-3 px-4 bg-white border border-yuji-200 text-yuji-700 rounded-xl font-medium hover:bg-yuji-50 transition-all flex items-center justify-center gap-2"
            >
              <User size={18} />
              创建新账号
            </button>
          </div>

          {/* 跳过 */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="text-sm text-yuji-400 hover:text-yuji-600 flex items-center justify-center gap-1"
            >
              <CloudOff size={14} />
              跳过登录，直接体验
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 登录表单
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yuji-50 via-white to-sage-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <button
            onClick={() => setMode('choice')}
            className="text-sm text-yuji-500 hover:text-yuji-700 mb-4 flex items-center gap-1"
          >
            ← 返回
          </button>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yuji-100 shadow-sm">
            <h2 className="text-xl font-bold text-yuji-800 mb-2">登录账号</h2>
            <p className="text-sm text-yuji-500 mb-6">欢迎回来，继续你的觉察之旅</p>

            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-2.5 border border-yuji-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-2.5 border border-yuji-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? '登录中...' : '登录'}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // 注册表单
  return (
    <div className="min-h-screen bg-gradient-to-br from-yuji-50 via-white to-sage-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => setMode('choice')}
          className="text-sm text-yuji-500 hover:text-yuji-700 mb-4 flex items-center gap-1"
        >
          ← 返回
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-yuji-100 shadow-sm">
          <h2 className="text-xl font-bold text-yuji-800 mb-2">创建账号</h2>
          <p className="text-sm text-yuji-500 mb-6">开始你的自我觉察之旅</p>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-1">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2.5 border border-yuji-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-yuji-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位字符"
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-yuji-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? '创建中...' : '创建账号'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="text-xs text-yuji-400 mt-4 text-center">
            创建账号即表示你同意我们的隐私政策
          </p>
        </div>
      </div>
    </div>
  )
}
