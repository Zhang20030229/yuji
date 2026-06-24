export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodRecord {
  id?: number
  date: string
  mood: MoodLevel
  event: string
  category: string
  note?: string
  createdAt: number
}

export interface DecisionSession {
  id?: number
  question: string
  optionA: string
  optionB: string
  createdAt: number
  messages: DecisionMessage[]
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
