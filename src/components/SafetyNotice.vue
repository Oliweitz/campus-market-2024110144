<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { noticeApi } from '@/api/noticeApi'
import type { Notice } from '@/data/listings'

const notices = ref<Notice[]>([])
const current = ref(0)

onMounted(async () => {
  try {
    const res = await noticeApi.getNotices({ type: 'safety' })
    notices.value = res.data
  } catch { /* 静默 */ }
})

function next() {
  if (notices.value.length > 0) {
    current.value = (current.value + 1) % notices.value.length
  }
}
</script>

<template>
  <div v-if="notices.length > 0" class="safety" @click="next">
    <span class="safety-icon">⚠</span>
    <span class="safety-text">{{ notices[current]?.content }}</span>
    <span v-if="notices.length > 1" class="safety-dots">
      <span v-for="(_, i) in notices" :key="i" :class="{ active: i === current }"></span>
    </span>
  </div>
</template>

<style scoped>
.safety {
  display: flex; align-items: center; gap: 10px;
  background: var(--warn-light); border-left: 3px solid var(--warn);
  border-radius: var(--radius-sm); padding: 10px 14px;
  font-size: 12px; color: #a08040; margin-bottom: 18px; line-height: 1.6;
  cursor: pointer; user-select: none;
}
.safety-icon { font-size: 16px; flex-shrink: 0; }
.safety-text { flex: 1; }
.safety-dots { display: flex; gap: 4px; flex-shrink: 0; }
.safety-dots span { width: 6px; height: 6px; border-radius: 50%; background: #d4c89a; }
.safety-dots span.active { background: var(--warn); }
</style>
