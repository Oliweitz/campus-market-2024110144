// ============================================================
// 校园轻集市 — 模拟回复工具
// ============================================================

import type { ItemType } from '@/data/listings'

/** 按信息类型分类的模拟回复语料 */
const REPLY_POOL: Record<ItemType, string[]> = {
  secondhand: [
    '还在的，可以来看看。',
    '价格可以商量，你出多少？',
    '好的，我们约个时间。',
    '东西没问题，你可以当面检查。',
    '之前也有人问，先到先得。',
  ],
  lostfound: [
    '是的，还没人认领。',
    '请描述一下物品特征。',
    '好的，什么时候来取？',
    '我明天也在图书馆，可以约。',
    '能说一下具体丢在哪里吗？',
  ],
  group: [
    '还有位置，快来！',
    '好的，算你一个。',
    '周末见！',
    '人数快够了，抓紧。',
    '截止前都可以加入。',
  ],
  errand: [
    '可以的，什么时候方便？',
    '没问题，交给我。',
    '已完成，请确认。',
    '我在附近，马上到。',
    '好的，具体地址发我。',
  ],
}

/** 默认回复（无法判断类型时使用） */
const FALLBACK_REPLIES = [
  '好的，收到。',
  '稍等，我看一下。',
  '没问题！',
  '谢谢，已回复。',
]

/**
 * 根据信息类型生成一条模拟回复
 * @param itemType 可选，用于匹配更贴切的回复
 */
export function generateMockReply(itemType?: ItemType): string {
  const pool = (itemType && REPLY_POOL[itemType]) ? REPLY_POOL[itemType] : FALLBACK_REPLIES
  return pool[Math.floor(Math.random() * pool.length)]!
}
