// ============================================================
// 校园轻集市 — Axios 实例封装
// ============================================================

import axios from 'axios'
import { API_BASE_URL } from '@/utils/constants'

const request = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 响应拦截器 — 统一错误处理
request.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.status
      ? `请求失败 (${error.response.status})`
      : error.message || '网络错误'
    console.error('[API Error]', message, error.config?.url)
    return Promise.reject(error)
  },
)

export default request
