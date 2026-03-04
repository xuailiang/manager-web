import type { MallProductGovernanceItem, ProductReviewStatus, RiskLevel } from './governance'

export type ProductFilterModel = {
  keyword: string
  status: 'all' | MallProductGovernanceItem['status']
  auditStatus: 'all' | ProductReviewStatus
  riskLevel: 'all' | RiskLevel
  merchantKeyword: string
  slaRange: [number, number]
  complaintRange: [number, number]
  violationRange: [number, number]
  mediaRange: [number, number]
  advancedOpen: boolean
}

export type ProductSummaryStats = {
  listed: number
  p0Timeout: number
  highRisk: number
  rectifying: number
  mediaPoor: number
  updatedToday: number
}

export type ProductViewPreset = 'default' | 'review-priority' | 'risk-first'
