import * as webllm from '@mlc-ai/web-llm'
import type { CharacterType } from '@/types'
import { buildCharacterPrompt } from './prompts'

export class AIEngine {
  private engine: webllm.MLCEngineInterface | null = null
  private isLoading = false
  private loadProgress = 0
  private useMock = true
  private onProgressCallback?: (progress: number) => void

  constructor() {
    this.useMock = true
  }

  setOnProgress(callback: (progress: number) => void) {
    this.onProgressCallback = callback
  }

  get isMockMode() {
    return this.useMock
  }

  get progress() {
    return this.loadProgress
  }

  async initModel(modelId: string = 'Qwen2-0.5B-Instruct-q4f32_1-MLC') {
    if (this.engine || this.isLoading) return

    this.isLoading = true
    this.loadProgress = 0

    try {
      this.engine = new webllm.MLCEngine()

      this.engine.setInitProgressCallback((report: webllm.InitProgressReport) => {
        this.loadProgress = report.progress * 100
        this.onProgressCallback?.(this.loadProgress)
        console.log(`[WebLLM] 加载中: ${report.text} - ${Math.round(this.loadProgress)}%`)
      })

      await this.engine.reload(modelId)
      this.useMock = false
      console.log('[WebLLM] 模型加载完成，端侧推理已就绪')
    } catch (error) {
      console.warn('[WebLLM] 加载失败，使用模拟模式:', error)
      this.useMock = true
      this.engine = null
    } finally {
      this.isLoading = false
    }
  }

  async chatWithCharacter(
    character: CharacterType,
    question: string,
    optionA: string,
    optionB: string
  ): Promise<string> {
    const prompt = buildCharacterPrompt(character, question, optionA, optionB)

    if (this.useMock || !this.engine) {
      return this.mockResponse(character, question, optionA, optionB)
    }

    try {
      const messages: webllm.ChatCompletionMessageParam[] = [
        { role: 'user', content: prompt },
      ]

      const reply = await this.engine.chat.completions.create({
        messages,
        temperature: 0.8,
      })

      return reply.choices[0]?.message?.content || '（AI没有回应）'
    } catch (error) {
      console.error('[WebLLM] 推理失败:', error)
      return this.mockResponse(character, question, optionA, optionB)
    }
  }

  private mockResponse(
    _character: CharacterType,
    _question: string,
    optionA: string,
    optionB: string
  ): string {
    const character = _character
    const responses: Record<CharacterType, string> = {
      judge: `从世俗成功的角度看，${optionA}明显更有"钱途"。你看看你同学，哪个不是往高处走？选${optionB}的话，之前这么多年的努力不就白费了？别人会怎么看你？35岁之前必须拼上去啊，现在不拼以后就没机会了。

——这只是你内心的一个声音`,

      slacker: `哎呀，选${optionB}吧，舒舒服服的不好吗？你想想${optionA}得熬多少夜、掉多少头发？人生苦短，何必为难自己呢。钱够花就行了，开心最重要嘛。你看你最近都失眠成啥样了，身体是自己的啊。

——这只是你内心的一个声音`,

      analyst: `让我们客观分析一下：

【${optionA}】
- 短期：高强度投入，可能牺牲健康和生活质量
- 长期：天花板较高，但不确定性也大
- 不可逆代价：青春、健康、陪伴家人的时间

【${optionB}】
- 短期：节奏平稳，有更多个人时间
- 长期：增长平缓但稳定，风险较低
- 不可逆代价：可能错过一些快速上升的窗口

两个选择各有优劣，没有绝对的对错。

——这只是你内心的一个声音`,

      child: `嗯...你喜欢哪个呀？

如果没人看着你，没有爸妈期待、没有同学比较，你自己会选哪个？

你做哪件事的时候，会忘记时间、觉得"啊好有意思"？

小时候你不是说想过……算了，你自己最清楚啦。

——这只是你内心的一个声音`,

      guide: `我听到你心里有好几个声音在吵架。

一边的声音说"要上进要成功"，另一边说"我好累我想停下来"。这很正常，小镇做题家都会经历这个阶段——我们太习惯用外界的标尺衡量自己了。

你有没有发现，你在思考的时候，用了很多"应该""必须"？这些"应该"是谁说的呢？是你自己的声音，还是别人的期待？

如果十年后回头看，你会后悔没选哪个？如果钱不是问题，你又会怎么选？

不用急着做决定，先听听你心里哪个声音最大。`,
    }

    return responses[character]
  }

  async reset() {
    if (this.engine) {
      await this.engine.resetChat()
    }
  }
}

export const aiEngine = new AIEngine()
