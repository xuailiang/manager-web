<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>风险命中查询工单池</span>
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
            <div style="font-weight: 500;">{{ record.id }}</div>
            <div class="is-muted" style="margin-top: 4px; font-size: 13px;">{{ record.detectedAt }}</div>
          </template>

          <template v-else-if="column.key === 'source'">
            <div style="display: flex; align-items: center; gap: 8px;">
              <a-tag v-if="record.sourceType === 'merchant'" color="cyan">商户账号</a-tag>
              <a-tag v-else-if="record.sourceType === 'product'" color="blue">商品外壳</a-tag>
              <a-tag v-else color="purple">涉案订单</a-tag>
              <span>{{ record.sourceId }}</span>
            </div>
          </template>

          <template v-else-if="column.key === 'riskLevel'">
            <a-badge v-if="record.riskLevel === 'high'" status="error" text="极高危风险" />
            <a-badge v-else-if="record.riskLevel === 'medium'" status="warning" text="中等嫌疑" />
            <a-badge v-else status="default" text="低位观察" />
          </template>

          <template v-else-if="column.key === 'rules'">
            <a-space wrap>
              <a-tag v-for="rule in record.hitRules" :key="rule" color="default">{{ rule }}</a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag v-if="record.status === 'pending'" color="processing">等待复核</a-tag>
            <a-tag v-else-if="record.status === 'punished'" color="error">已定性处罚</a-tag>
            <a-tag v-else color="success">已剔除误报</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space v-if="record.status === 'pending'">
              <a-button type="primary" size="small" danger @click="openPenaltyModal(record)">定案与开具罚单</a-button>
              <a-popconfirm title="确认该风控单为误报并清除？" @confirm="handleIgnore(record)">
                <a-button type="link" size="small">作为误报消除</a-button>
              </a-popconfirm>
            </a-space>
            <span v-else class="is-muted">已关单</span>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-modal
      v-model:open="modalVisible"
      title="人工复核定性与开立罚单"
      ok-text="确认下发处罚"
      cancel-text="取消"
      @ok="handleExecutePenalty"
    >
      <div v-if="activeRecord" style="margin-top: 16px;">
        <p><strong>涉案对象：</strong> {{ activeRecord.sourceId }}</p>
        <p><strong>命中类型：</strong> {{ activeRecord.hitRules.join(', ') }}</p>
        <a-form layout="vertical" style="margin-top: 24px;">
          <a-form-item label="处罚处置项 (可多选)" required>
            <a-checkbox-group v-model:value="selectedActions" style="width: 100%">
              <a-row>
                <a-col :span="12"><a-checkbox value="限制资金提现">限制资金提现</a-checkbox></a-col>
                <a-col :span="12"><a-checkbox value="强制下架涉事商品">强制下架涉事商品</a-checkbox></a-col>
                <a-col :span="12" style="margin-top: 8px"><a-checkbox value="扣除店铺信用分 6分">扣除店铺信用分 6分</a-checkbox></a-col>
                <a-col :span="12" style="margin-top: 8px"><a-checkbox value="封禁账号 7 天">封禁账号 7 天</a-checkbox></a-col>
              </a-row>
            </a-checkbox-group>
          </a-form-item>
        </a-form>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getHitTickets, executeHitPenalty } from '../../mock/risk'
import type { RiskHitTicket } from '../../types/risk'

const list = ref<RiskHitTicket[]>(getHitTickets())

const columns: TableColumnsType<RiskHitTicket> = [
  { title: '工单追溯凭据', key: 'ticket', width: 200 },
  { title: '涉嫌风控黑产节点', key: 'source', width: 320 },
  { title: '预警等级', key: 'riskLevel', width: 140 },
  { title: '引擎规则关联', key: 'rules', width: 280 },
  { title: '业务状态', key: 'status', width: 120 },
  { title: '复核介入', key: 'actions', width: 240 },
]

const modalVisible = ref(false)
const activeRecord = ref<RiskHitTicket | null>(null)
const selectedActions = ref<string[]>([])

const openPenaltyModal = (record: RiskHitTicket) => {
  activeRecord.value = record
  selectedActions.value = []
  modalVisible.value = true
}

const handleIgnore = (record: RiskHitTicket) => {
  record.status = 'ignored' // 简化的内存直接修改，真实需走 API
  message.success('已标记该触发单为误报并清除拦截链路')
}

const handleExecutePenalty = () => {
  if (!selectedActions.value.length) {
    message.error('请至少选择一项最终处置措施。')
    return
  }
  if (!activeRecord.value) return

  try {
    executeHitPenalty(activeRecord.value.id, selectedActions.value)
    message.success(`安全风控中心已下发防线封锁，转入统一处罚中心！惩治对象 [${activeRecord.value.sourceId}]`)
    modalVisible.value = false
    list.value = getHitTickets()
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
