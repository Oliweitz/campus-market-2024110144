<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFavoritesStore } from '@/stores/favorites'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, STATUS_LABELS, CAMPUS_LIST, type ListingType, type ListingStatus } from '@/data/listings'

const route = useRoute()
const fav = useFavoritesStore()
const listStore = useListingsStore()

const typeFilter = ref<ListingType | ''>((route.query.type as ListingType) || '')
const keyword = ref('')
const campusFilter = ref('')
const statusFilter = ref<ListingStatus | ''>('active')

const filteredList = computed(() => {
  let result = listStore.items
  if (typeFilter.value) result = result.filter(l => l.type === typeFilter.value)
  if (campusFilter.value) result = result.filter(l => l.campus === campusFilter.value)
  if (statusFilter.value) result = result.filter(l => l.status === statusFilter.value)
  if (keyword.value.trim()) {
    const kw = keyword.value.trim().toLowerCase()
    result = result.filter(l => l.title.toLowerCase().includes(kw) || l.desc.toLowerCase().includes(kw) || l.tags.some(t => t.includes(kw)))
  }
  return result
})
</script>

<template>
  <section>
    <h2>校园集市</h2>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索关键词..." class="search-input" />
      <select v-model="typeFilter" class="filter-select">
        <option value="">全部分类</option>
        <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <select v-model="campusFilter" class="filter-select">
        <option value="">全部校区</option>
        <option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="statusFilter" class="filter-select">
        <option value="">全部状态</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
    </div>

    <template v-if="filteredList.length > 0">
      <ul class="list">
        <li v-for="item in filteredList" :key="item.id" class="list-item">
          <router-link :to="'/detail/' + item.id" class="item-link">
            <div class="item-main">
              <strong class="item-title">{{ item.title }}</strong>
              <span class="item-type">{{ TYPE_LABELS[item.type] }}</span>
              <span class="item-status" :class="'status-' + item.status">{{ STATUS_LABELS[item.status] }}</span>
            </div>
            <div class="item-sub">
              <span v-if="item.price" class="item-price">{{ item.price }}</span>
              <span v-if="item.reward" class="item-price">{{ item.reward }}</span>
              <span v-if="item.unitPrice" class="item-price">{{ item.unitPrice }}/人</span>
              <span v-if="item.targetCount" class="item-count">{{ item.currentCount }}/{{ item.targetCount }}人</span>
              <span class="item-campus">{{ item.campus }}</span>
              <span class="item-poster">{{ item.poster }}</span>
            </div>
          </router-link>
          <button class="fav-toggle" @click="fav.toggle(item.id)">
            {{ fav.isFavorited(item.id) ? '&#9733;' : '&#9734;' }}
          </button>
        </li>
      </ul>
    </template>
    <p v-else class="empty">没有找到匹配的信息，试试调整筛选条件。</p>
  </section>
</template>

<style scoped>
.filter-bar { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }
.search-input { flex: 1; min-width: 150px; padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; }
.filter-select { padding: 8px 12px; border: 1px solid #ccc; border-radius: 6px; font-size: 14px; background: #fff; cursor: pointer; }
.list { list-style: none; padding: 0; }
.list-item { display: flex; align-items: center; margin-bottom: 8px; }
.item-link { flex: 1; display: block; padding: 14px 16px; border: 1px solid #e5e5e5; border-radius: 6px; text-decoration: none; color: #333; }
.item-link:hover { background: #f5f5f5; }
.item-main { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.item-title { font-size: 16px; }
.item-type { font-size: 12px; color: #409eff; background: #ecf5ff; padding: 2px 8px; border-radius: 4px; }
.item-status { font-size: 12px; padding: 2px 8px; border-radius: 4px; }
.status-active { background: #e8f5e9; color: #4caf50; }
.status-completed { background: #f0f0f0; color: #999; }
.status-closed { background: #fde8e8; color: #e74c3c; }
.item-sub { display: flex; align-items: center; gap: 16px; font-size: 14px; color: #999; }
.item-price { color: #e74c3c; font-weight: bold; }
.item-count { color: #67c23a; }
.item-poster { margin-left: auto; }
.fav-toggle { background: none; border: none; font-size: 20px; cursor: pointer; padding: 8px; color: #e6a23c; flex-shrink: 0; }
.empty { color: #999; margin-top: 24px; text-align: center; }
</style>
