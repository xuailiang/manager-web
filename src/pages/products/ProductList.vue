<template>
  <div class="page-wrap pg-page">
    <ProductCommandBar :cards="commandCards" @select="applyCommandFilter" />

    <ProductFilterPanel
      :model="filters"
      :status-options="statusOptions"
      :audit-status-options="auditStatusOptions"
      :risk-options="riskOptions"
      @update-model="updateFilters"
      @reset="resetFilters"
    />

    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>商品治理列表</span>
          <a-space>
            <a-tag color="processing">高密度工作台</a-tag>
            <a-tag color="blue">状态驱动</a-tag>
          </a-space>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-button @click="createExportTask">导出审核列表</a-button>
          <a-button type="primary" @click="router.push('/products/review')">进入审核工作台</a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRows"
        :pagination="{ pageSize: 8 }"
        row-key="id"
        :scroll="{ x: 1700 }"
        :expandable="expandable"
      >
        <template #expandedRowRender="{ record }">
          <div class="pg-expand-grid">
            <div class="pg-expand-card">
              <div class="pg-expand-title">命中规则</div>
              <ul class="pg-expand-list">
                <li v-for="rule in getRiskRules(record.id)" :key="rule">{{ rule }}</li>
                <li v-if="!getRiskRules(record.id).length" class="is-muted">暂无命中规则</li>
              </ul>
            </div>
            <div class="pg-expand-card">
              <div class="pg-expand-title">最近审核记录</div>
              <ul class="pg-expand-list">
                <li v-for="item in getReviewSnapshots(record.id)" :key="item.id">
                  <span>{{ item.statusText }}</span>
                  <span class="is-muted">{{ item.time }}</span>
                </li>
                <li v-if="!getReviewSnapshots(record.id).length" class="is-muted">暂无审核记录</li>
              </ul>
            </div>
            <div class="pg-expand-card">
              <div class="pg-expand-title">整改链路</div>
              <ul class="pg-expand-list">
                <li v-for="item in getRectifySnapshots(record.id)" :key="item.id">
                  <span>{{ item.statusText }}</span>
                  <span class="is-muted">{{ item.deadline }}</span>
                </li>
                <li v-if="!getRectifySnapshots(record.id).length" class="is-muted">暂无整改任务</li>
              </ul>
            </div>
          </div>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'product'">
            <div class="table-main-cell">
              <a-avatar shape="square" :src="record.image" :size="44" />
              <div>
                <div class="cell-title">{{ record.name }}</div>
                <div class="cell-sub">{{ record.code }} · {{ record.category }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'merchant'">
            <div class="cell-title">{{ record.merchantName }}</div>
            <div class="cell-sub">{{ record.shop }}</div>
          </template>

          <template v-else-if="column.key === 'pricing'">
            <div class="cell-title">¥{{ record.price.toFixed(2) }} / 成本 ¥{{ record.cost.toFixed(2) }}</div>
            <div class="cell-sub">毛利率 {{ formatPercent(calcMargin(record.price, record.cost)) }}</div>
          </template>

          <template v-else-if="column.key === 'inventory'">
            <div class="cell-title">库存 {{ record.stock }} · 销量 {{ record.sales }}</div>
            <div class="cell-sub">退款率 {{ formatPercent(record.refundRate) }}</div>
          </template>

          <template v-else-if="column.key === 'audit'">
            <a-tag :color="getAuditMeta(record).color">
              {{ getAuditMeta(record).label }}
            </a-tag>
            <div class="cell-sub">优先级 {{ record.reviewPriority }} · SLA {{ formatSla(record.slaMinutesLeft) }}</div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getProductMeta(record).color">{{ getProductMeta(record).label }}</a-tag>
            <div class="cell-sub">上架 {{ record.listedAt.slice(0, 10) }}</div>
          </template>

          <template v-else-if="column.key === 'risk'">
            <a-tag :color="record.riskLevel === 'high' ? 'red' : record.riskLevel === 'medium' ? 'orange' : 'green'">
              {{ record.riskLevel === 'high' ? '高风险' : record.riskLevel === 'medium' ? '中风险' : '低风险' }}
            </a-tag>
            <div class="cell-sub">风险分 {{ record.riskScore }} · 违规分 {{ record.violationScore }}</div>
          </template>

          <template v-else-if="column.key === 'media'">
            <div class="cell-title">{{ record.mediaCompleteness }}%</div>
            <a-progress :percent="record.mediaCompleteness" :show-info="false" size="small" />
          </template>

          <template v-else-if="column.key === 'updated'">
            <div class="cell-title">{{ record.updatedBy }}</div>
            <div class="cell-sub">{{ record.updatedAt }}</div>
          </template>

          <template v-else-if="column.key === 'actions'">
            <ProductActionCell :actions="getAvailableActions(record)" @action="(actionKey) => handleAction(actionKey, record)" />
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
import ProductActionCell from '../../components/products/ProductActionCell.vue'
import ProductCommandBar, { type CommandCard } from '../../components/products/ProductCommandBar.vue'
import ProductFilterPanel from '../../components/products/ProductFilterPanel.vue'
import {
  createGovernanceExportTask,
  getMallProductList,
  getMallProductReviewTickets,
  getMerchantCollabTasks,
} from '../../mock/governance'
import type { MallProductGovernanceItem, MerchantRectifyTask, ProductReviewStatus, RiskLevel } from '../../types/governance'
import type { ProductFilterModel } from '../../types/product-list'
import { productActionConfig, productReviewStatusConfig, productStatusActions, productStatusConfig } from '../../utils/statusConfig'
import '../../styles/product-governance-v2.css'

const router = useRouter()
const rows = ref<MallProductGovernanceItem[]>(getMallProductList())
const reviewTickets = ref(getMallProductReviewTickets())
const rectifyTasks = ref(getMerchantCollabTasks())
const expandedRowKeys = ref<string[]>([])

const defaultFilters: ProductFilterModel = {
  keyword: '',
  status: 'all',
  auditStatus: 'all',
  riskLevel: 'all',
  merchantKeyword: '',
  slaRange: [-120, 1440],
  complaintRange: [0, 20],
  violationRange: [0, 100],
  mediaRange: [0, 100],
  advancedOpen: false,
}

const filters = ref<ProductFilterModel>({ ...defaultFilters })

const statusOptions: { label: string; value: 'all' | MallProductGovernanceItem['status'] }[] = [
  { label: '全部', value: 'all' },
  { label: '上架中', value: '上架中' },
  { label: '库存紧张', value: '库存紧张' },
  { label: '待审核', value: '待审核' },
  { label: '整改中', value: '整改中' },
  { label: '已下架', value: '已下架' },
]

const auditStatusOptions: { label: string; value: 'all' | ProductReviewStatus }[] = [
  { label: '全部', value: 'all' },
  { label: '已提交', value: 'submitted' },
  { label: '审核中', value: 'in_review' },
  { label: '审核通过', value: 'approved' },
  { label: '补件中', value: 'need_fix' },
  { label: '已驳回', value: 'rejected' },
  { label: '重提待审', value: 'resubmitted' },
]

const riskOptions: { label: string; value: 'all' | RiskLevel }[] = [
  { label: '全部', value: 'all' },
  { label: '高风险', value: 'high' },
  { label: '中风险', value: 'medium' },
  { label: '低风险', value: 'low' },
]

const filteredRows = computed(() =>
  rows.value.filter((item) => {
    const model = filters.value
    const hitKeyword =
      !model.keyword ||
      item.name.includes(model.keyword) ||
      item.code.includes(model.keyword) ||
      item.merchantName.includes(model.keyword) ||
      item.updatedAt.includes(model.keyword)
    const hitMerchant = !model.merchantKeyword || item.merchantName.includes(model.merchantKeyword) || item.shop.includes(model.merchantKeyword)
    const hitStatus = model.status === 'all' || item.status === model.status
    const hitAudit =
      model.auditStatus === 'all' ||
      (model.auditStatus === 'submitted'
        ? item.auditStatus === 'submitted' || item.auditStatus === 'resubmitted'
        : item.auditStatus === model.auditStatus)
    const hitRisk = model.riskLevel === 'all' || item.riskLevel === model.riskLevel
    const hitSla = item.slaMinutesLeft >= model.slaRange[0] && item.slaMinutesLeft <= model.slaRange[1]
    const hitComplaint = item.complaintRate >= model.complaintRange[0] && item.complaintRate <= model.complaintRange[1]
    const hitViolation = item.violationScore >= model.violationRange[0] && item.violationScore <= model.violationRange[1]
    const hitMedia = item.mediaCompleteness >= model.mediaRange[0] && item.mediaCompleteness <= model.mediaRange[1]
    return hitKeyword && hitMerchant && hitStatus && hitAudit && hitRisk && hitSla && hitComplaint && hitViolation && hitMedia
  }),
)

const commandCards = computed<CommandCard[]>(() => {
  const pending = rows.value.filter((item) => item.auditStatus === 'submitted' || item.auditStatus === 'resubmitted').length
  const p0Timeout = rows.value.filter((item) => item.reviewPriority === 'P0' && item.slaMinutesLeft <= 30).length
  const highRisk = rows.value.filter((item) => item.riskLevel === 'high').length
  const rectifying = rows.value.filter((item) => item.status === '整改中').length
  const mediaPoor = rows.value.filter((item) => item.mediaCompleteness < 80).length
  const updated = rows.value.filter((item) => item.updatedAt.startsWith('2026-03-03')).length
  return [
    { key: 'pending', label: '待审商品', value: String(pending), hint: '待审核池中的商品', level: 'low' },
    { key: 'p0Timeout', label: 'P0 超时', value: String(p0Timeout), hint: '优先领取复核', level: 'high' },
    { key: 'highRisk', label: '高风险', value: String(highRisk), hint: '命中规则较多', level: 'high' },
    { key: 'rectifying', label: '整改中', value: String(rectifying), hint: '待商户补件', level: 'medium' },
    { key: 'mediaPoor', label: '素材不达标', value: String(mediaPoor), hint: '完整度低于 80%', level: 'medium' },
    { key: 'updated', label: '今日更新', value: String(updated), hint: '含重提与复审', level: 'low' },
  ]
})

const columns: TableColumnsType<MallProductGovernanceItem> = [
  { title: '商品信息', key: 'product', width: 280, fixed: 'left' },
  { title: '商户/店铺', key: 'merchant', width: 210 },
  { title: '价格/成本', key: 'pricing', width: 180 },
  { title: '库存/销量', key: 'inventory', width: 180 },
  { title: '审核状态', key: 'audit', width: 200 },
  { title: '商品状态', key: 'status', width: 130 },
  { title: '风险分', key: 'risk', width: 180 },
  { title: '素材完整度', key: 'media', width: 170 },
  { title: '最近操作', key: 'updated', width: 180 },
  { title: '平台动作', key: 'actions', width: 340, fixed: 'right', className: 'pg-col-actions' },
]

const expandable = computed(() => ({
  expandedRowKeys: expandedRowKeys.value,
  onExpand: (expanded: boolean, record: MallProductGovernanceItem) => {
    if (expanded) {
      expandedRowKeys.value = [...expandedRowKeys.value, record.id]
      return
    }
    expandedRowKeys.value = expandedRowKeys.value.filter((key) => key !== record.id)
  },
}))

const calcMargin = (price: number, cost: number) => {
  if (price <= 0) return 0
  return ((price - cost) / price) * 100
}

const formatPercent = (value: number) => `${value.toFixed(1)}%`
const formatSla = (minutes: number) => (minutes < 0 ? `超时 ${Math.abs(minutes)} 分钟` : `剩余 ${minutes} 分钟`)

const getAvailableActions = (record: MallProductGovernanceItem) =>
  (productStatusActions[record.status] ?? ['view'])
    .map((key) => productActionConfig[key])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

const getAuditMeta = (record: MallProductGovernanceItem) => productReviewStatusConfig[record.auditStatus]
const getProductMeta = (record: MallProductGovernanceItem) => productStatusConfig[record.status]

const getRiskRules = (productId: string) => {
  const ticket = reviewTickets.value.find((item) => item.productId === productId)
  return ticket?.riskTags ?? []
}

const getReviewSnapshots = (productId: string) =>
  reviewTickets.value
    .filter((item) => item.productId === productId)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      statusText: `${productReviewStatusConfig[item.status].label} · ${item.priority}`,
      time: item.reviewedAt || item.submittedAt,
    }))

const taskStatusLabelMap: Record<MerchantRectifyTask['status'], string> = {
  pending: '待处理',
  processing: '处理中',
  submitted: '已提交',
  overdue: '逾期',
  closed: '已关闭',
}

const getRectifySnapshots = (productId: string) =>
  rectifyTasks.value
    .filter((item) => item.bizType === 'product' && item.bizId === productId)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      statusText: `${taskStatusLabelMap[item.status]} · ${item.rectifyTaskId}`,
      deadline: `截止 ${item.deadline}`,
    }))

const handleAction = (actionKey: string, record: MallProductGovernanceItem) => {
  if (actionKey === 'view') {
    router.push({ path: '/products/detail', query: { id: record.id } })
    return
  }
  if (actionKey === 'approve' || actionKey === 'needFix' || actionKey === 'reject' || actionKey === 'resendReview') {
    router.push({ path: '/products/review', query: { productId: record.id, action: actionKey } })
    return
  }
  message.success(`已执行：${productActionConfig[actionKey]?.label ?? actionKey}`)
}

const applyCommandFilter = (key: string) => {
  filters.value = { ...defaultFilters, advancedOpen: filters.value.advancedOpen }
  if (key === 'pending') filters.value.auditStatus = 'submitted'
  if (key === 'p0Timeout') {
    filters.value.auditStatus = 'submitted'
    filters.value.slaRange = [-120, 30]
  }
  if (key === 'highRisk') filters.value.riskLevel = 'high'
  if (key === 'rectifying') filters.value.status = '整改中'
  if (key === 'mediaPoor') filters.value.mediaRange = [0, 79]
  if (key === 'updated') filters.value.keyword = '2026-03-03'
}

const updateFilters = (value: ProductFilterModel) => {
  filters.value = value
}

const createExportTask = () => {
  const taskId = createGovernanceExportTask('商品审核池', '平台审核员', 'review', 'product-review-list')
  message.success(`导出任务 ${taskId} 已创建，请前往下载中心查看`)
}

const resetFilters = () => {
  filters.value = { ...defaultFilters }
}
</script>
