import type { CouponPoolItem, MarketingActivityItem, RedemptionAnomalyTicket, ROIMetrics } from '../types/marketing'

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))
const idSeed = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
const nowText = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const marketingActivities: MarketingActivityItem[] = [
    {
        id: 'act-101',
        name: '2026 春季宠物节大促',
        level: 'platform',
        timeRange: ['2026-03-01 00:00:00', '2026-03-31 23:59:59'],
        merchantCount: 1240,
        budget: 5000000,
        status: 'active',
        createdAt: '2026-02-15 10:00:00',
    },
    {
        id: 'act-102',
        name: '数码焕新周补贴专场',
        level: 'category',
        timeRange: ['2026-04-10 00:00:00', '2026-04-20 23:59:59'],
        merchantCount: 350,
        budget: 1200000,
        status: 'recruiting',
        createdAt: '2026-03-01 09:30:00',
    },
    {
        id: 'act-103',
        name: '春节不打烊',
        level: 'platform',
        timeRange: ['2026-01-20 00:00:00', '2026-02-10 23:59:59'],
        merchantCount: 5600,
        budget: 20000000,
        status: 'ended',
        createdAt: '2025-12-01 14:00:00',
    },
]

const couponPools: CouponPoolItem[] = [
    {
        id: 'cp-201',
        name: '春季宠粉满199减50',
        sponsor: 'platform',
        totalBudget: 1000000,
        issuedCount: 15420,
        redeemedCount: 8210,
        rules: { limitPerUser: 1, targetAudience: 'all' },
        status: 'issuing',
        createdAt: '2026-02-28 10:00:00',
    },
    {
        id: 'cp-202',
        name: '数码新粉专属无门槛10元',
        sponsor: 'merchant',
        totalBudget: 50000,
        issuedCount: 5000,
        redeemedCount: 4950,
        rules: { limitPerUser: 1, targetAudience: 'new_user' },
        status: 'depleted',
        createdAt: '2026-03-02 08:00:00',
    },
]

const anomalies: RedemptionAnomalyTicket[] = [
    {
        id: 'ra-301',
        orderNo: 'ORD-20260304-0001',
        anomalyTags: ['异地聚集核销', '同设备多账号'],
        riskScore: 98,
        userId: 'u-88912',
        merchantName: '华北数码专营店',
        status: 'intercepted',
        detectedAt: nowText(),
    },
    {
        id: 'ra-302',
        orderNo: 'ORD-20260304-0002',
        anomalyTags: ['高频领券并发'],
        riskScore: 85,
        userId: 'u-10234',
        merchantName: '萌宠生活源头店',
        status: 'pending',
        detectedAt: nowText(),
    },
]

const roiMetrics: ROIMetrics = {
    funnel: {
        exposure: 2500000,
        clicks: 450000,
        couponClaims: 120000,
        couponUses: 85000,
        paidOrders: 68000,
    },
    topMerchants: [
        { id: 'm-1', name: '官方自营旗舰店', gmv: 12500000, roi: 5.2 },
        { id: 'm-2', name: '萌宠甄选', gmv: 3400000, roi: 4.1 },
        { id: 'm-3', name: '极客数码', gmv: 2800000, roi: 3.8 },
    ],
    trends: [
        { date: '03-01', roi: 3.1, gmv: 1500000 },
        { date: '03-02', roi: 3.4, gmv: 1800000 },
        { date: '03-03', roi: 3.8, gmv: 2200000 },
        { date: '03-04', roi: 4.2, gmv: 3100000 },
    ]
}

// Activity APIS
export const getMarketingActivities = () => deepClone(marketingActivities)
export const upsertMarketingActivity = (payload: Partial<MarketingActivityItem>) => {
    if (payload.id) {
        const existing = marketingActivities.find(a => a.id === payload.id)
        if (!existing) throw new Error('活动不存在')
        Object.assign(existing, payload)
        return existing
    }
    const newItem: MarketingActivityItem = {
        id: `act-${idSeed()}`,
        name: payload.name!,
        level: payload.level || 'category',
        timeRange: payload.timeRange || [nowText(), nowText()],
        merchantCount: 0,
        budget: payload.budget || 0,
        status: 'recruiting',
        createdAt: nowText(),
    }
    marketingActivities.unshift(newItem)
    return newItem
}
export const toggleActivityStatus = (id: string, targetStatus: MarketingActivityItem['status']) => {
    const item = marketingActivities.find(a => a.id === id)
    if (!item) throw new Error('活动不存在')
    item.status = targetStatus
    return item
}

// Coupon APIs
export const getCouponPools = () => deepClone(couponPools)
export const freezeCouponPool = (id: string) => {
    const pool = couponPools.find(p => p.id === id)
    if (!pool) throw new Error('券池不存在')
    pool.status = 'paused'
    return pool
}

// Redemption Anomalies APIs
export const getRedemptionAnomalies = () => deepClone(anomalies)
export const resolveAnomaly = (id: string, action: 'intercept' | 'release') => {
    const ticket = anomalies.find(a => a.id === id)
    if (!ticket) throw new Error('风控单不存在')
    ticket.status = action === 'intercept' ? 'intercepted' : 'released'
    return ticket
}

// ROI APIs
export const getROIMetrics = () => deepClone(roiMetrics)
