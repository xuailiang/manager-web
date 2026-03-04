<template>
  <a-card :bordered="false" class="dashboard-section-card" title="治理健康环">
    <div ref="containerRef" class="chart-box chart-gauge"></div>
    <div class="health-sub-metrics">
      <div class="metric">
        <span>审核时效</span>
        <strong>{{ health.reviewEfficiency }}%</strong>
      </div>
      <div class="metric">
        <span>履约准时</span>
        <strong>{{ health.fulfillmentOnTime }}%</strong>
      </div>
      <div class="metric">
        <span>仲裁积压</span>
        <strong>{{ health.arbitrationBacklog }}%</strong>
      </div>
      <div class="metric">
        <span>协同逾期控制</span>
        <strong>{{ health.collabOverdueRate }}%</strong>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { GovernanceHealthScore } from '../../types/dashboard'
import { createGaugeChart } from '../../utils/dashboardCharts'

const props = defineProps<{
  health: GovernanceHealthScore
  dark: boolean
}>()

const containerRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof createGaugeChart> | null = null

const renderChart = async () => {
  await nextTick()
  if (!containerRef.value) return
  chartInstance?.destroy()
  chartInstance = createGaugeChart(containerRef.value, props.health.score, props.dark)
}

onMounted(renderChart)

watch(
  () => [props.health.score, props.dark] as const,
  () => {
    void renderChart()
  },
)

onBeforeUnmount(() => {
  chartInstance?.destroy()
  chartInstance = null
})
</script>

