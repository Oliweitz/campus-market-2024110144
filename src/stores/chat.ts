import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface ChatMessage {
  from: string
  text: string
  time: string
}

export interface Conversation {
  messages: ChatMessage[]
  unread: number
}

const AUTO_REPLIES: Record<string, string[]> = {
  '二手交易': ['还在的，可以来看看。', '价格可以商量，你出多少？', '好的，我们约个时间。'],
  '失物招领': ['是的，还没人认领。', '请描述一下物品特征。', '好的，什么时候来取？'],
  '拼单搭子': ['还有位置，快来！', '好的，算你一个。', '周末见！'],
  '跑腿委托': ['可以的，什么时候方便？', '没问题，交给我。', '已完成，请确认。'],
}

function pickReply(): string {
  const all = Object.values(AUTO_REPLIES).flat()
  return all[Math.floor(Math.random() * all.length)]!
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Record<string, Conversation>>({})

  function ensureContact(name: string) {
    if (!conversations.value[name]) {
      conversations.value[name] = { messages: [], unread: 0 }
    }
  }

  function sendMessage(to: string, text: string) {
    ensureContact(to)
    conversations.value[to]!.messages.push({
      from: '我', text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    })
    // 自动生成模拟回复
    setTimeout(() => {
      conversations.value[to]!.messages.push({
        from: to, text: pickReply(),
        time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      })
      conversations.value[to]!.unread++
    }, 800)
  }

  function markRead(name: string) {
    if (conversations.value[name]) {
      conversations.value[name]!.unread = 0
    }
  }

  const contacts = computed(() => Object.keys(conversations.value))

  const totalUnread = computed(() =>
    Object.values(conversations.value).reduce((sum, c) => sum + c.unread, 0),
  )

  function getChat(name: string): ChatMessage[] {
    return conversations.value[name]?.messages ?? []
  }

  function getLastMessage(name: string): string {
    const msgs = conversations.value[name]?.messages
    if (!msgs || msgs.length === 0) return ''
    const last = msgs[msgs.length - 1]!
    return (last.from === '我' ? '我: ' : '') + last.text
  }

  return { conversations, ensureContact, sendMessage, markRead, contacts, totalUnread, getChat, getLastMessage }
})
