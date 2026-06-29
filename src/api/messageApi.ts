// ============================================================
// 校园轻集市 — 消息 API
// ============================================================

import request from './request'
import type { Conversation, Message } from '@/data/listings'

export const messageApi = {
  // ---- 会话 ----

  /** 获取所有会话 */
  getConversations() {
    return request.get<Conversation[]>('/conversations')
  },

  /** 创建会话（participants 自动排序去重） */
  createConversation(data: { participants: (string | number)[]; lastMessage: string }) {
    // 排序确保 [1,2] 和 [2,1] 被视为同一会话
    const sorted = [...new Set(data.participants)].sort((a, b) => Number(a) - Number(b))
    return request.post<Conversation>('/conversations', {
      participants: sorted,
      lastMessage: data.lastMessage,
      updatedAt: new Date().toISOString(),
    })
  },

  /** 更新会话最后消息 */
  updateConversation(id: number | string, data: Partial<Conversation>) {
    return request.patch<Conversation>(`/conversations/${id}`, data)
  },

  // ---- 消息 ----

  /** 获取指定会话的所有消息 */
  getMessagesByConversation(conversationId: number | string) {
    return request.get<Message[]>('/messages', {
      params: { conversationId, _sort: 'createdAt', _order: 'asc' },
    })
  },

  /** 获取所有消息 */
  getMessages() {
    return request.get<Message[]>('/messages')
  },

  /** 发送消息 */
  sendMessage(data: { conversationId: number | string; senderId: number | string; text: string }) {
    return request.post<Message>('/messages', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },
}
