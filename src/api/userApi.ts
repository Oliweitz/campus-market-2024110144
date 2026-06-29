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

  /** 登录：根据用户名查找用户 */
  async login(username: string, password: string): Promise<User | null> {
    const res = await request.get<User[]>('/users', {
      params: { username },
    })
    const user = res.data[0]
    if (user && user.password === password) {
      return user
    }
    return null
  },

  /** 注册 */
  register(data: Omit<User, 'id' | 'createdAt'>) {
    return request.post<User>('/users', {
      ...data,
      createdAt: new Date().toISOString(),
    })
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
