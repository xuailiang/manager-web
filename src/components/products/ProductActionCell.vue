<template>
  <div class="pg-action-cell">
    <a-button
      v-for="action in primaryActions"
      :key="action.key"
      size="small"
      :type="action.primary ? 'primary' : 'default'"
      :danger="Boolean(action.danger)"
      class="pg-action-btn"
      @click="emit('action', action.key)"
    >
      {{ action.label }}
    </a-button>
    <a-dropdown v-if="secondaryActions.length" :menu="menuConfig" trigger="click">
      <a-button size="small" class="pg-action-btn pg-action-more">更多</a-button>
    </a-dropdown>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ActionDef } from '../../utils/statusConfig'

const props = defineProps<{
  actions: ActionDef[]
}>()

const emit = defineEmits<{
  action: [key: string]
}>()

const primaryActions = computed(() => props.actions.slice(0, 2))
const secondaryActions = computed(() => props.actions.slice(2))

const menuConfig = computed(() => ({
  items: secondaryActions.value.map((item) => ({
    key: item.key,
    label: item.label,
    danger: Boolean(item.danger),
  })),
  onClick: (info: { key: string }) => emit('action', info.key),
}))
</script>
