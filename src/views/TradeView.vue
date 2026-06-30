<template>
  <section class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">&larr; 返回</button>
      <h1>二手交易</h1>
      <p>浏览同学发布的闲置物品，发现校园内的实用好物。</p>
    </div>

    <SearchBar v-model="keyword" placeholder="搜索商品标题、分类、地点或描述" />

    <LoadingState v-if="itemStore.loading" text="正在加载二手交易信息..." />

    <ErrorState
      v-else-if="itemStore.error"
      :message="itemStore.error"
      show-retry
      @retry="itemStore.fetchItems"
    />

    <template v-else-if="filteredItems.length > 0">
      <div class="list">
        <router-link
          v-for="item in filteredItems"
          :key="item.id"
          :to="'/detail/' + item.id"
          class="card-link"
        >
          <ItemCard
            :title="item.title"
            :description="item.description"
            :tag="item.tags?.[0] || ''"
            :location="item.location"
            :time="item.createdAt?.slice(0, 16)"
            :image="item.images?.[0]"
          >
            <template #footer>
              <div class="card-footer">
                <strong class="price">¥{{ item.price }}</strong>
                <span v-if="item.condition" class="condition">{{ item.condition }}</span>
                <span class="status" :class="statusClass(item.status)">{{ item.status }}</span>
                <FavoriteButton :item-id="item.id" />
              </div>
            </template>
          </ItemCard>
        </router-link>
      </div>
    </template>

    <EmptyState
      v-else
      :text="keyword ? '没有找到匹配的二手交易信息' : '暂无二手交易信息'"
      :hint="keyword ? '试试其他关键词' : '快去发布第一件闲置物品吧'"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import ItemCard from '@/components/ItemCard.vue'
import FavoriteButton from '@/components/FavoriteButton.vue'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'
import ErrorState from '@/components/ErrorState.vue'
import SearchBar from '@/components/SearchBar.vue'

const itemStore = useItemStore()
const keyword = ref('')

const filteredItems = computed(() => {
  const list = itemStore.getByType('secondhand')
  if (!keyword.value.trim()) return list
  const kw = keyword.value.trim().toLowerCase()
  return list.filter((item) =>
    item.title.toLowerCase().includes(kw) ||
    item.description.toLowerCase().includes(kw) ||
    item.location.toLowerCase().includes(kw) ||
    (item.category && item.category.toLowerCase().includes(kw)) ||
    item.tags?.some((t) => t.toLowerCase().includes(kw)),
  )
})

function statusClass(status: string) {
  if (status === '进行中') return 's-open'
  if (status === '已关闭') return 's-closed'
  if (status === '已完成') return 's-done'
  return ''
}

onMounted(async () => {
  await itemStore.fetchItems()
})
</script>

<style scoped>
.page { display: flex; flex-direction: column; gap: 20px; }
.page-header { padding: 24px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
.page-header h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
.page-header p { margin: 0; color: var(--text-light); font-size: 14px; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08); border-radius: var(--radius-full); font-size: 13px; color: var(--text-light); cursor: pointer; padding: 6px 16px; margin-bottom: 12px; transition: all var(--transition); }
.back-btn:hover { background: #fff; color: var(--primary); box-shadow: var(--shadow-sm); }
.list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.card-link { text-decoration: none; color: inherit; display: flex; height: 100%; }
.card-link > * { flex: 1; }
.card-footer { display: flex; align-items: center; gap: 10px; }
.price { font-size: 16px; color: var(--danger); }
.condition { font-size: 13px; color: var(--text-light); }
.status { margin-left: auto; font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.s-open { background: var(--success-light); color: var(--success); }
.s-closed { background: #f0f0f0; color: #999; }
.s-done { background: var(--primary-light); color: var(--primary); }
@media (max-width: 600px) { .list { grid-template-columns: 1fr; } }
</style>
