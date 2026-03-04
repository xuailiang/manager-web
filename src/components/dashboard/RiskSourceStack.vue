<template>
  <a-card :bordered="false" class="dashboard-section-card" title="异常来源分布">
    <div ref="containerRef" class="chart-box"></div>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { RiskSourceStackPoint } from '../../types/dashboard'
import { createRiskSourceStackChart } from '../../utils/dashboardCharts'

const props = defineProps<{
  data: RiskSourceStackPoint[]
  dark: boolean
}>()

const emit = defineEmits<{
  sourceClick: [RiskSourceStackPoint]
}>()

const containerRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof createRiskSourceStackChart> | null = null

const renderChart = async () => {
  await nextTick()
  if (!containerRef.value) return
  chartInstance?.destroy()
  chartInstance = createRiskSourceStackChart(containerRef.value, props.data, props.dark)
  chartInstance.plot.on('element:click', (evt: { data?: { data?: Record<string, unknown> } }) => {
    const payload = evt.data?.data
    if (!payload) return
    const hit = props.data.find((item) => item.date === String(payload.date) && item.source === String(payload.source))
    if (hit) emit('sourceClick', hit)
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

