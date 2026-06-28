<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ submit: [price: string] }>()
const visible = defineModel<boolean>({ default: false })
const offer = ref('')

function submit() {
  if (!offer.value.trim()) return
  emit('submit', offer.value.trim())
  offer.value = ''
  visible.value = false
}
</script>

<template>
  <div v-if="visible" class="bargain-row">
    <input v-model="offer" placeholder="输入出价..." class="bargain-in" @keyup.enter="submit" />
    <button class="btn btn-primary" @click="submit">出价</button>
  </div>
</template>

<style scoped>
.bargain-row { display: flex; gap: 10px; align-items: center; }
.bargain-in { flex: 1; padding: 10px 16px; border: none; border-radius: var(--radius-full); background: var(--bg); font-size: 14px; outline: none; }
.btn { padding: 10px 24px; font-size: 14px; font-weight: 500; border: none; border-radius: var(--radius-full); cursor: pointer; transition: all var(--transition); }
.btn-primary { background: var(--primary); color: #fff; }
.btn-primary:hover { box-shadow: 0 4px 12px rgba(91,155,213,0.35); transform: translateY(-1px); }
</style>
