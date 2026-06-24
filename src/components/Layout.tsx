import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Home,
  HeartPulse,
  Brain,
  Users,
  Info,
  Shield,
  Menu,
  X,
} from 'lucide-react'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/mood', label: '情绪记录', icon: HeartPulse },
  { path: '/decision', label: '决策推演', icon: Brain },
  { path: '/community', label: '同频社区', icon: Users },
  { path: '/about', label: '关于', icon: Info },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

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
            <div className="hidden sm:flex items-center gap-1 px-2 py-1.5 bg-sage-50 text-sage-600 rounded-lg text-xs">
              <Shield size={14} />
              <span>本地存储</span>
            </div>
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
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t border-yuji-100 bg-white/50">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-yuji-500">
          <p>🌿 遇己 — 遇见真实的自己</p>
          <p className="mt-1 text-xs text-yuji-400">
            所有数据仅存储在你的设备上，我们无法访问
          </p>
        </div>
      </footer>
    </div>
  )
}
