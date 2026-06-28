// ============================================================
// 校园轻集市 — 消息 API
// ============================================================

import request from './request'
import type { Conversation, Message } from '@/data/listings'

export const messageApi = {
  // ---- 会话 ----

  /** 获取指定用户的所有会话 */
  getConversationsByUser(userId: number) {
    return request.get<Conversation[]>('/conversations', {
      params: { participants_like: userId },
    })
  },

  /** 创建会话 */
  createConversation(data: { participants: number[]; lastMessage: string }) {
    return request.post<Conversation>('/conversations', {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  },

  /** 更新会话最后消息 */
  updateConversation(id: number, data: Partial<Conversation>) {
    return request.patch<Conversation>(`/conversations/${id}`, data)
  },

  // ---- 消息 ----

  /** 获取指定会话的所有消息 */
  getMessagesByConversation(conversationId: number) {
    return request.get<Message[]>('/messages', {
      params: { conversationId, _sort: 'createdAt', _order: 'asc' },
    })
  },

  /** 发送消息 */
  sendMessage(data: { conversationId: number; senderId: number; text: string }) {
    return request.post<Message>('/messages', {
      ...data,
      createdAt: new Date().toISOString(),
    })
  },
}
