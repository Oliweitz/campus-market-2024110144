// ============================================================
// 校园轻集市 — 数据类型定义
// 与架构文档对齐：type 使用 secondhand/lostfound/group/errand
// ============================================================

/** 信息类型 — 四类业务场景的统一抽象 */
export type ItemType = 'secondhand' | 'lostfound' | 'group' | 'errand'

/** 信息状态 */
export type ItemStatus = '进行中' | '已完成' | '已关闭'

/** 失物招领子类型 */
export type LostOrFound = 'lost' | 'found'

/** 安全提醒类型 */
export type NoticeType = 'safety' | 'rule' | 'notice'

// ============================================================
// 核心资源接口
// ============================================================

/** 用户 */
export interface User {
  id: number
  username: string
  password: string
  nickname: string
  college: string
  campus: string
  role: string
  creditScore: number
  createdAt: string
}

/** 校园信息（统一承载四类业务） */
export interface Item {
  id: number
  type: ItemType
  title: string
  description: string
  campus: string
  location: string
  tags: string[]
  images: string[]
  publisherId: number
  status: ItemStatus
  viewCount: number
  favoriteCount: number
  createdAt: string
  updatedAt: string
  // secondhand 专属
  price?: number
  condition?: string
  allowBargain?: boolean
  stock?: number
  // lostfound 专属
  lostOrFound?: LostOrFound
  eventTime?: string
  itemFeature?: string
  // group 专属
  targetCount?: number
  currentCount?: number
  deadline?: string
  // errand 专属
  reward?: number
  taskPlace?: string
  expectedTime?: string
}

/** 收藏关系 */
export interface Favorite {
  id: number
  userId: number
  itemId: number
  createdAt: string
}

/** 会话 */
export interface Conversation {
  id: number
  participants: number[]
  lastMessage: string
  updatedAt: string
}

/** 消息 */
export interface Message {
  id: number
  conversationId: number
  senderId: number
  text: string
  createdAt: string
}

/** 安全提醒 / 系统通知 */
export interface Notice {
  id: number
  title: string
  content: string
  type: NoticeType
  createdAt: string
}

// ============================================================
// 展示标签映射
// ============================================================

export const TYPE_LABELS: Record<ItemType, string> = {
  secondhand: '二手交易',
  lostfound: '失物招领',
  group: '拼单搭子',
  errand: '跑腿委托',
}

export const STATUS_LABELS: Record<ItemStatus, string> = {
  '进行中': '进行中',
  '已完成': '已完成',
  '已关闭': '已关闭',
}

export const LOST_FOUND_LABELS: Record<LostOrFound, string> = {
  lost: '丢失物品',
  found: '拾获物品',
}

export const CAMPUS_LIST = ['南校区', '北校区', '东校区', '西校区']

export const CONDITION_OPTIONS = ['全新', '九成新', '八成新', '六成新']

// ============================================================
// 每个类型对应的专属字段提示
// ============================================================

export const TYPE_EXTRA_FIELDS: Record<ItemType, { label: string; key: string }[]> = {
  secondhand: [
    { label: '价格 (元)', key: 'price' },
    { label: '成色', key: 'condition' },
    { label: '支持砍价', key: 'allowBargain' },
  ],
  lostfound: [
    { label: '丢失/拾获', key: 'lostOrFound' },
    { label: '发生时间', key: 'eventTime' },
    { label: '物品特征', key: 'itemFeature' },
  ],
  group: [
    { label: '目标人数', key: 'targetCount' },
    { label: '当前人数', key: 'currentCount' },
    { label: '截止时间', key: 'deadline' },
  ],
  errand: [
    { label: '酬劳 (元)', key: 'reward' },
    { label: '任务地点', key: 'taskPlace' },
    { label: '期望完成时间', key: 'expectedTime' },
  ],
}
