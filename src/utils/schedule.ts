import type { Task } from '@/types'

export interface LayoutTask extends Task {
  columnIndex: number
  totalColumns: number
  isConflict?: boolean
}

export function layoutTasks(tasks: Task[]): LayoutTask[] {
  const sorted = assignColumns(tasks)

  return sorted.map((task, _, allTasks) => {
    const isConflict = allTasks.some(
      (otherTask) =>
        otherTask.id !== task.id &&
        task.startMinute < otherTask.endMinute &&
        otherTask.startMinute < task.endMinute
    )

    return { ...task, isConflict }
  })
}

function assignColumns(tasks: Task[]): LayoutTask[] {
  if (tasks.length === 0) {
    return []
  }

  const sorted = [...tasks].sort((a, b) => a.startMinute - b.startMinute)
  const columns: Task[][] = []

  for (const task of sorted) {
    let placed = false

    for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
      const lastTask = columns[colIndex][columns[colIndex].length - 1]
      if (task.startMinute >= lastTask.endMinute) {
        columns[colIndex].push(task)
        placed = true
        break
      }
    }

    if (!placed) {
      columns.push([task])
    }
  }

  const result: LayoutTask[] = []

  for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
    for (const task of columns[colIndex]) {
      result.push({
        ...task,
        columnIndex: colIndex,
        totalColumns: columns.length,
      })
    }
  }

  return result
}

export interface DaySummary {
  busyMinutes: number
  freeMinutes: number
  focusMinutes: number
  taskCount: number
  nextTask?: Task
  completedCount: number
}

export function getDaySummary(tasks: Task[], date: string): DaySummary {
  const todayTasks = tasks.filter((t) => t.date === date)
  
  const busyMinutes = todayTasks.reduce((sum, task) => {
    return sum + (task.endMinute - task.startMinute)
  }, 0)

  const focusMinutes = todayTasks
    .filter((t) => t.category === 'focus' || t.category === 'study')
    .reduce((sum, task) => {
      return sum + (task.endMinute - task.startMinute)
    }, 0)

  const nowMinute = new Date().getHours() * 60 + new Date().getMinutes()
  const nextTask = todayTasks
    .filter((t) => t.startMinute > nowMinute && !t.done)
    .sort((a, b) => a.startMinute - b.startMinute)[0]

  return {
    busyMinutes,
    freeMinutes: Math.max(0, 1440 - busyMinutes),
    focusMinutes,
    taskCount: todayTasks.length,
    nextTask,
    completedCount: todayTasks.filter((t) => t.done).length,
  }
}

export function detectConflicts(tasks: Task[]): Task[] {
  const result: Task[] = []

  for (let i = 0; i < tasks.length; i += 1) {
    for (let j = i + 1; j < tasks.length; j += 1) {
      const t1 = tasks[i]
      const t2 = tasks[j]

      if (t1.date === t2.date && t1.startMinute < t2.endMinute && t2.startMinute < t1.endMinute) {
        if (!result.includes(t1)) result.push(t1)
        if (!result.includes(t2)) result.push(t2)
      }
    }
  }

  return result
}

export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export const TASK_TEMPLATES = [
  { title: '深度工作', category: 'focus' as const, duration: 120 },
  { title: '学习新技能', category: 'study' as const, duration: 90 },
  { title: '团队会议', category: 'meeting' as const, duration: 60 },
  { title: '健身运动', category: 'health' as const, duration: 60 },
  { title: '午餐休息', category: 'life' as const, duration: 60 },
  { title: '邮件处理', category: 'admin' as const, duration: 30 },
]
