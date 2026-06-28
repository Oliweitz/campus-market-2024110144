// ============================================================
// 校园轻集市 — 校园信息 API
// ============================================================

import request from './request'
import type { Item, ItemType, ItemStatus } from '@/data/listings'

export const itemApi = {
  /** 获取信息列表（支持查询参数筛选） */
  getItems(params?: {
    type?: ItemType
    campus?: string
    status?: ItemStatus
    q?: string
    _sort?: string
    _order?: 'asc' | 'desc'
    _page?: number
    _limit?: number
  }) {
    return request.get<Item[]>('/items', { params })
  },

  /** 根据 id 获取单条信息 */
  getItemById(id: string | number) {
    return request.get<Item>(`/items/${id}`)
  },

  /** 发布新信息 */
  createItem(data: Omit<Item, 'id'>) {
    return request.post<Item>('/items', data)
  },

  /** 更新信息（PATCH 部分更新） */
  updateItem(id: string | number, data: Partial<Item>) {
    return request.patch<Item>(`/items/${id}`, data)
  },

  /** 更新信息状态 */
  updateItemStatus(id: string | number, status: ItemStatus) {
    return request.patch<Item>(`/items/${id}`, { status, updatedAt: new Date().toISOString() })
  },

  /** 增加浏览量 */
  incrementViewCount(id: string | number, current: number) {
    return request.patch<Item>(`/items/${id}`, { viewCount: current + 1 })
  },

  /** 删除信息 */
  deleteItem(id: string | number) {
    return request.delete(`/items/${id}`)
  },
}
