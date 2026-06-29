// ============================================================
// 校园轻集市 — 失物招领 API
// ============================================================

import request from './request'

export interface LostFoundItem {
  id: number
  title: string
  type: 'lost' | 'found'
  itemName: string
  location: string
  eventTime: string
  contact: string
  status: string
  description: string
}

/** 获取失物招领列表 */
export function getLostFounds() {
  return request.get<LostFoundItem[]>('/lostFounds')
}

/** 根据 id 获取单条失物招领 */
export function getLostFoundById(id: number) {
  return request.get<LostFoundItem>(`/lostFounds/${id}`)
}
