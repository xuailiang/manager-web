import type { ProductReviewStatus, ReviewPriority } from './governance'

export type ReviewDecision = 'approved' | 'rejected' | 'need_fix'

export type ReviewDecisionPayload = {
  decision: ReviewDecision
  reasonCodes: string[]
  requiredFixes: string[]
  evidenceRequirements: string[]
  deadline?: string
  comment: string
  operatorId: string
  operatorName: string
  operateAt: string
  sourceSystem: 'mall-admin'
  sourceBizId?: string
  traceId?: string
}

export type ReviewQueueFilter = {
  keyword?: string
  status?: ProductReviewStatus | 'all'
  priority?: ReviewPriority | 'all'
  riskLevel?: 'high' | 'medium' | 'low' | 'all'
  merchantId?: string
  slaRange?: [number, number]
}

export type ReviewSlaPolicy = {
  priority: ReviewPriority
  minutes: number
  escalateLevel: 'high' | 'medium'
}
