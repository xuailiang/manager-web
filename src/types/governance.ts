export type RiskLevel = 'low' | 'medium' | 'high'

export type ReviewPriority = 'P0' | 'P1' | 'P2'

export type ProductReviewStatus =
  | 'submitted'
  | 'in_review'
  | 'approved'
  | 'rejected'
  | 'need_fix'
  | 'resubmitted'

export interface BrandItem {
  id: string
  name: string
  enName?: string
  logo: string
  company: string
  level: 'top' | 'normal' | 'risk' | 'banned'
  status: 'active' | 'inactive'
  merchantCount: number
  createdAt: string
}

export interface CategoryItem {
  id: string
  parentId: string | null
  name: string
  level: number
  hasChildren: boolean
  commissionRate: number
  requireCert: boolean
  depositAmount: number
  status: 'active' | 'disabled'
  children?: CategoryItem[]
}

export type OrderInterventionStatus =
  | 'normal'
  | 'risk_detected'
  | 'intervention_open'
  | 'merchant_processing'
  | 'evidence_submitted'
  | 'platform_decision'
  | 'closed'
  | 'overdue'

export type GovernanceAuditLog = {
  id: string
  action: string
  actionType: 'review' | 'risk' | 'intervention' | 'message' | 'sync' | 'system'
  operatorId: string
  operatorName: string
  operateAt: string
  sourceSystem: 'mall-admin' | 'merchant-admin' | 'risk-engine' | 'system'
  sourceBizId: string
  traceId: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  remark?: string
}

export type GovernanceMessage = {
  id: string
  templateKey: 'product_approved' | 'product_need_fix' | 'product_rejected' | 'product_reapproved' | 'export_done' | 'export_failed'
  title: string
  type: '审核' | '导出中心' | '商户协同' | '系统'
  bizNo: string
  status: '未读' | '已读' | '失败'
  priority: '高' | '中' | '低'
  time: string
  retry: number
  maxRetry: number
  content: string
  routePath?: string
  routeQuery?: Record<string, string>
}

export type GovernanceExportTask = {
  id: string
  module: string
  owner: string
  createdAt: string
  expireAt: string
  status: '排队中' | '生成中' | '已完成' | '失败' | '已过期'
  taskType: 'review' | 'orders' | 'products'
  bizNo: string
}

export type MerchantRectifyTask = {
  id: string
  bizType: 'product' | 'order'
  bizId: string
  rectifyTaskId: string
  merchantId: string
  merchantName: string
  shopId: string
  shopName: string
  status: 'pending' | 'processing' | 'submitted' | 'overdue' | 'closed'
  deadline: string
  requiredFixes: string[]
  evidenceRequirements: string[]
  sourceSystem: 'mall-admin'
  sourceBizId: string
  operatorId: string
  operateAt: string
  traceId: string
}

export type MallProductGovernanceItem = {
  id: string
  key: string
  name: string
  category: string
  price: number
  cost: number
  stock: number
  sales: number
  status: '上架中' | '库存紧张' | '待审核' | '已下架' | '整改中'
  listedAt: string
  updatedAt: string
  code: string
  brand: string
  image: string
  channel: string
  shop: string
  shopId: string
  merchantId: string
  merchantName: string
  auditStatus: ProductReviewStatus
  mediaCompleteness: number
  updatedBy: string
  complaintRate: number
  violationScore: number
  riskLevel: RiskLevel
  riskScore: number
  lastReviewDecision: '通过' | '驳回' | '补件' | '复审中' | '待审核'
  lastReviewAt: string
  reviewPriority: ReviewPriority
  slaMinutesLeft: number
  refundRate: number
}

export type MallProductReviewTicket = {
  id: string
  productId: string
  productName: string
  merchantId: string
  merchantName: string
  shopId: string
  shopName: string
  status: ProductReviewStatus
  priority: ReviewPriority
  riskTags: string[]
  riskScore: number
  slaMinutesLeft: number
  submittedAt: string
  deadline: string
  previousReviewId?: string
  rectifyTaskId?: string
  reasonCodes: string[]
  requiredFixes: string[]
  evidenceRequirements: string[]
  image: string
  category: string
  brand: string
  reviewerId?: string
  reviewerName?: string
  reviewedAt?: string
}

export type OrderPackageItem = {
  packageId: string
  logisticsNo: string
  company: string
  status: '待揽收' | '运输中' | '派送中' | '已签收' | '异常'
  lastNode: string
  latestLogisticsAt: string
  abnormal: boolean
}

export type OrderSkuItem = {
  skuId: string
  name: string
  spec: string
  image: string
  price: number
  qty: number
  spu: string
}

export type MallOrderGovernanceItem = {
  id: string
  status: '待支付' | '待发货' | '待收货' | '交易完成' | '取消' | '退款审核中' | '退款完成' | '交易关闭'
  orderTime: string
  payTime: string
  orderCode: string
  quantity: number
  unitPrice: number
  paidAmount: number
  payMethod: string
  receiver: string
  phone: string
  note: string
  settlement: '已结算' | '未结算'
  buyerTier: '普通' | '会员' | 'VIP'
  region: string
  warehouse: string
  paymentChannel: string
  slaDeadline: string
  slaMinutesLeft: number
  estimatedProfit: number
  estimatedMargin: number
  packageCount: number
  latestLogisticsAt: string
  riskFlags: string[]
  packages: OrderPackageItem[]
  items: OrderSkuItem[]
  merchantId: string
  merchantName: string
  shopId: string
  shopName: string
  interventionStatus: OrderInterventionStatus
  riskSource: string
  complaintCount: number
  disputeFlag: boolean
  merchantFulfillmentScore: number
  afterSale: boolean
  refundAmount: number
  reason: string
  logs: GovernanceAuditLog[]
}

export type MallOrderInterventionTicket = {
  id: string
  orderId: string
  merchantId: string
  merchantName: string
  status: OrderInterventionStatus
  triggerReason: string
  createdAt: string
  deadline: string
  evidenceSubmittedAt?: string
  decision?: '支持买家' | '支持商户' | '部分支持'
  liability?: 'merchant' | 'platform' | 'buyer' | 'shared'
  financeImpact?: number
  collabTaskId?: string
  riskLevel: RiskLevel
}
