import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getToken } from '../utils/auth'
import AdminLayout from '../layouts/AdminLayout.vue'
import ProductDetail from '../pages/products/ProductDetail.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/Login.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    component: AdminLayout,
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('../pages/Dashboard.vue'), meta: { title: '仪表盘', key: 'dashboard', root: 'dashboard' } },
      { path: 'products/list', component: () => import('../pages/products/ProductList.vue'), meta: { title: '商品列表', key: 'products-list', root: 'products' } },
      { path: 'products/review', component: () => import('../pages/products/ProductReview.vue'), meta: { title: '商品审核', key: 'products-review', root: 'products' } },
      { path: 'products/detail', component: ProductDetail, meta: { title: '商品详情', key: 'products-detail', root: 'products' } },
      { path: 'products/brands', component: () => import('../pages/products/BrandGovernance.vue'), meta: { title: '品牌治理', key: 'products-brand', root: 'products' } },
      { path: 'products/categories', component: () => import('../pages/products/CategoryGovernance.vue'), meta: { title: '类目治理', key: 'products-category', root: 'products' } },

      { path: 'orders/list', component: () => import('../pages/orders/OrderList.vue'), meta: { title: '订单列表', key: 'orders-list', root: 'orders' } },
      { path: 'orders/exception', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '异常订单', subtitle: '聚合超时未发货、物流中断、多次投诉订单。' }, meta: { title: '异常订单', key: 'orders-exception', root: 'orders' } },
      { path: 'orders/dispute', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '争议订单', subtitle: '平台介入订单的判责、证据与协同记录。' }, meta: { title: '争议订单', key: 'orders-dispute', root: 'orders' } },
      { path: 'orders/detail', component: () => import('../pages/orders/OrderDetail.vue'), meta: { title: '订单详情', key: 'orders-detail', root: 'orders' } },

      { path: 'after-sales/list', component: () => import('../pages/aftersales/AfterSaleArbitration.vue'), meta: { title: '售后列表', key: 'after-sales-list', root: 'after-sales' } },
      { path: 'after-sales/arbitration', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '仲裁处理', subtitle: '按证据与规则进行平台仲裁，自动生成判责结论。' }, meta: { title: '仲裁处理', key: 'after-sales-arbitration', root: 'after-sales' } },
      { path: 'after-sales/proof', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '举证管理', subtitle: '管理商户和买家上传证据，支持时序回放。' }, meta: { title: '举证管理', key: 'after-sales-proof', root: 'after-sales' } },
      { path: 'after-sales/liability', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '判责记录', subtitle: '沉淀平台判责案例，支持策略复盘。' }, meta: { title: '判责记录', key: 'after-sales-liability', root: 'after-sales' } },

      { path: 'shipping/monitor', component: () => import('../pages/shipping/ShippingLogistics.vue'), meta: { title: '发货监控', key: 'shipping-monitor', root: 'shipping' } },
      { path: 'shipping/fee', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '运费模板治理', subtitle: '审核商户运费模板、限制区域和计价规则。' }, meta: { title: '运费模板治理', key: 'shipping-fee', root: 'shipping' } },
      { path: 'shipping/exception', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '物流异常池', subtitle: '聚合揽收超时、轨迹停滞、拒收退回等异常包裹。' }, meta: { title: '物流异常池', key: 'shipping-exception', root: 'shipping' } },

      { path: 'merchant/list', component: () => import('../pages/merchant/MerchantCollab.vue'), meta: { title: '商户列表', key: 'merchant-list', root: 'merchant' } },
      { path: 'merchant/detail', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '商户详情', subtitle: '商户评级、处罚历史、整改效率、履约画像。' }, meta: { title: '商户详情', key: 'merchant-detail', root: 'merchant' } },
      { path: 'merchant/rectify', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '整改任务', subtitle: '平台下发整改任务并跟踪商户回传证据。' }, meta: { title: '整改任务', key: 'merchant-rectify', root: 'merchant' } },
      { path: 'merchant/messages', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '消息联动记录', subtitle: '审核/仲裁/异常动作触发站内信与回执统计。' }, meta: { title: '消息联动记录', key: 'merchant-message', root: 'merchant' } },

      { path: 'finance/settlement', component: () => import('../pages/finance/SettlementCenter.vue'), meta: { title: '结算单', key: 'finance-settlement', root: 'finance' } },
      { path: 'finance/detail', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '结算明细', subtitle: '按订单维度查看结算拆分、调账、税额。' }, meta: { title: '结算明细', key: 'finance-detail', root: 'finance' } },
      { path: 'finance/invoice', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '发票管理', subtitle: '发票申请审核、上传、回执和异常处理。' }, meta: { title: '发票管理', key: 'finance-invoice', root: 'finance' } },
      { path: 'finance/reconciliation', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '对账中心', subtitle: '平台-商户-渠道三方对账与差异追踪。' }, meta: { title: '对账中心', key: 'finance-recon', root: 'finance' } },

      { path: 'marketing/activity', component: () => import('../pages/marketing/MarketingGovernance.vue'), meta: { title: '活动治理', key: 'marketing-activity', root: 'marketing' } },
      { path: 'marketing/coupons', component: () => import('../pages/marketing/CouponGovernance.vue'), meta: { title: '券池治理', key: 'marketing-coupon', root: 'marketing' } },
      { path: 'marketing/redemption', component: () => import('../pages/marketing/RedemptionMonitor.vue'), meta: { title: '核销监控', key: 'marketing-redemption', root: 'marketing' } },
      { path: 'marketing/roi', component: () => import('../pages/marketing/MarketingROI.vue'), meta: { title: 'ROI看板', key: 'marketing-roi', root: 'marketing' } },

      { path: 'risk/rules', component: () => import('../pages/risk/RiskCenter.vue'), meta: { title: '风险规则', key: 'risk-rules', root: 'risk' } },
      { path: 'risk/hits', component: () => import('../pages/risk/RiskHitRecords.vue'), meta: { title: '风险命中', key: 'risk-hits', root: 'risk' } },
      { path: 'risk/penalty', component: () => import('../pages/risk/PenaltyCenter.vue'), meta: { title: '处罚中心', key: 'risk-penalty', root: 'risk' } },
      { path: 'risk/appeal', component: () => import('../pages/risk/AppealCenter.vue'), meta: { title: '申诉中心', key: 'risk-appeal', root: 'risk' } },

      { path: 'ops/messages', component: () => import('../pages/ops/MessageCenter.vue'), meta: { title: '消息中心', key: 'ops-messages', root: 'ops' } },
      { path: 'ops/tasks', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '任务中心', subtitle: '聚合审核任务、协同任务、逾期工单。' }, meta: { title: '任务中心', key: 'ops-tasks', root: 'ops' } },
      { path: 'ops/downloads', component: () => import('../pages/ops/DownloadCenter.vue'), meta: { title: '下载中心', key: 'ops-downloads', root: 'ops' } },
      { path: 'ops/logs', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '操作日志', subtitle: '平台关键动作全量审计追踪。' }, meta: { title: '操作日志', key: 'ops-logs', root: 'ops' } },

      { path: 'system/roles', component: () => import('../pages/system/SystemSettings.vue'), meta: { title: '角色权限', key: 'system-role', root: 'system' } },
      { path: 'system/assets', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '资源管理', subtitle: '图片/视频素材、分类、审计。' }, meta: { title: '资源管理', key: 'system-assets', root: 'system' } },
      { path: 'system/params', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '参数配置', subtitle: '平台参数、阈值和业务开关。' }, meta: { title: '参数配置', key: 'system-param', root: 'system' } },
      { path: 'system/dicts', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '字典配置', subtitle: '状态字典、类目字典、映射管理。' }, meta: { title: '字典配置', key: 'system-dict', root: 'system' } },

      { path: 'open/webhook', component: () => import('../pages/open/OpenPlatform.vue'), meta: { title: 'Webhook', key: 'open-webhook', root: 'open' } },
      { path: 'open/apikey', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: 'API Key', subtitle: '开放 API 凭证、白名单与调用限流。' }, meta: { title: 'API Key', key: 'open-apikey', root: 'open' } },
      { path: 'open/integration', component: () => import('../pages/common/ModulePlaceholder.vue'), props: { title: '第三方 ERP/WMS', subtitle: '第三方系统对接状态、回调日志、告警。' }, meta: { title: 'ERP/WMS 对接', key: 'open-integration', root: 'open' } },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const DYNAMIC_IMPORT_RELOAD_GUARD = '__mall_admin_dynamic_import_reload__'

router.onError((error) => {
  const text = String(error)
  if (!text.includes('Failed to fetch dynamically imported module')) return
  const hasReloaded = sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_GUARD) === '1'
  if (hasReloaded) return
  sessionStorage.setItem(DYNAMIC_IMPORT_RELOAD_GUARD, '1')
  window.location.reload()
})

router.beforeEach((to, _from, next) => {
  if (sessionStorage.getItem(DYNAMIC_IMPORT_RELOAD_GUARD) === '1') {
    sessionStorage.removeItem(DYNAMIC_IMPORT_RELOAD_GUARD)
  }
  document.title = `${(to.meta.title as string) || '商城管理后台'} - 商城管理后台`
  if (!to.meta.requiresAuth) {
    next()
    return
  }
  if (!getToken()) {
    next('/login')
    return
  }
  next()
})

export default router
