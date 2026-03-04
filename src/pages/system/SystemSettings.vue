<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="角色权限矩阵">
      <a-table :columns="columns" :data-source="rows" row-key="id" :pagination="false" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
const columns = [
  { title: '角色', dataIndex: 'role' },
  { title: '菜单权限', dataIndex: 'menus' },
  { title: '按钮权限', dataIndex: 'actions' },
  { title: '数据范围', dataIndex: 'scope' },
]

const rows = [
  { id: '1', role: '超级管理员', menus: '全部', actions: '全部', scope: '全平台' },
  { id: '2', role: '审核员', menus: '商品治理/售后仲裁/消息中心', actions: '审核、驳回、补件', scope: '按类目' },
  { id: '3', role: '财务管理员', menus: '财务结算/下载中心', actions: '结算、导出', scope: '财务域' },
]
</script>
