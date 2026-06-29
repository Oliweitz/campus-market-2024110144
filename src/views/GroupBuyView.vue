<template>
  <section class="page">
    <div class="page-header">
      <button class="back-btn" @click="$router.back()">&larr; 返回</button>
      <h1>拼单搭子</h1>
      <p>找人一起拼、一起学、一起玩，组团更划算。</p>
    </div>

    <div v-if="itemStore.loading" class="loading-state">
      <p>加载中...</p>
    </div>

    <template v-else-if="itemStore.error">
      <EmptyState :text="itemStore.error" hint="请检查 Mock 服务是否已启动" />
    </template>

    <template v-else-if="items.length > 0">
      <div class="list">
        <router-link
          v-for="item in items"
          :key="item.id"
          :to="'/detail/' + item.id"
          class="card-link"
        >
          <ItemCard
            :title="item.title"
            :description="item.description"
            :tag="item.tags?.[0] || ''"
            :location="item.location"
            :time="item.deadline"
          >
            <template #footer>
              <div class="card-footer">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: progressPercent(item) + '%' }"
                  ></div>
                </div>
                <span class="count">{{ item.currentCount }}/{{ item.targetCount }}人</span>
                <span class="status" :class="statusClass(item.status)">{{ item.status }}</span>
              </div>
            </template>
          </ItemCard>
        </router-link>
      </div>
    </template>

    <EmptyState
      v-else
      text="暂无拼单搭子信息"
      hint="快来发起第一个拼单吧"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import type { Item } from '@/data/listings'
import ItemCard from '@/components/ItemCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const itemStore = useItemStore()

const items = computed(() => itemStore.getByType('group'))

function progressPercent(item: Item): number {
  if (!item.targetCount) return 0
  return Math.min(100, Math.round(((item.currentCount ?? 0) / item.targetCount) * 100))
}

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
.page-header { padding: 24px; border-radius: var(--radius-lg); background: linear-gradient(135deg, #f3e5f5, #e1bee7); }
.page-header h1 { margin: 0 0 8px; font-size: 20px; font-weight: 600; }
.page-header p { margin: 0; color: var(--text-light); font-size: 14px; }
.back-btn { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.7); border: 1px solid rgba(0,0,0,0.08); border-radius: var(--radius-full); font-size: 13px; color: var(--text-light); cursor: pointer; padding: 6px 16px; margin-bottom: 12px; transition: all var(--transition); }
.back-btn:hover { background: #fff; color: var(--primary); box-shadow: var(--shadow-sm); }
.loading-state { text-align: center; padding: 60px 0; color: var(--text-lighter); }
.list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.card-link { text-decoration: none; color: inherit; display: block; }
.card-footer { display: flex; align-items: center; gap: 10px; }
.progress-bar { flex: 1; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #ce93d8, #ab47bc); border-radius: 4px; transition: width 0.3s ease; }
.count { font-size: 14px; font-weight: 600; color: var(--success); white-space: nowrap; }
.status { font-size: 12px; padding: 2px 8px; border-radius: 999px; }
.s-open { background: var(--success-light); color: var(--success); }
.s-closed { background: #f0f0f0; color: #999; }
.s-done { background: var(--primary-light); color: var(--primary); }
@media (max-width: 600px) { .list { grid-template-columns: 1fr; } }
</style>
