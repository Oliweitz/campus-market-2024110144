// ============================================================
// 校园轻集市 — 消息状态管理
// 数据源: JSON Server /conversations + /messages
// 注意: 所有 id 比较统一用 ==
// ============================================================

import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { messageApi } from '@/api/messageApi'
import { useUserStore } from '@/stores/userStore'
import { generateMockReply } from '@/utils/mockReply'
import { now as nowStr } from '@/utils/date'
import type { Conversation, Message } from '@/data/listings'

export interface ChatMessage { from: string; fromId: number; text: string; time: string }

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>([])
  const messageCache = ref<Record<number, Message[]>>({})
  const unreadCounts = ref<Record<number, number>>({})
  const contactNames = ref<Record<number, string>>({})
  const loading = ref(false)

  const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

  type Contact = { userId: number; nickname: string; lastMessage: string; unread: number }
  const contactList = computed<Contact[]>(() =>
    conversations.value.map((c) => {
      const otherId = c.participants.find((p) => p != useUserStore().currentUserId) ?? c.participants[0]!
      return {
        userId: otherId,
        nickname: contactNames.value[otherId] ?? `用户${otherId}`,
        lastMessage: c.lastMessage,
        unread: unreadCounts.value[c.id as number] ?? 0,
      }
    }),
  )

  async function fetchConversations() {
    const uid = useUserStore().currentUserId
    if (!uid) return
    loading.value = true
    try { conversations.value = (await messageApi.getConversationsByUser(uid)).data }
    catch (e) { console.error('[messageStore] fetchConversations:', e) }
    finally { loading.value = false }
  }

  async function fetchMessages(convId: number): Promise<Message[]> {
    loading.value = true
    try {
      const res = await messageApi.getMessagesByConversation(convId)
      messageCache.value[convId] = res.data
      return res.data
    } catch { return [] }
    finally { loading.value = false }
  }

  function getChatMessages(convId: number): ChatMessage[] {
    const uid = useUserStore().currentUserId
    return (messageCache.value[convId] ?? []).map((m) => ({
      from: m.senderId == uid ? '我' : (contactNames.value[m.senderId] ?? `用户${m.senderId}`),
      fromId: m.senderId,
      text: m.text,
      time: (m.createdAt ?? '').slice(11, 16) || '',
    }))
  }

  async function getOrCreateConversation(targetUid: number): Promise<Conversation> {
    const uid = useUserStore().currentUserId!
    let conv = conversations.value.find((c) =>
      c.participants.some((p) => p == uid) && c.participants.some((p) => p == targetUid),
    )
    if (conv) return conv
    const res = await messageApi.createConversation({ participants: [uid, targetUid], lastMessage: '' })
    conversations.value.push(res.data)
    return res.data
  }

  async function sendMessage(targetUid: number, text: string, targetNickname?: string) {
    const uid = useUserStore().currentUserId!
    if (targetNickname) contactNames.value[targetUid] = targetNickname

    const conv = await getOrCreateConversation(targetUid)

    // 发送
    const msgRes = await messageApi.sendMessage({ conversationId: conv.id as number, senderId: uid, text })
    await messageApi.updateConversation(conv.id as number, { lastMessage: text, updatedAt: nowStr() })
    conv.lastMessage = text; conv.updatedAt = nowStr()
    if (!messageCache.value[conv.id as number]) messageCache.value[conv.id as number] = []
    messageCache.value[conv.id as number]!.push(msgRes.data)

    // 模拟回复
    setTimeout(async () => {
      const reply = generateMockReply()
      const replyRes = await messageApi.sendMessage({ conversationId: conv.id as number, senderId: targetUid, text: reply })
      await messageApi.updateConversation(conv.id as number, { lastMessage: reply, updatedAt: nowStr() })
      conv.lastMessage = reply; conv.updatedAt = nowStr()
      if (!messageCache.value[conv.id as number]) messageCache.value[conv.id as number] = []
      messageCache.value[conv.id as number]!.push(replyRes.data)
      unreadCounts.value[conv.id as number] = (unreadCounts.value[conv.id as number] ?? 0) + 1
    }, 800)
  }

  async function markRead(convId: number) { unreadCounts.value[convId] = 0 }

  return { conversations, messageCache, unreadCounts, contactNames, loading, totalUnread, contactList, fetchConversations, fetchMessages, getChatMessages, getOrCreateConversation, sendMessage, markRead }
})
