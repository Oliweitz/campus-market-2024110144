<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMessageStore } from '@/stores/messageStore'
import ChatBox from '@/components/ChatBox.vue'

const route = useRoute()
const msgStore = useMessageStore()
const activeUserId = ref<number | null>(null)
const activeConvId = ref<number | null>(null)

const contact = computed(() => msgStore.contactList.find((c) => c.userId === activeUserId.value))
const chatMsgs = computed(() => (activeConvId.value ? msgStore.getChatMessages(activeConvId.value) : []))

watch(() => route.query.to, (name) => {
  if (name && typeof name === 'string') {
    const uid = name === '张三' ? 1 : name === '李四' ? 2 : name === '王五' ? 3 : 0
    if (uid) activeUserId.value = uid
  }
}, { immediate: true })

watch(() => msgStore.contactList.length, () => {
  if (!activeUserId.value && msgStore.contactList.length > 0) activeUserId.value = msgStore.contactList[0]!.userId
})

async function selectContact(userId: number) {
  activeUserId.value = userId
  const conv = msgStore.conversations.find((c) => c.participants.some((p) => p == userId))
  if (conv) { activeConvId.value = conv.id as number; await msgStore.fetchMessages(conv.id as number); await msgStore.markRead(conv.id as number) }
}

async function handleSend(text: string) {
  if (!activeUserId.value) return
  await msgStore.sendMessage(activeUserId.value, text)
}

onMounted(async () => {
  await msgStore.fetchConversations()
  if (activeUserId.value) await selectContact(activeUserId.value)
})
</script>

<template>
  <section class="msg-page">
    <div class="contact-panel">
      <h3>消息</h3>
      <template v-if="msgStore.contactList.length">
        <div class="contact-list">
          <div v-for="c in msgStore.contactList" :key="c.userId" :class="['contact-item', { active: c.userId === activeUserId }]" @click="selectContact(c.userId)">
            <div class="contact-top"><span class="contact-avatar">{{ c.nickname[0] }}</span><span class="contact-name">{{ c.nickname }}</span><span v-if="c.unread" class="dot"></span></div>
            <div class="contact-preview">{{ c.lastMessage }}</div>
          </div>
        </div>
      </template>
      <div v-else class="empty-contacts"><p>暂无联系人</p><span>从详情页点击用户名开始聊天</span></div>
    </div>
    <ChatBox v-if="activeConvId" :messages="chatMsgs" :contact-name="contact?.nickname" @send="handleSend" />
    <div v-else class="empty-chat">选择联系人开始聊天</div>
  </section>
</template>

<style scoped>
.msg-page { display: flex; gap: 0; height: 62vh; background: var(--card-bg); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }
.contact-panel { width: 220px; background: #fafbfc; padding: 20px 14px; flex-shrink: 0; overflow-y: auto; }
.contact-panel h3 { margin: 0 0 14px; font-size: 15px; font-weight: 600; }
.contact-list { display: flex; flex-direction: column; gap: 4px; }
.contact-item { padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition); }
.contact-item:hover { background: #eef2f7; }
.contact-item.active { background: var(--primary-light); }
.contact-top { display: flex; align-items: center; gap: 8px; }
.contact-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--primary-grad); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600; flex-shrink: 0; }
.contact-name { font-size: 13px; font-weight: 600; flex: 1; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); flex-shrink: 0; }
.contact-preview { font-size: 12px; color: var(--text-lighter); margin-top: 4px; margin-left: 36px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-contacts { text-align: center; padding-top: 40px; color: var(--text-lighter); font-size: 13px; } .empty-contacts p { margin: 0; font-weight: 600; color: var(--text-light); }
.empty-chat { margin: auto; color: var(--text-lighter); font-size: 14px; }
@media (max-width: 600px) { .msg-page { flex-direction: column; height: auto; } .contact-panel { width: 100%; padding: 12px 14px; } .contact-panel h3 { margin-bottom: 8px; } .contact-list { display: flex; gap: 6px; overflow-x: auto; } .contact-item { flex-shrink: 0; } .contact-preview { display: none; } }
</style>
