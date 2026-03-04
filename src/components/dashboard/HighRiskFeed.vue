<template>
  <a-card :bordered="false" class="dashboard-section-card" title="高风险清单">
    <a-list :data-source="items" class="high-risk-list">
      <template #renderItem="{ item }">
        <a-list-item class="high-risk-item" @click="$emit('open', item)">
          <div>
            <div class="todo-title">
              <a-tag :color="item.bizType === 'order' ? 'red' : 'orange'">
                {{ item.bizType === 'order' ? '订单' : '商品' }}
              </a-tag>
              {{ item.title }}
            </div>
            <div class="todo-sub">
              {{ item.merchantName }} · {{ item.slaMinutesLeft < 0 ? `超时${Math.abs(item.slaMinutesLeft)}分钟` : `剩余${item.slaMinutesLeft}分钟` }}
            </div>
            <a-space size="small" wrap>
              <a-tag v-for="risk in item.riskTags" :key="risk" color="orange">{{ risk }}</a-tag>
            </a-space>
          </div>
          <a-button type="link">查看</a-button>
        </a-list-item>
      </template>
    </a-list>
  </a-card>
</template>

<script setup lang="ts">
import type { HighRiskFeedItem } from '../../types/dashboard'

defineProps<{
  items: HighRiskFeedItem[]
}>()

defineEmits<{
  open: [HighRiskFeedItem]
}>()
</script>

