<script setup lang="ts">
import { TYPE_LABELS, CAMPUS_LIST, STATUS_LABELS, type ItemType, type ItemStatus } from '@/data/listings'

const model = defineModel<{
  keyword: string
  type: ItemType | ''
  campus: string
  status: ItemStatus | ''
}>({ required: true })
</script>

<template>
  <div class="filter-bar">
    <input v-model="model.keyword" placeholder="搜索..." class="search-input" />
    <select v-model="model.type" class="pill">
      <option value="">全部分类</option>
      <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
    </select>
    <select v-model="model.campus" class="pill">
      <option value="">全部校区</option>
      <option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option>
    </select>
    <select v-model="model.status" class="pill">
      <option value="">全部状态</option>
      <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
    </select>
    <slot name="extra" />
  </div>
</template>

<style scoped>
.filter-bar { display: flex; gap: 6px; margin-bottom: 16px; align-items: center; }
.search-input { flex: 1; min-width: 80px; padding: 9px 14px; border: none; border-radius: var(--radius-full); background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 13px; color: var(--text); outline: none; transition: all var(--transition); }
.search-input:focus { box-shadow: 0 0 0 2px var(--primary-light); }
.pill { width: 88px; padding: 9px 24px 9px 10px; border: none; border-radius: var(--radius-full); background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 13px; color: var(--text); outline: none; cursor: pointer; transition: all var(--transition); white-space: nowrap; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c0c0c0' d='M6 8L1 3h10z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
.pill:focus { box-shadow: 0 0 0 2px var(--primary-light); }
@media (max-width: 600px) { .filter-bar { flex-wrap: wrap; } .pill { font-size: 12px; padding: 8px 6px; } }
@media (max-width: 400px) { .search-input { min-width: 100%; } }
</style>
