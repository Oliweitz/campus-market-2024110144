<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  messages: { from: string; text: string; time: string }[]
  contactName?: string
}>()

const emit = defineEmits<{ send: [text: string] }>()
const text = ref('')

function send() {
  const t = text.value.trim()
  if (!t) return
  emit('send', t)
  text.value = ''
}

const quickReplies = ['还在吗？', '好的，谢谢', '什么时候方便？', '在哪里见面？']
</script>

<template>
  <div class="chat-panel">
    <div v-if="contactName" class="chat-header">{{ contactName }}</div>
    <div class="chat-log" ref="logRef">
      <div v-for="(m, i) in messages" :key="i" :class="['bubble', m.from === '我' ? 'bubble-me' : 'bubble-other']">
        <div class="bubble-text">{{ m.text }}</div>
        <div class="bubble-time">{{ m.time }}</div>
      </div>
    </div>
    <div class="quick-replies">
      <button v-for="r in quickReplies" :key="r" @click="text = r">{{ r }}</button>
    </div>
    <div class="chat-send">
      <input v-model="text" placeholder="输入消息..." class="send-input" @keyup.enter="send" />
      <button class="send-btn" @click="send">&rarr;</button>
    </div>
  </div>
</template>

<style scoped>
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
.quick-replies button { padding: 5px 12px; border: 1px solid #e0e0e0; border-radius: var(--radius-full); background: var(--card-bg); font-size: 12px; color: var(--text-light); cursor: pointer; transition: all var(--transition); }
.quick-replies button:hover { border-color: var(--primary); color: var(--primary); }
.chat-send { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.send-input { flex: 1; padding: 10px 18px; border: none; border-radius: var(--radius-full); background: var(--bg); font-size: 14px; outline: none; }
.send-btn { width: 40px; height: 40px; border: none; border-radius: 50%; background: var(--primary); color: #fff; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all var(--transition); flex-shrink: 0; }
.send-btn:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); transform: scale(1.05); }
</style>
