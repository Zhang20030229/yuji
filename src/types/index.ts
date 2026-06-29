export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodRecord {
  id?: number
  date: string
  mood: MoodLevel
  event: string
  category: string
  note?: string
  createdAt: number
  // 云端同步相关字段
  synced_at?: string
  local_only?: boolean
}

export interface DecisionSession {
  id?: number
  question: string
  optionA: string
  optionB: string
  createdAt: number
  messages: DecisionMessage[]
  // 云端同步相关字段
  synced_at?: string
  local_only?: boolean
}

export interface DecisionMessage {
  role: 'user' | 'assistant'
  character?: CharacterType
  content: string
  timestamp: number
}

export type CharacterType = 
  | 'judge'     
  | 'slacker'   
  | 'analyst'   
  | 'child'     
  | 'guide'     

export interface CharacterInfo {
  id: CharacterType
  name: string
  avatar: string
  description: string
  color: string
}

export const CHARACTERS: CharacterInfo[] = [
  {
    id: 'judge',
    name: '卷王判官',
    avatar: '⚖️',
    description: '世俗评价体系的声音',
    color: 'bg-red-100 text-red-700 border-red-200',
  },
  {
    id: 'slacker',
    name: '躺平咸鱼',
    avatar: '🦥',
    description: '身体真实感受的声音',
    color: 'bg-green-100 text-green-700 border-green-200',
  },
  {
    id: 'analyst',
    name: '理性分析师',
    avatar: '📊',
    description: '客观数据视角',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'child',
    name: '小孩初心',
    avatar: '🌱',
    description: '童年最纯粹的愿望',
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  {
    id: 'guide',
    name: '和解引导员',
    avatar: '🕊️',
    description: '整合与觉察的声音',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
]

export const MOOD_LABELS: Record<MoodLevel, { label: string; emoji: string; color: string }> = {
  1: { label: '很糟糕', emoji: '😔', color: 'bg-red-400' },
  2: { label: '不太好', emoji: '😕', color: 'bg-orange-400' },
  3: { label: '一般般', emoji: '😐', color: 'bg-yellow-400' },
  4: { label: '还不错', emoji: '🙂', color: 'bg-lime-400' },
  5: { label: '很开心', emoji: '😊', color: 'bg-green-400' },
}

export const CATEGORIES = [
  { id: 'work', label: '工作/学业', icon: '💼' },
  { id: 'relationship', label: '人际关系', icon: '👥' },
  { id: 'family', label: '家庭/原生', icon: '🏠' },
  { id: 'health', label: '身体健康', icon: '💪' },
  { id: 'money', label: '金钱/物质', icon: '💰' },
  { id: 'future', label: '未来规划', icon: '🔮' },
  { id: 'self', label: '自我价值', icon: '💭' },
  { id: 'other', label: '其他', icon: '📝' },
]

export type TaskCategory = 'focus' | 'study' | 'meeting' | 'life' | 'health' | 'admin'

export interface Task {
  id: string
  title: string
  date: string
  startMinute: number
  endMinute: number
  category: TaskCategory
  note?: string
  done: boolean
}

export interface HeartRateRecord {
  minute: number
  value: number
}

export interface StressRecord {
  minute: number
  value: number
}

export interface StepsRecord {
  minute: number
  value: number
}

export interface Spo2Record {
  minute: number
  value: number
}

export interface ExerciseRecord {
  startMinute: number
  endMinute: number
  type: string
  calories?: number
}

export interface SleepData {
  bedtime: number
  wakeupTime: number
  deepSleepMinutes: number
  lightSleepMinutes: number
  totalMinutes: number
  quality: number
}

export interface DayHealthData {
  heartRate?: HeartRateRecord[]
  stress?: StressRecord[]
  steps?: StepsRecord[]
  spo2?: Spo2Record[]
  exercise?: ExerciseRecord[]
  sleep?: SleepData
}

export interface DailyReport {
  date: string
  content: string
  taskSummary?: {
    busyMinutes: number
    freeMinutes: number
    focusMinutes: number
    taskCount: number
    nextTask?: Task
  }
  healthSummary?: {
    hasData: boolean
    heartRate?: { avg: number; min: number; max: number; count: number }
    stress?: { avg: number; min: number; max: number; count: number }
    steps?: { total: number }
    sleep?: { duration: number; quality: number }
    exercise?: { totalMinutes: number; items: ExerciseRecord[] }
  }
  createdAt: number
}

export interface Settings {
  key?: string
  glmApiKey: string
  glmModel: string
  activeTab?: string
}

export const CATEGORY_META: Record<TaskCategory, { label: string; color: string; bgColor: string }> = {
  focus: { label: '专注', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200' },
  study: { label: '学习', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200' },
  meeting: { label: '会议', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200' },
  life: { label: '生活', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200' },
  health: { label: '健康', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200' },
  admin: { label: '行政', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200' },
}

export const HEALTH_METRIC_META: Record<keyof DayHealthData, { label: string; icon: string; unit: string }> = {
  heartRate: { label: '心率', icon: '❤️', unit: 'bpm' },
  stress: { label: '压力', icon: '🧠', unit: '' },
  steps: { label: '步数', icon: '👟', unit: '步' },
  spo2: { label: '血氧', icon: '💨', unit: '%' },
  exercise: { label: '运动', icon: '🏃', unit: '分钟' },
  sleep: { label: '睡眠', icon: '🌙', unit: '小时' },
}

export const GLM_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
export const GLM_DEFAULT_MODEL = 'glm-4-flash'

export interface InferedEmotion {
  key: string
  label: string
  icon: string
  description: string
  confidence: number
}

export interface HealthCorrelation {
  heartRate?: { avg: number; min: number; max: number; count: number; trend: 'rising' | 'falling' | 'stable' }
  stress?: { avg: number; min: number; max: number; count: number; trend: 'rising' | 'falling' | 'stable' }
  steps?: { avg: number; min: number; max: number; count: number }
  spo2?: { avg: number; min: number; max: number; count: number }
  exercise?: ExerciseRecord[]
  sleepContext?: SleepData
}

export interface DailyHealthSummary {
  hasData: boolean
  heartRate?: { avg: number; min: number; max: number; count: number }
  stress?: { avg: number; min: number; max: number; count: number }
  steps?: { total: number }
  spo2?: { avg: number; min: number; max: number; count: number }
  exercise?: { totalMinutes: number; items: ExerciseRecord[] }
  sleep?: { duration: number; quality: number }
}
