export interface RiskRuleItem {
    id: string
    name: string
    category: 'product' | 'merchant' | 'shipping' | 'marketing'
    description: string
    threshold: number // 阈值参数，如 90% 识别率
    punishment: string[]
    status: 'active' | 'evaluating' | 'disabled'
    updatedAt: string
}

export interface RiskHitTicket {
    id: string
    sourceType: 'product' | 'merchant' | 'order'
    sourceId: string // e.g., 产品名称或商户名关联
    riskLevel: 'high' | 'medium' | 'low'
    hitRules: string[]
    detectedAt: string
    status: 'pending' | 'punished' | 'ignored'
}

export interface PenaltyRecord {
    id: string
    targetId: string // entity ID
    targetName: string // entity name for display
    targetType: 'merchant' | 'product'
    reason: string
    actions: string[] // ex: ['商品下架', '冻结提现', '扣除信用分']
    issuedAt: string
    status: 'executing' | 'revoked' | 'appealed_revoked' | 'expired'
}

export interface ReviewAppealTicket {
    id: string
    penaltyId: string // 关联的罚单 ID
    merchantId: string
    merchantName: string
    appealReason: string
    proofLinks: string[] // 证据图片 URL
    submittedAt: string
    deadline: string
    status: 'pending' | 'need_more_info' | 'approved' | 'rejected'
}
