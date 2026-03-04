import { http } from './client'
import type {
  ApiResp,
  DashboardDataResp,
  DashboardOverviewResp,
  DashboardChartsResp,
  ExportTask,
  MallOrderGovernanceItem,
  MallOrderInterventionPayload,
  MallOrderInterventionTicket,
  MallProductGovernanceItem,
  MallProductReviewDecisionPayload,
  MallProductReviewTicket,
  MerchantRectifyTask,
  PageResult,
} from './types'

export const getDashboardOverview = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardOverviewResp>>('/dashboard/overview', { params })

export const getDashboardTodos = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardDataResp['todos']>>('/dashboard/todos', { params })

export const getDashboardSlaTrend = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardChartsResp['slaTrend']>>('/dashboard/charts/sla-trend', { params })

export const getDashboardReviewFunnel = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardChartsResp['reviewFunnel']>>('/dashboard/charts/review-funnel', { params })

export const getDashboardRiskSource = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardChartsResp['riskSource']>>('/dashboard/charts/risk-source', { params })

export const getDashboardHighRiskFeed = (params?: Record<string, unknown>) =>
  http.get<never, ApiResp<DashboardDataResp['highRiskFeed']>>('/dashboard/high-risk-feed', { params })

export const listProducts = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<MallProductGovernanceItem>>>('/products', { params })

export const listProductReviews = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<MallProductReviewTicket>>>('/product-reviews', { params })

export const approveProductReview = (id: string, payload: MallProductReviewDecisionPayload) =>
  http.post<never, ApiResp<null>>(`/product-reviews/${id}/approve`, payload)

export const rejectProductReview = (id: string, payload: MallProductReviewDecisionPayload) =>
  http.post<never, ApiResp<null>>(`/product-reviews/${id}/reject`, payload)

export const needFixProductReview = (id: string, payload: MallProductReviewDecisionPayload) =>
  http.post<never, ApiResp<null>>(`/product-reviews/${id}/need-fix`, payload)

export const resubmitProductReview = (id: string, payload: MallProductReviewDecisionPayload) =>
  http.post<never, ApiResp<null>>(`/product-reviews/${id}/resubmit`, payload)

export const listOrders = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<MallOrderGovernanceItem>>>('/orders', { params })

export const interveneOrder = (id: string, payload: MallOrderInterventionPayload) =>
  http.post<never, ApiResp<null>>(`/orders/${id}/intervene`, payload)

export const decideOrderIntervention = (id: string, payload: Record<string, unknown>) =>
  http.post<never, ApiResp<null>>(`/orders/${id}/decision`, payload)

export const createCollabTask = (payload: Record<string, unknown>) =>
  http.post<never, ApiResp<{ taskId: string }>>('/merchant-collab/tasks', payload)

export const getCollabTaskDetail = (id: string) =>
  http.get<never, ApiResp<MerchantRectifyTask>>(`/merchant-collab/tasks/${id}`)

export const closeCollabTask = (id: string, payload: Record<string, unknown>) =>
  http.post<never, ApiResp<null>>(`/merchant-collab/tasks/${id}/close`, payload)

export const listMessages = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<Record<string, unknown>>>>('/messages', { params })

export const sendTemplateMessage = (payload: Record<string, unknown>) =>
  http.post<never, ApiResp<null>>('/messages/send-template', payload)

export const listInterventionTickets = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<MallOrderInterventionTicket>>>('/orders/interventions', { params })

export const createExportTask = (payload: Record<string, unknown>) =>
  http.post<never, ApiResp<{ taskId: string }>>('/exports', payload)

export const listExportTasks = (params: Record<string, unknown>) =>
  http.get<never, ApiResp<PageResult<ExportTask>>>('/exports', { params })
