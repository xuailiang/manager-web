<template>
  <div class="signal-grid">
    <div v-for="card in cards" :key="card.key" class="signal-card" :class="card.level" @click="$emit('select', card)">
      <div class="signal-label">{{ card.label }}</div>
      <div class="signal-value">{{ card.value }}</div>
      <div class="signal-trend">{{ card.trend || '较昨日平稳' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { SignalCard } from '../types/common'

defineProps<{ cards: SignalCard[] }>()
defineEmits<{ select: [SignalCard] }>()
</script>
