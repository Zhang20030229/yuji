import { useState } from 'react'
import { Lock, MessageCircle, BookOpen, Sparkles, Shield, ChevronRight } from 'lucide-react'

type TabType = 'diary' | 'stories' | 'lab'

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<TabType>('diary')

  const tabs = [
    { id: 'diary' as TabType, label: '焦虑拆解日记', icon: MessageCircle },
    { id: 'stories' as TabType, label: '选择实录', icon: BookOpen },
    { id: 'lab' as TabType, label: '和解实验室', icon: Sparkles },
  ]

  const diaryPosts = [
    {
      id: 1,
      title: '今天同学聚会，当年不如我的人都靠家里进体制了',
      excerpt:
        '突然觉得这么多年书白读了……我在大厂996还买不起房，人家朝九晚五有房有车。有没有人懂这种感觉？',
      replies: 128,
      likes: 256,
      time: '2小时前',
      tag: '自我价值',
    },
    {
      id: 2,
      title: '相亲了20次，每次都因为家庭背景被嫌弃',
      excerpt:
        '农村出身，父母没有退休金，还有个弟弟。每次相亲说到家庭情况，对方态度就变了。我真的不配拥有幸福吗？',
      replies: 89,
      likes: 178,
      time: '5小时前',
      tag: '婚恋焦虑',
    },
    {
      id: 3,
      title: '30岁了还在租房，觉得自己很失败',
      excerpt:
        '同学都买房结婚了，我还在一线城市漂着。不敢回家，怕被问工资问对象。有时候深夜会想，这么辛苦到底是为了什么？',
      replies: 203,
      likes: 342,
      time: '昨天',
      tag: '未来规划',
    },
    {
      id: 4,
      title: '终于鼓起勇气和爸妈说我不想考公了',
      excerpt:
        '他们念叨了三年，说稳定体面。但我真的不喜欢那种一眼望到头的生活。吵了一架，但说完之后反而轻松了。',
      replies: 67,
      likes: 145,
      time: '昨天',
      tag: '家庭关系',
    },
  ]

  const stories = [
    {
      id: 1,
      title: '我从大厂回老家当老师的一年',
      author: '曾经的算法工程师',
      excerpt:
        '放弃了年薪50万的工作，回到县城当高中老师。工资只有原来的1/5，但我终于能好好吃饭、好好睡觉了。',
      likes: 512,
      comments: 89,
      tag: '职业选择',
    },
    {
      id: 2,
      title: '30岁，我决定不买房了',
      author: '一线城市打工人',
      excerpt:
        '算了一笔账，买房要掏空六个钱包+30年房贷。算了，租房子也能活，把钱花在让自己开心的事情上不好吗？',
      likes: 687,
      comments: 156,
      tag: '生活方式',
    },
    {
      id: 3,
      title: '读了985，我去开奶茶店了',
      author: '曾经的高考状元',
      excerpt:
        '亲戚都说我白读了，爸妈觉得丢脸。但我每天都很开心，做自己喜欢的事，比什么都重要。',
      likes: 823,
      comments: 234,
      tag: '自我实现',
    },
  ]

  const labSessions = [
    {
      id: 1,
      title: '和原生家庭和解：不是原谅，是划清边界',
      facilitator: '小溪（心理学硕士/小镇出身）',
      time: '本周六 20:00',
      participants: 28,
      maxParticipants: 30,
      status: '报名中',
    },
    {
      id: 2,
      title: '停止社会比较：你不需要和任何人赛跑',
      facilitator: '阿杰（走过这条路的学长）',
      time: '下周三 19:30',
      participants: 15,
      maxParticipants: 30,
      status: '报名中',
    },
    {
      id: 3,
      title: '接纳自己的普通：平凡不等于失败',
      facilitator: '小楠（心理咨询师）',
      time: '下周日 20:00',
      participants: 30,
      maxParticipants: 30,
      status: '已满员',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-yuji-800">同频社区</h1>
        <p className="text-sm text-yuji-500 mt-1">你不是性格有问题，你是千万同类人中的一个</p>
      </div>

      <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border border-teal-100">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white rounded-xl text-teal-600 shadow-sm">
            <Lock size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-teal-800 mb-1">封闭社区 · 仅同类人可见</h3>
            <p className="text-sm text-teal-600 leading-relaxed">
              仅开放给小镇出身、通过高考突围的青年。
              <br />
              没有营销号，没有内卷博主，只有懂你的同路人。
            </p>
            <button className="mt-3 px-4 py-2 bg-teal-500 text-white text-sm rounded-lg hover:bg-teal-600 transition-colors">
              申请加入社区
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-white/60 rounded-xl p-1 border border-yuji-100 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                active
                  ? 'bg-yuji-500 text-white shadow-sm'
                  : 'text-yuji-600 hover:bg-yuji-50'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'diary' && (
        <div className="space-y-3">
          {diaryPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100 hover:border-yuji-200 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-yuji-800 line-clamp-1">{post.title}</h3>
                <span className="text-xs px-2 py-0.5 bg-yuji-50 text-yuji-500 rounded-full flex-shrink-0">
                  {post.tag}
                </span>
              </div>
              <p className="text-sm text-yuji-600 mt-2 line-clamp-2">{post.excerpt}</p>
              <div className="flex items-center gap-4 mt-3 text-xs text-yuji-400">
                <span className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  {post.replies} 回复
                </span>
                <span className="flex items-center gap-1">❤️ {post.likes}</span>
                <span className="ml-auto">{post.time}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'stories' && (
        <div className="space-y-4">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-yuji-100 hover:border-yuji-200 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs px-2 py-0.5 bg-sage-100 text-sage-600 rounded-full">
                  {story.tag}
                </span>
                <ChevronRight
                  size={18}
                  className="text-yuji-300 group-hover:text-yuji-500 group-hover:translate-x-0.5 transition-all"
                />
              </div>
              <h3 className="font-semibold text-yuji-800 text-lg group-hover:text-yuji-600 transition-colors">
                {story.title}
              </h3>
              <p className="text-sm text-yuji-500 mt-1">—— {story.author}</p>
              <p className="text-sm text-yuji-600 mt-3 leading-relaxed">{story.excerpt}</p>
              <div className="flex items-center gap-4 mt-4 text-xs text-yuji-400">
                <span>❤️ {story.likes} 喜欢</span>
                <span>💬 {story.comments} 评论</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'lab' && (
        <div className="space-y-3">
          {labSessions.map((session) => (
            <div
              key={session.id}
              className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-yuji-100"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-yuji-800">{session.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                    session.status === '报名中'
                      ? 'bg-green-50 text-green-600'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <p className="text-sm text-yuji-500 mt-2">引导员：{session.facilitator}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm text-yuji-600">
                  <span>🕐 {session.time}</span>
                  <span className="mx-2">·</span>
                  <span>
                    👥 {session.participants}/{session.maxParticipants}人
                  </span>
                </div>
                <button
                  disabled={session.status === '已满员'}
                  className="px-3 py-1.5 text-sm rounded-lg bg-yuji-500 text-white hover:bg-yuji-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {session.status === '已满员' ? '已满员' : '立即报名'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-sage-50/70 rounded-2xl p-5 border border-sage-100">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg text-sage-600">
            <Shield size={20} />
          </div>
          <div>
            <h3 className="font-medium text-sage-700 mb-1">社区公约</h3>
            <ul className="text-sm text-sage-600 space-y-1">
              <li>✓ 不评判、不说教、不灌鸡汤</li>
              <li>✓ 不攀比、不炫耀、不制造焦虑</li>
              <li>✓ 只分享真实感受，不讲"正确答案"</li>
              <li>✓ 保护隐私，尊重每一个人的脆弱</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
