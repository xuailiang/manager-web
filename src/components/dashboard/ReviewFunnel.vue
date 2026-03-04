<template>
  <a-card :bordered="false" class="dashboard-section-card" title="审核问题漏斗">
    <div ref="containerRef" class="chart-box"></div>
  </a-card>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ReviewFunnelNode } from '../../types/dashboard'
import { createReviewFunnelChart } from '../../utils/dashboardCharts'

const props = defineProps<{
  data: ReviewFunnelNode[]
  dark: boolean
}>()

const emit = defineEmits<{
  stageClick: [ReviewFunnelNode]
}>()

const containerRef = ref<HTMLElement | null>(null)
let chartInstance: ReturnType<typeof createReviewFunnelChart> | null = null

const renderChart = async () => {
  await nextTick()
  if (!containerRef.value) return
  chartInstance?.destroy()
  chartInstance = createReviewFunnelChart(containerRef.value, props.data, props.dark)
  chartInstance.plot.on('element:click', (evt: { data?: { data?: Record<string, unknown> } }) => {
    const payload = evt.data?.data
    if (!payload) return
    const stageLabel = String(payload.stage)
    const stageMap: Record<string, ReviewFunnelNode['stage']> = {
      提交: 'submitted',
      审核中: 'in_review',
      '补件/驳回': 'need_fix_rejected',
      重提: 'resubmitted',
      通过: 'approved',
    }
    const stage = stageMap[stageLabel]
    if (!stage) return
    const hit = props.data.find((item) => item.stage === stage)
    if (hit) emit('stageClick', hit)
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

