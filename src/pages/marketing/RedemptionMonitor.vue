<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>异常核销与风控监控</span>
        </div>
      </template>

      <a-table
        :columns="columns"
        :data-source="list"
        row-key="id"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'ticket'">
            <div class="ticket-cell">
              <strong>{{ record.id }}</strong>
              <div class="is-muted" style="margin-top: 4px; font-size: 13px;">关联订单: {{ record.orderNo }}</div>
            </div>
          </template>

          <template v-else-if="column.key === 'riskScore'">
            <a-progress type="circle" :percent="record.riskScore" :width="45" :stroke-color="record.riskScore > 90 ? 'red' : 'orange'" />
          </template>

          <template v-else-if="column.key === 'anomalyTags'">
            <a-space wrap>
              <a-tag v-for="tag in record.anomalyTags" :key="tag" color="error">{{ tag }}</a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag v-if="record.status === 'pending'" color="warning">待人工研判</a-tag>
            <a-tag v-else-if="record.status === 'intercepted'" color="error">已确认拦截</a-tag>
            <a-tag v-else color="success">已豁免放行</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space v-if="record.status === 'pending'">
              <a-popconfirm title="确认这是恶意刷单客，并拦截该笔核销及关联发货吗？" @confirm="handleDecision(record, 'intercept')">
                <a-button type="primary" danger size="small">拦截并封禁</a-button>
              </a-popconfirm>
              <a-popconfirm title="确认为正常用户行为，豁免风控？" @confirm="handleDecision(record, 'release')">
                <a-button size="small">豁免放行</a-button>
              </a-popconfirm>
            </a-space>
            <span v-else class="is-muted">无需操作</span>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getRedemptionAnomalies, resolveAnomaly } from '../../mock/marketing'
import type { RedemptionAnomalyTicket } from '../../types/marketing'

const list = ref<RedemptionAnomalyTicket[]>(getRedemptionAnomalies())

const columns: TableColumnsType<RedemptionAnomalyTicket> = [
  { title: '风控工单', key: 'ticket', width: 220 },
  { title: '嫌疑度', key: 'riskScore', width: 100, align: 'center' },
  { title: '命中规则', key: 'anomalyTags', width: 240 },
  { title: '用户身份', dataIndex: 'userId', width: 150 },
  { title: '受害防线', dataIndex: 'merchantName', width: 200 },
  { title: '识别时间', dataIndex: 'detectedAt', width: 180 },
  { title: '研判状态', key: 'status', width: 120 },
  { title: '干预操作', key: 'actions', width: 220 },
]

const handleDecision = (record: RedemptionAnomalyTicket, action: 'intercept' | 'release') => {
  try {
    resolveAnomaly(record.id, action)
    if (action === 'intercept') {
      message.error(`拦截生效：已冻结 [${record.userId}] 在商家 [${record.merchantName}] 的核销行为`)
    } else {
      message.success(`放行生效：风控工单 [${record.id}] 已解卡`)
    }
    list.value = getRedemptionAnomalies()
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
