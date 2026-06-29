// ============================================================
// 校园轻集市 — 拼单搭子 API
// ============================================================

import request from './request'

export interface GroupBuyItem {
  id: number
  title: string
  type: string
  targetCount: number
  currentCount: number
  deadline: string
  location: string
  publisher: string
  status: string
  description: string
}

/** 获取拼单搭子列表 */
export function getGroupBuys() {
  return request.get<GroupBuyItem[]>('/groupBuys')
}

/** 根据 id 获取单条拼单搭子 */
export function getGroupBuyById(id: number) {
  return request.get<GroupBuyItem>(`/groupBuys/${id}`)
}
