<template>
  <div class="governance-kpi-grid">
    <button
      v-for="card in cards"
      :key="card.key"
      class="governance-kpi-card"
      :class="[card.level, { active: activeKey === card.key }]"
      type="button"
      @click="$emit('select', card.key)"
    >
      <div class="kpi-label">{{ card.label }}</div>
      <div class="kpi-value">
        <span>{{ card.value }}</span>
        <small v-if="card.key === 'all'">%</small>
      </div>
      <div class="kpi-trend">{{ card.trend }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { GovernanceKpiCard } from '../../types/dashboard'

defineProps<{
  cards: GovernanceKpiCard[]
  activeKey: GovernanceKpiCard['key']
}>()

defineEmits<{
  select: [GovernanceKpiCard['key']]
}>()
</script>

