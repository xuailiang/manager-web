import type { DashboardFilterState } from '../types/dashboard'

export type DashboardRouteTarget = {
  path: string
  query?: Record<string, string>
}

export const dashboardFilterRouteMap: Record<DashboardFilterState['riskKey'], DashboardRouteTarget> = {
  all: { path: '/dashboard' },
  pendingReview: { path: '/products/review', query: { status: 'submitted', from: 'dashboard' } },
  p0Overdue: { path: '/products/review', query: { priority: 'P0', overdue: '1', from: 'dashboard' } },
  shipTimeout: { path: '/orders/list', query: { risk: '超时风险', from: 'dashboard' } },
  arbitration: { path: '/after-sales/list', query: { status: '待审核', from: 'dashboard' } },
  collabOverdue: { path: '/merchant/list', query: { status: 'overdue', from: 'dashboard' } },
}

export const healthScoreColor = (score: number) => {
  if (score < 70) return '#ef4444'
  if (score < 85) return '#f59e0b'
  return '#10b981'
}

export const getSlaLabel = (minutes: number) => {
  if (minutes < 0) return `超时 ${Math.abs(minutes)} 分钟`
  if (minutes <= 30) return `剩余 ${minutes} 分钟`
  return `剩余 ${minutes} 分钟`
}

export const getPriorityTagColor = (priority: 'P0' | 'P1' | 'P2') => {
  if (priority === 'P0') return 'red'
  if (priority === 'P1') return 'orange'
  return 'blue'
}

