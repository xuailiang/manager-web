export type RiskLevel = 'low' | 'medium' | 'high'

export type SignalCard = {
  key: string
  label: string
  value: string
  trend?: string
  level?: RiskLevel
  route?: string
}

export type ReviewStatus = '待审' | '补件中' | '复审中' | '已通过' | '已驳回'

export type GovernanceStatus = '正常' | '预警' | '高风险'
