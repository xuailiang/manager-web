<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="下载中心 / 导出记录">
      <a-table :columns="columns" :data-source="rows" row-key="id" :pagination="{ pageSize: 8 }" :scroll="{ x: 1200 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'id'">
            <a-typography-text :mark="highlightTaskId === record.id">{{ record.id }}</a-typography-text>
          </template>
          <template v-if="column.key === 'status'">
            <a-tag :color="statusColor(record.status)">{{ record.status }}</a-tag>
          </template>
          <template v-if="column.key === 'actions'">
            <div class="action-cell">
              <a-button type="link" size="small" :disabled="record.status !== '已完成'" @click="download(record.id)">下载</a-button>
              <a-button type="link" size="small" :disabled="record.status === '生成中'" @click="regenerate(record.id)">重新生成</a-button>
              <a-button type="link" size="small" danger @click="remove(record.id)">删除</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute } from 'vue-router'
import { getGovernanceExportTasks, updateGovernanceExportTaskStatus } from '../../mock/governance'
import type { GovernanceExportTask } from '../../types/governance'

const route = useRoute()
const rows = ref<GovernanceExportTask[]>([])
const hiddenIds = ref<string[]>([])

const refresh = () => {
  const all = getGovernanceExportTasks()
  rows.value = all.filter((row) => !hiddenIds.value.includes(row.id))
}

refresh()

const highlightTaskId = computed(() => String(route.query.taskId || ''))

watch(
  () => route.query.taskId,
  () => refresh(),
  { immediate: true },
)

const columns = [
  { title: '任务ID', key: 'id', width: 220 },
  { title: '模块', dataIndex: 'module', width: 120 },
  { title: '发起人', dataIndex: 'owner', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', width: 180 },
  { title: '过期时间', dataIndex: 'expireAt', width: 180 },
  { title: '状态', key: 'status', width: 120 },
  { title: '操作', key: 'actions', width: 230, fixed: 'right' },
]

const statusColor = (status: string) => {
  if (status === '已完成') return 'green'
  if (status === '生成中' || status === '排队中') return 'blue'
  if (status === '失败') return 'red'
  if (status === '已过期') return 'default'
  return 'default'
}

const download = (id: string) => {
  message.success(`开始下载导出文件 ${id}`)
}

const regenerate = (id: string) => {
  updateGovernanceExportTaskStatus(id, '生成中')
  message.success(`任务 ${id} 已重新进入生成队列`)
  refresh()
}

const remove = (id: string) => {
  hiddenIds.value = [...hiddenIds.value, id]
  refresh()
}
</script>
