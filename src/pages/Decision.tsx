import { useState, useEffect, useRef } from 'react'
import { Sparkles, RotateCcw, Play, Loader2, Shield, Cpu } from 'lucide-react'
import { CHARACTERS, type CharacterType, type DecisionMessage } from '@/types'
import { aiEngine } from '@/ai/webllm'
import { decisionDB } from '@/db'

type Step = 'input' | 'thinking' | 'result'

export default function DecisionPage() {
  const [step, setStep] = useState<Step>('input')
  const [question, setQuestion] = useState('')
  const [optionA, setOptionA] = useState('')
  const [optionB, setOptionB] = useState('')
  const [messages, setMessages] = useState<DecisionMessage[]>([])
  const [currentCharacter, setCurrentCharacter] = useState<CharacterType | null>(null)
  const [aiProgress, setAiProgress] = useState(0)
  const [isMockMode, setIsMockMode] = useState(true)
  const [isLoadingModel, setIsLoadingModel] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMockMode(aiEngine.isMockMode)
    aiEngine.setOnProgress((p) => setAiProgress(p))
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const characterOrder: CharacterType[] = ['judge', 'slacker', 'analyst', 'child', 'guide']

  async function startAnalysis() {
    if (!question.trim() || !optionA.trim() || !optionB.trim()) return

    setStep('thinking')
    setMessages([])

    if (!aiEngine.isMockMode) {
      await aiEngine.reset()
    }

    for (const charId of characterOrder) {
      setCurrentCharacter(charId)

      await new Promise((resolve) => setTimeout(resolve, 300))

      const response = await aiEngine.chatWithCharacter(charId, question, optionA, optionB)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          character: charId,
          content: response,
          timestamp: Date.now(),
        },
      ])

      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setCurrentCharacter(null)
    setStep('result')

    await decisionDB.add({
      question,
      optionA,
      optionB,
      createdAt: Date.now(),
      messages,
    })
  }

  function reset() {
    setStep('input')
    setQuestion('')
    setOptionA('')
    setOptionB('')
    setMessages([])
    setCurrentCharacter(null)
  }

  async function loadLocalModel() {
    if (isLoadingModel) return
    setIsLoadingModel(true)
    await aiEngine.initModel()
    setIsMockMode(aiEngine.isMockMode)
    setIsLoadingModel(false)
  }

  const quickQuestions = [
    {
      q: '要不要从大厂辞职回老家考公？',
      a: '留在大厂继续打拼',
      b: '回老家考公务员',
    },
    {
      q: '要不要接受条件好但不爱的相亲对象？',
      a: '接受，感情可以培养',
      b: '拒绝，等对的人',
    },
    {
      q: '要不要继续读博还是直接工作？',
      a: '继续读博深造',
      b: '直接工作赚钱',
    },
  ]

  function fillQuick(q: string, a: string, b: string) {
    setQuestion(q)
    setOptionA(a)
    setOptionB(b)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-yuji-800">决策推演</h1>
        <p className="text-sm text-yuji-500 mt-1">
          听见内心的五个声音，找到属于自己的答案
        </p>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${
          isMockMode ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' : 'bg-green-50 text-green-700 border border-green-100'
        }`}
      >
        {isMockMode ? (
          <>
            <Sparkles size={16} />
            <span className="flex-1">演示模式：使用预置回答，所有数据本地处理</span>
            <button
              onClick={loadLocalModel}
              disabled={isLoadingModel}
              className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg text-xs hover:bg-yellow-200 transition-colors"
            >
              {isLoadingModel ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  加载中 {Math.round(aiProgress)}%
                </>
              ) : (
                <>
                  <Cpu size={14} />
                  启用端侧AI
                </>
              )}
            </button>
          </>
        ) : (
          <>
            <Shield size={16} />
            <span>端侧AI已启用 · 所有推理在本地完成，数据不上传</span>
          </>
        )}
      </div>

      {step === 'input' && (
        <div className="space-y-5">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-yuji-700 mb-2">
                  你在纠结什么问题？
                </label>
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="比如：要不要从大厂辞职回老家？"
                  className="w-full px-4 py-3 rounded-xl border border-yuji-200 bg-white focus:outline-none focus:ring-2 focus:ring-yuji-300 focus:border-transparent text-yuji-700 placeholder-yuji-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-2">
                    选项 A
                  </label>
                  <input
                    type="text"
                    value={optionA}
                    onChange={(e) => setOptionA(e.target.value)}
                    placeholder="留在一线继续打拼"
                    className="w-full px-4 py-3 rounded-xl border border-yuji-200 bg-white focus:outline-none focus:ring-2 focus:ring-yuji-300 focus:border-transparent text-yuji-700 placeholder-yuji-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-yuji-700 mb-2">
                    选项 B
                  </label>
                  <input
                    type="text"
                    value={optionB}
                    onChange={(e) => setOptionB(e.target.value)}
                    placeholder="回老家考公务员"
                    className="w-full px-4 py-3 rounded-xl border border-yuji-200 bg-white focus:outline-none focus:ring-2 focus:ring-yuji-300 focus:border-transparent text-yuji-700 placeholder-yuji-300"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={startAnalysis}
              disabled={!question.trim() || !optionA.trim() || !optionB.trim()}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-yuji-500 to-yuji-400 text-white rounded-xl hover:from-yuji-600 hover:to-yuji-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play size={18} />
              开始内心对话
            </button>
          </div>

          <div className="bg-yuji-50/50 rounded-2xl p-4 border border-yuji-100">
            <p className="text-sm text-yuji-600 mb-3">💡 试试这些问题：</p>
            <div className="space-y-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => fillQuick(q.q, q.a, q.b)}
                  className="w-full text-left px-3 py-2 text-sm text-yuji-700 bg-white rounded-lg hover:bg-yuji-50 transition-colors"
                >
                  {q.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(step === 'thinking' || step === 'result') && (
        <div className="space-y-4">
          <div className="bg-white/50 rounded-xl p-4 border border-yuji-100">
            <p className="text-sm text-yuji-500 mb-1">问题</p>
            <p className="font-medium text-yuji-800">{question}</p>
            <div className="flex gap-3 mt-3">
              <span className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-sm">
                A：{optionA}
              </span>
              <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-sm">
                B：{optionB}
              </span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100 min-h-[400px]">
            {step === 'thinking' && currentCharacter && (
              <div className="text-center py-8">
                <div className="animate-bounce text-4xl mb-3">
                  {CHARACTERS.find((c) => c.id === currentCharacter)?.avatar}
                </div>
                <p className="text-yuji-600">
                  <span className="font-medium">
                    {CHARACTERS.find((c) => c.id === currentCharacter)?.name}
                  </span>{' '}
                  正在思考...
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((msg, i) => {
                const char = CHARACTERS.find((c) => c.id === msg.character)
                return (
                  <div key={i} className="flex gap-3 animate-fadeIn">
                    <div
                      className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xl ${char?.color}`}
                    >
                      {char?.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yuji-700 mb-1">
                        {char?.name}
                        <span className="text-xs font-normal text-yuji-400 ml-2">
                          {char?.description}
                        </span>
                      </p>
                      <div className="bg-yuji-50 rounded-xl p-3 text-sm text-yuji-700 leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div ref={messagesEndRef} />
          </div>

          {step === 'result' && (
            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-yuji-600 border border-yuji-200 rounded-xl hover:bg-yuji-50 transition-colors"
              >
                <RotateCcw size={18} />
                重新开始
              </button>
            </div>
          )}

          {step === 'result' && (
            <div className="bg-sage-50/70 rounded-2xl p-4 border border-sage-100">
              <p className="text-sm text-sage-600 leading-relaxed">
                💡 <strong>温馨提示：</strong>
                这些只是你内心的不同声音，没有哪个是"对"的。
                闭上眼睛感受一下，哪个声音让你觉得最放松、最真实？
                答案不在AI这里，在你自己心里。
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
        <h3 className="font-medium text-purple-700 mb-3">🧠 五位内心角色</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {CHARACTERS.map((char) => (
            <div key={char.id} className={`p-3 rounded-xl ${char.color} border text-center`}>
              <div className="text-2xl mb-1">{char.avatar}</div>
              <p className="text-xs font-medium">{char.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
