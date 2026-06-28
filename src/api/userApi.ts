// ============================================================
// 校园轻集市 — 用户 API
// ============================================================

import request from './request'
import type { User } from '@/data/listings'

export const userApi = {
  /** 获取所有用户 */
  getUsers() {
    return request.get<User[]>('/users')
  },

  /** 根据 id 获取用户 */
  getUserById(id: number) {
    return request.get<User>(`/users/${id}`)
  },

  /** 创建用户 */
  createUser(data: Omit<User, 'id'>) {
    return request.post<User>('/users', data)
  },

  /** 更新用户信息 */
  updateUser(id: number, data: Partial<User>) {
    return request.patch<User>(`/users/${id}`, data)
  },
}
