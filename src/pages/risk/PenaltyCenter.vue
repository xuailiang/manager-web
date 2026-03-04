<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>统一处罚执行中心</span>
        </div>
      </template>

      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="merchant" tab="商户/主体级处罚"></a-tab-pane>
        <a-tab-pane key="product" tab="商品级管控"></a-tab-pane>
      </a-tabs>

      <a-table
        :columns="columns"
        :data-source="filteredList"
        row-key="id"
        :pagination="{ pageSize: 15 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'penaltyInfo'">
            <div style="font-weight: 500;">{{ record.id }}</div>
            <div class="is-muted" style="margin-top: 4px; font-size: 13px;">下发: {{ record.issuedAt }}</div>
          </template>

          <template v-else-if="column.key === 'target'">
            <a-tag v-if="record.targetType === 'merchant'" color="cyan">商户体</a-tag>
            <a-tag v-else color="blue">商品外壳</a-tag>
            <span>{{ record.targetName }}</span>
          </template>

          <template v-else-if="column.key === 'reason'">
            <div style="max-width: 250px;">{{ record.reason }}</div>
          </template>

          <template v-else-if="column.key === 'actionsInfo'">
            <ul style="padding-left: 16px; margin-bottom: 0;">
              <li v-for="act in record.actions" :key="act" style="color: #cf1322">{{ act }}</li>
            </ul>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-badge v-if="record.status === 'executing'" status="processing" text="执行中" />
            <a-badge v-else-if="record.status === 'revoked'" status="default" text="已手动解禁" />
            <a-badge v-else-if="record.status === 'appealed_revoked'" status="success" text="因申诉撤销" />
            <a-badge v-else status="default" text="到期失效" />
          </template>

          <template v-else-if="column.key === 'actionCol'">
            <a-space>
              <a-popconfirm
                v-if="record.status === 'executing'"
                title="撤销该处罚将立即解冻对应限制，确认解禁吗？"
                @confirm="handleRevoke(record)"
              >
                <a-button type="link" size="small">提前解禁撤销</a-button>
              </a-popconfirm>
              <span v-else class="is-muted">无需操作</span>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getPenalties, revokePenalty } from '../../mock/risk'
import type { PenaltyRecord } from '../../types/risk'

const list = ref<PenaltyRecord[]>(getPenalties())
const activeTab = ref<'merchant' | 'product'>('merchant')

const filteredList = computed(() => {
  return list.value.filter(item => item.targetType === activeTab.value)
})

const columns: TableColumnsType<PenaltyRecord> = [
  { title: '风控连带罚单', key: 'penaltyInfo', width: 220 },
  { title: '直接惩治对象', key: 'target', width: 260 },
  { title: '判责原由', key: 'reason', width: 260 },
  { title: '包含触发措施', key: 'actionsInfo', width: 260 },
  { title: '效力态', key: 'status', width: 150 },
  { title: '操作权限', key: 'actionCol', width: 140 },
]

const handleRevoke = (record: PenaltyRecord) => {
  try {
    revokePenalty(record.id, false)
    message.success(`处罚动作已终止释放：${record.targetName}`)
    list.value = getPenalties()
  } catch (err: any) {
    message.error(err.message)
  }
}
</script>

<style scoped>
.is-muted {
  color: var(--text-sub);
}
</style>
