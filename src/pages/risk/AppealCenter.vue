<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>商户申诉听证流转中心</span>
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
            <div class="is-muted" style="margin-top: 4px; font-size: 13px;">关联罚单: {{ record.penaltyId }}</div>
          </template>

          <template v-else-if="column.key === 'merchant'">
            <div style="font-weight: 500;">{{ record.merchantName }}</div>
            <div class="is-muted" style="margin-top: 4px; font-size: 13px;">{{ record.merchantId }}</div>
          </template>

          <template v-else-if="column.key === 'appealData'">
            <div style="max-width: 300px; margin-bottom: 8px;">{{ record.appealReason }}</div>
            <a-space wrap>
              <!-- 模拟凭证图片 -->
              <a-image
                v-for="(_, i) in record.proofLinks"
                :key="i"
                :width="40"
                :height="40"
                :src="'https://th.bing.com/th/id/OIG1.l2K1_G6wWp_.X22A0H2s?pid=ImgGn'"
                fallback="https://th.bing.com/th/id/OIG1.l2K1_G6wWp_.X22A0H2s?pid=ImgGn"
              />
            </a-space>
          </template>

          <template v-else-if="column.key === 'timing'">
            <div>提交: {{ record.submittedAt }}</div>
            <div style="margin-top: 4px; color: #faad14">大限: {{ record.deadline }}</div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-badge v-if="record.status === 'pending'" status="processing" text="待二审" />
            <a-badge v-else-if="record.status === 'need_more_info'" status="warning" text="已要求补件" />
            <a-badge v-else-if="record.status === 'approved'" status="success" text="仲裁通过 (解禁)" />
            <a-badge v-else status="error" text="驳回维持原判" />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space v-if="record.status === 'pending' || record.status === 'need_more_info'">
              <a-popconfirm title="确认撤销对应罚单及其衍生的所有平台限制措施吗？" @confirm="handleDecision(record, 'approve')">
                <a-button type="primary" size="small" style="background-color: #52c41a;">通过并解绑罚单</a-button>
              </a-popconfirm>
              <a-button size="small" @click="handleDecision(record, 'need_info')">打回补件</a-button>
              <a-popconfirm title="确认仲裁证据不足驳回吗？一旦操作此工单将完结。" @confirm="handleDecision(record, 'reject')">
                <a-button type="primary" danger size="small">驳回申请</a-button>
              </a-popconfirm>
            </a-space>
            <span v-else class="is-muted">本工单已完结</span>
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
import { getAppeals, resolveAppeal } from '../../mock/risk'
import type { ReviewAppealTicket } from '../../types/risk'

const list = ref<ReviewAppealTicket[]>(getAppeals())

const columns: TableColumnsType<ReviewAppealTicket> = [
  { title: '申诉流水凭证', key: 'ticket', width: 200 },
  { title: '被诉主体', key: 'merchant', width: 220 },
  { title: '申诉详情与凭据矩阵', key: 'appealData', width: 340 },
  { title: '时效管控', key: 'timing', width: 220 },
  { title: '所处环节', key: 'status', width: 140 },
  { title: '仲裁介入决策区', key: 'actions', width: 340 },
]

const handleDecision = (record: ReviewAppealTicket, dec: 'approve' | 'reject' | 'need_info') => {
  try {
    resolveAppeal(record.id, dec)
    if (dec === 'approve') {
      message.success(`工单裁定成功！已自动抹除关联罚单 [${record.penaltyId}]`)
    } else if (dec === 'reject') {
      message.warning('申诉被判定不成立，维持原判。')
    } else {
      message.info('下发补充凭证函成功，等待商户二次提交。')
    }
    list.value = getAppeals()
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
