import { supabase } from './client'
import { moodDB } from '@/db'

// 同步状态管理
let isSyncing = false
let lastSyncTime: Date | null = null

// 获取当前用户ID
export async function getCurrentUserId(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// 检查是否已登录
export async function isLoggedIn(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

// 匿名登录（快速体验）
export async function signInAnonymously(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 邮箱登录
export async function signInWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 邮箱注册
export async function signUpWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// 登出
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

// 监听认证状态变化
export function onAuthStateChange(callback: (userId: string | null) => void) {
  return supabase.auth.onAuthStateChange((_, session) => {
    callback(session?.user?.id || null)
  })
}

// 同步情绪记录到云端
export async function syncMoodRecords(userId: string): Promise<{ synced: number; errors: number }> {
  if (isSyncing) return { synced: 0, errors: 0 }

  isSyncing = true
  let synced = 0
  let errors = 0

  try {
    // 获取所有本地未同步的记录
    const localRecords = await moodDB.getAll()
    const unsyncedRecords = localRecords.filter(r => !r.synced_at)

    for (const record of unsyncedRecords) {
      const cloudRecord = {
        user_id: userId,
        mood: record.mood,
        event: record.event,
        category: record.category,
        note: record.note,
        created_at: new Date(record.createdAt).toISOString(),
        synced_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('mood_records').insert(cloudRecord)

      if (error) {
        console.error('同步情绪记录失败:', error)
        errors++
      } else {
        // 标记为已同步
        if (record.id) {
          await moodDB.update(record.id, { synced_at: cloudRecord.synced_at })
        }
        synced++
      }
    }

    lastSyncTime = new Date()
    return { synced, errors }
  } finally {
    isSyncing = false
  }
}

// 从云端拉取情绪记录到本地
export async function pullMoodRecords(_userId: string): Promise<{ pulled: number }> {
  try {
    // 获取用户的所有云端记录
    const { data: cloudRecords, error } = await supabase
      .from('mood_records')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error

    let pulled = 0

    for (const record of cloudRecords || []) {
      // 检查本地是否已存在
      const existing = await moodDB.getByDate(record.created_at)

      if (!existing) {
        // 添加到本地
        await moodDB.add({
          date: record.created_at.split('T')[0],
          mood: record.mood,
          event: record.event,
          category: record.category,
          note: record.note,
          createdAt: new Date(record.created_at).getTime(),
          synced_at: record.synced_at,
        })
        pulled++
      }
    }

    return { pulled }
  } catch (error) {
    console.error('拉取情绪记录失败:', error)
    return { pulled: 0 }
  }
}

// 完整同步（推送 + 拉取）
export async function fullSync(): Promise<{
  pushed: number;
  pulled: number;
  errors: number;
  lastSyncTime: Date | null
}> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return { pushed: 0, pulled: 0, errors: 0, lastSyncTime: null }
  }

  // 先推送本地数据
  const pushResult = await syncMoodRecords(userId)

  // 再拉取云端数据
  const pullResult = await pullMoodRecords(userId)

  return {
    pushed: pushResult.synced,
    pulled: pullResult.pulled,
    errors: pushResult.errors,
    lastSyncTime,
  }
}

// 获取同步状态
export function getSyncStatus(): { isSyncing: boolean; lastSyncTime: Date | null } {
  return { isSyncing, lastSyncTime }
}
