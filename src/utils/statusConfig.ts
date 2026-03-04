import type {
  MallOrderGovernanceItem,
  MallProductGovernanceItem,
  ProductReviewStatus,
  ReviewPriority,
} from '../types/governance'

export type StatusMeta = {
  label: string
  color: string
}

export type ActionDef<T = unknown> = {
  key: string
  label: string
  danger?: boolean
  primary?: boolean
  when?: (record: T) => boolean
}

export const productStatusConfig: Record<MallProductGovernanceItem['status'], StatusMeta> = {
  上架中: { label: '上架中', color: 'green' },
  库存紧张: { label: '库存紧张', color: 'orange' },
  待审核: { label: '待审核', color: 'blue' },
  已下架: { label: '已下架', color: 'default' },
  整改中: { label: '整改中', color: 'volcano' },
}

export const productReviewStatusConfig: Record<ProductReviewStatus, StatusMeta> = {
  submitted: { label: '已提交', color: 'blue' },
  in_review: { label: '审核中', color: 'processing' },
  approved: { label: '审核通过', color: 'success' },
  rejected: { label: '已驳回', color: 'error' },
  need_fix: { label: '补件中', color: 'warning' },
  resubmitted: { label: '重提待审', color: 'purple' },
}

export const reviewPriorityColor: Record<ReviewPriority, string> = {
  P0: 'red',
  P1: 'orange',
  P2: 'blue',
}

export const productActionConfig: Record<string, ActionDef<MallProductGovernanceItem>> = {
  view: { key: 'view', label: '详情' },
  approve: { key: 'approve', label: '通过审核', primary: true },
  reject: { key: 'reject', label: '驳回', danger: true },
  needFix: { key: 'needFix', label: '要求补件' },
  resendReview: { key: 'resendReview', label: '转复审' },
  takeDown: { key: 'takeDown', label: '下架', danger: true },
  limitTraffic: { key: 'limitTraffic', label: '限制流量' },
  notifyRectify: { key: 'notifyRectify', label: '发整改通知' },
}

export const productStatusActions: Record<MallProductGovernanceItem['status'], string[]> = {
  待审核: ['approve', 'needFix', 'reject', 'view'],
  整改中: ['needFix', 'resendReview', 'view'],
  上架中: ['view', 'takeDown', 'limitTraffic', 'notifyRectify'],
  库存紧张: ['view', 'notifyRectify'],
  已下架: ['view', 'approve'],
}

export const orderStatusConfig: Record<MallOrderGovernanceItem['status'], StatusMeta> = {
  待支付: { label: '待支付', color: 'orange' },
  待发货: { label: '待发货', color: 'blue' },
  待收货: { label: '待收货', color: 'geekblue' },
  交易完成: { label: '交易完成', color: 'green' },
  取消: { label: '取消', color: 'default' },
  退款审核中: { label: '退款审核中', color: 'volcano' },
  退款完成: { label: '退款完成', color: 'purple' },
  交易关闭: { label: '交易关闭', color: 'default' },
}

export const interventionStatusConfig: Record<MallOrderGovernanceItem['interventionStatus'], StatusMeta> = {
  normal: { label: '正常', color: 'default' },
  risk_detected: { label: '风险识别', color: 'orange' },
  intervention_open: { label: '介入中', color: 'red' },
  merchant_processing: { label: '商户处理中', color: 'processing' },
  evidence_submitted: { label: '已提交证据', color: 'blue' },
  platform_decision: { label: '平台裁决中', color: 'purple' },
  closed: { label: '已关闭', color: 'success' },
  overdue: { label: '协同逾期', color: 'error' },
}

export const orderActionConfig: Record<string, ActionDef<MallOrderGovernanceItem>> = {
  detail: { key: 'detail', label: '详情', primary: true },
  urgeMerchant: { key: 'urgeMerchant', label: '催办商户' },
  intervene: { key: 'intervene', label: '平台介入', primary: true },
  arbitrate: { key: 'arbitrate', label: '发起仲裁' },
  createCollab: { key: 'createCollab', label: '生成协同任务' },
  sendNotice: { key: 'sendNotice', label: '发送站内信' },
  clearRisk: { key: 'clearRisk', label: '标记风险解除' },
}

export const orderStatusActions: Record<MallOrderGovernanceItem['status'], string[]> = {
  待支付: ['detail', 'sendNotice'],
  待发货: ['detail', 'urgeMerchant', 'intervene', 'createCollab'],
  待收货: ['detail', 'intervene', 'arbitrate'],
  交易完成: ['detail', 'clearRisk'],
  取消: ['detail'],
  退款审核中: ['detail', 'intervene', 'arbitrate', 'createCollab'],
  退款完成: ['detail', 'clearRisk'],
  交易关闭: ['detail'],
}

const riskOrderPriority: Record<string, number> = {
  超时风险: 100,
  退款审核中: 90,
  物流异常: 80,
  高客单争议: 70,
  售后冲突: 65,
}

const reviewPriorityWeight: Record<ReviewPriority, number> = {
  P0: 3,
  P1: 2,
  P2: 1,
}

export const reviewSlaPolicy: Record<ReviewPriority, number> = {
  P0: 30,
  P1: 120,
  P2: 24 * 60,
}

export const resolveReviewRiskLevel = (priority: ReviewPriority, slaMinutesLeft: number) => {
  const timeout = slaMinutesLeft <= 0
  if (priority === 'P0' || timeout) return 'high' as const
  if (priority === 'P1' || slaMinutesLeft <= 30) return 'medium' as const
  return 'low' as const
}

export const computeProductGovernanceSortScore = (item: MallProductGovernanceItem) => {
  const priorityScore = reviewPriorityWeight[item.reviewPriority] * 10000
  const slaScore = Math.max(0, 1440 - item.slaMinutesLeft) * 10
  const riskScore = item.riskScore * 5
  const submitAgePenalty = new Date(item.updatedAt).getTime() / 100000
  return priorityScore + slaScore + riskScore + submitAgePenalty
}

export const computeOrderGovernancePriorityScore = (item: MallOrderGovernanceItem) => {
  const riskScore = item.riskFlags.reduce((sum, flag) => sum + (riskOrderPriority[flag] ?? 20), 0)
  const slaScore = item.slaMinutesLeft <= 0 ? 100 : item.slaMinutesLeft <= 30 ? 70 : item.slaMinutesLeft <= 120 ? 40 : 10
  const disputeScore = item.disputeFlag ? 50 : 0
  const complaintScore = Math.min(item.complaintCount, 10) * 3
  return riskScore + slaScore + disputeScore + complaintScore
}
