// ============================================================
// 校园轻集市 — 二手交易 API
// ============================================================

import request from './request'

export interface TradeItem {
  id: number
  title: string
  category: string
  price: number
  condition: string
  location: string
  publisher: string
  publishTime: string
  image: string
  status: string
  description: string
}

/** 获取二手交易列表 */
export function getTrades() {
  return request.get<TradeItem[]>('/trades')
}

/** 根据 id 获取单条二手交易 */
export function getTradeById(id: number) {
  return request.get<TradeItem>(`/trades/${id}`)
}
