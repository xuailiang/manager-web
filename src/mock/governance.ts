import type {
  BrandItem,
  CategoryItem,
  GovernanceAuditLog,
  GovernanceExportTask,
  GovernanceMessage,
  MallOrderGovernanceItem,
  MallOrderInterventionTicket,
  MallProductGovernanceItem,
  MallProductReviewTicket,
  MerchantRectifyTask,
} from '../types/governance'
import type { ReviewDecisionPayload } from '../types/product-governance'
import { computeOrderGovernancePriorityScore, computeProductGovernanceSortScore } from '../utils/statusConfig'

const nowText = () => new Date().toISOString().slice(0, 19).replace('T', ' ')
const idSeed = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
const traceId = (prefix: string) => `trace-${prefix}-${idSeed()}`

const auditLogs: GovernanceAuditLog[] = [
  {
    id: 'log-001',
    action: '提交商品审核',
    actionType: 'review',
    operatorId: 'merchant-1001',
    operatorName: '拼京宝旗舰店-运营',
    operateAt: '2026-03-03 09:05:02',
    sourceSystem: 'merchant-admin',
    sourceBizId: 'rv-1001',
    traceId: 'trace-rv-1001',
    after: { status: 'submitted' },
    remark: '商户提交新版本素材与资质',
  },
  {
    id: 'log-002',
    action: '平台介入订单',
    actionType: 'intervention',
    operatorId: 'ops-001',
    operatorName: '平台运营A',
    operateAt: '2026-03-03 10:15:22',
    sourceSystem: 'mall-admin',
    sourceBizId: 'iv-9001',
    traceId: 'trace-iv-9001',
    before: { interventionStatus: 'risk_detected' },
    after: { interventionStatus: 'intervention_open' },
    remark: '超时未发货 + 投诉触发自动介入',
  },
]

const productList: MallProductGovernanceItem[] = [
  {
    id: 'prod-1001',
    key: 'prod-1001',
    name: '猫爬架四层大型豪华款',
    category: '宠物生活/猫玩具',
    price: 28,
    cost: 17,
    stock: 1111,
    sales: 1240,
    status: '待审核',
    listedAt: '2026-02-02 10:12:00',
    updatedAt: '2026-03-03 09:00:00',
    code: 'SPU108601',
    brand: '亮牌(L&P)',
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
    channel: '商城',
    shop: '拼京宝旗舰店',
    shopId: 'shop-01',
    merchantId: 'merchant-1001',
    merchantName: '山东京宝淘东有限公司',
    auditStatus: 'submitted',
    mediaCompleteness: 92,
    updatedBy: '余心几',
    complaintRate: 2.8,
    violationScore: 68,
    riskLevel: 'high',
    riskScore: 86,
    lastReviewDecision: '补件',
    lastReviewAt: '2026-03-02 18:22:10',
    reviewPriority: 'P0',
    slaMinutesLeft: 21,
    refundRate: 4.9,
  },
  {
    id: 'prod-1002',
    key: 'prod-1002',
    name: '多功能宠物饮水器 3L',
    category: '宠物生活/喂养',
    price: 89,
    cost: 56,
    stock: 802,
    sales: 638,
    status: '上架中',
    listedAt: '2026-01-16 11:20:00',
    updatedAt: '2026-03-02 15:12:00',
    code: 'SPU20310',
    brand: '萌宠家',
    image: 'https://picsum.photos/id/292/180/180',
    channel: '商城',
    shop: '萌宠之家',
    shopId: 'shop-02',
    merchantId: 'merchant-1002',
    merchantName: '济南宠伴商贸有限公司',
    auditStatus: 'approved',
    mediaCompleteness: 96,
    updatedBy: '陈晓',
    complaintRate: 0.8,
    violationScore: 22,
    riskLevel: 'low',
    riskScore: 36,
    lastReviewDecision: '通过',
    lastReviewAt: '2026-02-22 12:05:10',
    reviewPriority: 'P2',
    slaMinutesLeft: 600,
    refundRate: 1.2,
  },
  {
    id: 'prod-1003',
    key: 'prod-1003',
    name: '三层剑麻抓板组合',
    category: '宠物生活/磨爪',
    price: 59,
    cost: 43,
    stock: 91,
    sales: 403,
    status: '整改中',
    listedAt: '2026-02-03 13:40:00',
    updatedAt: '2026-03-02 20:40:00',
    code: 'SPU20411',
    brand: '趣宠工坊',
    image: 'https://picsum.photos/id/433/180/180',
    channel: '商城',
    shop: '趣宠工坊',
    shopId: 'shop-03',
    merchantId: 'merchant-1003',
    merchantName: '青岛趣宠供应链有限公司',
    auditStatus: 'need_fix',
    mediaCompleteness: 73,
    updatedBy: '刘飞',
    complaintRate: 3.2,
    violationScore: 61,
    riskLevel: 'medium',
    riskScore: 67,
    lastReviewDecision: '驳回',
    lastReviewAt: '2026-03-02 11:18:10',
    reviewPriority: 'P1',
    slaMinutesLeft: 96,
    refundRate: 3.6,
  },
  {
    id: 'prod-1004',
    key: 'prod-1004',
    name: '智能猫砂盆净味款',
    category: '宠物生活/猫砂盆',
    price: 499,
    cost: 352,
    stock: 38,
    sales: 129,
    status: '库存紧张',
    listedAt: '2026-01-20 09:21:00',
    updatedAt: '2026-03-03 08:10:00',
    code: 'SPU40288',
    brand: '喵管家',
    image: 'https://picsum.photos/id/169/180/180',
    channel: '商城',
    shop: '喵管家旗舰店',
    shopId: 'shop-04',
    merchantId: 'merchant-1004',
    merchantName: '山东喵管家智能科技有限公司',
    auditStatus: 'approved',
    mediaCompleteness: 89,
    updatedBy: '赵宁',
    complaintRate: 1.9,
    violationScore: 35,
    riskLevel: 'medium',
    riskScore: 58,
    lastReviewDecision: '通过',
    lastReviewAt: '2026-02-16 10:00:12',
    reviewPriority: 'P2',
    slaMinutesLeft: 460,
    refundRate: 2.2,
  },
]

const productReviewTickets: MallProductReviewTicket[] = [
  {
    id: 'rv-1001',
    productId: 'prod-1001',
    productName: '猫爬架四层大型豪华款',
    merchantId: 'merchant-1001',
    merchantName: '山东京宝淘东有限公司',
    shopId: 'shop-01',
    shopName: '拼京宝旗舰店',
    status: 'submitted',
    priority: 'P0',
    riskTags: ['主图含夸大宣传词', '历史投诉率偏高', '类目资质即将到期'],
    riskScore: 86,
    slaMinutesLeft: 21,
    submittedAt: '2026-03-03 09:05:00',
    deadline: '2026-03-03 09:35:00',
    previousReviewId: 'rv-0944',
    reasonCodes: ['IMG_CLAIM_OVER', 'QUAL_EXPIRING'],
    requiredFixes: ['更换主图文案', '补充最新类目资质'],
    evidenceRequirements: ['类目资质原件扫描件', '品牌授权链路文件'],
    image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
    category: '宠物生活/猫玩具',
    brand: '亮牌(L&P)',
  },
  {
    id: 'rv-1002',
    productId: 'prod-1003',
    productName: '三层剑麻抓板组合',
    merchantId: 'merchant-1003',
    merchantName: '青岛趣宠供应链有限公司',
    shopId: 'shop-03',
    shopName: '趣宠工坊',
    status: 'need_fix',
    priority: 'P1',
    riskTags: ['授权书清晰度不足'],
    riskScore: 67,
    slaMinutesLeft: 96,
    submittedAt: '2026-03-02 10:10:00',
    deadline: '2026-03-02 12:10:00',
    rectifyTaskId: 'rectify-8012',
    reasonCodes: ['AUTH_DOC_BLUR'],
    requiredFixes: ['上传清晰品牌授权书'],
    evidenceRequirements: ['品牌授权书盖章页'],
    image: 'https://picsum.photos/id/433/260/200',
    category: '宠物生活/磨爪',
    brand: '趣宠工坊',
  },
  {
    id: 'rv-1003',
    productId: 'prod-1002',
    productName: '多功能宠物饮水器 3L',
    merchantId: 'merchant-1002',
    merchantName: '济南宠伴商贸有限公司',
    shopId: 'shop-02',
    shopName: '萌宠之家',
    status: 'approved',
    priority: 'P2',
    riskTags: [],
    riskScore: 36,
    slaMinutesLeft: 999,
    submittedAt: '2026-02-22 09:30:00',
    deadline: '2026-02-23 09:30:00',
    reasonCodes: [],
    requiredFixes: [],
    evidenceRequirements: [],
    image: 'https://picsum.photos/id/292/260/200',
    category: '宠物生活/喂养',
    brand: '萌宠家',
  },
]

const orderList: MallOrderGovernanceItem[] = [
  {
    id: 'DD202603011001',
    status: '待发货',
    orderTime: '2026-03-01 10:10:21',
    payTime: '2026-03-01 10:12:03',
    orderCode: '13288889999',
    quantity: 2,
    unitPrice: 134,
    paidAmount: 238,
    payMethod: '微信支付',
    receiver: '一卡通用户',
    phone: '13456789890',
    note: '急单，尽快发货',
    settlement: '未结算',
    buyerTier: '会员',
    region: '山东济南',
    warehouse: '济南历下仓',
    paymentChannel: '微信',
    slaDeadline: '2026-03-01 12:10:21',
    slaMinutesLeft: -35,
    estimatedProfit: 66,
    estimatedMargin: 27.73,
    packageCount: 2,
    latestLogisticsAt: '2026-03-01 11:40:00',
    riskFlags: ['超时风险', '售后冲突'],
    packages: [
      {
        packageId: 'PKG001',
        logisticsNo: 'YT341223889901',
        company: '圆通',
        status: '待揽收',
        lastNode: '电子面单已生成',
        latestLogisticsAt: '2026-03-01 11:40:00',
        abnormal: true,
      },
      {
        packageId: 'PKG002',
        logisticsNo: 'SF223001903393',
        company: '顺丰',
        status: '运输中',
        lastNode: '济南转运中心发出',
        latestLogisticsAt: '2026-03-01 15:26:00',
        abnormal: false,
      },
    ],
    items: [
      {
        skuId: 'SKU1001',
        name: '猫爬架四层大型豪华款',
        spec: '红色 / 22 / 大型',
        image: 'https://ceshimall.sdykt.com.cn/uploadfiles/img/goods/MT00000905/76a71e2c1bd244e2a655428660e69273.jpg',
        price: 118,
        qty: 1,
        spu: 'SPU108601',
      },
      {
        skuId: 'SKU1002',
        name: '剑麻猫抓柱',
        spec: '米色 / 加粗款',
        image: 'https://picsum.photos/id/433/120/120',
        price: 137,
        qty: 1,
        spu: 'SPU108602',
      },
    ],
    merchantId: 'merchant-1001',
    merchantName: '山东京宝淘东有限公司',
    shopId: 'shop-01',
    shopName: '拼京宝旗舰店',
    interventionStatus: 'intervention_open',
    riskSource: '发货SLA+投诉',
    complaintCount: 3,
    disputeFlag: true,
    merchantFulfillmentScore: 64,
    afterSale: true,
    refundAmount: 12,
    reason: '拍错颜色/想换款',
    logs: auditLogs,
  },
  {
    id: 'DD202603011102',
    status: '退款审核中',
    orderTime: '2026-03-01 13:19:33',
    payTime: '2026-03-01 13:20:14',
    orderCode: '13277778888',
    quantity: 1,
    unitPrice: 1229,
    paidAmount: 1199,
    payMethod: '支付宝',
    receiver: '李女士',
    phone: '18612340001',
    note: '',
    settlement: '未结算',
    buyerTier: 'VIP',
    region: '江苏南京',
    warehouse: '南京江宁仓',
    paymentChannel: '支付宝',
    slaDeadline: '2026-03-01 19:19:33',
    slaMinutesLeft: 40,
    estimatedProfit: 228,
    estimatedMargin: 19.02,
    packageCount: 1,
    latestLogisticsAt: '2026-03-01 18:40:00',
    riskFlags: ['高客单争议', '退款审核中'],
    packages: [
      {
        packageId: 'PKG003',
        logisticsNo: 'JD223903838393',
        company: '京东物流',
        status: '运输中',
        lastNode: '南京分拨中心揽收',
        latestLogisticsAt: '2026-03-01 18:40:00',
        abnormal: false,
      },
    ],
    items: [
      {
        skuId: 'SKU3301',
        name: '智能猫砂盆净味款',
        spec: '白色 / 标准版',
        image: 'https://picsum.photos/id/169/120/120',
        price: 1229,
        qty: 1,
        spu: 'SPU40288',
      },
    ],
    merchantId: 'merchant-1004',
    merchantName: '山东喵管家智能科技有限公司',
    shopId: 'shop-04',
    shopName: '喵管家旗舰店',
    interventionStatus: 'platform_decision',
    riskSource: '售后争议',
    complaintCount: 2,
    disputeFlag: true,
    merchantFulfillmentScore: 78,
    afterSale: true,
    refundAmount: 1199,
    reason: '噪音过大',
    logs: auditLogs,
  },
  {
    id: 'DD202603021889',
    status: '待收货',
    orderTime: '2026-03-02 09:22:12',
    payTime: '2026-03-02 09:24:19',
    orderCode: '13267777888',
    quantity: 1,
    unitPrice: 86,
    paidAmount: 86,
    payMethod: '微信支付',
    receiver: '王先生',
    phone: '13700112233',
    note: '',
    settlement: '已结算',
    buyerTier: '普通',
    region: '山东青岛',
    warehouse: '青岛李沧仓',
    paymentChannel: '微信',
    slaDeadline: '2026-03-02 15:22:12',
    slaMinutesLeft: 160,
    estimatedProfit: 28,
    estimatedMargin: 32.56,
    packageCount: 1,
    latestLogisticsAt: '2026-03-02 12:11:00',
    riskFlags: ['物流异常'],
    packages: [
      {
        packageId: 'PKG004',
        logisticsNo: 'ST3000129920',
        company: '申通',
        status: '异常',
        lastNode: '包裹滞留超过12小时',
        latestLogisticsAt: '2026-03-02 12:11:00',
        abnormal: true,
      },
    ],
    items: [
      {
        skuId: 'SKU8891',
        name: '多功能宠物饮水器 3L',
        spec: '蓝色 / 国标',
        image: 'https://picsum.photos/id/292/120/120',
        price: 86,
        qty: 1,
        spu: 'SPU20310',
      },
    ],
    merchantId: 'merchant-1002',
    merchantName: '济南宠伴商贸有限公司',
    shopId: 'shop-02',
    shopName: '萌宠之家',
    interventionStatus: 'merchant_processing',
    riskSource: '物流规则命中',
    complaintCount: 0,
    disputeFlag: false,
    merchantFulfillmentScore: 84,
    afterSale: false,
    refundAmount: 0,
    reason: '',
    logs: auditLogs,
  },
]

const interventionTickets: MallOrderInterventionTicket[] = [
  {
    id: 'iv-9001',
    orderId: 'DD202603011001',
    merchantId: 'merchant-1001',
    merchantName: '山东京宝淘东有限公司',
    status: 'intervention_open',
    triggerReason: '超时未发货 + 售后冲突',
    createdAt: '2026-03-01 13:10:00',
    deadline: '2026-03-01 15:10:00',
    collabTaskId: 'task-20260301-01',
    riskLevel: 'high',
  },
  {
    id: 'iv-9002',
    orderId: 'DD202603011102',
    merchantId: 'merchant-1004',
    merchantName: '山东喵管家智能科技有限公司',
    status: 'platform_decision',
    triggerReason: '高客单退款争议',
    createdAt: '2026-03-01 16:20:00',
    deadline: '2026-03-01 20:20:00',
    evidenceSubmittedAt: '2026-03-01 18:10:00',
    decision: '部分支持',
    liability: 'shared',
    financeImpact: -210,
    collabTaskId: 'task-20260301-02',
    riskLevel: 'medium',
  },
]

const collabTasks: MerchantRectifyTask[] = [
  {
    id: 'task-20260301-01',
    bizType: 'order',
    bizId: 'DD202603011001',
    rectifyTaskId: 'rectify-8001',
    merchantId: 'merchant-1001',
    merchantName: '山东京宝淘东有限公司',
    shopId: 'shop-01',
    shopName: '拼京宝旗舰店',
    status: 'processing',
    deadline: '2026-03-01 15:10:00',
    requiredFixes: ['回传真实发货单', '解释售后争议处理计划'],
    evidenceRequirements: ['面单照片', '仓库出库记录'],
    sourceSystem: 'mall-admin',
    sourceBizId: 'iv-9001',
    operatorId: 'ops-001',
    operateAt: '2026-03-01 13:12:00',
    traceId: 'trace-iv-9001',
  },
  {
    id: 'task-20260302-02',
    bizType: 'product',
    bizId: 'prod-1003',
    rectifyTaskId: 'rectify-8012',
    merchantId: 'merchant-1003',
    merchantName: '青岛趣宠供应链有限公司',
    shopId: 'shop-03',
    shopName: '趣宠工坊',
    status: 'overdue',
    deadline: '2026-03-02 18:00:00',
    requiredFixes: ['补充品牌授权书', '更换违规素材'],
    evidenceRequirements: ['授权链路盖章件', '新素材源文件'],
    sourceSystem: 'mall-admin',
    sourceBizId: 'rv-1002',
    operatorId: 'auditor-01',
    operateAt: '2026-03-02 12:02:00',
    traceId: 'trace-rv-1002',
  },
]

const governanceMessages: GovernanceMessage[] = [
  {
    id: 'msg-2001',
    templateKey: 'product_need_fix',
    title: '商品审核补件通知',
    type: '审核',
    bizNo: 'rv-1002',
    status: '未读',
    priority: '高',
    time: '2026-03-03 09:12:30',
    retry: 0,
    maxRetry: 3,
    content: '三层剑麻抓板组合需要补充品牌授权书与新版主图素材。',
    routePath: '/products/review',
    routeQuery: { ticketId: 'rv-1002', highlight: 'need_fix' },
  },
  {
    id: 'msg-2002',
    templateKey: 'export_failed',
    title: '商品审核导出失败',
    type: '导出中心',
    bizNo: 'EXP-1003',
    status: '失败',
    priority: '中',
    time: '2026-03-03 08:45:10',
    retry: 2,
    maxRetry: 3,
    content: '导出任务失败，原因：文件服务响应超时。',
    routePath: '/ops/downloads',
    routeQuery: { taskId: 'EXP-1003', highlight: '1' },
  },
]

const governanceExportTasks: GovernanceExportTask[] = [
  {
    id: 'EXP-1001',
    module: '商品审核池',
    owner: '审核员A',
    createdAt: '2026-03-03 09:10:00',
    expireAt: '2026-03-04 09:10:00',
    status: '已完成',
    taskType: 'review',
    bizNo: 'rv-1001',
  },
  {
    id: 'EXP-1002',
    module: '商品整改任务',
    owner: '审核员B',
    createdAt: '2026-03-03 09:22:00',
    expireAt: '-',
    status: '生成中',
    taskType: 'products',
    bizNo: 'task-20260302-02',
  },
  {
    id: 'EXP-1003',
    module: '高风险商品列表',
    owner: '平台运营A',
    createdAt: '2026-03-03 08:41:00',
    expireAt: '-',
    status: '失败',
    taskType: 'products',
    bizNo: 'risk-batch',
  },
]

const deepClone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

const reviewDecisionLabel: Record<ReviewDecisionPayload['decision'], '通过' | '驳回' | '补件'> = {
  approved: '通过',
  rejected: '驳回',
  need_fix: '补件',
}

const reviewStatusMap: Record<ReviewDecisionPayload['decision'], MallProductReviewTicket['status']> = {
  approved: 'approved',
  rejected: 'rejected',
  need_fix: 'need_fix',
}

const reviewMessageTemplate: Record<
  ReviewDecisionPayload['decision'],
  GovernanceMessage['templateKey']
> = {
  approved: 'product_approved',
  rejected: 'product_rejected',
  need_fix: 'product_need_fix',
}

const appendAuditLog = (partial: Omit<GovernanceAuditLog, 'id'>) => {
  auditLogs.unshift({
    id: `log-${idSeed()}`,
    ...partial,
  })
}

const appendGovernanceMessage = (payload: Omit<GovernanceMessage, 'id' | 'time'> & { time?: string }) => {
  governanceMessages.unshift({
    id: `msg-${idSeed()}`,
    time: payload.time ?? nowText(),
    ...payload,
  })
}

const closeRelatedProductTasks = (ticketId: string, productId: string) => {
  collabTasks.forEach((task) => {
    if (task.bizType === 'product' && (task.sourceBizId === ticketId || task.bizId === productId)) {
      task.status = 'closed'
      task.operateAt = nowText()
    }
  })
}

const upsertRectifyTask = (
  ticket: MallProductReviewTicket,
  payload: ReviewDecisionPayload,
  status: MerchantRectifyTask['status'],
) => {
  let task = collabTasks.find((item) => item.id === ticket.rectifyTaskId)
  if (!task) {
    const taskId = `task-${idSeed()}`
    task = {
      id: taskId,
      bizType: 'product',
      bizId: ticket.productId,
      rectifyTaskId: `rectify-${idSeed()}`,
      merchantId: ticket.merchantId,
      merchantName: ticket.merchantName,
      shopId: ticket.shopId,
      shopName: ticket.shopName,
      status,
      deadline: payload.deadline ?? ticket.deadline,
      requiredFixes: payload.requiredFixes,
      evidenceRequirements: payload.evidenceRequirements,
      sourceSystem: 'mall-admin',
      sourceBizId: ticket.id,
      operatorId: payload.operatorId,
      operateAt: payload.operateAt,
      traceId: payload.traceId ?? traceId(ticket.id),
    }
    collabTasks.unshift(task)
    ticket.rectifyTaskId = task.id
    return task
  }
  task.status = status
  task.deadline = payload.deadline ?? task.deadline
  task.requiredFixes = payload.requiredFixes.length ? payload.requiredFixes : task.requiredFixes
  task.evidenceRequirements = payload.evidenceRequirements.length ? payload.evidenceRequirements : task.evidenceRequirements
  task.operatorId = payload.operatorId
  task.operateAt = payload.operateAt
  task.traceId = payload.traceId ?? task.traceId
  return task
}

export const submitProductReviewDecision = (ticketId: string, payload: ReviewDecisionPayload) => {
  const ticket = productReviewTickets.find((item) => item.id === ticketId)
  if (!ticket) {
    throw new Error('审核单不存在')
  }
  if ((payload.decision === 'rejected' || payload.decision === 'need_fix') && payload.reasonCodes.length === 0) {
    throw new Error('驳回或补件结论必须选择原因编码')
  }
  if (payload.decision === 'need_fix') {
    if (!payload.deadline) throw new Error('补件结论必须设置截止时间')
    if (!payload.requiredFixes.length || !payload.evidenceRequirements.length) {
      throw new Error('补件结论必须填写整改要求和证据要求')
    }
  }

  const product = productList.find((item) => item.id === ticket.productId)
  const before = deepClone(ticket)

  ticket.status = reviewStatusMap[payload.decision]
  ticket.reasonCodes = [...payload.reasonCodes]
  ticket.requiredFixes = [...payload.requiredFixes]
  ticket.evidenceRequirements = [...payload.evidenceRequirements]
  ticket.deadline = payload.deadline ?? ticket.deadline
  ticket.reviewerId = payload.operatorId
  ticket.reviewerName = payload.operatorName
  ticket.reviewedAt = payload.operateAt

  if (product) {
    product.auditStatus = ticket.status
    product.lastReviewAt = payload.operateAt
    product.lastReviewDecision = reviewDecisionLabel[payload.decision]
    product.updatedAt = payload.operateAt
    product.updatedBy = payload.operatorName
    if (payload.decision === 'approved') {
      product.status = product.stock <= 100 ? '库存紧张' : '上架中'
    } else {
      product.status = '整改中'
    }
  }

  const taskStatus = payload.decision === 'approved' ? 'closed' : payload.decision === 'need_fix' ? 'pending' : 'overdue'
  if (payload.decision === 'approved') {
    closeRelatedProductTasks(ticket.id, ticket.productId)
  } else {
    upsertRectifyTask(ticket, payload, taskStatus)
  }

  appendGovernanceMessage({
    templateKey: reviewMessageTemplate[payload.decision],
    title:
      payload.decision === 'approved'
        ? '商品审核通过通知'
        : payload.decision === 'need_fix'
          ? '商品审核补件通知'
          : '商品审核驳回通知',
    type: '审核',
    bizNo: ticket.id,
    status: '未读',
    priority: ticket.priority === 'P0' ? '高' : ticket.priority === 'P1' ? '中' : '低',
    retry: 0,
    maxRetry: 3,
    content:
      payload.decision === 'approved'
        ? `${ticket.productName} 已通过平台审核。`
        : `${ticket.productName} 审核未通过，请按整改要求补充材料。`,
    routePath: '/products/review',
    routeQuery: { ticketId: ticket.id, highlight: payload.decision },
  })

  appendAuditLog({
    action: payload.decision === 'approved' ? '审核通过商品' : payload.decision === 'need_fix' ? '下发补件要求' : '驳回商品审核',
    actionType: 'review',
    operatorId: payload.operatorId,
    operatorName: payload.operatorName,
    operateAt: payload.operateAt,
    sourceSystem: payload.sourceSystem,
    sourceBizId: payload.sourceBizId ?? ticket.id,
    traceId: payload.traceId ?? traceId(ticket.id),
    before,
    after: deepClone(ticket),
    remark: payload.comment,
  })
}

export const markProductReviewResubmitted = (ticketId: string, operatorName = '商户运营提交') => {
  const ticket = productReviewTickets.find((item) => item.id === ticketId)
  if (!ticket) return
  const now = nowText()
  const previous = ticket.status
  ticket.previousReviewId = ticket.previousReviewId ?? ticket.id
  ticket.status = 'resubmitted'
  ticket.submittedAt = now
  ticket.slaMinutesLeft = 120
  ticket.reviewedAt = now
  const task = collabTasks.find((item) => item.id === ticket.rectifyTaskId)
  if (task) {
    task.status = 'submitted'
    task.operateAt = now
  }
  const product = productList.find((item) => item.id === ticket.productId)
  if (product) {
    product.auditStatus = 'resubmitted'
    product.status = '待审核'
    product.lastReviewDecision = '复审中'
    product.updatedAt = now
    product.updatedBy = operatorName
    product.slaMinutesLeft = 120
  }
  appendGovernanceMessage({
    templateKey: 'product_reapproved',
    title: '商品已重提待审',
    type: '审核',
    bizNo: ticket.id,
    status: '未读',
    priority: ticket.priority === 'P0' ? '高' : '中',
    retry: 0,
    maxRetry: 3,
    content: `${ticket.productName} 已补件并重提审核，请优先处理。`,
    routePath: '/products/review',
    routeQuery: { ticketId: ticket.id, highlight: 'resubmitted' },
  })
  appendAuditLog({
    action: '商户重提审核',
    actionType: 'sync',
    operatorId: ticket.merchantId,
    operatorName,
    operateAt: now,
    sourceSystem: 'merchant-admin',
    sourceBizId: ticket.id,
    traceId: traceId(ticket.id),
    before: { status: previous },
    after: { status: ticket.status },
    remark: `整改任务 ${ticket.rectifyTaskId ?? '-'} 已回传`,
  })
}

export const transferProductReviewToRecheck = (ticketId: string, operatorId = 'auditor-ops', operatorName = '平台审核员') => {
  const ticket = productReviewTickets.find((item) => item.id === ticketId)
  if (!ticket) return
  const now = nowText()
  const beforeStatus = ticket.status
  ticket.status = 'in_review'
  ticket.reviewedAt = now
  ticket.reviewerId = operatorId
  ticket.reviewerName = operatorName
  ticket.slaMinutesLeft = ticket.priority === 'P0' ? 30 : ticket.priority === 'P1' ? 120 : 24 * 60
  const product = productList.find((item) => item.id === ticket.productId)
  if (product) {
    product.auditStatus = 'in_review'
    product.status = '待审核'
    product.lastReviewDecision = '复审中'
    product.updatedAt = now
    product.updatedBy = operatorName
    product.slaMinutesLeft = ticket.slaMinutesLeft
  }
  appendAuditLog({
    action: '转入复审队列',
    actionType: 'review',
    operatorId,
    operatorName,
    operateAt: now,
    sourceSystem: 'mall-admin',
    sourceBizId: ticket.id,
    traceId: traceId(ticket.id),
    before: { status: beforeStatus },
    after: { status: ticket.status },
  })
}

export const claimProductReviewTickets = (ticketIds: string[], operatorId: string, operatorName: string) => {
  const now = nowText()
  ticketIds.forEach((ticketId) => {
    const ticket = productReviewTickets.find((item) => item.id === ticketId)
    if (!ticket) return
    ticket.reviewerId = operatorId
    ticket.reviewerName = operatorName
    if (ticket.status === 'submitted' || ticket.status === 'resubmitted') {
      ticket.status = 'in_review'
    }
    ticket.reviewedAt = now
  })
}

export const createGovernanceExportTask = (module: string, owner: string, taskType: GovernanceExportTask['taskType'], bizNo: string) => {
  const id = `EXP-${idSeed().slice(0, 6).toUpperCase()}`
  governanceExportTasks.unshift({
    id,
    module,
    owner,
    createdAt: nowText(),
    expireAt: '-',
    status: '排队中',
    taskType,
    bizNo,
  })
  appendGovernanceMessage({
    templateKey: 'export_done',
    title: '导出任务已加入队列',
    type: '导出中心',
    bizNo: id,
    status: '未读',
    priority: '低',
    retry: 0,
    maxRetry: 3,
    content: `导出任务 ${id} 已创建，请在下载中心查看处理进度。`,
    routePath: '/ops/downloads',
    routeQuery: { taskId: id, highlight: '1' },
  })
  return id
}

export const updateGovernanceExportTaskStatus = (taskId: string, status: GovernanceExportTask['status']) => {
  const task = governanceExportTasks.find((item) => item.id === taskId)
  if (!task) return
  task.status = status
  if (status === '已完成') {
    task.expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
  }
}

export const markGovernanceMessageRead = (id: string) => {
  const row = governanceMessages.find((item) => item.id === id)
  if (!row || row.status === '失败') return
  row.status = '已读'
}

export const retryGovernanceMessage = (id: string) => {
  const row = governanceMessages.find((item) => item.id === id)
  if (!row || row.retry >= row.maxRetry) return false
  row.retry += 1
  row.status = '已读'
  row.time = nowText()
  return true
}

export const getMallProductList = () =>
  deepClone(productList).sort((a, b) => computeProductGovernanceSortScore(b) - computeProductGovernanceSortScore(a))

export const getMallProductReviewTickets = () => deepClone(productReviewTickets)

export const getMallProductById = (id: string) => deepClone(productList.find((item) => item.id === id) ?? null)

export const getMallOrders = () =>
  deepClone(orderList).sort((a, b) => computeOrderGovernancePriorityScore(b) - computeOrderGovernancePriorityScore(a))

export const getMallOrderById = (id: string) => deepClone(orderList.find((item) => item.id === id) ?? null)

export const getInterventionTickets = () => deepClone(interventionTickets)

export const getMerchantCollabTasks = () => deepClone(collabTasks)

export const getGovernanceAuditLogs = () => deepClone(auditLogs)

export const getGovernanceMessages = () => deepClone(governanceMessages)

export const getGovernanceExportTasks = () => deepClone(governanceExportTasks)

const brandList: BrandItem[] = [
  {
    id: 'b-1001',
    name: '亮牌',
    enName: 'L&P',
    logo: 'https://picsum.photos/id/1025/120/120',
    company: '亮牌(中国)有限公司',
    level: 'top',
    status: 'active',
    merchantCount: 124,
    createdAt: '2023-01-12 10:00:00',
  },
  {
    id: 'b-1002',
    name: '萌宠家',
    enName: 'MengChong',
    logo: 'https://picsum.photos/id/1062/120/120',
    company: '萌宠家(深圳)科技有限公司',
    level: 'normal',
    status: 'active',
    merchantCount: 35,
    createdAt: '2024-05-20 14:30:00',
  },
  {
    id: 'b-1003',
    name: '山寨宝',
    enName: '',
    logo: 'https://picsum.photos/id/237/120/120',
    company: '不明注册地控股',
    level: 'risk',
    status: 'inactive',
    merchantCount: 3,
    createdAt: '2025-11-11 09:12:00',
  },
  {
    id: 'b-1004',
    name: '喵管家',
    enName: 'MeowKeeper',
    logo: 'https://picsum.photos/id/40/120/120',
    company: '山东喵管家智能科技有限公司',
    level: 'normal',
    status: 'active',
    merchantCount: 1,
    createdAt: '2026-01-10 08:00:00',
  },
]

const categoryTree: CategoryItem[] = [
  {
    id: 'cat-1',
    parentId: null,
    name: '宠物生活',
    level: 1,
    hasChildren: true,
    commissionRate: 5.0,
    requireCert: false,
    depositAmount: 10000,
    status: 'active',
    children: [
      {
        id: 'cat-1-1',
        parentId: 'cat-1',
        name: '宠物干粮',
        level: 2,
        hasChildren: true,
        commissionRate: 3.5,
        requireCert: true,
        depositAmount: 50000,
        status: 'active',
        children: [
          {
            id: 'cat-1-1-1',
            parentId: 'cat-1-1',
            name: '猫粮',
            level: 3,
            hasChildren: false,
            commissionRate: 3.5,
            requireCert: true,
            depositAmount: 50000,
            status: 'active',
          },
          {
            id: 'cat-1-1-2',
            parentId: 'cat-1-1',
            name: '狗粮',
            level: 3,
            hasChildren: false,
            commissionRate: 3.5,
            requireCert: true,
            depositAmount: 50000,
            status: 'active',
          },
        ],
      },
      {
        id: 'cat-1-2',
        parentId: 'cat-1',
        name: '宠物玩具',
        level: 2,
        hasChildren: true,
        commissionRate: 8.0,
        requireCert: false,
        depositAmount: 5000,
        status: 'active',
        children: [
          {
            id: 'cat-1-2-1',
            parentId: 'cat-1-2',
            name: '猫玩具',
            level: 3,
            hasChildren: false,
            commissionRate: 8.0,
            requireCert: false,
            depositAmount: 5000,
            status: 'active',
          },
        ],
      },
      {
        id: 'cat-1-3',
        parentId: 'cat-1',
        name: '医药保健 (禁入)',
        level: 2,
        hasChildren: false,
        commissionRate: 15.0,
        requireCert: true,
        depositAmount: 200000,
        status: 'disabled',
      },
    ],
  },
  {
    id: 'cat-2',
    parentId: null,
    name: '家用电器',
    level: 1,
    hasChildren: true,
    commissionRate: 6.0,
    requireCert: true,
    depositAmount: 30000,
    status: 'active',
    children: [
      {
        id: 'cat-2-1',
        parentId: 'cat-2',
        name: '生活电器',
        level: 2,
        hasChildren: false,
        commissionRate: 6.0,
        requireCert: true,
        depositAmount: 30000,
        status: 'active',
      },
    ],
  },
]

export const getBrandList = () => deepClone(brandList)
export const getCategoryTree = () => deepClone(categoryTree)

export const upsertGovernanceBrand = (payload: Partial<BrandItem> & { name: string; company: string }) => {
  if (payload.id) {
    const existing = brandList.find(b => b.id === payload.id)
    if (!existing) throw new Error('品牌不存在')
    Object.assign(existing, payload)
    return existing
  }
  const newBrand: BrandItem = {
    id: `b-${idSeed()}`,
    name: payload.name,
    enName: payload.enName || '',
    logo: payload.logo || 'https://picsum.photos/id/1025/120/120',
    company: payload.company,
    level: payload.level || 'normal',
    status: payload.status || 'active',
    merchantCount: 0,
    createdAt: nowText(),
  }
  brandList.unshift(newBrand)
  return newBrand
}

export const updateBrandRiskLevel = (brandId: string, isRisk: boolean) => {
  const brand = brandList.find(b => b.id === brandId)
  if (!brand) throw new Error('品牌不存在')
  if (brand.level === 'banned') throw new Error('封禁品牌无法直接变更风险状态')
  brand.level = isRisk ? 'risk' : 'normal'
  return brand
}

export const resolveBrandAuthorization = (brandId: string, decision: 'approve' | 'reject') => {
  const brand = brandList.find(b => b.id === brandId)
  if (!brand) throw new Error('品牌不存在')
  if (decision === 'approve') {
    brand.merchantCount += 1
  }
  return true
}

export const upsertGovernanceCategory = (
  payload: Partial<CategoryItem> & { name: string; level: number },
  parentId: string | null = null,
) => {
  if (payload.id) {
    const parent = parentId ? findCategoryNode(categoryTree, parentId) : null
    const list = parent ? parent.children! : categoryTree
    const target = list.find(c => c.id === payload.id)
    if (!target) throw new Error('类目不存在')
    Object.assign(target, payload)
    return target
  }

  const newNode: CategoryItem = {
    id: `cat-${idSeed()}`,
    parentId,
    name: payload.name,
    level: payload.level,
    hasChildren: false,
    commissionRate: payload.commissionRate ?? 0,
    requireCert: payload.requireCert ?? false,
    depositAmount: payload.depositAmount ?? 0,
    status: payload.status || 'active',
  }

  if (parentId) {
    const parent = findCategoryNode(categoryTree, parentId)
    if (!parent) throw new Error('上级类目不存在')
    if (!parent.children) parent.children = []
    parent.children.push(newNode)
    parent.hasChildren = true
  } else {
    categoryTree.push(newNode)
  }
  return newNode
}

const findCategoryNode = (nodes: CategoryItem[], id: string): CategoryItem | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findCategoryNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

export const toggleCategoryStatus = (categoryId: string, cascade: boolean = false) => {
  const node = findCategoryNode(categoryTree, categoryId)
  if (!node) throw new Error('类目不存在')
  const newStatus = node.status === 'active' ? 'disabled' : 'active'

  const setStatusDeep = (n: CategoryItem, status: 'active' | 'disabled') => {
    n.status = status
    if (n.children && cascade) {
      n.children.forEach(child => setStatusDeep(child, status))
    }
  }

  setStatusDeep(node, newStatus)
  return node
}
