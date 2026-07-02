<script setup lang="ts">
import { useFavoriteStore } from '@/stores/favoriteStore'

const props = defineProps<{ itemId: string | number }>()
const favStore = useFavoriteStore()

async function toggle() {
  await favStore.toggle(props.itemId)
}
</script>

<template>
  <button
    class="fav-btn"
    :class="{ active: favStore.isFavorited(itemId) }"
    :title="favStore.isFavorited(itemId) ? '取消收藏' : '收藏'"
    @click="toggle"
  >
    <span class="fav-icon">{{ favStore.isFavorited(itemId) ? '★' : '☆' }}</span>
    <span class="fav-text">{{ favStore.isFavorited(itemId) ? '已收藏' : '收藏' }}</span>
  </button>
</template>

<style scoped>
.fav-btn {
  display: inline-flex; align-items: center; gap: 4px;
  background: #f3f4f6; border: none; border-radius: var(--radius-full);
  padding: 5px 12px; font-size: 13px; cursor: pointer;
  color: #374151; transition: all var(--transition); flex-shrink: 0;
}
.fav-btn:hover { background: #e5e7eb; }
.fav-btn.active {
  background: var(--primary-light); color: var(--primary);
}
.fav-icon { font-size: 15px; }
.fav-text { font-size: 12px; }
</style>
