<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="售后仲裁工作台">
      <a-alert type="warning" show-icon message="当前 7 单高风险退款申请待平台判责，请优先处理证据完整单。" />
      <a-table class="mt16" :columns="columns" :data-source="rows" row-key="id" :pagination="{ pageSize: 8 }" :scroll="{ x: 980 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'amount'">
            <span style="color: #dc2626; font-weight: 600">¥{{ record.amount }}</span>
          </template>
          <template v-if="column.key === 'actions'">
            <div class="action-cell">
              <a-button type="link" size="small">查看证据</a-button>
              <a-button type="link" size="small">判责</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '售后单号', dataIndex: 'id', width: 180 },
  { title: '订单号', dataIndex: 'orderId', width: 180 },
  { title: '商户', dataIndex: 'merchant', width: 220 },
  { title: '售后类型', dataIndex: 'type', width: 140 },
  { title: '金额', key: 'amount', width: 120 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '操作', key: 'actions', width: 160, fixed: 'right' },
]

const rows = [
  { id: 'TK20260301011', orderId: 'DD202603011001', merchant: '拼京宝旗舰店', type: '退款退货', amount: '238.00', status: '待判责' },
  { id: 'TK20260301014', orderId: 'DD202603011102', merchant: '智选数码店', type: '仅退款', amount: '1229.00', status: '补件中' },
]
</script>
