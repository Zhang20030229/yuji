import Dexie from 'dexie'
import type { Table } from 'dexie'
import type { MoodRecord, DecisionSession } from '@/types'

export class YujiDatabase extends Dexie {
  moodRecords!: Table<MoodRecord, number>
  decisionSessions!: Table<DecisionSession, number>

  constructor() {
    super('yuji-db')
    this.version(1).stores({
      moodRecords: '++id, date, mood, category, createdAt',
      decisionSessions: '++id, createdAt',
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
