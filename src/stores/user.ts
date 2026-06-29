// ============================================================
// 校园轻集市 — 用户状态管理
// 职责: 登录 / 注册 / 登出 / 当前用户信息
// 持久化策略: userId + 关键信息存入 localStorage，刷新不丢
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/userApi'
import { LS_KEYS } from '@/utils/constants'
import type { User } from '@/data/listings'

const AUTH_KEY = 'campus_market_auth'

interface StoredAuth {
  userId: string | number
  nickname: string
  campus: string
  college: string
}

function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveAuth(user: User) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({
    userId: user.id,
    nickname: user.nickname,
    campus: user.campus,
    college: user.college,
  }))
}

function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
  localStorage.removeItem(LS_KEYS.CURRENT_USER_ID)
}

export const useUserStore = defineStore('user', () => {
  // ---- 从 localStorage 恢复 ----
  const stored = loadAuth()

  const currentUserId = ref<string | number | null>(stored?.userId ?? null)
  const profile = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 如果有本地缓存，先用缓存数据撑起 UI
  if (stored) {
    profile.value = {
      id: stored.userId as number,
      username: '',
      password: '',
      nickname: stored.nickname,
      college: stored.college,
      campus: stored.campus,
      role: '',
      creditScore: 0,
      createdAt: '',
    }
  }

  // ---- getters ----
  const isLoggedIn = computed(() => currentUserId.value !== null && profile.value !== null)
  const nickname = computed(() => profile.value?.nickname ?? '')
  const campus = computed(() => profile.value?.campus ?? '')

  // ---- actions ----
  /** 初始化：后台静默刷新用户完整信息，失败不影响登录态 */
  async function init() {
    if (!currentUserId.value) return
    loading.value = true
    error.value = null
    try {
      const res = await userApi.getUserById(currentUserId.value)
      profile.value = res.data
      saveAuth(res.data)
    } catch {
      // API 暂时不可用，保留本地缓存，不清除登录态
      error.value = null
    } finally {
      loading.value = false
    }
  }

  /** 登录 */
  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const user = await userApi.login(username, password)
      if (user) {
        profile.value = user
        currentUserId.value = user.id
        saveAuth(user)
        localStorage.setItem(LS_KEYS.CURRENT_USER_ID, String(user.id))
        return true
      }
      error.value = '用户名或密码错误'
      return false
    } catch (e) {
      error.value = '登录失败，请检查网络'
      return false
    } finally {
      loading.value = false
    }
  }

  /** 注册 */
  async function register(data: {
    username: string
    password: string
    nickname: string
    college: string
    campus: string
    role: string
  }): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const check = await request.get<User[]>('/users', {
        params: { username: data.username },
      })
      if (check.data.length > 0) {
        error.value = '用户名已被注册'
        return false
      }
      const res = await userApi.register({
        ...data,
        creditScore: 80,
      })
      profile.value = res.data
      currentUserId.value = res.data.id
      saveAuth(res.data)
      localStorage.setItem(LS_KEYS.CURRENT_USER_ID, String(res.data.id))
      return true
    } catch (e) {
      error.value = '注册失败，请重试'
      return false
    } finally {
      loading.value = false
    }
  }

  /** 登出 */
  function logout() {
    profile.value = null
    currentUserId.value = null
    clearAuth()
    error.value = null
    // 清除消息本地缓存（保护隐私）
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('campus_market_msg_')) localStorage.removeItem(k)
    })
  }

  /** 更新用户信息 */
  async function updateProfile(data: Partial<User>) {
    if (!currentUserId.value) return
    loading.value = true
    try {
      const res = await userApi.updateUser(currentUserId.value, data)
      profile.value = res.data
      saveAuth(res.data)
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
      saveAuth(res.data)
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
    login,
    register,
    logout,
    updateProfile,
    switchUser,
  }
})

// 顶层 import 供 userStore 内部使用
import request from '@/api/http'
