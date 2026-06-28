export type ListingType = 'trade' | 'lost' | 'pintuan' | 'paotui'
export type ListingStatus = 'active' | 'completed' | 'closed'
export type LostSubType = 'lost' | 'found'

export interface Listing {
  id: number
  type: ListingType
  title: string
  poster: string
  desc: string
  campus: string
  location: string
  status: ListingStatus
  publishTime: string
  tags: string[]
  price?: string
  stock?: number
  condition?: string
  lostType?: LostSubType
  lostTime?: string
  targetCount?: number
  currentCount?: number
  unitPrice?: string
  deadline?: string
  reward?: string
  taskLocation?: string
  expectTime?: string
}

export const seedListings: Listing[] = [
  // ===== 二手交易 =====
  { id: 1, type: 'trade', title: '九成新《JavaScript高级程序设计》', poster: '张三', desc: '几乎全新，仅翻阅过前两章，无笔记无折痕。', campus: '南校区', location: '图书馆', status: 'active', publishTime: '2026-06-25T10:00:00', tags: ['教材', '前端'], price: '¥35', stock: 1, condition: '九成新' },
  { id: 2, type: 'trade', title: '折叠书桌 宿舍必备', poster: '李四', desc: '桌面平整，折叠方便，不占空间。', campus: '北校区', location: '北区宿舍', status: 'active', publishTime: '2026-06-24T14:00:00', tags: ['家具', '宿舍'], price: '¥60', stock: 1, condition: '八成新' },
  { id: 3, type: 'trade', title: '机械键盘 Cherry茶轴', poster: '王五', desc: '全键无冲，RGB背光，使用半年。', campus: '南校区', location: '教学楼A', status: 'active', publishTime: '2026-06-26T09:00:00', tags: ['数码', '外设'], price: '¥120', stock: 3, condition: '八成新' },
  { id: 4, type: 'trade', title: '台灯 LED护眼', poster: '赵六', desc: '三档亮度，无频闪，宿舍学习用。', campus: '东校区', location: '东区宿舍', status: 'active', publishTime: '2026-06-23T16:00:00', tags: ['生活', '宿舍'], price: '¥25', stock: 5, condition: '九成新' },
  // ===== 失物招领 =====
  { id: 5, type: 'lost', title: '寻找黑色钱包', poster: '李明', desc: '内有身份证、校园卡，在图书馆三楼遗失。', campus: '南校区', location: '图书馆三楼', status: 'active', publishTime: '2026-06-27T08:00:00', tags: ['钱包', '证件'], lostType: 'lost', lostTime: '2026-06-26' },
  { id: 6, type: 'lost', title: '拾到 AirPods 白色耳机盒', poster: '王芳', desc: '操场跑道边拾到，外观完好。', campus: '北校区', location: '操场', status: 'active', publishTime: '2026-06-27T12:00:00', tags: ['耳机', '数码'], lostType: 'found', lostTime: '2026-06-27' },
  { id: 7, type: 'lost', title: '寻找校园卡', poster: '刘强', desc: '一食堂附近丢失，姓名张三，学号末尾4144。', campus: '南校区', location: '一食堂', status: 'active', publishTime: '2026-06-26T18:00:00', tags: ['校园卡', '证件'], lostType: 'lost', lostTime: '2026-06-26' },
  // ===== 拼单搭子 =====
  { id: 8, type: 'pintuan', title: '周末奶茶拼单', poster: '小红', desc: '一起凑外卖满减，人均15元左右。', campus: '南校区', location: '南门奶茶店', status: 'active', publishTime: '2026-06-27T10:00:00', tags: ['奶茶', '外卖'], targetCount: 4, currentCount: 2, unitPrice: '¥15', deadline: '2026-06-29' },
  { id: 9, type: 'pintuan', title: '期末复习搭子', poster: '陈同学', desc: '找 3 人一起图书馆刷题，互相监督。', campus: '北校区', location: '图书馆', status: 'active', publishTime: '2026-06-26T15:00:00', tags: ['学习', '期末'], targetCount: 3, currentCount: 1, deadline: '2026-07-05' },
  { id: 10, type: 'pintuan', title: '二手教材团购', poster: '班长', desc: '团购下学期教材，满10人每人省20元。', campus: '南校区', location: '教材科', status: 'active', publishTime: '2026-06-25T09:00:00', tags: ['教材', '团购'], targetCount: 10, currentCount: 5, unitPrice: '¥80', deadline: '2026-07-10' },
  // ===== 跑腿委托 =====
  { id: 11, type: 'paotui', title: '帮忙取快递', poster: '小周', desc: '菜鸟驿站取件（中号箱），送到南区宿舍3号楼。', campus: '南校区', location: '菜鸟驿站', status: 'active', publishTime: '2026-06-27T14:00:00', tags: ['快递', '代取'], reward: '¥5', taskLocation: '南区宿舍3号楼', expectTime: '今晚20:00前' },
  { id: 12, type: 'paotui', title: '代买早餐', poster: '安娜', desc: '明早食堂带一份包子+豆浆，送到教学楼B座。', campus: '北校区', location: '北区食堂', status: 'active', publishTime: '2026-06-27T20:00:00', tags: ['早餐', '代买'], reward: '¥3', taskLocation: '教学楼B座', expectTime: '明早7:30' },
  { id: 13, type: 'paotui', title: '打印并交作业', poster: '赵强', desc: '帮打印一份报告并交到教务办公室，急！', campus: '东校区', location: '打印店', status: 'active', publishTime: '2026-06-28T08:00:00', tags: ['打印', '急'], reward: '¥8', taskLocation: '教务办公室', expectTime: '今天下午16:00前' },
]

export const TYPE_LABELS: Record<ListingType, string> = {
  trade: '二手交易', lost: '失物招领', pintuan: '拼单搭子', paotui: '跑腿委托',
}

export const STATUS_LABELS: Record<ListingStatus, string> = {
  active: '进行中', completed: '已完成', closed: '已关闭',
}

export const CAMPUS_LIST = ['南校区', '北校区', '东校区', '西校区']
