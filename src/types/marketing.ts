export interface MarketingActivityItem {
    id: string
    name: string
    level: 'platform' | 'category' | 'merchant' // S级, A级, 自促
    timeRange: [string, string]
    merchantCount: number
    budget: number
    status: 'recruiting' | 'active' | 'ended' | 'offline'
    createdAt: string
}

export interface CouponPoolItem {
    id: string
    name: string
    sponsor: 'platform' | 'merchant' // 平台出资, 商户出资
    totalBudget: number
    issuedCount: number
    redeemedCount: number
    rules: {
        limitPerUser: number
        targetAudience: 'all' | 'new_user' | 'vip'
    }
    status: 'issuing' | 'paused' | 'depleted' | 'expired'
    createdAt: string
}

export interface RedemptionAnomalyTicket {
    id: string
    orderNo: string
    anomalyTags: string[]
    riskScore: number // 0 - 100
    userId: string
    merchantName: string
    status: 'pending' | 'intercepted' | 'released'
    detectedAt: string
}

export interface ROIMetrics {
    funnel: {
        exposure: number
        clicks: number
        couponClaims: number
        couponUses: number
        paidOrders: number
    }
    topMerchants: {
        id: string
        name: string
        gmv: number
        roi: number
    }[]
    trends: {
        date: string
        roi: number
        gmv: number
    }[]
}
