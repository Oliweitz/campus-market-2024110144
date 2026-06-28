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
      <h3>消息</h3>
      <template v-if="chatStore.contacts.length > 0">
        <div class="contact-list">
          <div
            v-for="c in chatStore.contacts" :key="c"
            :class="['contact-item', { active: c === activeContact }]"
            @click="selectContact(c)"
          >
            <div class="contact-top">
              <span class="contact-avatar">{{ c[0] }}</span>
              <span class="contact-name">{{ c }}</span>
              <span v-if="chatStore.conversations[c]?.unread" class="dot"></span>
            </div>
            <div class="contact-preview">{{ chatStore.getLastMessage(c) }}</div>
          </div>
        </div>
      </template>
      <div v-else class="empty-contacts">
        <p>暂无联系人</p>
        <span>从详情页点击用户名开始聊天</span>
      </div>
    </div>

    <div class="chat-panel">
      <template v-if="activeContact">
        <div class="chat-header">{{ activeContact }}</div>
        <div class="chat-log">
          <div v-for="(m, i) in chatStore.getChat(activeContact)" :key="i" :class="['bubble', m.from === '我' ? 'bubble-me' : 'bubble-other']">
            <div class="bubble-text">{{ m.text }}</div>
            <div class="bubble-time">{{ m.time }}</div>
          </div>
        </div>
        <div class="quick-replies">
          <button @click="newMsg = '还在吗？'; send()">还在吗？</button>
          <button @click="newMsg = '好的，谢谢'">好的，谢谢</button>
          <button @click="newMsg = '什么时候方便？'">什么时候方便？</button>
          <button @click="newMsg = '在哪里见面？'">在哪里见面？</button>
        </div>
        <div class="chat-send">
          <input v-model="newMsg" placeholder="输入消息..." class="send-input" @keyup.enter="send" />
          <button class="send-btn" @click="send">&rarr;</button>
        </div>
      </template>
      <div v-else class="empty-chat">选择联系人开始聊天</div>
    </div>
  </section>
</template>

<style scoped>
.msg-page { display: flex; gap: 0; height: 62vh; background: var(--card-bg); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); }

.contact-panel {
  width: 220px; background: #fafbfc; padding: 20px 14px; flex-shrink: 0; overflow-y: auto;
}
.contact-panel h3 { margin: 0 0 14px; font-size: 15px; font-weight: 600; }
.contact-list { display: flex; flex-direction: column; gap: 4px; }
.contact-item { padding: 10px 12px; border-radius: var(--radius-sm); cursor: pointer; transition: all var(--transition); }
.contact-item:hover { background: #eef2f7; }
.contact-item.active { background: var(--primary-light); }
.contact-top { display: flex; align-items: center; gap: 8px; }
.contact-avatar {
  width: 28px; height: 28px; border-radius: 50%; background: var(--primary-grad); color: #fff;
  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 600;
  flex-shrink: 0;
}
.contact-name { font-size: 13px; font-weight: 600; flex: 1; }
.dot { width: 8px; height: 8px; border-radius: 50%; background: var(--danger); flex-shrink: 0; }
.contact-preview { font-size: 12px; color: var(--text-lighter); margin-top: 4px; margin-left: 36px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.empty-contacts { text-align: center; padding-top: 40px; color: var(--text-lighter); font-size: 13px; line-height: 1.6; }
.empty-contacts p { margin: 0; font-weight: 600; color: var(--text-light); }

.chat-panel { flex: 1; display: flex; flex-direction: column; }
.chat-header { padding: 16px 20px; font-size: 15px; font-weight: 600; border-bottom: 1px solid #f0f0f0; }
.chat-log { flex: 1; overflow-y: auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
.bubble { max-width: 72%; }
.bubble-me { align-self: flex-end; }
.bubble-other { align-self: flex-start; }
.bubble-text { padding: 10px 16px; border-radius: var(--radius-lg); font-size: 14px; line-height: 1.5; display: inline-block; }
.bubble-me .bubble-text { background: var(--primary-grad); color: #fff; border-bottom-right-radius: 4px; }
.bubble-other .bubble-text { background: #f0f2f5; color: var(--text); border-bottom-left-radius: 4px; }
.bubble-time { font-size: 11px; color: var(--text-lighter); margin-top: 4px; }
.bubble-me .bubble-time { text-align: right; }

.quick-replies { display: flex; gap: 6px; padding: 8px 16px 0; flex-wrap: wrap; }
.quick-replies button {
  padding: 5px 12px; border: 1px solid #e0e0e0; border-radius: var(--radius-full);
  background: var(--card-bg); font-size: 12px; color: var(--text-light); cursor: pointer;
  transition: all var(--transition);
}
.quick-replies button:hover { border-color: var(--primary); color: var(--primary); }

.chat-send { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.send-input {
  flex: 1; padding: 10px 18px; border: none; border-radius: var(--radius-full);
  background: var(--bg); font-size: 14px; outline: none;
}
.send-btn {
  width: 40px; height: 40px; border: none; border-radius: 50%;
  background: var(--primary); color: #fff; font-size: 20px; cursor: pointer;
  display: flex; align-items: center; justify-content: center; transition: all var(--transition);
  flex-shrink: 0;
}
.send-btn:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); transform: scale(1.05); }
.empty-chat { margin: auto; color: var(--text-lighter); font-size: 14px; }

@media (max-width: 600px) {
  .msg-page { flex-direction: column; height: auto; }
  .contact-panel { width: 100%; border-right: none; border-bottom: 1px solid #f0f0f0; padding: 12px 14px; }
  .contact-panel h3 { margin-bottom: 8px; }
  .contact-list { display: flex; gap: 6px; overflow-x: auto; }
  .contact-item { flex-shrink: 0; }
  .contact-preview { display: none; }
  .chat-panel { min-height: 50vh; }
}
</style>
