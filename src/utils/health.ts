import type { DayHealthData, HeartRateRecord, StressRecord, StepsRecord, ExerciseRecord, SleepData, InferedEmotion, HealthCorrelation, DailyHealthSummary } from '@/types'

export interface ParseResult {
  success: boolean
  data?: DayHealthData
  error?: string
}

export function parseHealthCSV(csvText: string): ParseResult {
  try {
    const lines = csvText.trim().split('\n')
    if (lines.length === 0) {
      return { success: false, error: 'CSV内容为空' }
    }

    const headers = lines[0].split(',')
    const data: DayHealthData = {}

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const record: Record<string, string> = {}
      
      headers.forEach((header, idx) => {
        record[header.trim()] = values[idx]?.trim() || ''
      })

      const minute = parseInt(record.minute || record.time || '', 10)
      if (isNaN(minute)) continue

      if (record.heart_rate || record.heartRate || record.hr) {
        const value = parseInt(record.heart_rate || record.heartRate || record.hr || '', 10)
        if (!isNaN(value)) {
          if (!data.heartRate) data.heartRate = []
          data.heartRate.push({ minute, value })
        }
      }

      if (record.stress || record.stress_level) {
        const value = parseInt(record.stress || record.stress_level || '', 10)
        if (!isNaN(value)) {
          if (!data.stress) data.stress = []
          data.stress.push({ minute, value })
        }
      }

      if (record.steps || record.step_count) {
        const value = parseInt(record.steps || record.step_count || '', 10)
        if (!isNaN(value)) {
          if (!data.steps) data.steps = []
          data.steps.push({ minute, value })
        }
      }

      if (record.spo2 || record.blood_oxygen) {
        const value = parseInt(record.spo2 || record.blood_oxygen || '', 10)
        if (!isNaN(value)) {
          if (!data.spo2) data.spo2 = []
          data.spo2.push({ minute, value })
        }
      }

      if (record.exercise_type || record.activity) {
        const startMinute = minute
        const endMinute = minute + (parseInt(record.duration || '30', 10) || 30)
        const exercise: ExerciseRecord = {
          startMinute,
          endMinute,
          type: record.exercise_type || record.activity || 'unknown',
        }
        if (record.calories) {
          exercise.calories = parseInt(record.calories, 10)
        }
        if (!data.exercise) data.exercise = []
        data.exercise.push(exercise)
      }
    }

    return { success: true, data }
  } catch (error) {
    return { success: false, error: 'CSV解析失败: ' + (error as Error).message }
  }
}

export function parseHealthExport(text: string): ParseResult {
  try {
    const json = JSON.parse(text)
    const data: DayHealthData = {}

    if (json.heartRate && Array.isArray(json.heartRate)) {
      data.heartRate = json.heartRate.map((r: { minute: number; value: number }) => ({
        minute: r.minute,
        value: r.value,
      }))
    }

    if (json.stress && Array.isArray(json.stress)) {
      data.stress = json.stress.map((r: { minute: number; value: number }) => ({
        minute: r.minute,
        value: r.value,
      }))
    }

    if (json.steps && Array.isArray(json.steps)) {
      data.steps = json.steps.map((r: { minute: number; value: number }) => ({
        minute: r.minute,
        value: r.value,
      }))
    }

    if (json.spo2 && Array.isArray(json.spo2)) {
      data.spo2 = json.spo2.map((r: { minute: number; value: number }) => ({
        minute: r.minute,
        value: r.value,
      }))
    }

    if (json.exercise && Array.isArray(json.exercise)) {
      data.exercise = json.exercise.map((r: { startMinute: number; endMinute: number; type: string; calories?: number }) => ({
        startMinute: r.startMinute,
        endMinute: r.endMinute,
        type: r.type,
        calories: r.calories,
      }))
    }

    if (json.sleep && typeof json.sleep === 'object') {
      data.sleep = {
        bedtime: json.sleep.bedtime,
        wakeupTime: json.sleep.wakeupTime,
        deepSleepMinutes: json.sleep.deepSleepMinutes,
        lightSleepMinutes: json.sleep.lightSleepMinutes,
        totalMinutes: json.sleep.totalMinutes,
        quality: json.sleep.quality,
      }
    }

    return { success: true, data }
  } catch (error) {
    return parseHealthCSV(text)
  }
}

export function getHealthSummary(healthData: DayHealthData | undefined): DailyHealthSummary | null {
  if (!healthData) return null

  const result: DailyHealthSummary = { hasData: false }

  if (healthData.heartRate && healthData.heartRate.length > 0) {
    const values = healthData.heartRate.map((r) => r.value)
    result.heartRate = {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
    result.hasData = true
  }

  if (healthData.stress && healthData.stress.length > 0) {
    const values = healthData.stress.map((r) => r.value)
    result.stress = {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
    result.hasData = true
  }

  if (healthData.steps && healthData.steps.length > 0) {
    const total = healthData.steps.reduce((sum, r) => sum + r.value, 0)
    result.steps = { total }
    result.hasData = true
  }

  if (healthData.spo2 && healthData.spo2.length > 0) {
    const values = healthData.spo2.map((r) => r.value)
    result.spo2 = {
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
    result.hasData = true
  }

  if (healthData.exercise && healthData.exercise.length > 0) {
    const totalMinutes = healthData.exercise.reduce(
      (sum, e) => sum + (e.endMinute - e.startMinute),
      0
    )
    result.exercise = { totalMinutes, items: healthData.exercise }
    result.hasData = true
  }

  if (healthData.sleep) {
    result.sleep = {
      duration: Math.round(healthData.sleep.totalMinutes / 60 * 10) / 10,
      quality: healthData.sleep.quality,
    }
    result.hasData = true
  }

  return result.hasData ? result : null
}

export interface WeekTrend {
  date: string
  avg: number
  min?: number
  max?: number
}

export function getWeeklyHealthTrend(
  weekData: { date: string; data: DayHealthData }[],
  metric: keyof DayHealthData
): WeekTrend[] {
  const result: WeekTrend[] = []

  for (const { date, data } of weekData) {
    const records = data[metric]
    if (!records || !Array.isArray(records)) {
      result.push({ date, avg: 0 })
      continue
    }

    if (metric === 'exercise') {
      const values = (records as ExerciseRecord[]).map(r => r.endMinute - r.startMinute)
      result.push({
        date,
        avg: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
        min: values.length > 0 ? Math.min(...values) : undefined,
        max: values.length > 0 ? Math.max(...values) : undefined,
      })
    } else {
      const values = (records as { value: number }[]).map(r => r.value)
      result.push({
        date,
        avg: values.length > 0 ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0,
        min: values.length > 0 ? Math.min(...values) : undefined,
        max: values.length > 0 ? Math.max(...values) : undefined,
      })
    }
  }

  return result
}

export function correlateHealthWithTask(task: { startMinute: number; endMinute: number }, healthRecords: DayHealthData): HealthCorrelation | null {
  if (!healthRecords) return null

  const result: HealthCorrelation = {}

  const timeSeriesTypes: Array<keyof Pick<DayHealthData, 'heartRate' | 'stress' | 'steps' | 'spo2'>> = ['heartRate', 'stress', 'steps', 'spo2']

  for (const type of timeSeriesTypes) {
    const series = healthRecords[type]
    if (!Array.isArray(series) || series.length === 0) continue

    const matching = series.filter(
      (r) => r.minute >= task.startMinute && r.minute <= task.endMinute
    )

    if (matching.length === 0) continue

    const values = matching.map((r) => r.value)
    result[type] = {
      avg: Math.round(values.reduce((s, v) => s + v, 0) / values.length),
      min: Math.min(...values),
      max: Math.max(...values),
      count: matching.length,
      trend: computeTrend(matching as { minute: number; value: number }[]),
    }
  }

  if (healthRecords.exercise && Array.isArray(healthRecords.exercise)) {
    const matching = healthRecords.exercise.filter(
      (e) => e.startMinute < task.endMinute && e.endMinute > task.startMinute
    )
    if (matching.length > 0) {
      result.exercise = matching
    }
  }

  if (healthRecords.sleep && typeof healthRecords.sleep === 'object') {
    const sl = healthRecords.sleep
    if (task.startMinute < 6 * 60 && task.endMinute > 0) {
      result.sleepContext = sl
    }
  }

  return Object.keys(result).length > 0 ? result : null
}

function computeTrend(records: { minute: number; value: number }[]): 'rising' | 'falling' | 'stable' {
  if (records.length < 3) return 'stable'

  let rising = 0
  let falling = 0

  for (let i = 1; i < records.length; i++) {
    const diff = records[i].value - records[i - 1].value
    if (diff > 2) rising++
    else if (diff < -2) falling++
  }

  const ratio = rising / (rising + falling)
  if (ratio > 0.6) return 'rising'
  if (ratio < 0.4) return 'falling'
  return 'stable'
}

const EMOTION_PROFILES: Record<string, { label: string; icon: string; description: string }> = {
  calm: { label: '平静', icon: '😌', description: '内心平和，情绪稳定' },
  focused: { label: '专注', icon: '🎯', description: '注意力集中，思维清晰' },
  anxious: { label: '焦虑', icon: '😰', description: '内心不安，感到紧张' },
  stressed: { label: '压力', icon: '😫', description: '压力较大，需要放松' },
  joyful: { label: '愉悦', icon: '😊', description: '心情愉快，充满活力' },
  energized: { label: '精力充沛', icon: '⚡', description: '充满能量，干劲十足' },
  tired: { label: '疲惫', icon: '😴', description: '身心俱疲，需要休息' },
  bored: { label: '无聊', icon: '😐', description: '缺乏兴趣，动力不足' },
}

export function inferEmotionFromHealth(healthData: HealthCorrelation | DailyHealthSummary | null, taskCategory: string): InferedEmotion | null {
  if (!healthData) return null

  const hr = (healthData as HealthCorrelation).heartRate || (healthData as DailyHealthSummary).heartRate
  const stress = (healthData as HealthCorrelation).stress || (healthData as DailyHealthSummary).stress
  const steps = (healthData as HealthCorrelation).steps || (healthData as DailyHealthSummary).steps
  const exercise = (healthData as HealthCorrelation).exercise || (healthData as DailyHealthSummary).exercise?.items

  const avgHR = hr?.avg ?? null
  const stressAvg = stress?.avg ?? null
  const stressTrend = (healthData as HealthCorrelation).stress?.trend ?? null
  const hrTrend = (healthData as HealthCorrelation).heartRate?.trend ?? null
  const isExercise = exercise && exercise.length > 0

  if (isExercise) {
    if (avgHR && avgHR >= 120) return { ...EMOTION_PROFILES.energized, key: 'energized', confidence: 0.85 }
    return { ...EMOTION_PROFILES.energized, key: 'energized', confidence: 0.7 }
  }

  const scores: Record<string, number> = {}
  for (const key of Object.keys(EMOTION_PROFILES)) {
    scores[key] = 0
  }

  if (stressAvg !== null) {
    if (stressAvg < 25) {
      scores.calm += 3
      scores.focused += 2
    } else if (stressAvg < 50) {
      scores.focused += 2
      scores.calm += 1
    } else if (stressAvg < 75) {
      scores.anxious += 2
      scores.stressed += 1
    } else {
      scores.stressed += 3
      scores.anxious += 2
    }
  }

  if (avgHR !== null) {
    if (avgHR < 60) {
      scores.calm += 2
      scores.tired += 1
    } else if (avgHR < 80) {
      scores.calm += 2
      scores.focused += 1
    } else if (avgHR < 100) {
      scores.energized += 2
      scores.joyful += 1
    } else {
      scores.anxious += 2
      scores.stressed += 1
    }
  }

  if (hr && hr.max - hr.min > 30) {
    scores.anxious += 1
    scores.energized += 1
  } else if (hr && hr.max - hr.min < 10) {
    scores.calm += 1
    scores.bored += 1
  }

  const stepsValue = steps ? ('avg' in steps ? steps.avg : steps.total) : 0
  if (stepsValue > 0) {
    if (stepsValue > 500) {
      scores.energized += 2
      scores.joyful += 1
    } else if (stepsValue > 200) {
      scores.energized += 1
      scores.joyful += 1
    }
  }

  if (taskCategory === 'focus' || taskCategory === 'study') {
    scores.focused += 1
    scores.tired += 1
  } else if (taskCategory === 'meeting') {
    scores.anxious += 1
    scores.stressed += 1
  } else if (taskCategory === 'life') {
    scores.joyful += 2
    scores.calm += 1
  } else if (taskCategory === 'health') {
    scores.energized += 2
    scores.calm += 1
  }

  if (stressTrend === 'rising') {
    scores.anxious += 1
    scores.stressed += 1
  } else if (stressTrend === 'falling') {
    scores.calm += 1
    scores.joyful += 1
  }

  if (hrTrend === 'rising') {
    scores.energized += 1
    scores.anxious += 1
  } else if (hrTrend === 'falling') {
    scores.calm += 1
    scores.tired += 1
  }

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1])
  const topEmotion = sorted[0]

  if (topEmotion[1] === 0) return null

  const profile = EMOTION_PROFILES[topEmotion[0]]
  const confidence = Math.min(0.95, topEmotion[1] / 10)

  return { ...profile, key: topEmotion[0], confidence }
}

export function formatHealthValue(value: number, metric: keyof DayHealthData): string {
  switch (metric) {
    case 'heartRate':
      return `${value} bpm`
    case 'stress':
      return `${value}`
    case 'steps':
      return `${value.toLocaleString()}`
    case 'spo2':
      return `${value}%`
    case 'exercise':
      return `${value}分钟`
    case 'sleep':
      return `${value}小时`
    default:
      return value.toString()
  }
}

export function buildHealthSummaryText(summary: DailyHealthSummary | null): string {
  if (!summary || !summary.hasData) return '无健康数据'

  const parts: string[] = []

  if (summary.heartRate) {
    parts.push(`心率: 平均${summary.heartRate.avg}bpm (${summary.heartRate.min}-${summary.heartRate.max})`)
  }
  if (summary.stress) {
    parts.push(`压力: 平均${summary.stress.avg} (${summary.stress.min}-${summary.stress.max})`)
  }
  if (summary.steps) {
    parts.push(`步数: ${summary.steps.total.toLocaleString()}步`)
  }
  if (summary.spo2) {
    parts.push(`血氧: 平均${summary.spo2.avg}%`)
  }
  if (summary.exercise) {
    parts.push(`运动: ${summary.exercise.totalMinutes}分钟`)
  }
  if (summary.sleep) {
    parts.push(`睡眠: ${summary.sleep.duration}小时, 质量${summary.sleep.quality}/10`)
  }

  return parts.join('; ')
}

export function generateDemoHealthData(_dateKey: string): DayHealthData {
  const heartRate: HeartRateRecord[] = []
  const stress: StressRecord[] = []
  const steps: StepsRecord[] = []

  for (let minute = 0; minute < 1440; minute += 10) {
    const hour = Math.floor(minute / 60)
    
    let baseHR = 70
    let baseStress = 30
    
    if (hour >= 6 && hour < 9) {
      baseHR = 75 + Math.random() * 10
      baseStress = 40 + Math.random() * 20
    } else if (hour >= 9 && hour < 12) {
      baseHR = 80 + Math.random() * 15
      baseStress = 50 + Math.random() * 30
    } else if (hour >= 12 && hour < 14) {
      baseHR = 72 + Math.random() * 8
      baseStress = 35 + Math.random() * 15
    } else if (hour >= 14 && hour < 18) {
      baseHR = 82 + Math.random() * 12
      baseStress = 55 + Math.random() * 25
    } else if (hour >= 18 && hour < 21) {
      baseHR = 75 + Math.random() * 10
      baseStress = 40 + Math.random() * 20
    } else if (hour >= 21 && hour < 23) {
      baseHR = 68 + Math.random() * 8
      baseStress = 25 + Math.random() * 15
    } else {
      baseHR = 55 + Math.random() * 10
      baseStress = 15 + Math.random() * 10
    }

    heartRate.push({ minute, value: Math.round(baseHR) })
    stress.push({ minute, value: Math.round(Math.min(100, Math.max(0, baseStress))) })
    steps.push({ minute, value: hour >= 9 && hour < 18 ? Math.round(Math.random() * 50) : Math.round(Math.random() * 20) })
  }

  const sleep: SleepData = {
    bedtime: 22 * 60 + 30,
    wakeupTime: 6 * 60 + 45,
    deepSleepMinutes: 120,
    lightSleepMinutes: 345,
    totalMinutes: 465,
    quality: 7,
  }

  const exercise: ExerciseRecord[] = [
    { startMinute: 18 * 60, endMinute: 19 * 60, type: '跑步', calories: 350 },
  ]

  return { heartRate, stress, steps, sleep, exercise }
}
