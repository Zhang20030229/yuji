import { Heart, Shield, Users, Lightbulb } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <div className="text-center py-6">
        <div className="text-5xl mb-4">🌿</div>
        <h1 className="text-2xl font-bold text-yuji-800">遇己</h1>
        <p className="text-yuji-500 mt-2">遇见真实的自己</p>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-yuji-100">
        <h2 className="font-semibold text-yuji-800 mb-3 flex items-center gap-2">
          <Lightbulb size={20} className="text-yuji-500" />
          我们的初心
        </h2>
        <p className="text-yuji-600 leading-relaxed">
          有这样一群人——他们或许从小镇出发，或许在大城市成长，都经历过一段迷茫与探索的时期。
          择业、定居、婚恋、人生意义……太多问题没有标准答案，太多声音在拉扯。
          他们是旁人眼中的"优秀者"，但只有自己知道，内心总有一种"不确定"的声音。
        </p>
        <p className="text-yuji-600 leading-relaxed mt-3">
          但只有他们自己知道，内心深处总有一种"不够好"的声音。
          比工资、比房子、比职级、比对象……永远在比较，永远在焦虑。
          单一的评价体系像一道紧箍咒，困住了真实的自己。
        </p>
        <p className="text-yuji-600 leading-relaxed mt-3">
          <strong className="text-yuji-700">遇己</strong>
          ，就是为这群人做的。我们不灌鸡汤，不教你怎么往上爬。
          我们只是想帮你——
          <span className="text-yuji-700 font-medium">
            听见自己内心的声音，看见真实的自己。
          </span>
        </p>
      </div>

      <div className="grid gap-4">
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-5 border border-pink-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-xl text-pink-500 shadow-sm">
              <Heart size={20} />
            </div>
            <div>
              <h3 className="font-medium text-pink-800 mb-1">情绪客观观测</h3>
              <p className="text-sm text-pink-600 leading-relaxed">
                用数据打破自我PUA。你以为的"我很差"，可能只是某一天、某件事带来的暂时情绪。
                长期记录下来，你会发现——原来我大部分时候都还不错。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-5 border border-violet-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-xl text-violet-500 shadow-sm">
              <Lightbulb size={20} />
            </div>
            <div>
              <h3 className="font-medium text-violet-800 mb-1">人生决策推演</h3>
              <p className="text-sm text-violet-600 leading-relaxed">
                听见内心的五个声音。卷王判官、躺平咸鱼、理性分析师、小孩初心、和解引导员——
                它们都是你的一部分。答案不在AI那里，在你自己心里。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white rounded-xl text-teal-500 shadow-sm">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-medium text-teal-800 mb-1">同频封闭社区</h3>
              <p className="text-sm text-teal-600 leading-relaxed">
                你不是性格有问题，你只是身边同类人太少。
                在这个封闭社区里，你不用解释什么是"奥德赛时期"的不安，不用怕被评判。
                你的脆弱，有人懂。
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-sage-50/70 rounded-2xl p-5 border border-sage-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white rounded-xl text-sage-600 shadow-sm">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-medium text-sage-700 mb-2">你的数据，只属于你</h3>
            <ul className="text-sm text-sage-600 space-y-2">
              <li>✓ 所有情绪日记、对话记录都存储在你本地的设备中</li>
              <li>✓ 端侧AI推理，数据不上传云端</li>
              <li>✓ 代码开源，任何人都可以审查数据流向</li>
              <li>✓ 一键删除所有数据，不留痕迹</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-yuji-100 text-center">
        <p className="text-yuji-700 leading-relaxed italic">
          "西西弗斯推石头上山不是悲剧，
          <br />
          真正的悲剧是——你以为别人都在看你，
          <br />
          其实大家都在看自己的石头。"
        </p>
        <p className="text-sm text-yuji-400 mt-3">—— 遇己</p>
      </div>

      <div className="text-center text-sm text-yuji-400 pb-4">
        <p>Made with 💚 for every 小镇做题家</p>
        <p className="mt-1">愿你遇见真实的自己</p>
      </div>
    </div>
  )
}
