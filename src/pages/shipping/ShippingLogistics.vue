<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="发货与物流监控">
      <a-row :gutter="16" class="mb12">
        <a-col :span="8"><a-statistic title="当日发货及时率" value="94.7" suffix="%" /></a-col>
        <a-col :span="8"><a-statistic title="揽收超时包裹" value="18" /></a-col>
        <a-col :span="8"><a-statistic title="轨迹停滞 > 24h" value="11" /></a-col>
      </a-row>
      <a-table :columns="columns" :data-source="rows" row-key="id" :pagination="{ pageSize: 8 }" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '订单号', dataIndex: 'orderId' },
  { title: '包裹号', dataIndex: 'packageNo' },
  { title: '物流公司', dataIndex: 'carrier' },
  { title: '最新节点', dataIndex: 'latest' },
  { title: '状态', dataIndex: 'status' },
  { title: '商户', dataIndex: 'merchant' },
]

const rows = [
  { id: '1', orderId: 'DD202603011001', packageNo: 'YT2026030112', carrier: '圆通', latest: '济南转运中心', status: '轨迹停滞', merchant: '拼京宝旗舰店' },
  { id: '2', orderId: 'DD202603011052', packageNo: 'SF2026030118', carrier: '顺丰', latest: '已揽收', status: '正常', merchant: '萌宠之家' },
]
</script>
