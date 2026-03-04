import type { PenaltyRecord, ReviewAppealTicket, RiskHitTicket, RiskRuleItem } from '../types/risk'

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj))
const idSeed = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
const nowText = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const riskRules: RiskRuleItem[] = [
    {
        id: 'r-101',
        name: '商品异地低价引流黑产检测',
        category: 'product',
        description: '通过识别突发的 1折 商品短时内异地集中下单。',
        threshold: 90,
        punishment: ['下线商品', '限制商户提现'],
        status: 'active',
        updatedAt: nowText(),
    },
    {
        id: 'r-102',
        name: '刷单炒信行为分析',
        category: 'merchant',
        description: '检测商品好评率上升但物流停滞的虚假好评行为。',
        threshold: 85,
        punishment: ['扣除信用分 12分', '全店降权 30 天'],
        status: 'active',
        updatedAt: '2026-02-14 10:00:00',
    },
    {
        id: 'r-103',
        name: '虚假发货/空包轨迹识别',
        category: 'shipping',
        description: '匹配网点揽收重量与实际购买商品重量差异极大的空包号。',
        threshold: 95,
        punishment: ['赔付买家', '冻结资金池'],
        status: 'evaluating',
        updatedAt: nowText(),
    },
]

const hitTickets: RiskHitTicket[] = [
    {
        id: 'rh-1001',
        sourceType: 'product',
        sourceId: 'PRD-IPHONE16-001 (iPhone 16 1折包邮)',
        riskLevel: 'high',
        hitRules: ['商品异地低价引流黑产检测'],
        status: 'pending',
        detectedAt: nowText(),
    },
    {
        id: 'rh-1002',
        sourceType: 'merchant',
        sourceId: 'MCH-09221 (华强北数码城专营)',
        riskLevel: 'medium',
        hitRules: ['刷单炒信行为分析'],
        status: 'punished',
        detectedAt: '2026-03-01 02:15:00',
    },
]

// 独立的处罚账本
const penalties: PenaltyRecord[] = [
    {
        id: 'pen-8001',
        targetId: 'MCH-09221',
        targetName: '华强北数码城专营',
        targetType: 'merchant',
        reason: '命中风控规则：刷单炒信行为分析',
        actions: ['扣除信用分 12分', '全店降权 30 天'],
        status: 'executing',
        issuedAt: '2026-03-01 09:00:00',
    },
    {
        id: 'pen-8002',
        targetId: 'PRD-88219',
        targetName: '某品牌高仿运动鞋',
        targetType: 'product',
        reason: '品牌侵权',
        actions: ['下线商品', '限制上新'],
        status: 'revoked',
        issuedAt: '2026-02-15 14:00:00',
    }
]

// 申诉工单池
const appeals: ReviewAppealTicket[] = [
    {
        id: 'ap-5001',
        penaltyId: 'pen-8001',
        merchantId: 'MCH-09221',
        merchantName: '华强北数码城专营',
        appealReason: '属于线下老客户复购扫码拍单，并非刷单。附物流底单。',
        proofLinks: ['img-1.png', 'img-2.png'],
        status: 'pending',
        submittedAt: '2026-03-02 11:30:00',
        deadline: '2026-03-09 11:30:00',
    }
]

// API: Rules
export const getRiskRules = () => deepClone(riskRules)
export const updateRuleConfig = (id: string, threshold: number, status: RiskRuleItem['status']) => {
    const rule = riskRules.find(r => r.id === id)
    if (!rule) throw new Error('规则不存在')
    rule.threshold = threshold
    rule.status = status
    rule.updatedAt = nowText()
    return rule
}

// API: Hit Tickets
export const getHitTickets = () => deepClone(hitTickets)
export const executeHitPenalty = (hitId: string, actions: string[]) => {
    const hit = hitTickets.find(h => h.id === hitId)
    if (!hit) throw new Error('风险工单不存在')
    if (hit.status !== 'pending') throw new Error('只能处理待处理状态的风控工单')

    hit.status = 'punished'
    const newPenalty: PenaltyRecord = {
        id: `pen-${idSeed()}`,
        targetId: hit.sourceId.split(' ')[0], // simple mock parse
        targetName: hit.sourceId,
        targetType: hit.sourceType === 'product' ? 'product' : 'merchant',
        reason: `命中风控规则：${hit.hitRules.join(',')}`,
        actions,
        status: 'executing',
        issuedAt: nowText(),
    }
    penalties.unshift(newPenalty)
    return newPenalty
}

// API: Penalty Center
export const getPenalties = () => deepClone(penalties)
export const revokePenalty = (penaltyId: string, isFromAppeal = false) => {
    const p = penalties.find(x => x.id === penaltyId)
    if (!p) throw new Error('罚单不存在')
    p.status = isFromAppeal ? 'appealed_revoked' : 'revoked'
    return p
}

// API: Appeal Center
export const getAppeals = () => deepClone(appeals)
export const resolveAppeal = (appealId: string, decision: 'approve' | 'reject' | 'need_info') => {
    const claim = appeals.find(a => a.id === appealId)
    if (!claim) throw new Error('申诉工单不存在')

    if (decision === 'approve') {
        claim.status = 'approved'
        // Cross-module logic: revoke the penalty if appeal succeeds
        try {
            revokePenalty(claim.penaltyId, true)
        } catch (e) {
            console.warn('联动撤销原罚单失败', e)
        }
    } else if (decision === 'reject') {
        claim.status = 'rejected'
    } else {
        claim.status = 'need_more_info'
    }
    return claim
}
