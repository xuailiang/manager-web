<template>
  <a-card :bordered="false" class="dashboard-section-card" title="SLA 风险趋势（风险单量 vs 超时率）">
    <div ref="containerRef" class="chart-box"></div>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { SlaTrendPoint } from '../../types/dashboard'
import { createSlaDualAxesChart } from '../../utils/dashboardCharts'

const props = defineProps<{
  data: SlaTrendPoint[]
  dark: boolean
}>()

const emit = defineEmits<{
  pointClick: [SlaTrendPoint]
}>()

const containerRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof createSlaDualAxesChart> | null = null

const renderChart = async () => {
  await nextTick()
  if (!containerRef.value) return
  chartInstance?.destroy()
  chartInstance = createSlaDualAxesChart(containerRef.value, props.data, props.dark)
  chartInstance.plot.on('element:click', (evt: { data?: { data?: Record<string, unknown> } }) => {
    const payload = evt.data?.data
    if (!payload) return
    const hit = props.data.find((item) => item.date === String(payload.date))
    if (hit) emit('pointClick', hit)
  })
}

onMounted(renderChart)

watch(
  () => [props.data, props.dark] as const,
  () => {
    void renderChart()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

