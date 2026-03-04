<template>
  <div class="page-wrap">
    <a-card :bordered="false" class="toolbar-card">
      <a-form layout="inline" class="toolbar-form">
        <a-form-item label="任务类型">
          <a-select v-model:value="bizType" style="width: 140px" :options="bizTypeOptions" />
        </a-form-item>
        <a-form-item label="任务状态">
          <a-select v-model:value="taskStatus" style="width: 140px" :options="statusOptions" />
        </a-form-item>
        <a-form-item label="商户">
          <a-input v-model:value="merchantKeyword" placeholder="商户/店铺/任务号" allow-clear style="width: 220px" />
        </a-form-item>
        <a-form-item>
          <a-button @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" title="商户协同任务">
      <a-table :columns="columns" :data-source="filteredRows" row-key="id" :pagination="{ pageSize: 10 }" :scroll="{ x: 1560 }">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'bizType'">
            <a-tag :color="record.bizType === 'product' ? 'blue' : 'purple'">
              {{ record.bizType === 'product' ? '商品整改' : '订单举证' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record)">{{ getStatusLabel(record) }}</a-tag>
          </template>
          <template v-else-if="column.key === 'trace'">
            <div class="cell-title">{{ record.traceId }}</div>
            <div class="cell-sub">{{ record.sourceSystem }} · {{ record.sourceBizId }}</div>
          </template>
          <template v-else-if="column.key === 'actions'">
            <div class="action-cell">
              <a-button type="link" size="small" @click="openTask(record.id)">查看回传</a-button>
              <a-button type="link" size="small" @click="urge(record.id)">催办</a-button>
              <a-button type="link" size="small" @click="closeTask(record.id)">关闭任务</a-button>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:open="drawerOpen" title="协同任务详情" width="560">
      <template v-if="currentTask">
        <div class="metric-rows">
          <div class="metric"><span>任务号</span><strong>{{ currentTask.rectifyTaskId }}</strong></div>
          <div class="metric"><span>业务单号</span><strong>{{ currentTask.bizId }}</strong></div>
          <div class="metric"><span>商户</span><strong>{{ currentTask.merchantName }}</strong></div>
          <div class="metric"><span>店铺</span><strong>{{ currentTask.shopName }}</strong></div>
          <div class="metric"><span>截止时间</span><strong>{{ currentTask.deadline }}</strong></div>
          <div class="metric"><span>状态</span><strong>{{ getStatusLabel(currentTask) }}</strong></div>
        </div>
        <a-divider />
        <div class="cell-title">整改要求</div>
        <ul>
          <li v-for="row in currentTask.requiredFixes" :key="row" class="cell-sub">{{ row }}</li>
        </ul>
        <div class="cell-title">证据要求</div>
        <ul>
          <li v-for="row in currentTask.evidenceRequirements" :key="row" class="cell-sub">{{ row }}</li>
        </ul>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getMerchantCollabTasks } from '../../mock/governance'
import type { MerchantRectifyTask } from '../../types/governance'

const rows = ref<MerchantRectifyTask[]>(getMerchantCollabTasks())

const bizType = ref<'all' | MerchantRectifyTask['bizType']>('all')
const taskStatus = ref<'all' | MerchantRectifyTask['status']>('all')
const merchantKeyword = ref('')
const drawerOpen = ref(false)
const currentTaskId = ref('')

const bizTypeOptions = [
  { label: '全部', value: 'all' },
  { label: '商品整改', value: 'product' },
  { label: '订单举证', value: 'order' },
]

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '处理中', value: 'processing' },
  { label: '已提交', value: 'submitted' },
  { label: '逾期', value: 'overdue' },
  { label: '已关闭', value: 'closed' },
]

const statusColorMap: Record<MerchantRectifyTask['status'], string> = {
  pending: 'blue',
  processing: 'orange',
  submitted: 'green',
  overdue: 'red',
  closed: 'default',
}

const statusLabelMap: Record<MerchantRectifyTask['status'], string> = {
  pending: '待处理',
  processing: '处理中',
  submitted: '已提交',
  overdue: '逾期',
  closed: '已关闭',
}

const filteredRows = computed(() =>
  rows.value.filter((item) => {
    const hitType = bizType.value === 'all' || item.bizType === bizType.value
    const hitStatus = taskStatus.value === 'all' || item.status === taskStatus.value
    const hitKeyword =
      !merchantKeyword.value ||
      item.merchantName.includes(merchantKeyword.value) ||
      item.shopName.includes(merchantKeyword.value) ||
      item.rectifyTaskId.includes(merchantKeyword.value)
    return hitType && hitStatus && hitKeyword
  }),
)

const getStatusColor = (record: MerchantRectifyTask) => statusColorMap[record.status]
const getStatusLabel = (record: MerchantRectifyTask) => statusLabelMap[record.status]

const currentTask = computed(() => rows.value.find((item) => item.id === currentTaskId.value) ?? null)

const columns: TableColumnsType<MerchantRectifyTask> = [
  { title: '任务号', dataIndex: 'rectifyTaskId', key: 'rectifyTaskId', width: 190 },
  { title: '任务类型', key: 'bizType', width: 120 },
  { title: '关联单据', dataIndex: 'bizId', key: 'bizId', width: 170 },
  { title: '商户/店铺', key: 'merchant', width: 220, customRender: ({ record }) => `${record.merchantName} / ${record.shopName}` },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline', width: 180 },
  { title: '状态', key: 'status', width: 120 },
  { title: '追踪链路', key: 'trace', width: 260 },
  { title: '操作', key: 'actions', width: 220, fixed: 'right' },
]

const resetFilters = () => {
  bizType.value = 'all'
  taskStatus.value = 'all'
  merchantKeyword.value = ''
}

const openTask = (id: string) => {
  currentTaskId.value = id
  drawerOpen.value = true
}

const urge = (id: string) => {
  message.success(`已发送催办消息（任务 ${id}），商户端任务中心将收到提醒`)
}

const closeTask = (id: string) => {
  const task = rows.value.find((item) => item.id === id)
  if (!task) return
  task.status = 'closed'
  message.success('协同任务已关闭，并写入审计日志')
}
</script>
