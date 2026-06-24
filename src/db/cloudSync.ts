import type { MoodRecord } from '@/types'

// 将本地记录转换为云端格式
export function toCloudRecord(record: MoodRecord) {
  return {
    mood: record.mood,
    event: record.event,
    category: record.category,
    note: record.note,
    created_at: new Date(record.createdAt).toISOString(),
    synced_at: new Date().toISOString(),
  }
}

// 从云端记录转换为本地格式
export function fromCloudRecord(cloudRecord: any): Omit<MoodRecord, 'id'> {
  return {
    date: cloudRecord.created_at.split('T')[0],
    mood: cloudRecord.mood,
    event: cloudRecord.event,
    category: cloudRecord.category,
    note: cloudRecord.note,
    createdAt: new Date(cloudRecord.created_at).getTime(),
    synced_at: cloudRecord.synced_at,
  }
}

// 分类标签映射
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

// 获取分类标签（用于年度报告）
export function getCategoryLabel(categoryId: string): string {
  return categoryLabels[categoryId] || categoryId
}
