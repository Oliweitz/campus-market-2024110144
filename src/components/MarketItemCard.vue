<script setup lang="ts">
import type { Item } from '@/data/listings'
import { TYPE_LABELS } from '@/data/listings'
import FavoriteButton from './FavoriteButton.vue'

defineProps<{ item: Item }>()
</script>

<template>
  <div class="list-card">
    <router-link :to="'/detail/' + item.id" class="card-body">
      <div class="card-img-wrap">
        <img v-if="item.images?.[0]" :src="item.images[0]" class="card-thumb" alt="" />
        <div v-else class="card-thumb-fb" :class="'fb-' + item.type"></div>
      </div>
      <div class="card-content">
      <div class="card-top">
        <strong>{{ item.title }}</strong>
        <span class="status-dot" :class="'dot-' + (item.status === '进行中' ? 'active' : item.status === '已完成' ? 'completed' : 'closed')"></span>
      </div>
      <div class="card-mid">
        <span class="c-type">{{ TYPE_LABELS[item.type] }}</span>
        <span v-if="item.price" class="c-num">¥{{ item.price }}</span>
        <span v-if="item.reward" class="c-num">¥{{ item.reward }}</span>
        <span v-if="item.targetCount" class="c-join">{{ item.currentCount }}/{{ item.targetCount }}人</span>
        <span v-if="item.type === 'secondhand' && item.stock !== undefined" :class="['c-stock', item.stock === 0 ? 'sold-out' : '']">{{ item.stock > 0 ? '库存 ' + item.stock : '已售罄' }}</span>
      </div>
      <div class="card-bot">
        <span>{{ item.campus }}</span>
        <span>&middot;</span>
        <span>👁 {{ item.viewCount }}</span>
        <span class="card-time">{{ item.createdAt.slice(0, 10) }}</span>
      </div>
      </div>
    </router-link>
    <FavoriteButton :item-id="item.id" />
  </div>
</template>

<style scoped>
.list-card { display: flex; align-items: center; background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); transition: all var(--transition); overflow: hidden; }
.list-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.card-body { flex: 1; display: flex; gap: 14px; padding: 14px 16px; text-decoration: none; color: var(--text); align-items: center; }
.card-img-wrap { width: 80px; height: 60px; flex-shrink: 0; border-radius: 8px; overflow: hidden; }
.card-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.card-thumb-fb { width: 100%; height: 100%; }
.fb-secondhand { background: linear-gradient(135deg, #c8e6c9, #a5d6a7); }
.fb-lostfound { background: linear-gradient(135deg, #bbdefb, #90caf9); }
.fb-group { background: linear-gradient(135deg, #e1bee7, #ce93d8); }
.fb-errand { background: linear-gradient(135deg, #ffccbc, #ffab91); }
.card-content { flex: 1; min-width: 0; }
.card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.card-top strong { font-size: 15px; font-weight: 600; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: var(--success); }
.dot-completed { background: #ccc; }
.dot-closed { background: var(--danger); }
.card-mid { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.c-type { font-size: 11px; color: var(--primary); background: var(--primary-light); padding: 2px 7px; border-radius: 4px; }
.c-num { font-size: 14px; font-weight: 600; color: var(--danger); }
.c-join { font-size: 13px; color: var(--success); }
.c-stock { font-size: 12px; color: var(--text-light); }
.c-stock.sold-out { color: var(--danger); font-weight: 600; }
.card-bot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); }
.card-time { margin-left: auto; color: var(--text-lighter); }
</style>
