import { useState, useEffect } from 'react'
import { Link, useLocation, Outlet } from 'react-router-dom'
import {
  Home,
  HeartPulse,
  Brain,
  Users,
  Info,
  Menu,
  X,
  Cloud,
  CloudOff,
  FileText,
  User,
} from 'lucide-react'
import { onAuthStateChange, isLoggedIn } from '@/supabase/sync'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/mood', label: '情绪记录', icon: HeartPulse },
  { path: '/decision', label: '决策推演', icon: Brain },
  { path: '/community', label: '同频社区', icon: Users },
  { path: '/report', label: '年度报告', icon: FileText },
  { path: '/about', label: '关于', icon: Info },
]

export default function Layout() {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isLogged, setIsLogged] = useState(false)

  useEffect(() => {
    // 监听登录状态
    const { data: { subscription } } = onAuthStateChange((userId) => {
      setIsLogged(!!userId)
    })

    // 初始检查
    isLoggedIn().then(setIsLogged)

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-yuji-100">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="font-bold text-xl text-yuji-700">遇己</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    active
                      ? 'bg-yuji-100 text-yuji-700 font-medium'
                      : 'text-yuji-600 hover:bg-yuji-50 hover:text-yuji-700'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* 同步状态 */}
            <Link
              to="/auth"
              className={`hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs transition-all ${
                isLogged
                  ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'bg-yuji-50 text-yuji-500 hover:bg-yuji-100'
              }`}
              title={isLogged ? '已登录，可同步数据' : '点击登录，开启云端同步'}
            >
              {isLogged ? <Cloud size={14} /> : <CloudOff size={14} />}
              <span>{isLogged ? '已同步' : '本地'}</span>
            </Link>

            <button
              className="md:hidden p-2 text-yuji-600 hover:bg-yuji-50 rounded-lg"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden border-t border-yuji-100 bg-white/95 backdrop-blur-md">
            <div className="max-w-4xl mx-auto px-4 py-2 flex flex-col">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-2 px-3 py-3 rounded-lg text-sm ${
                      active
                        ? 'bg-yuji-100 text-yuji-700 font-medium'
                        : 'text-yuji-600 hover:bg-yuji-50'
                    }`}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                )
              })}
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-3 rounded-lg text-sm text-yuji-600 hover:bg-yuji-50"
              >
                <User size={18} />
                {isLogged ? '账号设置' : '登录 / 注册'}
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-yuji-100 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-yuji-500">
          <p>🌿 遇己 — 遇见真实的自己</p>
          <p className="mt-1 text-xs text-yuji-400">
            {isLogged ? '已开启云端同步，你的觉察之旅永不中断' : '数据仅存储在你的设备上，我们无法访问'}
          </p>
        </div>
      </footer>
    </div>
  )
}
