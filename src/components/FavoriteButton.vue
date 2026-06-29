<script setup lang="ts">
import { useFavoriteStore } from '@/stores/favorite'

const props = defineProps<{ itemId: string | number }>()
const favStore = useFavoriteStore()

async function toggle() {
  await favStore.toggle(props.itemId)
}
</script>

<template>
  <button class="fav-btn" :class="{ active: favStore.isFavorited(itemId) }" @click="toggle">
    {{ favStore.isFavorited(itemId) ? '★' : '☆' }}
  </button>
</template>

<style scoped>
.fav-btn {
  background: none; border: none; font-size: 20px; cursor: pointer;
  color: var(--warn); padding: 4px; transition: transform var(--transition); flex-shrink: 0;
}
.fav-btn:hover { transform: scale(1.2); }
</style>
