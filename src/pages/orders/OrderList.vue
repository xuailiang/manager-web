<template>
  <div class="page-wrap">
    <SignalCards :cards="signals" @select="quickFilter" />

    <a-card :bordered="false" class="toolbar-card">
      <a-form layout="inline" class="toolbar-form">
        <a-form-item label="订单号">
          <a-input v-model:value="keyword" placeholder="订单号/下单号/收件人" allow-clear style="width: 220px" />
        </a-form-item>
        <a-form-item label="订单状态">
          <a-select v-model:value="status" style="width: 140px" :options="statusOptions" />
        </a-form-item>
        <a-form-item label="介入状态">
          <a-select v-model:value="interventionStatus" style="width: 150px" :options="interventionOptions" />
        </a-form-item>
        <a-form-item label="风险">
          <a-select v-model:value="riskFlag" style="width: 150px" :options="riskOptions" />
        </a-form-item>
        <a-form-item>
          <a-button @click="resetFilters">重置</a-button>
        </a-form-item>
      </a-form>
    </a-card>

    <a-card :bordered="false" title="订单治理列表" class="og-table-card" style="width: 100%; overflow: hidden;">
      <a-table
        :columns="columns"
        :data-source="filteredRows"
        row-key="id"
        :pagination="{ pageSize: 8 }"
        :scroll="{ x: 1800 }"
        :expanded-row-keys="expandedKeys"
        @expand="onExpand"
      >
        <template #expandedRowRender="{ record }">
          <div class="order-expand">
            <div class="order-expand-col">
              <div class="cell-title">商品清单</div>
              <div v-for="item in record.items" :key="item.skuId" class="cell-sub">
                {{ item.name }}（{{ item.spec }}） × {{ item.qty }} · ¥{{ item.price.toFixed(2) }}
              </div>
            </div>
            <div class="order-expand-col">
              <div class="cell-title">包裹与物流</div>
              <div v-for="pkg in record.packages" :key="pkg.packageId" class="cell-sub">
                {{ pkg.company }} {{ pkg.logisticsNo }} · {{ pkg.status }} · {{ pkg.lastNode }}
              </div>
            </div>
            <div class="order-expand-col">
              <div class="cell-title">最近轨迹</div>
              <div v-for="log in record.logs.slice(0, 3)" :key="log.id" class="cell-sub">
                {{ log.operateAt }} · {{ log.action }}
              </div>
            </div>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'order'">
            <div class="cell-title">{{ record.id }}</div>
            <div class="cell-sub">{{ record.orderTime }}</div>
          </template>

          <template v-else-if="column.key === 'merchant'">
            <div class="cell-title">{{ record.merchantName }}</div>
            <div class="cell-sub">{{ record.shopName }}</div>
          </template>

          <template v-else-if="column.key === 'buyer'">
            <div class="cell-title">{{ record.receiver }}</div>
            <div class="cell-sub">{{ record.phone }} · {{ record.region }}</div>
          </template>

          <template v-else-if="column.key === 'amount'">
            <div class="cell-title">¥{{ record.paidAmount.toFixed(2) }}</div>
            <div class="cell-sub">利润 ¥{{ record.estimatedProfit.toFixed(2) }} / {{ record.estimatedMargin.toFixed(1) }}%</div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getOrderMeta(record).color">{{ getOrderMeta(record).label }}</a-tag>
            <div class="cell-sub">结算：{{ record.settlement }}</div>
          </template>

          <template v-else-if="column.key === 'sla'">
            <a-tag :color="record.slaMinutesLeft <= 0 ? 'red' : record.slaMinutesLeft <= 30 ? 'orange' : 'green'">
              {{ formatSla(record.slaMinutesLeft) }}
            </a-tag>
            <div class="cell-sub">截止 {{ record.slaDeadline }}</div>
          </template>

          <template v-else-if="column.key === 'risk'">
            <a-space wrap>
              <a-tag
                v-for="flag in record.riskFlags"
                :key="flag"
                :color="flag.includes('超时') || flag.includes('争议') ? 'red' : 'orange'"
              >
                {{ flag }}
              </a-tag>
            </a-space>
            <div class="cell-sub">投诉 {{ record.complaintCount }} 次 · {{ record.riskSource }}</div>
          </template>

          <template v-else-if="column.key === 'logistics'">
            <div class="cell-title">{{ record.packageCount }} 个包裹</div>
            <div class="cell-sub">最新 {{ record.latestLogisticsAt }}</div>
          </template>

          <template v-else-if="column.key === 'intervention'">
            <a-tag :color="getInterventionMeta(record).color">
              {{ getInterventionMeta(record).label }}
            </a-tag>
            <div class="cell-sub">{{ record.afterSale ? `售后冲突 ¥${record.refundAmount}` : '无售后冲突' }}</div>
          </template>

          <template v-else-if="column.key === 'actions'">
            <div class="action-cell">
              <a-button
                v-for="action in getPrimaryActions(record)"
                :key="action.key"
                type="link"
                size="small"
                @click="handleAction(action.key, record)"
              >
                {{ action.label }}
              </a-button>
              <a-dropdown v-if="getSecondaryActions(record).length" :menu="buildMoreMenu(record)">
                <a-button type="link" size="small">更多</a-button>
              </a-dropdown>
            </div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import SignalCards from '../../components/SignalCards.vue'
import { getMallOrders } from '../../mock/governance'
import type { SignalCard } from '../../types/common'
import type { MallOrderGovernanceItem } from '../../types/governance'
import { interventionStatusConfig, orderActionConfig, orderStatusActions, orderStatusConfig } from '../../utils/statusConfig'

const router = useRouter()
const rows = ref<MallOrderGovernanceItem[]>(getMallOrders())
const expandedKeys = ref<string[]>([])

const keyword = ref('')
const status = ref<'all' | MallOrderGovernanceItem['status']>('all')
const interventionStatus = ref<'all' | MallOrderGovernanceItem['interventionStatus']>('all')
const riskFlag = ref<'all' | string>('all')

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '待支付', value: '待支付' },
  { label: '待发货', value: '待发货' },
  { label: '待收货', value: '待收货' },
  { label: '退款审核中', value: '退款审核中' },
  { label: '交易完成', value: '交易完成' },
]

const interventionOptions = [
  { label: '全部', value: 'all' },
  { label: '风险识别', value: 'risk_detected' },
  { label: '介入中', value: 'intervention_open' },
  { label: '商户处理中', value: 'merchant_processing' },
  { label: '平台裁决中', value: 'platform_decision' },
  { label: '已关闭', value: 'closed' },
  { label: '协同逾期', value: 'overdue' },
]

const riskOptions = [
  { label: '全部', value: 'all' },
  { label: '超时风险', value: '超时风险' },
  { label: '退款审核中', value: '退款审核中' },
  { label: '物流异常', value: '物流异常' },
  { label: '高客单争议', value: '高客单争议' },
]

const filteredRows = computed(() =>
  rows.value.filter((item) => {
    const hitKeyword =
      !keyword.value ||
      item.id.includes(keyword.value) ||
      item.orderCode.includes(keyword.value) ||
      item.receiver.includes(keyword.value)
    const hitStatus = status.value === 'all' || item.status === status.value
    const hitIntervention = interventionStatus.value === 'all' || item.interventionStatus === interventionStatus.value
    const hitRisk = riskFlag.value === 'all' || item.riskFlags.includes(riskFlag.value)
    return hitKeyword && hitStatus && hitIntervention && hitRisk
  }),
)

const signals: SignalCard[] = [
  { key: 'timeout', label: '超时未发货', value: String(rows.value.filter((item) => item.slaMinutesLeft <= 0).length), level: 'high' },
  { key: 'arbitration', label: '退款待裁决', value: String(rows.value.filter((item) => item.status === '退款审核中').length), level: 'medium' },
  { key: 'logistics', label: '物流异常包裹', value: String(rows.value.filter((item) => item.packages.some((pkg) => pkg.abnormal)).length), level: 'high' },
  {
    key: 'highAmount',
    label: '高客单争议',
    value: String(rows.value.filter((item) => item.disputeFlag && item.paidAmount > 500).length),
    level: 'medium',
  },
]

const columns: TableColumnsType<MallOrderGovernanceItem> = [
  { title: '订单号/下单时间', key: 'order', width: 210, fixed: 'left' },
  { title: '商户/店铺', key: 'merchant', width: 180 },
  { title: '买家/收货', key: 'buyer', width: 190 },
  { title: '金额/利润', key: 'amount', width: 190 },
  { title: '履约状态', key: 'status', width: 130 },
  { title: 'SLA', key: 'sla', width: 170 },
  { title: '风险标签', key: 'risk', width: 260 },
  { title: '物流进度', key: 'logistics', width: 170 },
  { title: '介入状态', key: 'intervention', width: 170 },
  { title: '平台动作', key: 'actions', width: 300, fixed: 'right', className: 'og-col-actions' },
]

const formatSla = (minutes: number) => {
  if (minutes < 0) return `超时 ${Math.abs(minutes)} 分钟`
  if (minutes <= 30) return `临近超时 ${minutes} 分钟`
  return `剩余 ${minutes} 分钟`
}

const getOrderMeta = (record: MallOrderGovernanceItem) => orderStatusConfig[record.status]
const getInterventionMeta = (record: MallOrderGovernanceItem) => interventionStatusConfig[record.interventionStatus]

const getActions = (record: MallOrderGovernanceItem) =>
  (orderStatusActions[record.status] ?? ['detail'])
    .map((key) => orderActionConfig[key])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

const getPrimaryActions = (record: MallOrderGovernanceItem) => getActions(record).slice(0, 2)
const getSecondaryActions = (record: MallOrderGovernanceItem) => getActions(record).slice(2)

const buildMoreMenu = (record: MallOrderGovernanceItem) => ({
  items: getSecondaryActions(record).map((item) => ({ key: item.key, label: item.label, danger: Boolean(item.danger) })),
  onClick: (info: { key: string }) => handleAction(info.key, record),
})

const handleAction = (actionKey: string, record: MallOrderGovernanceItem) => {
  if (actionKey === 'detail') {
    router.push({ path: '/orders/detail', query: { id: record.id } })
    return
  }
  message.success(`已执行：${orderActionConfig[actionKey]?.label ?? actionKey}`)
}

const quickFilter = (card: SignalCard) => {
  if (card.key === 'timeout') riskFlag.value = '超时风险'
  if (card.key === 'arbitration') status.value = '退款审核中'
  if (card.key === 'logistics') riskFlag.value = '物流异常'
  if (card.key === 'highAmount') riskFlag.value = '高客单争议'
}

const resetFilters = () => {
  keyword.value = ''
  status.value = 'all'
  interventionStatus.value = 'all'
  riskFlag.value = 'all'
}

const onExpand = (expanded: boolean, record: MallOrderGovernanceItem) => {
  if (expanded) {
    expandedKeys.value = [record.id]
    return
  }
  expandedKeys.value = expandedKeys.value.filter((key) => key !== record.id)
}
</script>
