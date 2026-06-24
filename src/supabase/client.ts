import { createClient } from '@supabase/supabase-js'

// Supabase 配置
// 请在 Supabase 创建一个项目，然后填入以下信息
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storage: {
      getItem: (key) => {
        try {
          return localStorage.getItem(key)
        } catch {
          return null
        }
      },
      setItem: (key, value) => {
        try {
          localStorage.setItem(key, value)
        } catch {
          // Ignore quota exceeded errors
        }
      },
      removeItem: (key) => {
        try {
          localStorage.removeItem(key)
        } catch {
          // Ignore errors
        }
      },
    },
  },
})

// 数据库类型定义
export interface UserProfile {
  id: string
  email?: string
  display_name?: string
  created_at: string
  last_sync_at?: string
}

export interface MoodRecord {
  id?: number
  user_id: string
  mood: number // 1-5
  tags: string[]
  event?: string
  note?: string
  created_at: string
  synced_at?: string
  local_only?: boolean
}

export interface DecisionRecord {
  id?: number
  user_id: string
  question: string
  option_a: string
  option_b: string
  reflections: string[]
  created_at: string
  resolved_at?: string
  outcome?: string
  synced_at?: string
  local_only?: boolean
}

export interface AnnualReflection {
  id?: number
  user_id: string
  year: number
  overall_mood_avg: number
  top_moods: string[]
  top_tags: string[]
  key_decisions: string[]
  insights: string[]
  created_at: string
}
