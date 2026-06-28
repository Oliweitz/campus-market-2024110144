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

const sortBy = ref<'time' | 'price'>('time')
const sortedList = computed(() => {
  const arr = [...filteredList.value]
  if (sortBy.value === 'time') arr.sort((a, b) => b.publishTime.localeCompare(a.publishTime))
  return arr
})

const pageSize = 6
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(sortedList.value.length / pageSize))
const pagedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return sortedList.value.slice(start, start + pageSize)
})
function goPage(p: number) {
  if (p >= 1 && p <= totalPages.value) currentPage.value = p
}
</script>

<template>
  <section>
    <h2 class="page-title">校园集市</h2>

    <div class="filter-bar">
      <input v-model="keyword" placeholder="搜索..." class="search-input" />
      <select v-model="typeFilter" class="pill">
        <option value="">分类</option>
        <option v-for="(label, key) in TYPE_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <select v-model="campusFilter" class="pill">
        <option value="">校区</option>
        <option v-for="c in CAMPUS_LIST" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="statusFilter" class="pill">
        <option value="">状态</option>
        <option v-for="(label, key) in STATUS_LABELS" :key="key" :value="key">{{ label }}</option>
      </select>
      <select v-model="sortBy" class="pill pill-sm">
        <option value="time">最新</option>
        <option value="price">价格</option>
      </select>
    </div>

    <template v-if="pagedList.length > 0">
      <div class="list">
        <div v-for="item in pagedList" :key="item.id" class="list-card">
          <router-link :to="'/detail/' + item.id" class="card-body">
            <div class="card-top">
              <strong>{{ item.title }}</strong>
              <span class="status-dot" :class="'dot-' + item.status"></span>
            </div>
            <div class="card-mid">
              <span class="c-type">{{ TYPE_LABELS[item.type] }}</span>
              <span v-if="item.price" class="c-num">{{ item.price }}</span>
              <span v-if="item.reward" class="c-num">{{ item.reward }}</span>
              <span v-if="item.unitPrice" class="c-num">{{ item.unitPrice }}/人</span>
              <span v-if="item.targetCount" class="c-join">{{ item.currentCount }}/{{ item.targetCount }}人</span>
            </div>
            <div class="card-bot">
              <span>{{ item.campus }}</span>
              <span>&middot;</span>
              <span>{{ item.poster }}</span>
              <span class="card-time">{{ item.publishTime.slice(0, 10) }}</span>
            </div>
          </router-link>
          <button class="fav-dot" @click="fav.toggle(item.id)">
            {{ fav.isFavorited(item.id) ? '&#9733;' : '&#9734;' }}
          </button>
        </div>
      </div>

      <div v-if="totalPages > 1" class="pager">
        <button :disabled="currentPage === 1" @click="goPage(currentPage - 1)">&laquo;</button>
        <button v-for="p in totalPages" :key="p" :class="{ active: p === currentPage }" @click="goPage(p)">{{ p }}</button>
        <button :disabled="currentPage === totalPages" @click="goPage(currentPage + 1)">&raquo;</button>
      </div>
    </template>
    <div v-else class="empty-state">
      <div class="empty-icon">~</div>
      <p>没有找到匹配的信息</p>
      <span>试试调整筛选条件</span>
    </div>
  </section>
</template>

<style scoped>
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 16px; color: var(--text); }

.filter-bar { display: flex; gap: 6px; margin-bottom: 16px; align-items: center; }
.search-input {
  flex: 1; min-width: 80px; padding: 9px 14px; border: none; border-radius: var(--radius-full);
  background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 13px;
  color: var(--text); outline: none; transition: all var(--transition);
}
.search-input:focus { box-shadow: 0 0 0 2px var(--primary-light); }
.pill {
  width: 88px; padding: 9px 24px 9px 10px; border: none; border-radius: var(--radius-full);
  background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 13px;
  color: var(--text); outline: none; cursor: pointer; transition: all var(--transition);
  white-space: nowrap; appearance: none; -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23c0c0c0' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat; background-position: right 10px center;
}
.pill-sm { width: 72px; padding: 9px 20px 9px 8px; font-size: 12px; background-position: right 6px center; }
.pill:focus { box-shadow: 0 0 0 2px var(--primary-light); }

.list { display: flex; flex-direction: column; gap: 10px; }
.list-card {
  display: flex; align-items: stretch; background: var(--card-bg);
  border-radius: var(--radius-md); box-shadow: var(--shadow-sm);
  transition: all var(--transition); overflow: hidden;
}
.list-card:hover { box-shadow: var(--shadow-md); transform: translateY(-1px); }
.card-body {
  flex: 1; padding: 14px 16px; text-decoration: none; color: var(--text);
}
.card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.card-top strong { font-size: 15px; font-weight: 600; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-active { background: var(--success); }
.dot-completed { background: #ccc; }
.dot-closed { background: var(--danger); }

.card-mid { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
.c-type {
  font-size: 11px; color: var(--primary); background: var(--primary-light);
  padding: 2px 7px; border-radius: 4px;
}
.c-num { font-size: 14px; font-weight: 600; color: var(--danger); }
.c-join { font-size: 13px; color: var(--success); }

.card-bot { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--text-light); }
.card-time { margin-left: auto; color: var(--text-lighter); }

.fav-dot {
  background: none; border: none; font-size: 18px; cursor: pointer;
  padding: 0 14px; color: var(--warn); transition: all var(--transition);
  flex-shrink: 0;
}
.fav-dot:hover { transform: scale(1.2); }

.empty-state {
  text-align: center; padding: 60px 0; color: var(--text-light);
}
.empty-icon { font-size: 40px; color: var(--text-lighter); margin-bottom: 12px; }
.empty-state p { margin: 0; font-size: 15px; }
.empty-state span { font-size: 13px; color: var(--text-lighter); }

@media (max-width: 600px) {
  .filter-bar { flex-wrap: wrap; }
  .pill { font-size: 12px; padding: 8px 6px; }
}
@media (max-width: 400px) {
  .search-input { min-width: 100%; }
}

.pager {
  display: flex; justify-content: center; gap: 4px; margin-top: 20px;
}
.pager button {
  width: 34px; height: 34px; border: none; border-radius: 50%;
  background: var(--card-bg); box-shadow: var(--shadow-sm);
  font-size: 13px; color: var(--text); cursor: pointer; transition: all var(--transition);
}
.pager button:hover { background: var(--bg); }
.pager button.active { background: var(--primary); color: #fff; box-shadow: 0 2px 6px rgba(91,155,213,0.35); }
.pager button:disabled { color: var(--text-lighter); cursor: default; }
</style>
