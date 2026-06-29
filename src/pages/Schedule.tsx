import { useState, useEffect } from 'react'
import { Plus, ChevronLeft, ChevronRight, Edit2, Trash2, Tag, AlertCircle } from 'lucide-react'
import { taskDB } from '@/db'
import { todayKey, addDays, formatTime, formatLongDate, isToday, parseTime } from '@/utils/date'
import { layoutTasks, getDaySummary, createId, TASK_TEMPLATES } from '@/utils/schedule'
import { CATEGORY_META } from '@/types'
import type { Task, TaskCategory } from '@/types'

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState(todayKey())
  const [tasks, setTasks] = useState<Task[]>([])
  const [layoutedTasks, setLayoutedTasks] = useState(layoutTasks([]))
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    category: 'focus' as TaskCategory,
    startMinute: 9 * 60,
    endMinute: 11 * 60,
    note: '',
  })

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const dateTasks = tasks.filter((t) => t.date === selectedDate)
    setLayoutedTasks(layoutTasks(dateTasks))
  }, [tasks, selectedDate])

  const loadTasks = async () => {
    const allTasks = await taskDB.getAll()
    setTasks(allTasks)
  }

  const handleAddTask = async () => {
    if (!formData.title.trim()) return

    const newTask: Task = {
      id: createId(),
      title: formData.title,
      date: selectedDate,
      startMinute: formData.startMinute,
      endMinute: formData.endMinute,
      category: formData.category,
      note: formData.note || undefined,
      done: false,
    }

    await taskDB.add(newTask)
    await loadTasks()
    setShowAddModal(false)
    setFormData({
      title: '',
      category: 'focus',
      startMinute: 9 * 60,
      endMinute: 11 * 60,
      note: '',
    })
  }

  const handleEditTask = (task: Task) => {
    setCurrentTask(task)
    setFormData({
      title: task.title,
      category: task.category,
      startMinute: task.startMinute,
      endMinute: task.endMinute,
      note: task.note || '',
    })
    setShowEditModal(true)
  }

  const handleUpdateTask = async () => {
    if (!currentTask || !formData.title.trim()) return

    await taskDB.update(currentTask.id, {
      title: formData.title,
      category: formData.category,
      startMinute: formData.startMinute,
      endMinute: formData.endMinute,
      note: formData.note || undefined,
    })

    await loadTasks()
    setShowEditModal(false)
    setCurrentTask(null)
  }

  const handleDeleteTask = async (taskId: string) => {
    await taskDB.delete(taskId)
    await loadTasks()
  }

  const handleToggleTask = async (task: Task) => {
    await taskDB.update(task.id, { done: !task.done })
    await loadTasks()
  }

  const handleUseTemplate = (template: typeof TASK_TEMPLATES[0]) => {
    setFormData({
      title: template.title,
      category: template.category,
      startMinute: 9 * 60,
      endMinute: 9 * 60 + template.duration,
      note: '',
    })
    setShowAddModal(true)
  }

  const daySummary = getDaySummary(tasks, selectedDate)

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-yuji-800">
              {isToday(selectedDate) ? '今天' : formatLongDate(selectedDate)}
            </h1>
            <p className="text-sm text-yuji-500">
              {daySummary.completedCount}/{daySummary.taskCount} 任务完成 ·{' '}
              {Math.round((daySummary.completedCount / Math.max(1, daySummary.taskCount)) * 100)}%
            </p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-yuji-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-yuji-600 text-white rounded-lg hover:bg-yuji-700 transition-colors"
        >
          <Plus size={18} />
          添加任务
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-sm text-blue-600">忙碌时间</div>
          <div className="text-xl font-bold text-blue-700">
            {Math.round(daySummary.busyMinutes / 60 * 10) / 10}h
          </div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-sm text-green-600">专注时间</div>
          <div className="text-xl font-bold text-green-700">
            {Math.round(daySummary.focusMinutes / 60 * 10) / 10}h
          </div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-sm text-purple-600">空闲时间</div>
          <div className="text-xl font-bold text-purple-700">
            {Math.round(daySummary.freeMinutes / 60 * 10) / 10}h
          </div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-sm text-orange-600">任务数量</div>
          <div className="text-xl font-bold text-orange-700">
            {daySummary.taskCount}个
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-yuji-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-yuji-100">
          <div className="w-16 flex-shrink-0 border-r border-yuji-100"></div>
          <div className="flex-1 grid grid-cols-12">
            {hours.map((h) => (
              <div
                key={h}
                className="border-r border-yuji-50 last:border-r-0 text-center py-2 text-xs text-yuji-400"
              >
                {h}:00
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="flex border-b border-yuji-50">
              <div className="w-16 flex-shrink-0 border-r border-yuji-100 py-1 text-xs text-yuji-500 pr-2 text-right">
                {hour}:00
              </div>
              <div className="flex-1 relative">
                <div className="absolute inset-0 grid grid-cols-12">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="border-r border-yuji-50 last:border-r-0"></div>
                  ))}
                </div>

                {layoutedTasks
                  .filter((task) => {
                    const taskHour = Math.floor(task.startMinute / 60)
                    return taskHour === hour || Math.floor(task.endMinute / 60) > hour
                  })
                  .map((task) => {
                    const top = ((task.startMinute % 60) / 60) * 60
                    const height = ((task.endMinute - task.startMinute) / 60) * 60
                    const width = task.totalColumns > 1 ? `${100 / task.totalColumns}%` : '100%'
                    const left = task.totalColumns > 1 ? `${(task.columnIndex / task.totalColumns) * 100}%` : '0'

                    const meta = CATEGORY_META[task.category]

                    return (
                      <div
                        key={task.id}
                        className={`absolute rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                          task.done ? 'opacity-50' : ''
                        } ${task.isConflict ? 'ring-2 ring-red-400' : ''}`}
                        style={{
                          top: `${top}px`,
                          height: `${Math.max(height - 4, 20)}px`,
                          width,
                          left,
                          backgroundColor: meta.bgColor.split(' ')[0],
                          border: meta.bgColor.split(' ')[1] || undefined,
                        }}
                        onClick={() => handleToggleTask(task)}
                      >
                        <div className={`text-xs font-medium ${meta.color}`}>
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-yuji-500">
                            {formatTime(task.startMinute)} - {formatTime(task.endMinute)}
                          </span>
                          {task.isConflict && (
                            <span className="flex items-center text-xs text-red-500">
                              <AlertCircle size={10} />
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditTask(task)
                            }}
                            className="p-1 hover:bg-black/5 rounded"
                          >
                            <Edit2 size={12} className="text-yuji-500" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteTask(task.id)
                            }}
                            className="p-1 hover:bg-black/5 rounded"
                          >
                            <Trash2 size={12} className="text-red-500" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-yuji-700 mb-3">快速模板</h3>
        <div className="flex flex-wrap gap-2">
          {TASK_TEMPLATES.map((template) => {
            const meta = CATEGORY_META[template.category]
            return (
              <button
                key={template.title}
                onClick={() => handleUseTemplate(template)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${meta.bgColor} ${meta.color} hover:opacity-80 transition-opacity`}
              >
                <Tag size={14} />
                {template.title}
                <span className="text-xs opacity-70">{template.duration}分钟</span>
              </button>
            )
          })}
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-yuji-800 mb-4">添加新任务</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">任务名称</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  placeholder="输入任务名称"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_META) as TaskCategory[]).map((cat) => {
                    const meta = CATEGORY_META[cat]
                    return (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          formData.category === cat
                            ? `${meta.bgColor} ${meta.color}`
                            : 'border-yuji-200 text-yuji-600 hover:bg-yuji-50'
                        }`}
                      >
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={formatTime(formData.startMinute)}
                    onChange={(e) => setFormData({ ...formData, startMinute: parseTime(e.target.value) })}
                    className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={formatTime(formData.endMinute)}
                    onChange={(e) => setFormData({ ...formData, endMinute: parseTime(e.target.value) })}
                    className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  placeholder="添加备注（可选）"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-yuji-600 hover:bg-yuji-50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleAddTask}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-yuji-600 text-white rounded-lg hover:bg-yuji-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                添加
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && currentTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-yuji-800 mb-4">编辑任务</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">任务名称</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">分类</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(CATEGORY_META) as TaskCategory[]).map((cat) => {
                    const meta = CATEGORY_META[cat]
                    return (
                      <button
                        key={cat}
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                          formData.category === cat
                            ? `${meta.bgColor} ${meta.color}`
                            : 'border-yuji-200 text-yuji-600 hover:bg-yuji-50'
                        }`}
                      >
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-1">开始时间</label>
                  <input
                    type="time"
                    value={formatTime(formData.startMinute)}
                    onChange={(e) => setFormData({ ...formData, startMinute: parseTime(e.target.value) })}
                    className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-1">结束时间</label>
                  <input
                    type="time"
                    value={formatTime(formData.endMinute)}
                    onChange={(e) => setFormData({ ...formData, endMinute: parseTime(e.target.value) })}
                    className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-1">备注</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-yuji-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yuji-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setCurrentTask(null)
                }}
                className="px-4 py-2 text-yuji-600 hover:bg-yuji-50 rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleUpdateTask}
                disabled={!formData.title.trim()}
                className="px-4 py-2 bg-yuji-600 text-white rounded-lg hover:bg-yuji-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
