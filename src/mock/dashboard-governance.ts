import { getMallOrders, getMallProductReviewTickets, getMerchantCollabTasks } from './governance'
import type {
  CollabEfficiencyPoint,
  DashboardExportNotice,
  DashboardFilterState,
  GovernanceHealthScore,
  GovernanceKpiCard,
  GovernanceTodo,
  HighRiskFeedItem,
  ReviewFunnelNode,
  RiskSourceStackPoint,
  SlaTrendPoint,
} from '../types/dashboard'

const getKpis = (): GovernanceKpiCard[] => {
  const reviews = getMallProductReviewTickets()
  const orders = getMallOrders()
  const tasks = getMerchantCollabTasks()

  const pendingReview = reviews.filter((item) => item.status === 'submitted' || item.status === 'resubmitted').length
  const p0Overdue = reviews.filter((item) => item.priority === 'P0' && item.slaMinutesLeft <= 0).length
  const shipTimeout = orders.filter((item) => item.status === '待发货' && item.slaMinutesLeft <= 0).length
  const arbitration = orders.filter((item) => item.status === '退款审核中').length
  const collabOverdue = tasks.filter((item) => item.status === 'overdue').length
  const closedRate = Math.round((tasks.filter((item) => item.status === 'closed').length / Math.max(tasks.length, 1)) * 100)

  return [
    { key: 'pendingReview', label: '待审商品', value: pendingReview, trend: '较昨日 +6', level: 'medium', route: '/products/review?status=submitted&from=dashboard' },
    { key: 'p0Overdue', label: 'P0审核超时', value: p0Overdue, trend: '需立即处理', level: 'high', route: '/products/review?priority=P0&overdue=1&from=dashboard' },
    { key: 'shipTimeout', label: '超时未发货', value: shipTimeout, trend: '较昨日 +3', level: 'high', route: '/orders/list?risk=超时风险&from=dashboard' },
    { key: 'arbitration', label: '仲裁待处理', value: arbitration, trend: '较昨日 -1', level: 'medium', route: '/after-sales/list?status=待审核&from=dashboard' },
    { key: 'collabOverdue', label: '协同任务逾期', value: collabOverdue, trend: '较昨日 +1', level: 'high', route: '/merchant/list?status=overdue&from=dashboard' },
    { key: 'all', label: '今日闭环率', value: closedRate, trend: '协同任务闭环', level: 'low' },
  ]
}

const getTodos = (): GovernanceTodo[] => {
  const reviewTodos = getMallProductReviewTickets()
    .filter((item) => item.status === 'submitted' || item.status === 'resubmitted' || item.status === 'need_fix')
    .map<GovernanceTodo>((item) => ({
      id: `todo-${item.id}`,
      title: `${item.productName} 审核处理`,
      bizId: item.id,
      priority: item.priority,
      slaMinutesLeft: item.slaMinutesLeft,
      riskTags: item.riskTags.slice(0, 2),
      route: `/products/review?productId=${item.productId}&highlight=${item.id}&from=dashboard`,
    }))

  const orderTodos = getMallOrders()
    .filter((item) => item.slaMinutesLeft <= 30 || item.interventionStatus === 'intervention_open' || item.interventionStatus === 'overdue')
    .map<GovernanceTodo>((item) => ({
      id: `todo-${item.id}`,
      title: `订单 ${item.id} 平台介入`,
      bizId: item.id,
      priority: item.slaMinutesLeft <= 0 ? 'P0' : item.interventionStatus === 'intervention_open' ? 'P1' : 'P2',
      slaMinutesLeft: item.slaMinutesLeft,
      riskTags: item.riskFlags.slice(0, 2),
      route: `/orders/detail?id=${item.id}&highlight=${item.id}&from=dashboard`,
    }))

  return [...reviewTodos, ...orderTodos]
    .sort((a, b) => {
      const rank = { P0: 3, P1: 2, P2: 1 }
      const diff = rank[b.priority] - rank[a.priority]
      if (diff !== 0) return diff
      return a.slaMinutesLeft - b.slaMinutesLeft
    })
    .slice(0, 8)
}

const getHealthScore = (): GovernanceHealthScore => ({
  score: 82,
  reviewEfficiency: 88,
  fulfillmentOnTime: 79,
  arbitrationBacklog: 72,
  collabOverdueRate: 86,
})

const getSlaTrend = (): SlaTrendPoint[] => [
  { date: '02-25', riskOrders: 18, timeoutRate: 4.2 },
  { date: '02-26', riskOrders: 22, timeoutRate: 5.1 },
  { date: '02-27', riskOrders: 21, timeoutRate: 4.8 },
  { date: '02-28', riskOrders: 27, timeoutRate: 6.4 },
  { date: '03-01', riskOrders: 29, timeoutRate: 6.9 },
  { date: '03-02', riskOrders: 24, timeoutRate: 5.7 },
  { date: '03-03', riskOrders: 26, timeoutRate: 6.1 },
]

const getReviewFunnel = (): ReviewFunnelNode[] => [
  { stage: 'submitted', value: 168 },
  { stage: 'in_review', value: 128 },
  { stage: 'need_fix_rejected', value: 74 },
  { stage: 'resubmitted', value: 51 },
  { stage: 'approved', value: 39 },
]

const getRiskSource = (): RiskSourceStackPoint[] => {
  const dates = ['02-27', '02-28', '03-01', '03-02', '03-03']
  const rows: RiskSourceStackPoint[] = []
  const sourceMap: Array<RiskSourceStackPoint['source']> = ['商品合规', '履约', '售后', '财务', '风控规则']
  dates.forEach((date, index) => {
    sourceMap.forEach((source, sourceIndex) => {
      rows.push({
        date,
        source,
        count: Math.max(2, 6 + index * 2 + sourceIndex - (source === '财务' ? 3 : 0)),
      })
    })
  })
  return rows
}

const getCollabEfficiency = (): CollabEfficiencyPoint[] => {
  const tasks = getMerchantCollabTasks()
  return [
    { status: 'created', count: tasks.length + 8 },
    { status: 'processing', count: tasks.filter((item) => item.status === 'processing').length + 4 },
    { status: 'overdue', count: tasks.filter((item) => item.status === 'overdue').length },
    { status: 'closed', count: tasks.filter((item) => item.status === 'closed').length + 6 },
  ]
}

const getHighRiskFeed = (): HighRiskFeedItem[] => {
  const orderRows = getMallOrders().map<HighRiskFeedItem>((item) => ({
    id: `risk-order-${item.id}`,
    bizType: 'order',
    title: `订单 ${item.id} ${item.status}`,
    riskTags: item.riskFlags,
    slaMinutesLeft: item.slaMinutesLeft,
    merchantName: item.merchantName,
    route: `/orders/detail?id=${item.id}&from=dashboard`,
    highlight: item.id,
  }))
  const reviewRows = getMallProductReviewTickets().map<HighRiskFeedItem>((item) => ({
    id: `risk-product-${item.id}`,
    bizType: 'product',
    title: `${item.productName} 审核单 ${item.id}`,
    riskTags: item.riskTags,
    slaMinutesLeft: item.slaMinutesLeft,
    merchantName: item.merchantName,
    route: `/products/review?productId=${item.productId}&from=dashboard`,
    highlight: item.id,
  }))
  return [...orderRows, ...reviewRows]
    .sort((a, b) => a.slaMinutesLeft - b.slaMinutesLeft)
    .slice(0, 10)
}

const getExportNotice = (): DashboardExportNotice => ({
  exportDoneRate: 94,
  retryCount: 3,
  unreadCritical: 11,
  failedTasks: 2,
})

const filterFeed = (items: HighRiskFeedItem[], filter: DashboardFilterState['riskKey']) => {
  if (filter === 'all') return items
  if (filter === 'pendingReview') return items.filter((item) => item.bizType === 'product')
  if (filter === 'shipTimeout') return items.filter((item) => item.riskTags.some((tag) => tag.includes('超时')))
  if (filter === 'arbitration') return items.filter((item) => item.riskTags.some((tag) => tag.includes('退款') || tag.includes('争议')))
  if (filter === 'collabOverdue') return items.filter((item) => item.slaMinutesLeft <= 0)
  if (filter === 'p0Overdue') return items.filter((item) => item.slaMinutesLeft <= 0 && item.bizType === 'product')
  return items
}

export const getDashboardGovernanceData = (filter: DashboardFilterState['riskKey'] = 'all') => {
  const todos = getTodos()
  const matchedTodos = todos.filter((item) => {
    if (filter === 'all') return true
    if (filter === 'pendingReview') return item.route.includes('/products/review')
    if (filter === 'p0Overdue') return item.priority === 'P0' && item.slaMinutesLeft <= 0
    if (filter === 'shipTimeout') return item.riskTags.some((tag) => tag.includes('超时'))
    if (filter === 'arbitration') return item.riskTags.some((tag) => tag.includes('退款') || tag.includes('争议'))
    if (filter === 'collabOverdue') return item.slaMinutesLeft <= 0
    return true
  })
  return {
    kpis: getKpis(),
    todos: matchedTodos,
    health: getHealthScore(),
    slaTrend: getSlaTrend(),
    reviewFunnel: getReviewFunnel(),
    riskSource: getRiskSource(),
    collabEfficiency: getCollabEfficiency(),
    highRiskFeed: filterFeed(getHighRiskFeed(), filter),
    exportNotice: getExportNotice(),
  }
}
