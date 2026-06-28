<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'

const route = useRoute()
const chatStore = useChatStore()
const activeContact = ref('')
const newMsg = ref('')

watch(() => route.query.to, (name) => {
  if (name && typeof name === 'string') { chatStore.ensureContact(name); activeContact.value = name }
}, { immediate: true })

watch(() => chatStore.contacts.length, () => {
  if (!activeContact.value && chatStore.contacts.length > 0) activeContact.value = chatStore.contacts[0]!
})

function selectContact(name: string) { activeContact.value = name; chatStore.markRead(name) }

function send() {
  if (!newMsg.value.trim() || !activeContact.value) return
  chatStore.sendMessage(activeContact.value, newMsg.value.trim())
  newMsg.value = ''
}
</script>

<template>
  <section class="msg-page">
    <div class="contact-panel">
      <h3>消息 <span v-if="chatStore.totalUnread > 0" class="unread-total">{{ chatStore.totalUnread }}</span></h3>
      <template v-if="chatStore.contacts.length > 0">
        <ul class="contact-list">
          <li v-for="c in chatStore.contacts" :key="c" :class="['contact-item', { active: c === activeContact }]" @click="selectContact(c)">
            <div class="contact-top">
              <span class="contact-name">{{ c }}</span>
              <span v-if="chatStore.conversations[c]?.unread" class="unread-badge">{{ chatStore.conversations[c]!.unread }}</span>
            </div>
            <div class="contact-preview">{{ chatStore.getLastMessage(c) }}</div>
          </li>
        </ul>
      </template>
      <p v-else class="empty-contacts">暂无联系人。从详情页点击用户名字开始聊天。</p>
    </div>

    <div class="chat-panel">
      <template v-if="activeContact">
        <h3 class="chat-title">{{ activeContact }}</h3>
        <div class="chat-log">
          <div v-for="(m, i) in chatStore.getChat(activeContact)" :key="i" :class="['chat-msg', m.from === '我' ? 'msg-me' : 'msg-other']">
            <div class="msg-text">{{ m.text }}</div>
            <div class="msg-time">{{ m.time }}</div>
          </div>
        </div>
        <div class="chat-input">
          <input v-model="newMsg" placeholder="输入消息..." @keyup.enter="send" />
          <button @click="send">发送</button>
        </div>
      </template>
      <p v-else class="empty">选择一个联系人开始聊天</p>
    </div>
  </section>
</template>

<style scoped>
.msg-page { display: flex; gap: 16px; height: 65vh; }
.contact-panel { width: 220px; border-right: 1px solid #e5e5e5; flex-shrink: 0; overflow-y: auto; }
.contact-panel h3 { font-size: 16px; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
.unread-total { background: #e74c3c; color: #fff; font-size: 12px; padding: 2px 8px; border-radius: 10px; }
.contact-list { list-style: none; padding: 0; }
.contact-item { padding: 10px 12px; cursor: pointer; border-radius: 6px; margin-bottom: 4px; }
.contact-item:hover { background: #f0f0f0; }
.contact-item.active { background: #ecf5ff; }
.contact-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.contact-name { font-weight: bold; font-size: 14px; }
.unread-badge { background: #e74c3c; color: #fff; font-size: 11px; padding: 1px 6px; border-radius: 8px; }
.contact-preview { font-size: 12px; color: #999; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-contacts { color: #999; font-size: 13px; line-height: 1.6; }
.chat-panel { flex: 1; display: flex; flex-direction: column; }
.chat-title { font-size: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e5e5; margin-bottom: 12px; }
.chat-log { flex: 1; overflow-y: auto; padding-right: 8px; }
.chat-msg { margin-bottom: 12px; max-width: 70%; }
.msg-me { margin-left: auto; text-align: right; }
.msg-other { margin-right: auto; }
.msg-text { padding: 8px 14px; border-radius: 12px; display: inline-block; font-size: 14px; }
.msg-me .msg-text { background: #409eff; color: #fff; }
.msg-other .msg-text { background: #f0f0f0; color: #333; }
.msg-time { font-size: 12px; color: #999; margin-top: 4px; }
.chat-input { display: flex; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #e5e5e5; }
.chat-input input { flex: 1; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
.chat-input button { padding: 8px 20px; background: #409eff; color: #fff; border: none; border-radius: 6px; cursor: pointer; }
.chat-input button:hover { background: #337ecc; }
.empty { color: #999; margin: auto; }
</style>
