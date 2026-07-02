// ============================================================
// 校园轻集市 — 购物车 API
// 数据源: JSON Server /carts
// ============================================================

import request from './request'
import type { CartItem } from '@/stores/cart'

export interface CartRecord {
  id?: number | string
  userId: string | number
  itemId: string | number
  title: string
  price: number
  stock: number
  quantity: number
}

export const cartApi = {
  /** 获取用户购物车 */
  async getByUser(userId: string | number) {
    return request.get<CartRecord[]>('/carts', { params: { userId: String(userId) } })
  },

  /** 添加商品到购物车 */
  async add(record: CartRecord) {
    return request.post<CartRecord>('/carts', record)
  },

  /** 更新购物车项（数量） */
  async update(id: string | number, data: Partial<CartRecord>) {
    return request.patch<CartRecord>(`/carts/${id}`, data)
  },

  /** 从购物车移除 */
  async remove(id: string | number) {
    return request.delete(`/carts/${id}`)
  },

  /** 清空用户购物车 */
  async clearByUser(userId: string | number) {
    const res = await request.get<CartRecord[]>('/carts', { params: { userId: String(userId) } })
    await Promise.all(res.data.map((item) => request.delete(`/carts/${item.id}`)))
  },
}
