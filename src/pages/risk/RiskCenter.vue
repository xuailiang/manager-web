<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="风险规则中心">
      <a-row :gutter="16" class="mb12">
        <a-col :span="6"><a-statistic title="生效规则" value="48" /></a-col>
        <a-col :span="6"><a-statistic title="今日命中" value="126" /></a-col>
        <a-col :span="6"><a-statistic title="高危命中" value="19" /></a-col>
        <a-col :span="6"><a-statistic title="误判率" value="1.8" suffix="%" /></a-col>
      </a-row>
      <a-table :columns="columns" :data-source="rows" row-key="id" :pagination="{ pageSize: 8 }" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '规则名', dataIndex: 'name' },
  { title: '对象', dataIndex: 'scope' },
  { title: '阈值', dataIndex: 'threshold' },
  { title: '今日命中', dataIndex: 'hits' },
  { title: '等级', dataIndex: 'level' },
  { title: '状态', dataIndex: 'status' },
]

const rows = [
  { id: 'R01', name: '超时未发货', scope: '订单', threshold: '48h', hits: 63, level: '高', status: '启用' },
  { id: 'R02', name: '高投诉商户预警', scope: '商户', threshold: '7天>15单', hits: 8, level: '中', status: '启用' },
]
</script>
