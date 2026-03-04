import type {
  CollabEfficiencyPoint,
  DashboardExportNotice,
  GovernanceHealthScore,
  GovernanceKpiCard,
  GovernanceTodo,
  HighRiskFeedItem,
  ReviewFunnelNode,
  RiskSourceStackPoint,
  SlaTrendPoint,
} from '../types/dashboard'
import type { ReviewDecisionPayload, ReviewQueueFilter, ReviewSlaPolicy } from '../types/product-governance'

export type ApiResp<T> = {
  code: number
  message: string
  data: T
}

export type PageResult<T> = {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export type {
  GovernanceAuditLog,
  MallOrderGovernanceItem,
  MallOrderInterventionTicket,
  MallProductGovernanceItem,
  MallProductReviewTicket,
  MerchantRectifyTask,
  OrderInterventionStatus,
  ProductReviewStatus,
} from '../types/governance'

export type {
  CollabEfficiencyPoint,
  DashboardExportNotice,
  GovernanceHealthScore,
  GovernanceKpiCard,
  GovernanceTodo,
  HighRiskFeedItem,
  ReviewFunnelNode,
  RiskSourceStackPoint,
  SlaTrendPoint,
} from '../types/dashboard'

export type MallProductReviewDecisionPayload = ReviewDecisionPayload

export type MallReviewQueueFilter = ReviewQueueFilter

export type MallReviewSlaPolicy = ReviewSlaPolicy

export type MallOrderInterventionPayload = {
  triggerReason: string
  riskSource: string
  deadline: string
  sourceSystem: 'mall-admin'
  sourceBizId: string
  operatorId: string
  operateAt: string
  traceId: string
}

export type ExportTask = {
  id: string
  module: string
  status: 'queued' | 'processing' | 'done' | 'failed' | 'expired'
  createdAt: string
  expireAt?: string
}

export type DashboardOverviewResp = {
  kpis: GovernanceKpiCard[]
  health: GovernanceHealthScore
}

export type DashboardChartsResp = {
  slaTrend: SlaTrendPoint[]
  reviewFunnel: ReviewFunnelNode[]
  riskSource: RiskSourceStackPoint[]
  collabEfficiency: CollabEfficiencyPoint[]
}

export type DashboardDataResp = {
  overview: DashboardOverviewResp
  todos: GovernanceTodo[]
  charts: DashboardChartsResp
  highRiskFeed: HighRiskFeedItem[]
  exportNotice: DashboardExportNotice
}
