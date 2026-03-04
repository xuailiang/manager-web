<template>
  <div v-if="order" class="page-wrap">
    <a-card :bordered="false" class="hero-card">
      <div class="detail-hero">
        <div class="hero-meta">
          <h2>订单号 {{ order.id }}</h2>
          <p>
            下单 {{ order.orderTime }} · 商户 {{ order.merchantName }} / {{ order.shopName }} · 买家 {{ order.receiver }}
          </p>
          <a-space wrap>
            <a-tag :color="orderStatusConfig[order.status].color">{{ orderStatusConfig[order.status].label }}</a-tag>
            <a-tag :color="interventionStatusConfig[order.interventionStatus].color">
              {{ interventionStatusConfig[order.interventionStatus].label }}
            </a-tag>
            <a-tag :color="order.slaMinutesLeft <= 0 ? 'red' : order.slaMinutesLeft <= 30 ? 'orange' : 'green'">
              {{ formatSla(order.slaMinutesLeft) }}
            </a-tag>
          </a-space>
        </div>
        <div class="hero-actions">
          <a-button type="primary">催办商户</a-button>
          <a-button>发起仲裁</a-button>
          <a-button @click="router.push('/merchant/list')">生成协同任务</a-button>
        </div>
      </div>
    </a-card>

    <div class="dashboard-grid">
      <a-card :bordered="false" class="full-span" title="订单概览">
        <a-steps :current="stepCurrent" :items="stepItems" />
      </a-card>

      <a-card :bordered="false" title="资金与优惠">
        <div class="metric-rows">
          <div class="metric"><span>商品总额</span><strong>¥{{ goodsTotal.toFixed(2) }}</strong></div>
          <div class="metric"><span>运费</span><strong>¥{{ shippingFee.toFixed(2) }}</strong></div>
          <div class="metric"><span>平台券</span><strong>-¥20.00</strong></div>
          <div class="metric"><span>店铺券</span><strong>-¥10.00</strong></div>
          <div class="metric"><span>活动优惠</span><strong>-¥{{ activityDiscount.toFixed(2) }}</strong></div>
          <div class="metric"><span>实付金额</span><strong>¥{{ order.paidAmount.toFixed(2) }}</strong></div>
        </div>
      </a-card>

      <a-card :bordered="false" title="收货与发票">
        <div class="metric-rows">
          <div class="metric"><span>收货人</span><strong>{{ order.receiver }} {{ order.phone }}</strong></div>
          <div class="metric"><span>收货地区</span><strong>{{ order.region }}</strong></div>
          <div class="metric"><span>仓库</span><strong>{{ order.warehouse }}</strong></div>
          <div class="metric"><span>开票状态</span><strong>待开票</strong></div>
        </div>
      </a-card>

      <a-card :bordered="false" class="full-span" title="商品与包裹">
        <a-table :columns="itemColumns" :data-source="order.items" size="small" :pagination="false" row-key="skuId" />
        <a-divider />
        <a-table :columns="packageColumns" :data-source="order.packages" size="small" :pagination="false" row-key="packageId" />
      </a-card>

      <a-card :bordered="false" title="售后轨迹">
        <a-timeline>
          <a-timeline-item color="blue">买家提交售后：{{ order.reason || '无' }}</a-timeline-item>
          <a-timeline-item color="orange">商户处理中：退款金额 ¥{{ order.refundAmount.toFixed(2) }}</a-timeline-item>
          <a-timeline-item color="green">平台待裁决：{{ interventionDecisionHint }}</a-timeline-item>
        </a-timeline>
      </a-card>

      <a-card :bordered="false" title="平台裁决记录">
        <a-table :columns="decisionColumns" :data-source="decisionRows" size="small" :pagination="false" row-key="id" />
      </a-card>

      <a-card :bordered="false" class="full-span" title="协同任务与操作日志">
        <a-table :columns="collabColumns" :data-source="collabRows" size="small" :pagination="false" row-key="id" />
        <a-divider />
        <a-timeline>
          <a-timeline-item v-for="log in order.logs" :key="log.id">
            <div class="cell-title">{{ log.action }} · {{ log.operatorName }}</div>
            <div class="cell-sub">{{ log.operateAt }} · {{ log.sourceSystem }} · trace {{ log.traceId }}</div>
          </a-timeline-item>
        </a-timeline>
      </a-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { getInterventionTickets, getMallOrderById, getMerchantCollabTasks } from '../../mock/governance'
import type { MallOrderInterventionTicket, MerchantRectifyTask, OrderPackageItem, OrderSkuItem } from '../../types/governance'
import { interventionStatusConfig, orderStatusConfig } from '../../utils/statusConfig'

const route = useRoute()
const router = useRouter()

const orderId = computed(() => String(route.query.id || 'DD202603011001'))
const order = computed(() => getMallOrderById(orderId.value))

const collabRows = computed(() =>
  getMerchantCollabTasks().filter((task) => task.bizType === 'order' && task.bizId === orderId.value),
)
const decisionRows = computed(() => getInterventionTickets().filter((ticket) => ticket.orderId === orderId.value))

const goodsTotal = computed(() => (order.value ? order.value.items.reduce((sum, item) => sum + item.price * item.qty, 0) : 0))
const shippingFee = computed(() => (order.value ? Math.max(order.value.paidAmount - goodsTotal.value + 30, 0) : 0))
const activityDiscount = computed(() => 8)

const formatSla = (minutes: number) => (minutes < 0 ? `超时 ${Math.abs(minutes)} 分钟` : `剩余 ${minutes} 分钟`)

const stepItems = computed(() => {
  if (!order.value) return []
  return [
    { title: '买家下单', description: order.value.orderTime },
    { title: '支付完成', description: order.value.payTime },
    { title: '商户履约', description: order.value.interventionStatus === 'intervention_open' ? '平台介入处理中' : '正常履约' },
    { title: '完成/关闭', description: order.value.status },
  ]
})

const stepCurrent = computed(() => {
  if (!order.value) return 0
  if (order.value.status === '待支付') return 0
  if (order.value.status === '待发货' || order.value.status === '退款审核中') return 2
  if (order.value.status === '待收货') return 2
  return 3
})

const interventionDecisionHint = computed(() => {
  const ticket = decisionRows.value[0]
  if (!ticket?.decision) return '等待平台裁决'
  return `${ticket.decision}（责任：${ticket.liability || '-'}）`
})

const itemColumns: TableColumnsType<OrderSkuItem> = [
  {
    title: '商品',
    key: 'name',
    customRender: ({ record }) => `${record.name}（${record.spec}）`,
  },
  { title: 'SPU', dataIndex: 'spu', key: 'spu' },
  { title: '单价', key: 'price', customRender: ({ record }) => `¥${record.price.toFixed(2)}` },
  { title: '数量', dataIndex: 'qty', key: 'qty' },
  { title: '小计', key: 'subtotal', customRender: ({ record }) => `¥${(record.price * record.qty).toFixed(2)}` },
]

const packageColumns: TableColumnsType<OrderPackageItem> = [
  { title: '包裹号', dataIndex: 'packageId', key: 'packageId' },
  { title: '物流公司', dataIndex: 'company', key: 'company' },
  { title: '物流单号', dataIndex: 'logisticsNo', key: 'logisticsNo' },
  { title: '状态', dataIndex: 'status', key: 'status' },
  { title: '最近节点', dataIndex: 'lastNode', key: 'lastNode' },
  { title: '更新时间', dataIndex: 'latestLogisticsAt', key: 'latestLogisticsAt' },
]

const decisionColumns: TableColumnsType<MallOrderInterventionTicket> = [
  { title: '介入单号', dataIndex: 'id', key: 'id' },
  { title: '触发原因', dataIndex: 'triggerReason', key: 'triggerReason' },
  { title: '状态', key: 'status', customRender: ({ record }) => interventionStatusConfig[record.status].label },
  { title: '裁决结果', key: 'decision', customRender: ({ record }) => record.decision || '-' },
  { title: '责任方', key: 'liability', customRender: ({ record }) => record.liability || '-' },
  { title: '财务影响', key: 'financeImpact', customRender: ({ record }) => (record.financeImpact ? `¥${record.financeImpact}` : '-') },
]

const collabColumns: TableColumnsType<MerchantRectifyTask> = [
  { title: '协同任务', dataIndex: 'rectifyTaskId', key: 'rectifyTaskId' },
  { title: '任务状态', dataIndex: 'status', key: 'status' },
  { title: '截止时间', dataIndex: 'deadline', key: 'deadline' },
  { title: '整改要求', key: 'requiredFixes', customRender: ({ record }) => record.requiredFixes.join(' / ') },
  { title: '证据要求', key: 'evidenceRequirements', customRender: ({ record }) => record.evidenceRequirements.join(' / ') },
]
</script>
