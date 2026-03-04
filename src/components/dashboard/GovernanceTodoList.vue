<template>
  <a-card title="今日待办队列" :bordered="false" class="dashboard-section-card">
    <a-list :data-source="todos" size="small">
      <template #renderItem="{ item }">
        <a-list-item>
          <div class="todo-row dashboard-todo-row">
            <div>
              <div class="todo-title">{{ item.title }}</div>
              <div class="todo-sub">
                业务号 {{ item.bizId }} ·
                <a-tag :color="getPriorityTagColor(item.priority)">{{ item.priority }}</a-tag>
                {{ getSlaLabel(item.slaMinutesLeft) }}
              </div>
              <a-space size="small" wrap>
                <a-tag v-for="risk in item.riskTags" :key="risk" color="orange">{{ risk }}</a-tag>
              </a-space>
            </div>
            <a-button type="link" @click="$emit('go', item)">去处理</a-button>
          </div>
        </a-list-item>
      </template>
    </a-list>
  </a-card>
</template>

<script setup lang="ts">
import type { GovernanceTodo } from '../../types/dashboard'
import { getPriorityTagColor, getSlaLabel } from '../../utils/dashboardConfig'

defineProps<{
  todos: GovernanceTodo[]
}>()

defineEmits<{
  go: [GovernanceTodo]
}>()
</script>
