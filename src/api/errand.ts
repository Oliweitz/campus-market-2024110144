// ============================================================
// 校园轻集市 — 跑腿委托 API
// ============================================================

import request from './request'

export interface ErrandItem {
  id: number
  title: string
  taskType: string
  reward: number
  from: string
  to: string
  deadline: string
  publisher: string
  status: string
  description: string
}

/** 获取跑腿委托列表 */
export function getErrands() {
  return request.get<ErrandItem[]>('/errands')
}

/** 根据 id 获取单条跑腿委托 */
export function getErrandById(id: number) {
  return request.get<ErrandItem>(`/errands/${id}`)
}
