<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useItemStore } from '@/stores/itemStore'
import { useFavoriteStore } from '@/stores/favorite'
import { type ItemType, type ItemStatus } from '@/data/listings'
import MarketFilterBar from '@/components/MarketFilterBar.vue'
import MarketItemCard from '@/components/MarketItemCard.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import EmptyState from '@/components/EmptyState.vue'

const route = useRoute()
const itemStore = useItemStore()
const favStore = useFavoriteStore()

const filters = ref<{ keyword: string; type: ItemType | ''; campus: string; status: ItemStatus | '' }>({
  keyword: '', type: (route.query.type as ItemType) || '', campus: '', status: '进行中',
})

const filteredList = computed(() => {
  let result = itemStore.items
  if (filters.value.type) result = result.filter((l) => l.type === filters.value.type)
  if (filters.value.campus) result = result.filter((l) => l.campus === filters.value.campus)
  if (filters.value.status) result = result.filter((l) => l.status === filters.value.status)
  if (filters.value.keyword.trim()) {
    const kw = filters.value.keyword.trim().toLowerCase()
    result = result.filter((l) => l.title.toLowerCase().includes(kw) || l.description.toLowerCase().includes(kw) || l.tags.some((t) => t.includes(kw)))
  }
  return [...result].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
})

const pageSize = 6
const currentPage = ref(1)
const totalPages = computed(() => Math.ceil(filteredList.value.length / pageSize) || 1)
const pagedList = computed(() => filteredList.value.slice((currentPage.value - 1) * pageSize, currentPage.value * pageSize))

watch(() => route.query.type, (val) => { filters.value.type = (val as ItemType) || '' })

onMounted(async () => { await itemStore.fetchItems() })
</script>

<template>
  <section>
    <h2 class="page-title">校园集市</h2>
    <MarketFilterBar v-model="filters" />

    <LoadingState v-if="itemStore.loading" text="正在加载校园信息..." />

    <ErrorState
      v-else-if="itemStore.error"
      :message="itemStore.error"
      show-retry
      @retry="itemStore.fetchItems"
    />

    <template v-else-if="pagedList.length">
      <div class="list"><MarketItemCard v-for="item in pagedList" :key="item.id" :item="item" /></div>
      <div v-if="totalPages > 1" class="pager">
        <button :disabled="currentPage === 1" @click="currentPage--">&laquo;</button>
        <button v-for="p in totalPages" :key="p" :class="{ active: p === currentPage }" @click="currentPage = p">{{ p }}</button>
        <button :disabled="currentPage === totalPages" @click="currentPage++">&raquo;</button>
      </div>
    </template>

    <EmptyState v-else text="没有找到匹配的信息" hint="试试调整筛选条件" />
  </section>
</template>

<style scoped>
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 16px; color: var(--text); }
.list { display: flex; flex-direction: column; gap: 10px; }
.pager { display: flex; justify-content: center; gap: 4px; margin-top: 20px; }
.pager button { width: 34px; height: 34px; border: none; border-radius: 50%; background: var(--card-bg); box-shadow: var(--shadow-sm); font-size: 13px; color: var(--text); cursor: pointer; transition: all var(--transition); }
.pager button:hover { background: var(--bg); }
.pager button.active { background: var(--primary); color: #fff; box-shadow: 0 2px 6px rgba(91,155,213,0.35); }
.pager button:disabled { color: var(--text-lighter); cursor: default; }
</style>
