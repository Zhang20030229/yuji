import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { MoodRecord, DecisionSession, Task, DailyReport, Settings, DayHealthData } from '@/types'

export class YujiDatabase extends Dexie {
  moodRecords!: Table<MoodRecord, number>
  decisionSessions!: Table<DecisionSession, number>
  tasks!: Table<Task, string>
  healthData!: Table<{ date: string; data: DayHealthData }, string>
  reports!: Table<DailyReport, string>
  settings!: Table<Settings, string>

  constructor() {
    super('yuji-db')
    this.version(2).stores({
      moodRecords: '++id, date, mood, category, createdAt',
      decisionSessions: '++id, createdAt',
      tasks: 'id, date, startMinute, endMinute, category, done',
      healthData: 'date',
      reports: 'date',
      settings: 'key',
    })
  }
}

export const db = new YujiDatabase()

export const moodDB = {
  async add(record: Omit<MoodRecord, 'id'>) {
    return db.moodRecords.add(record as MoodRecord)
  },

  async getAll(): Promise<MoodRecord[]> {
    return db.moodRecords.orderBy('createdAt').reverse().toArray()
  },

  async getByDateRange(startDate: string, endDate: string): Promise<MoodRecord[]> {
    return db.moodRecords
      .where('date')
      .between(startDate, endDate, true, true)
      .sortBy('date')
  },

  async getRecent(days: number = 7): Promise<MoodRecord[]> {
    const now = new Date()
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    return db.moodRecords
      .where('createdAt')
      .aboveOrEqual(past.getTime())
      .sortBy('createdAt')
  },

  async update(id: number, changes: Partial<MoodRecord>) {
    return db.moodRecords.update(id, changes)
  },

  async getByDate(createdAt: string): Promise<MoodRecord | undefined> {
    const all = await db.moodRecords.toArray()
    return all.find(r => new Date(r.createdAt).toISOString().split('T')[0] === createdAt.split('T')[0])
  },

  async delete(id: number) {
    return db.moodRecords.delete(id)
  },

  async clearAll() {
    return db.moodRecords.clear()
  },
}

export const decisionDB = {
  async add(session: Omit<DecisionSession, 'id'>) {
    return db.decisionSessions.add(session as DecisionSession)
  },

  async getAll(): Promise<DecisionSession[]> {
    return db.decisionSessions.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: number): Promise<DecisionSession | undefined> {
    return db.decisionSessions.get(id)
  },

  async update(id: number, changes: Partial<DecisionSession>) {
    return db.decisionSessions.update(id, changes)
  },

  async delete(id: number) {
    return db.decisionSessions.delete(id)
  },

  async clearAll() {
    return db.decisionSessions.clear()
  },
}

export const taskDB = {
  async getAll(): Promise<Task[]> {
    const tasks = await db.tasks.orderBy('date').toArray()
    return tasks.sort((a, b) => a.date.localeCompare(b.date) || a.startMinute - b.startMinute)
  },

  async getByDate(date: string): Promise<Task[]> {
    const tasks = await db.tasks.where('date').equals(date).toArray()
    return tasks.sort((a, b) => a.startMinute - b.startMinute)
  },

  async add(task: Task) {
    return db.tasks.add(task)
  },

  async update(id: string, changes: Partial<Task>) {
    return db.tasks.update(id, changes)
  },

  async delete(id: string) {
    return db.tasks.delete(id)
  },

  async clearAll() {
    return db.tasks.clear()
  },
}

export const healthDB = {
  async getByDate(date: string): Promise<DayHealthData | undefined> {
    const result = await db.healthData.get(date)
    return result?.data
  },

  async setByDate(date: string, data: DayHealthData) {
    return db.healthData.put({ date, data })
  },

  async getAll(): Promise<{ date: string; data: DayHealthData }[]> {
    return db.healthData.orderBy('date').toArray()
  },

  async getRecentDays(days: number): Promise<{ date: string; data: DayHealthData }[]> {
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    const startDateStr = startDate.toISOString().split('T')[0]
    const nowStr = now.toISOString().split('T')[0]
    return db.healthData.where('date').between(startDateStr, nowStr, true, true).toArray()
  },

  async clearAll() {
    return db.healthData.clear()
  },
}

export const reportDB = {
  async getByDate(date: string): Promise<DailyReport | undefined> {
    return db.reports.get(date)
  },

  async add(report: DailyReport) {
    return db.reports.add(report)
  },

  async update(date: string, changes: Partial<DailyReport>) {
    return db.reports.update(date, changes)
  },

  async getAll(): Promise<DailyReport[]> {
    return db.reports.orderBy('date').reverse().toArray()
  },

  async clearAll() {
    return db.reports.clear()
  },
}

export const settingsDB = {
  async get(): Promise<Settings | undefined> {
    return db.settings.get('default')
  },

  async set(settings: Settings) {
    return db.settings.put({ ...settings, key: 'default' })
  },

  async getGLMApiKey(): Promise<string> {
    const settings = await this.get()
    return settings?.glmApiKey || ''
  },

  async getGLMModel(): Promise<string> {
    const settings = await this.get()
    return settings?.glmModel || 'glm-4-flash'
  },
}
