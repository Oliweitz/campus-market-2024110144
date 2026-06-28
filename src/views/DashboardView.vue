<script setup lang="ts">
import { computed } from 'vue'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, CAMPUS_LIST, type ListingType } from '@/data/listings'

const listStore = useListingsStore()

const totalCount = computed(() => listStore.items.length)

const typeStats = computed(() => {
  const types: ListingType[] = ['trade', 'lost', 'pintuan', 'paotui']
  return types.map(t => ({ label: TYPE_LABELS[t], count: listStore.items.filter(l => l.type === t).length }))
})

const campusStats = computed(() =>
  CAMPUS_LIST.map(c => ({ label: c, count: listStore.items.filter(l => l.campus === c).length })).filter(s => s.count > 0),
)

const activeCount = computed(() => listStore.items.filter(l => l.status === 'active').length)
const completedCount = computed(() => listStore.items.filter(l => l.status === 'completed').length)

const maxTypeCount = computed(() => Math.max(...typeStats.value.map(t => t.count), 1))
const maxCampusCount = computed(() => Math.max(...campusStats.value.map(c => c.count), 1))
</script>

<template>
  <section class="dashboard">
    <h2>趋势看板</h2>

    <div class="stats-cards">
      <div class="stat-card"><strong>{{ totalCount }}</strong><span>信息总数</span></div>
      <div class="stat-card"><strong>{{ activeCount }}</strong><span>进行中</span></div>
      <div class="stat-card"><strong>{{ completedCount }}</strong><span>已完成</span></div>
      <div class="stat-card"><strong>{{ CAMPUS_LIST.length }}</strong><span>覆盖校区</span></div>
    </div>

    <div class="chart-section">
      <h3>信息类型占比</h3>
      <div class="bar-chart">
        <div v-for="t in typeStats" :key="t.label" class="bar-row">
          <span class="bar-label">{{ t.label }}</span>
          <div class="bar-track"><div class="bar-fill" :style="{ width: (t.count / maxTypeCount * 100) + '%' }"></div></div>
          <span class="bar-value">{{ t.count }}</span>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>校区分布</h3>
      <div class="bar-chart">
        <div v-for="c in campusStats" :key="c.label" class="bar-row">
          <span class="bar-label">{{ c.label }}</span>
          <div class="bar-track"><div class="bar-fill campus-fill" :style="{ width: (c.count / maxCampusCount * 100) + '%' }"></div></div>
          <span class="bar-value">{{ c.count }}</span>
        </div>
      </div>
    </div>

    <div class="chart-section">
      <h3>最近发布</h3>
      <ul class="recent-list">
        <li v-for="l in listStore.items.slice(0, 5)" :key="l.id" class="recent-item">
          <span class="r-type">{{ TYPE_LABELS[l.type] }}</span>
          <router-link :to="'/detail/' + l.id" class="r-title">{{ l.title }}</router-link>
          <span class="r-time">{{ l.publishTime.slice(0, 10) }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.dashboard { max-width: 640px; }
.stats-cards { display: flex; gap: 12px; margin: 16px 0; flex-wrap: wrap; }
.stat-card { flex: 1; min-width: 100px; background: #f5f5f5; border-radius: 8px; padding: 20px 16px; text-align: center; }
.stat-card strong { display: block; font-size: 24px; color: #409eff; }
.stat-card span { font-size: 13px; color: #666; }
.chart-section { margin-top: 24px; }
.chart-section h3 { font-size: 16px; margin-bottom: 12px; }
.bar-chart { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { width: 80px; font-size: 14px; color: #333; flex-shrink: 0; }
.bar-track { flex: 1; height: 22px; background: #f0f0f0; border-radius: 11px; overflow: hidden; }
.bar-fill { height: 100%; background: #409eff; border-radius: 11px; transition: width 0.5s; min-width: 4px; }
.campus-fill { background: #67c23a; }
.bar-value { width: 30px; text-align: right; font-size: 14px; color: #666; font-weight: bold; }
.recent-list { list-style: none; padding: 0; }
.recent-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0; }
.r-type { font-size: 12px; color: #409eff; background: #ecf5ff; padding: 2px 6px; border-radius: 4px; }
.r-title { flex: 1; text-decoration: none; color: #333; font-size: 14px; }
.r-title:hover { color: #409eff; }
.r-time { font-size: 13px; color: #999; }
</style>
