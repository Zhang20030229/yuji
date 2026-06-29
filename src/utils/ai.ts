import { GLM_API_URL } from '@/types'
import { settingsDB } from '@/db'
import { buildHealthSummaryText } from './health'
import type { Task, MoodRecord } from '@/types'
import type { DailyHealthSummary } from '@/types'

export interface ReportResult {
  success: boolean
  content?: string
  error?: string
}

export interface PromptData {
  date: string
  moodRecords: MoodRecord[]
  taskSummary: {
    busyMinutes: number
    freeMinutes: number
    focusMinutes: number
    taskCount: number
    nextTask?: Task
  }
  healthSummary?: DailyHealthSummary
  emotionInference?: {
    label: string
    description: string
    confidence: number
  }
}

export function buildAnalysisPrompt(data: PromptData): string {
  const { date, moodRecords, taskSummary, healthSummary, emotionInference } = data

  let prompt = `你是一位专业的个人成长教练。请根据以下数据为用户生成一份每日分析报告。

日期：${date}

--- 情绪数据 ---
`

  if (moodRecords.length > 0) {
    moodRecords.forEach((record) => {
      prompt += `- 时间: ${new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} | 情绪: ${record.mood}分 | 事件: ${record.event} | 分类: ${record.category}${record.note ? ` | 备注: ${record.note}` : ''}\n`
    })
  } else {
    prompt += '今日无情绪记录\n'
  }

  prompt += `\n--- 时间管理数据 ---
- 任务总数: ${taskSummary.taskCount}个
- 忙碌时间: ${Math.round(taskSummary.busyMinutes / 60 * 10) / 10}小时
- 专注时间: ${Math.round(taskSummary.focusMinutes / 60 * 10) / 10}小时
- 空闲时间: ${Math.round(taskSummary.freeMinutes / 60 * 10) / 10}小时
${taskSummary.nextTask ? `- 下一个任务: ${taskSummary.nextTask.title} (${taskSummary.nextTask.startMinute}分钟开始)` : ''}

--- 健康数据 ---
${healthSummary ? buildHealthSummaryText(healthSummary) : '今日无健康数据'}

${emotionInference ? `\n--- 情绪推断 ---
从生理数据推断的情绪状态: ${emotionInference.label} (${Math.round(emotionInference.confidence * 100)}%)
描述: ${emotionInference.description}
` : ''}

--- 报告要求 ---
请生成一份结构清晰、温暖贴心的日报，包含以下部分：
1. 今日概览：总结今天的整体状态
2. 情绪洞察：分析情绪变化和影响因素
3. 时间管理：评估时间利用效率，提出优化建议
4. 健康建议：基于健康数据给出具体建议
5. 明日行动：给出3条具体的行动建议

语言风格：亲切、鼓励、专业，使用适当的emoji装饰，不要过于生硬。`

  return prompt
}

export async function generateDailyReport(prompt: string): Promise<string> {
  try {
    const apiKey = await settingsDB.getGLMApiKey()
    const model = await settingsDB.getGLMModel()

    if (!apiKey) {
      throw new Error('请先在设置中配置GLM API Key')
    }

    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || '生成报告失败'
  } catch (error) {
    console.error('生成日报失败:', error)
    return `生成日报时遇到问题: ${(error as Error).message}`
  }
}

export async function analyzeDecision(question: string, options: string[]): Promise<string> {
  try {
    const apiKey = await settingsDB.getGLMApiKey()
    const model = await settingsDB.getGLMModel()

    if (!apiKey) {
      return '请先在设置中配置GLM API Key'
    }

    const prompt = `你是一位智慧的决策顾问。请帮助用户分析以下决策问题：

问题：${question}

选项：
${options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n')}

请从多个角度分析：
1. 理性分析：各选项的优缺点
2. 直觉感受：哪个选项更符合内心
3. 长期影响：各选项对未来的影响
4. 风险评估：潜在风险和应对策略

最后给出你的建议，但请记住最终决定权在用户手中。语言风格温暖、理性、有同理心。`

    const response = await fetch(GLM_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`)
    }

    const result = await response.json()
    return result.choices?.[0]?.message?.content || '分析失败'
  } catch (error) {
    console.error('决策分析失败:', error)
    return `分析时遇到问题: ${(error as Error).message}`
  }
}
