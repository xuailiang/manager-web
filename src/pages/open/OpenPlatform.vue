<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="Webhook 管理">
      <a-alert type="info" show-icon message="用于与 ERP/WMS/消息系统联动，支持重试和签名校验。" />
      <a-table class="mt16" :columns="columns" :data-source="rows" row-key="id" :pagination="false" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '回调地址', dataIndex: 'url' },
  { title: '事件', dataIndex: 'events' },
  { title: '状态', dataIndex: 'status' },
  { title: '失败重试', dataIndex: 'retry' },
]

const rows = [
  { id: '1', name: 'ERP-订单同步', url: 'https://erp.example.com/webhook/orders', events: 'order.created, order.updated', status: '启用', retry: '3次' },
  { id: '2', name: 'WMS-发货回传', url: 'https://wms.example.com/callback/shipping', events: 'shipping.updated', status: '启用', retry: '5次' },
]
</script>
