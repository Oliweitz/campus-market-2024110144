// ============================================================
// 校园轻集市 — 收藏 API
// ============================================================

import request from './http'
import type { Favorite } from '@/data/listings'

export const favoriteApi = {
  /** 获取指定用户的所有收藏 */
  getFavoritesByUser(userId: number) {
    return request.get<Favorite[]>('/favorites', { params: { userId } })
  },

  /** 检查是否已收藏 */
  async checkFavorited(userId: number, itemId: string | number): Promise<Favorite | null> {
    const res = await request.get<Favorite[]>('/favorites', {
      params: { userId, itemId },
    })
    return res.data[0] ?? null
  },

  /** 添加收藏 */
  addFavorite(data: { userId: number; itemId: string | number }) {
    return request.post<Favorite>('/favorites', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },

  /** 取消收藏（通过收藏记录 id） */
  removeFavorite(id: string | number) {
    return request.delete(`/favorites/${id}`)
  },

  /** 取消收藏（通过 userId + itemId） */
  async removeFavoriteByUserAndItem(userId: number, itemId: string | number): Promise<boolean> {
    const res = await request.get<Favorite[]>('/favorites', {
      params: { userId, itemId },
    })
    if (res.data.length > 0) {
      await request.delete(`/favorites/${res.data[0]!.id}`)
      return true
    }
    return false
  },
}
