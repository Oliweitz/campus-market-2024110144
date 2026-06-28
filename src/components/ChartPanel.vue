<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as echarts from 'echarts'

const props = defineProps<{ option: any; height?: string }>()
const container = ref<HTMLDivElement>()
let chart: echarts.ECharts | null = null

function init() {
  if (!container.value) return
  chart = echarts.init(container.value)
  chart.setOption(props.option)
}

onMounted(() => init())
onUnmounted(() => chart?.dispose())
watch(() => props.option, (o) => chart?.setOption(o, true), { deep: true })
</script>

<template>
  <div ref="container" :style="{ width: '100%', height: height || '280px' }"></div>
</template>
