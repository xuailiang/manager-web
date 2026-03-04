<template>
  <div class="page-wrap pg-page" v-if="product">
    <a-card class="hero-card" :bordered="false">
      <div class="detail-hero">
        <a-image :src="product.image" width="220" />
        <div class="hero-meta">
          <h2>{{ product.name }}</h2>
          <p>{{ product.code }} · {{ product.category }} · {{ product.brand }}</p>
          <a-space wrap>
            <a-tag :color="productStatusConfig[product.status].color">{{ productStatusConfig[product.status].label }}</a-tag>
            <a-tag :color="productReviewStatusConfig[product.auditStatus].color">
              {{ productReviewStatusConfig[product.auditStatus].label }}
            </a-tag>
            <a-tag :color="product.riskLevel === 'high' ? 'red' : product.riskLevel === 'medium' ? 'orange' : 'green'">
              风险分 {{ product.riskScore }}
            </a-tag>
          </a-space>
          <div class="metric-inline">
            <div>
              <span>售价区间</span>
              <strong>{{ priceRange }}</strong>
            </div>
            <div>
              <span>利润区间</span>
              <strong>{{ profitRange }}</strong>
            </div>
            <div>
              <span>素材完整度</span>
              <strong>{{ product.mediaCompleteness }}%</strong>
            </div>
            <div>
              <span>投诉率</span>
              <strong>{{ formatPercent(product.complaintRate) }}</strong>
            </div>
          </div>
        </div>
        <div class="hero-actions">
          <a-button type="primary" @click="router.push({ path: '/products/review', query: { productId: product.id } })">进入审核台</a-button>
          <a-button @click="router.push('/merchant/list')">查看商户协同</a-button>
        </div>
      </div>
    </a-card>

    <div class="pg-anchors">
      <button
        v-for="section in sections"
        :key="section.key"
        type="button"
        class="pg-anchor-btn"
        :class="{ active: activeSection === section.key }"
        @click="scrollToSection(section.key)"
      >
        {{ section.label }}
      </button>
    </div>

    <a-card id="section-basic" :bordered="false" class="pg-section" title="基础信息">
      <div class="metric-rows">
        <div class="metric"><span>商户</span><strong>{{ product.merchantName }}</strong></div>
        <div class="metric"><span>店铺</span><strong>{{ product.shop }}</strong></div>
        <div class="metric"><span>渠道</span><strong>{{ product.channel }}</strong></div>
        <div class="metric"><span>最近操作</span><strong>{{ product.updatedBy }} · {{ product.updatedAt }}</strong></div>
      </div>
    </a-card>

    <a-card id="section-media" :bordered="false" class="pg-section" title="媒体素材">
      <a-space wrap size="middle">
        <a-image :src="product.image" width="120" height="120" />
        <a-image src="https://picsum.photos/id/292/120/120" width="120" height="120" />
        <a-image src="https://picsum.photos/id/433/120/120" width="120" height="120" />
      </a-space>
      <a-divider />
      <div class="cell-sub">素材完整度 {{ product.mediaCompleteness }}%，建议至少保留 3 张场景图 + 1 张细节图。</div>
    </a-card>

    <a-card id="section-sku" :bordered="false" class="pg-section" title="SKU 与利润">
      <a-table :columns="skuColumns" :data-source="skuRows" size="small" :pagination="false" row-key="skuId" />
    </a-card>

    <a-card id="section-compliance" :bordered="false" class="pg-section" title="合规检测结果">
      <div class="pg-review-grid">
        <div class="pg-review-block">
          <div class="pg-review-block-title">风险评分构成</div>
          <div class="metric"><span>违规分</span><strong>{{ product.violationScore }}</strong></div>
          <div class="metric"><span>投诉率</span><strong>{{ formatPercent(product.complaintRate) }}</strong></div>
          <div class="metric"><span>退款率</span><strong>{{ formatPercent(product.refundRate) }}</strong></div>
        </div>
        <div class="pg-review-block">
          <div class="pg-review-block-title">命中证据片段</div>
          <div class="pg-evidence-item" v-for="row in complianceRows" :key="row.title">
            <div class="pg-evidence-score">{{ row.score }}</div>
            <div class="pg-evidence-content">
              <div class="pg-evidence-title">{{ row.title }}</div>
              <div class="cell-sub">{{ row.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </a-card>

    <div class="dashboard-grid pg-section" id="section-history">
      <a-card :bordered="false" title="历史审核记录">
        <a-table :columns="reviewColumns" :data-source="reviewRows" size="small" :pagination="false" row-key="id" />
      </a-card>
      <a-card :bordered="false" title="商户整改记录">
        <a-table :columns="rectifyColumns" :data-source="rectifyRows" size="small" :pagination="false" row-key="id" />
      </a-card>
    </div>

    <a-card id="section-logs" :bordered="false" class="pg-section" title="审计日志">
      <a-timeline>
        <a-timeline-item v-for="log in logs" :key="log.id">
          <div class="cell-title">{{ log.action }} · {{ log.operatorName }}</div>
          <div class="cell-sub">{{ log.operateAt }} · trace: {{ log.traceId }}</div>
          <div v-if="log.remark" class="cell-sub">{{ log.remark }}</div>
        </a-timeline-item>
      </a-timeline>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { getGovernanceAuditLogs, getMallProductById, getMallProductReviewTickets, getMerchantCollabTasks } from '../../mock/governance'
import type { MallProductReviewTicket, MerchantRectifyTask } from '../../types/governance'
import { productReviewStatusConfig, productStatusConfig } from '../../utils/statusConfig'
import '../../styles/product-governance-v2.css'

const route = useRoute()
const router = useRouter()
const activeSection = ref('basic')

const sections = [
  { key: 'basic', label: '基础信息' },
  { key: 'media', label: '媒体素材' },
  { key: 'sku', label: 'SKU利润' },
  { key: 'compliance', label: '合规检测' },
  { key: 'history', label: '审核历史' },
  { key: 'logs', label: '审计日志' },
]

const productId = computed(() => String(route.query.id || 'prod-1001'))
const product = computed(() => getMallProductById(productId.value))

const reviewRows = computed(() => getMallProductReviewTickets().filter((item) => item.productId === productId.value))
const rectifyRows = computed(() =>
  getMerchantCollabTasks().filter((item) => item.bizType === 'product' && item.bizId === productId.value),
)
const logs = computed(() =>
  getGovernanceAuditLogs()
    .filter((log) => log.sourceBizId.includes('rv-') || log.sourceBizId.includes(productId.value))
    .slice(0, 10),
)

const priceRange = computed(() =>
  product.value ? `¥${product.value.price.toFixed(2)} ~ ¥${(product.value.price * 1.35).toFixed(2)}` : '-',
)
const profitRange = computed(() => {
  if (!product.value) return '-'
  const low = product.value.price - product.value.cost
  const high = low + 20
  return `¥${low.toFixed(2)} ~ ¥${high.toFixed(2)}`
})

const formatPercent = (value: number) => `${value.toFixed(1)}%`

const complianceRows = computed(() => {
  if (!product.value) return []
  return [
    {
      title: '违规词命中：主图文案存在夸大表述',
      score: '92',
      desc: '命中规则 IMG_CLAIM_OVER，建议替换主图文案并上传新版素材。',
    },
    {
      title: '授权链路补充不足',
      score: '76',
      desc: '命中规则 AUTH_DOC_BLUR，建议补充盖章清晰件与授权链路证明。',
    },
    {
      title: '类目资质临期',
      score: '68',
      desc: '命中规则 QUAL_EXPIRING，建议提前提交更新后的资质证件。',
    },
  ]
})

const skuRows = computed(() => {
  if (!product.value) return []
  return [
    {
      skuId: `${product.value.code}-01`,
      spec: '红色 / 22 / 大型',
      price: product.value.price,
      cost: product.value.cost,
      profit: product.value.price - product.value.cost,
      margin: ((product.value.price - product.value.cost) / product.value.price) * 100,
      stock: Math.max(0, product.value.stock - 120),
    },
    {
      skuId: `${product.value.code}-02`,
      spec: '灰色 / 22 / 大型',
      price: product.value.price + 8,
      cost: product.value.cost + 5,
      profit: product.value.price + 8 - (product.value.cost + 5),
      margin: (((product.value.price + 8) - (product.value.cost + 5)) / (product.value.price + 8)) * 100,
      stock: product.value.stock,
    },
  ]
})

const skuColumns: TableColumnsType<(typeof skuRows.value)[number]> = [
  { title: 'SKU', dataIndex: 'skuId', key: 'skuId' },
  { title: '规格组合', dataIndex: 'spec', key: 'spec' },
  { title: '售价', key: 'price', customRender: ({ record }) => `¥${record.price.toFixed(2)}` },
  { title: '成本', key: 'cost', customRender: ({ record }) => `¥${record.cost.toFixed(2)}` },
  { title: '利润', key: 'profit', customRender: ({ record }) => `¥${record.profit.toFixed(2)}` },
  { title: '利润率', key: 'margin', customRender: ({ record }) => `${record.margin.toFixed(1)}%` },
  { title: '库存', dataIndex: 'stock', key: 'stock' },
]

const reviewColumns: TableColumnsType<MallProductReviewTicket> = [
  { title: '审核单号', dataIndex: 'id', key: 'id' },
  { title: '状态', key: 'status', customRender: ({ record }) => productReviewStatusConfig[record.status].label },
  { title: '优先级', dataIndex: 'priority', key: 'priority' },
  { title: '风险分', dataIndex: 'riskScore', key: 'riskScore' },
  { title: '提交时间', dataIndex: 'submittedAt', key: 'submittedAt' },
]

const rectifyColumns: TableColumnsType<MerchantRectifyTask> = [
  { title: '整改任务', dataIndex: 'rectifyTaskId', key: 'rectifyTaskId' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline' },
  { title: '整改要求', key: 'requiredFixes', customRender: ({ record }) => record.requiredFixes.join(' / ') },
]

const sectionElement = (key: string) => document.getElementById(`section-${key}`)

const syncActiveSection = () => {
  let current = 'basic'
  for (const section of sections) {
    const node = sectionElement(section.key)
    if (!node) continue
    const top = node.getBoundingClientRect().top
    if (top <= 120) current = section.key
  }
  activeSection.value = current
}

const scrollToSection = (key: string) => {
  const node = sectionElement(key)
  if (!node) return
  node.scrollIntoView({ behavior: 'smooth', block: 'start' })
  activeSection.value = key
}

onMounted(() => {
  window.addEventListener('scroll', syncActiveSection, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', syncActiveSection)
})
</script>
