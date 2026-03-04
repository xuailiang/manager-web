<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="结算单">
      <a-table :columns="columns" :data-source="rows" row-key="id" :pagination="{ pageSize: 8 }" :scroll="{ x: 980 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <span style="font-weight: 600">¥{{ record.payable }}</span>
          </template>
          <template v-if="column.key === 'actions'">
            <div class="action-cell">
              <a-button type="link" size="small">查看明细</a-button>
              <a-button type="link" size="small">导出</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '结算单号', dataIndex: 'id', width: 180 },
  { title: '商户', dataIndex: 'merchant', width: 220 },
  { title: '结算周期', dataIndex: 'period', width: 240 },
  { title: '应付金额', key: 'amount', width: 140 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '操作', key: 'actions', width: 160, fixed: 'right' },
]

const rows = [
  { id: 'ST202603-001', merchant: '拼京宝旗舰店', period: '2026-02-24 ~ 2026-03-01', payable: '82,109.10', status: '待确认' },
  { id: 'ST202603-002', merchant: '萌宠之家', period: '2026-02-24 ~ 2026-03-01', payable: '13,902.28', status: '已确认' },
]
</script>
