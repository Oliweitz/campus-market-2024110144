<script setup lang="ts">
import { computed } from 'vue'
import { useListingsStore } from '@/stores/listings'
import { TYPE_LABELS, CAMPUS_LIST, type ListingType } from '@/data/listings'

const listStore = useListingsStore()
const total = computed(() => listStore.items.length)
const active = computed(() => listStore.items.filter(l => l.status === 'active').length)
const done = computed(() => listStore.items.filter(l => l.status === 'completed').length)

const typeStats = computed(() => {
  const types: ListingType[] = ['trade', 'lost', 'pintuan', 'paotui']
  return types.map(t => ({ label: TYPE_LABELS[t], count: listStore.items.filter(l => l.type === t).length }))
})
const campusStats = computed(() =>
  CAMPUS_LIST.map(c => ({ label: c, count: listStore.items.filter(l => l.campus === c).length })).filter(s => s.count > 0),
)
const maxT = computed(() => Math.max(...typeStats.value.map(t => t.count), 1))
const maxC = computed(() => Math.max(...campusStats.value.map(c => c.count), 1))
</script>

<template>
  <section class="dash">
    <h2 class="page-title">趋势看板</h2>

    <div class="stat-cards">
      <div class="sc"><strong>{{ total }}</strong><span>信息总数</span></div>
      <div class="sc"><strong>{{ active }}</strong><span>进行中</span></div>
      <div class="sc"><strong>{{ done }}</strong><span>已完成</span></div>
      <div class="sc"><strong>{{ CAMPUS_LIST.length }}</strong><span>覆盖校区</span></div>
    </div>

    <div class="charts-row">
      <div class="chart-block">
        <h3>类型占比</h3>
        <div class="bars">
          <div v-for="t in typeStats" :key="t.label" class="bar-row">
            <span class="bar-label">{{ t.label }}</span>
            <div class="bar-track"><div class="bar-fill" :style="{ width: (t.count / maxT * 100) + '%' }"></div></div>
            <span class="bar-val">{{ t.count }}</span>
          </div>
        </div>
      </div>

      <div class="chart-block">
        <h3>校区分布</h3>
        <div class="bars">
          <div v-for="c in campusStats" :key="c.label" class="bar-row">
            <span class="bar-label">{{ c.label }}</span>
            <div class="bar-track"><div class="bar-fill bar-green" :style="{ width: (c.count / maxC * 100) + '%' }"></div></div>
            <span class="bar-val">{{ c.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-block">
      <h3>最近发布</h3>
      <div class="mini-rows">
        <div v-for="l in listStore.items.slice(0, 6)" :key="l.id" class="mini-row">
          <span class="mr-type">{{ TYPE_LABELS[l.type] }}</span>
          <router-link :to="'/detail/' + l.id" class="mr-title">{{ l.title }}</router-link>
          <span class="mr-time">{{ l.publishTime.slice(0, 10) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.dash { }
.page-title { font-size: 18px; font-weight: 600; margin: 0 0 18px; color: var(--text); }

.stat-cards { display: flex; gap: 10px; margin-bottom: 22px; }
.sc {
  flex: 1; min-width: 80px; background: var(--card-bg); border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm); padding: 18px 12px; text-align: center;
}
.sc strong { display: block; font-size: 22px; font-weight: 700; color: var(--primary); }
.sc span { font-size: 12px; color: var(--text-light); margin-top: 4px; display: block; }

.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.chart-block { margin-bottom: 22px; }
@media (max-width: 700px) { .charts-row { grid-template-columns: 1fr; } }
.chart-block h3 { font-size: 14px; font-weight: 600; margin: 0 0 10px; }

.bars { display: flex; flex-direction: column; gap: 8px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { width: 72px; font-size: 13px; color: var(--text); flex-shrink: 0; }
.bar-track { flex: 1; height: 20px; background: var(--bg); border-radius: 10px; overflow: hidden; }
.bar-fill { height: 100%; background: var(--primary-grad); border-radius: 10px; transition: width 0.6s ease; min-width: 4px; }
.bar-green { background: linear-gradient(135deg, var(--success), #8ddb98); }
.bar-val { width: 24px; text-align: right; font-size: 13px; font-weight: 600; color: var(--text-light); }

.mini-rows { background: var(--card-bg); border-radius: var(--radius-md); box-shadow: var(--shadow-sm); overflow: hidden; }
.mini-row { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid #f5f5f5; }
.mini-row:last-child { border-bottom: none; }
.mr-type { font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 6px; border-radius: 4px; }
.mr-title { flex: 1; text-decoration: none; color: var(--text); font-size: 13px; }
.mr-title:hover { color: var(--primary); }
.mr-time { font-size: 12px; color: var(--text-lighter); }

@media (max-width: 600px) {
  .stat-cards { flex-wrap: wrap; }
  .sc { min-width: calc(50% - 6px); }
}
@media (max-width: 400px) {
  .sc { min-width: 100%; }
}
</style>
