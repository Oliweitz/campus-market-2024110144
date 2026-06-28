// ============================================================
// 校园轻集市 — 用户状态管理
// 职责: 当前登录用户信息、localStorage 持久化当前用户 id
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/userApi'
import { LS_KEYS } from '@/utils/constants'
import type { User } from '@/data/listings'

export const useUserStore = defineStore('user', () => {
  // ---- state ----
  const currentUserId = ref<number | null>(
    Number(localStorage.getItem(LS_KEYS.CURRENT_USER_ID)) || null,
  )
  const profile = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // ---- getters ----
  const isLoggedIn = computed(() => currentUserId.value !== null && profile.value !== null)
  const nickname = computed(() => profile.value?.nickname ?? '')
  const campus = computed(() => profile.value?.campus ?? '')

  // ---- actions ----
  /** 初始化：根据 localStorage 中的 userId 加载用户，无则自动登录为张三（id=1） */
  async function init() {
    // 首次访问自动以张三身份登录
    if (!currentUserId.value) {
      currentUserId.value = 1
      localStorage.setItem(LS_KEYS.CURRENT_USER_ID, '1')
    }
    loading.value = true
    error.value = null
    try {
      const res = await userApi.getUserById(currentUserId.value)
      profile.value = res.data
    } catch (e) {
      error.value = '加载用户信息失败'
      console.error('[userStore] init failed:', e)
    } finally {
      loading.value = false
    }
  }

  /** 创建本地身份 */
  async function createProfile(data: Omit<User, 'id' | 'createdAt'>) {
    loading.value = true
    error.value = null
    try {
      const res = await userApi.createUser({
        ...data,
        createdAt: new Date().toISOString(),
      } as Omit<User, 'id'>)
      profile.value = res.data
      currentUserId.value = res.data.id
      localStorage.setItem(LS_KEYS.CURRENT_USER_ID, String(res.data.id))
      return res.data
    } catch (e) {
      error.value = '创建用户失败'
      throw e
    } finally {
      loading.value = false
    }
  }

  /** 更新用户信息 */
  async function updateProfile(data: Partial<User>) {
    if (!currentUserId.value) return
    loading.value = true
    try {
      const res = await userApi.updateUser(currentUserId.value, data)
      profile.value = res.data
    } catch (e) {
      error.value = '更新用户信息失败'
    } finally {
      loading.value = false
    }
  }

  /** 切换用户（用于演示多用户场景） */
  async function switchUser(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await userApi.getUserById(id)
      profile.value = res.data
      currentUserId.value = id
      localStorage.setItem(LS_KEYS.CURRENT_USER_ID, String(id))
    } catch (e) {
      error.value = '切换用户失败'
    } finally {
      loading.value = false
    }
  }

  return {
    currentUserId,
    profile,
    loading,
    error,
    isLoggedIn,
    nickname,
    campus,
    init,
    createProfile,
    updateProfile,
    switchUser,
  }
})
