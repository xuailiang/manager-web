import type { Component } from 'vue'
import {
  DashboardOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  AuditOutlined,
  RocketOutlined,
  TeamOutlined,
  WalletOutlined,
  GiftOutlined,
  SafetyOutlined,
  NotificationOutlined,
  SettingOutlined,
  ApiOutlined,
} from '@ant-design/icons-vue'

export type MenuItem = {
  key: string
  label: string
  icon?: Component
  path?: string
  children?: MenuItem[]
}

export const menuTree: MenuItem[] = [
  { key: 'dashboard', label: '仪表盘', icon: DashboardOutlined, path: '/dashboard' },
  {
    key: 'products',
    label: '商品治理',
    icon: AppstoreOutlined,
    children: [
      { key: 'products-list', label: '商品列表', path: '/products/list' },
      { key: 'products-review', label: '商品审核', path: '/products/review' },
      { key: 'products-detail', label: '商品详情', path: '/products/detail' },
      { key: 'products-brand', label: '品牌治理', path: '/products/brands' },
      { key: 'products-category', label: '类目治理', path: '/products/categories' },
    ],
  },
  {
    key: 'orders',
    label: '订单治理',
    icon: ShoppingCartOutlined,
    children: [
      { key: 'orders-list', label: '订单列表', path: '/orders/list' },
      { key: 'orders-exception', label: '异常订单', path: '/orders/exception' },
      { key: 'orders-dispute', label: '争议订单', path: '/orders/dispute' },
      { key: 'orders-detail', label: '订单详情', path: '/orders/detail' },
    ],
  },
  {
    key: 'after-sales',
    label: '售后仲裁',
    icon: AuditOutlined,
    children: [
      { key: 'after-sales-list', label: '售后列表', path: '/after-sales/list' },
      { key: 'after-sales-arbitration', label: '仲裁处理', path: '/after-sales/arbitration' },
      { key: 'after-sales-proof', label: '举证管理', path: '/after-sales/proof' },
      { key: 'after-sales-liability', label: '判责记录', path: '/after-sales/liability' },
    ],
  },
  {
    key: 'shipping',
    label: '发货与物流',
    icon: RocketOutlined,
    children: [
      { key: 'shipping-monitor', label: '发货监控', path: '/shipping/monitor' },
      { key: 'shipping-fee', label: '运费模板治理', path: '/shipping/fee' },
      { key: 'shipping-exception', label: '物流异常池', path: '/shipping/exception' },
    ],
  },
  {
    key: 'merchant',
    label: '商户协同',
    icon: TeamOutlined,
    children: [
      { key: 'merchant-list', label: '商户列表', path: '/merchant/list' },
      { key: 'merchant-detail', label: '商户详情', path: '/merchant/detail' },
      { key: 'merchant-rectify', label: '整改任务', path: '/merchant/rectify' },
      { key: 'merchant-message', label: '消息联动记录', path: '/merchant/messages' },
    ],
  },
  {
    key: 'finance',
    label: '财务结算',
    icon: WalletOutlined,
    children: [
      { key: 'finance-settlement', label: '结算单', path: '/finance/settlement' },
      { key: 'finance-detail', label: '结算明细', path: '/finance/detail' },
      { key: 'finance-invoice', label: '发票管理', path: '/finance/invoice' },
      { key: 'finance-recon', label: '对账中心', path: '/finance/reconciliation' },
    ],
  },
  {
    key: 'marketing',
    label: '营销治理',
    icon: GiftOutlined,
    children: [
      { key: 'marketing-activity', label: '活动治理', path: '/marketing/activity' },
      { key: 'marketing-coupon', label: '券池治理', path: '/marketing/coupons' },
      { key: 'marketing-redemption', label: '核销监控', path: '/marketing/redemption' },
      { key: 'marketing-roi', label: 'ROI看板', path: '/marketing/roi' },
    ],
  },
  {
    key: 'risk',
    label: '风控中心',
    icon: SafetyOutlined,
    children: [
      { key: 'risk-rules', label: '风险规则', path: '/risk/rules' },
      { key: 'risk-hits', label: '风险命中', path: '/risk/hits' },
      { key: 'risk-penalty', label: '处罚中心', path: '/risk/penalty' },
      { key: 'risk-appeal', label: '申诉中心', path: '/risk/appeal' },
    ],
  },
  {
    key: 'ops',
    label: '运营中心',
    icon: NotificationOutlined,
    children: [
      { key: 'ops-messages', label: '消息中心', path: '/ops/messages' },
      { key: 'ops-tasks', label: '任务中心', path: '/ops/tasks' },
      { key: 'ops-downloads', label: '下载中心', path: '/ops/downloads' },
      { key: 'ops-logs', label: '操作日志', path: '/ops/logs' },
    ],
  },
  {
    key: 'system',
    label: '系统设置',
    icon: SettingOutlined,
    children: [
      { key: 'system-role', label: '角色权限', path: '/system/roles' },
      { key: 'system-assets', label: '资源管理', path: '/system/assets' },
      { key: 'system-param', label: '参数配置', path: '/system/params' },
      { key: 'system-dict', label: '字典配置', path: '/system/dicts' },
    ],
  },
  {
    key: 'open',
    label: '开放平台',
    icon: ApiOutlined,
    children: [
      { key: 'open-webhook', label: 'Webhook', path: '/open/webhook' },
      { key: 'open-apikey', label: 'API Key', path: '/open/apikey' },
      { key: 'open-integration', label: '第三方ERP/WMS', path: '/open/integration' },
    ],
  },
]

export const findMenuPath = (key: string) => {
  for (const parent of menuTree) {
    if (parent.key === key && parent.path) return parent.path
    for (const child of parent.children ?? []) {
      if (child.key === key) return child.path
    }
  }
  return '/dashboard'
}
