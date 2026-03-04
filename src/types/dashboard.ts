export type DashboardFilterState = {
  riskKey: 'all' | 'pendingReview' | 'p0Overdue' | 'shipTimeout' | 'arbitration' | 'collabOverdue'
}

export type GovernanceKpiCard = {
  key: DashboardFilterState['riskKey']
  label: string
  value: number
  trend: string
  level: 'low' | 'medium' | 'high'
  route?: string
}

export type GovernanceTodo = {
  id: string
  title: string
  bizId: string
  priority: 'P0' | 'P1' | 'P2'
  slaMinutesLeft: number
  riskTags: string[]
  route: string
}

export type GovernanceHealthScore = {
  score: number
  reviewEfficiency: number
  fulfillmentOnTime: number
  arbitrationBacklog: number
  collabOverdueRate: number
}

export type SlaTrendPoint = {
  date: string
  riskOrders: number
  timeoutRate: number
}

export type ReviewFunnelNode = {
  stage: 'submitted' | 'in_review' | 'need_fix_rejected' | 'resubmitted' | 'approved'
  value: number
}

export type RiskSourceStackPoint = {
  date: string
  source: '商品合规' | '履约' | '售后' | '财务' | '风控规则'
  count: number
}

export type HighRiskFeedItem = {
  id: string
  bizType: 'order' | 'product'
  title: string
  riskTags: string[]
  slaMinutesLeft: number
  merchantName: string
  route: string
  highlight: string
}

export type DashboardExportNotice = {
  exportDoneRate: number
  retryCount: number
  unreadCritical: number
  failedTasks: number
}

export type CollabEfficiencyPoint = {
  status: 'created' | 'processing' | 'overdue' | 'closed'
  count: number
}

