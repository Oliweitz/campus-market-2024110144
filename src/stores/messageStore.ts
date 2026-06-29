// ============================================================
// 校园轻集市 — 消息状态管理
// 数据源: JSON Server /conversations + /messages
// ============================================================

import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { messageApi } from '@/api/messageApi'
import { userApi } from '@/api/userApi'
import { useUserStore } from '@/stores/user'
import { generateMockReply } from '@/utils/mockReply'
import { now as nowStr } from '@/utils/date'
import type { Conversation, Message } from '@/data/listings'

function msgKey(suffix: string): string {
  const uid = useUserStore().currentUserId
  return `campus_market_msg_${suffix}_${uid ?? 'anon'}`
}

function loadLS<T>(keyFn: () => string, fallback: T): T {
  try { const r = localStorage.getItem(keyFn()); return r ? JSON.parse(r) : fallback } catch { return fallback }
}

function saveLS(keyFn: () => string, val: unknown) {
  try { localStorage.setItem(keyFn(), JSON.stringify(val)) } catch {}
}

/** 判断用户是否参与某个会话 */
function isParticipant(conv: Conversation, userId: string | number): boolean {
  return conv.participants.some((p: string | number) => String(p) === String(userId))
}

export interface ChatMessage { from: string; fromId: number; text: string; time: string }

export const useMessageStore = defineStore('message', () => {
  const conversations = ref<Conversation[]>(loadLS(() => msgKey('convs'), []))
  const messageCache = ref<Record<string, Message[]>>(loadLS(() => msgKey('cache'), {}))
  const unreadCounts = ref<Record<string, number>>({})
  const contactNames = ref<Record<number, string>>(loadLS(() => msgKey('names'), {}))
  const loading = ref(false)

  // 自动持久化
  watch(messageCache, v => saveLS(() => msgKey('cache'), v), { deep: true })
  watch(conversations, v => saveLS(() => msgKey('convs'), v), { deep: true })
  watch(contactNames, v => saveLS(() => msgKey('names'), v), { deep: true })

  const totalUnread = computed(() => Object.values(unreadCounts.value).reduce((a, b) => a + b, 0))

  type Contact = { userId: number; nickname: string; lastMessage: string; unread: number }
  const contactList = computed<Contact[]>(() =>
    conversations.value.map((c) => {
      const myId = useUserStore().currentUserId
      const otherId = c.participants.find((p: string | number) => String(p) !== String(myId)) ?? c.participants[0]!
      return {
        userId: Number(otherId),
        nickname: contactNames.value[Number(otherId)] ?? `用户${otherId}`,
        lastMessage: c.lastMessage,
        unread: unreadCounts.value[String(c.id)] ?? 0,
      }
    })
  )

  /** 获取当前用户的会话（拉全部再本地过滤，避免 JSON Server 数组查询不稳定） */
  async function fetchConversations() {
    const uid = useUserStore().currentUserId
    if (!uid) return
    loading.value = true
    try {
      const res = await messageApi.getConversations()
      // 过滤出当前用户参与的会话
      conversations.value = res.data.filter(c => isParticipant(c, uid))
      // 清理不属于当前会话的消息缓存
      const convIds = new Set(conversations.value.map(c => String(c.id)))
      Object.keys(messageCache.value).forEach(k => {
        if (!convIds.has(k)) delete messageCache.value[k]
      })
      // 加载对方昵称
      conversations.value.forEach((c) => {
        const otherId = c.participants.find((p: string | number) => String(p) !== String(uid)) ?? c.participants[0]!
        const oid = Number(otherId)
        if (!contactNames.value[oid]) {
          userApi.getUserById(oid).then(r => { contactNames.value[oid] = r.data.nickname }).catch(() => {})
        }
      })
    } catch (e) {
      console.error('[messageStore] fetchConversations:', e)
    } finally { loading.value = false }
  }

  async function fetchMessages(convId: number | string): Promise<Message[]> {
    loading.value = true
    try {
      const res = await messageApi.getMessagesByConversation(convId)
      messageCache.value[String(convId)] = res.data
      return res.data
    } catch { return [] }
    finally { loading.value = false }
  }

  function getChatMessages(convId: number | string): ChatMessage[] {
    const uid = useUserStore().currentUserId
    return (messageCache.value[String(convId)] ?? []).map((m) => ({
      from: String(m.senderId) === String(uid) ? '我' : (contactNames.value[Number(m.senderId)] ?? `用户${m.senderId}`),
      fromId: Number(m.senderId),
      text: m.text,
      time: (m.createdAt ?? '').slice(11, 16) || '',
    }))
  }

  /** 查找或创建与目标用户的会话（自动去重） */
  async function getOrCreateConversation(targetUid: number | string): Promise<Conversation> {
    const uid = useUserStore().currentUserId
    if (!uid) throw new Error('未登录')
    // 查找已有会话
    let conv = conversations.value.find((c) =>
      isParticipant(c, uid) && isParticipant(c, targetUid)
    )
    if (conv) return conv
    // 创建新会话（participants 排序后由 API 层处理）
    const res = await messageApi.createConversation({
      participants: [uid, targetUid],
      lastMessage: '',
    })
    conversations.value.push(res.data)
    // 加载对方昵称
    const oid = Number(targetUid)
    if (!contactNames.value[oid]) {
      userApi.getUserById(oid).then(r => { contactNames.value[oid] = r.data.nickname }).catch(() => {})
    }
    return res.data
  }

  async function sendMessage(targetUid: number, text: string, targetNickname?: string) {
    const uid = useUserStore().currentUserId
    if (!uid) return
    if (targetNickname) contactNames.value[targetUid] = targetNickname

    const conv = await getOrCreateConversation(targetUid)
    const cid = String(conv.id)

    // 发送
    const msgRes = await messageApi.sendMessage({ conversationId: conv.id, senderId: uid, text })
    await messageApi.updateConversation(conv.id, { lastMessage: text, updatedAt: nowStr() })
    conv.lastMessage = text
    conv.updatedAt = nowStr()
    if (!messageCache.value[cid]) messageCache.value[cid] = []
    messageCache.value[cid]!.push(msgRes.data)

    // 模拟回复
    setTimeout(async () => {
      const reply = generateMockReply()
      const replyRes = await messageApi.sendMessage({ conversationId: conv.id, senderId: targetUid, text: reply })
      await messageApi.updateConversation(conv.id, { lastMessage: reply, updatedAt: nowStr() })
      conv.lastMessage = reply
      conv.updatedAt = nowStr()
      if (!messageCache.value[cid]) messageCache.value[cid] = []
      messageCache.value[cid]!.push(replyRes.data)
      unreadCounts.value[cid] = (unreadCounts.value[cid] ?? 0) + 1
    }, 800)
  }

  async function markRead(convId: number | string) {
    unreadCounts.value[String(convId)] = 0
  }

  return {
    conversations, messageCache, unreadCounts, contactNames,
    loading, totalUnread, contactList,
    fetchConversations, fetchMessages, getChatMessages,
    getOrCreateConversation, sendMessage, markRead,
  }
})
