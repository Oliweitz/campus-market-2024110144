// ============================================================
// 校园轻集市 — 安全提醒 / 通知 API
// ============================================================

import request from './http'
import type { Notice, NoticeType } from '@/data/listings'

export const noticeApi = {
  /** 获取所有通知 */
  getNotices(params?: { type?: NoticeType }) {
    return request.get<Notice[]>('/notices', { params })
  },

  /** 根据 id 获取单条通知 */
  getNoticeById(id: number) {
    return request.get<Notice>(`/notices/${id}`)
  },
}
