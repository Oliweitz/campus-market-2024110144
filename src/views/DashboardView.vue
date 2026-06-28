<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useItemStore } from '@/stores/itemStore'
import { countByType, countByCampus, countByStatus } from '@/utils/statistics'
import { TYPE_LABELS } from '@/data/listings'
import ChartPanel from '@/components/ChartPanel.vue'

const itemStore = useItemStore()

const totalCount = computed(() => itemStore.items.length)
const activeCount = computed(() => itemStore.items.filter((i) => i.status === '进行中').length)
const completedCount = computed(() => itemStore.items.filter((i) => i.status === '已完成').length)

const typeStats = computed(() => countByType(itemStore.items))
const campusStats = computed(() => countByCampus(itemStore.items))
const statusStats = computed(() => countByStatus(itemStore.items))

const typeChartOption = computed(() => ({
  tooltip: { trigger: 'item' as const },
  legend: { bottom: 0 },
  series: [{
    type: 'pie', radius: ['45%', '70%'], center: ['50%', '45%'],
    label: { show: true, formatter: '{b}\n{d}%' },
    data: typeStats.value.map((t) => ({ name: t.label, value: t.count })),
    itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
  }],
}))

const campusChartOption = computed(() => ({
  tooltip: { trigger: 'axis' as const },
  xAxis: { type: 'category' as const, data: campusStats.value.map((c) => c.label), axisLabel: { fontSize: 12 } },
  yAxis: { type: 'value' as const, show: false },
  grid: { top: 10, bottom: 30, left: 10, right: 30 },
  series: [{
    type: 'bar', data: campusStats.value.map((c) => c.count),
    itemStyle: { borderRadius: [6, 6, 0, 0], color: '#7ab8f5' },
    label: { show: true, position: 'top' as const, fontSize: 12 },
  }],
}))

onMounted(async () => {
  await itemStore.fetchItems()
})
</script>

<template>
  <section class="dash">
    <h2 class="page-title">趋势看板</h2>

    <div class="stat-cards">
      <div class="sc"><strong>{{ totalCount }}</strong><span>信息总数</span></div>
      <div class="sc"><strong>{{ activeCount }}</strong><span>进行中</span></div>
      <div class="sc"><strong>{{ completedCount }}</strong><span>已完成</span></div>
      <div class="sc"><strong>{{ campusStats.length }}</strong><span>覆盖校区</span></div>
    </div>

    <div class="charts-row">
      <div class="chart-block"><h3>类型占比</h3><ChartPanel :option="typeChartOption" height="300px" /></div>
      <div class="chart-block"><h3>校区分布</h3><ChartPanel :option="campusChartOption" height="300px" /></div>
    </div>

    <div class="chart-block">
      <h3>最近发布</h3>
      <div class="mini-rows">
        <div v-for="l in itemStore.items.slice(0, 6)" :key="l.id" class="mini-row">
          <span class="mr-type">{{ TYPE_LABELS[l.type] }}</span>
          <router-link :to="'/detail/' + l.id" class="mr-title">{{ l.title }}</router-link>
          <span class="mr-view">👁 {{ l.viewCount }}</span>
          <span class="mr-time">{{ l.createdAt.slice(0, 10) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dash { }
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 18px; color: var(--text); }

.stat-cards { display: flex; gap: 10px; margin-bottom: 22px; }
.sc { flex: 1; min-width: 80px; background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 18px 12px; text-align: center; }
.sc strong { display: block; font-size: 22px; font-weight: 700; color: var(--primary); }
.sc span { font-size: 12px; color: var(--text-light); margin-top: 4px; display: block; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
@media (max-width: 700px) { .charts-row { grid-template-columns: 1fr; } }
.chart-block { margin-bottom: 22px; background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); padding: 16px; }
.chart-block h3 { font-size: 14px; font-weight: 600; margin: 0 0 10px; }

.mini-rows { background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
.mini-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #f5f5f5; }
.mini-row:last-child { border-bottom: none; }
.mr-type { font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; }
.mr-title { flex: 1; text-decoration: none; color: var(--text); font-size: 13px; }
.mr-title:hover { color: var(--primary); }
.mr-view { font-size: 12px; color: var(--text-lighter); }
.mr-time { font-size: 12px; color: var(--text-lighter); }

@media (max-width: 600px) { .stat-cards { flex-wrap: wrap; } .sc { min-width: calc(50% - 6px); } }
@media (max-width: 400px) { .sc { min-width: 100%; } }
</style>
