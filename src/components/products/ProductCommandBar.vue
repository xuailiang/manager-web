<template>
  <div class="pg-command-grid">
    <button
      v-for="card in cards"
      :key="card.key"
      type="button"
      class="pg-command-card"
      :class="`level-${card.level}`"
      @click="emit('select', card.key)"
    >
      <div class="pg-command-label">{{ card.label }}</div>
      <div class="pg-command-value">{{ card.value }}</div>
      <div class="pg-command-hint">{{ card.hint }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
export type CommandCard = {
  key: string
  label: string
  value: string
  hint: string
  level: 'low' | 'medium' | 'high'
}

defineProps<{
  cards: CommandCard[]
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
</script>
