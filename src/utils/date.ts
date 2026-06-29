export function todayKey(): string {
  return new Date().toISOString().split('T')[0]
}

export function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

export function formatTime(minute: number): string {
  const hours = Math.floor(minute / 60)
  const mins = minute % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export function parseTime(timeStr: string): number {
  const [hours, mins] = timeStr.split(':').map(Number)
  return hours * 60 + mins
}

export function formatLongDate(dateStr: string): string {
  const date = new Date(dateStr)
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }
  return date.toLocaleDateString('zh-CN', options)
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayKey()
}

export function getWeekDays(dateStr: string): string[] {
  const result: string[] = []
  const date = new Date(dateStr)
  const dayOfWeek = date.getDay() || 7
  const monday = new Date(date.getTime() - (dayOfWeek - 1) * 24 * 60 * 60 * 1000)
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday.getTime() + i * 24 * 60 * 60 * 1000)
    result.push(d.toISOString().split('T')[0])
  }
  
  return result
}

export function getDaysInMonth(dateStr: string): string[] {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const result: string[] = []
  
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i)
    result.push(d.toISOString().split('T')[0])
  }
  
  return result
}
