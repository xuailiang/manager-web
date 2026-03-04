<template>
  <div class="page-wrap dashboard-v3">
    <a-card :bordered="false" class="hero-card">
      <div>
        <h2 class="hero-headline">平台治理指挥台</h2>
        <p class="hero-subline">优先处理待审、超时、高风险与协同逾期，支持一键跳转处置。</p>
      </div>
      <a-space>
        <a-button @click="router.push('/ops/messages')">关键通知</a-button>
        <a-button @click="router.push('/ops/downloads')">下载中心</a-button>
        <a-button type="primary" @click="router.push('/products/review?priority=P0&from=dashboard')">
          处理 P0 审核
        </a-button>
      </a-space>
    </a-card>

    <GovernanceKpiBar :cards="dashboardData.kpis" :active-key="filterState.riskKey" @select="onKpiSelect" />

    <div class="dashboard-row first">
      <template v-if="loading">
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 6 }" /></a-card>
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 6 }" /></a-card>
      </template>
      <template v-else>
        <GovernanceTodoList :todos="dashboardData.todos" @go="onTodoGo" />
        <GovernanceHealthGauge :health="dashboardData.health" :dark="isDark" />
      </template>
    </div>

    <div class="dashboard-grid">
      <template v-if="loading">
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 8 }" /></a-card>
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 8 }" /></a-card>
      </template>
      <template v-else>
        <SlaRiskDualAxes :data="dashboardData.slaTrend" :dark="isDark" @point-click="onSlaPointClick" />
        <ReviewFunnel :data="dashboardData.reviewFunnel" :dark="isDark" @stage-click="onFunnelClick" />
      </template>
    </div>

    <div class="dashboard-row third">
      <template v-if="loading">
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 8 }" /></a-card>
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 8 }" /></a-card>
        <a-card :bordered="false" class="dashboard-section-card"><a-skeleton active :paragraph="{ rows: 8 }" /></a-card>
      </template>
      <template v-else>
        <RiskSourceStack :data="dashboardData.riskSource" :dark="isDark" @source-click="onRiskSourceClick" />
        <HighRiskFeed :items="dashboardData.highRiskFeed" @open="onHighRiskOpen" />
        <a-card :bordered="false" class="dashboard-section-card" title="协同与消息联动">
          <div class="dashboard-mini-cards">
            <div v-for="item in collabRows" :key="item.status" class="mini-status">
              <div class="label">{{ collabLabelMap[item.status] }}</div>
              <div class="value">{{ item.count }}</div>
            </div>
            <div class="mini-status">
              <div class="label">导出任务完成率</div>
              <div class="value">{{ dashboardData.exportNotice.exportDoneRate }}%</div>
            </div>
            <div class="mini-status">
              <div class="label">失败重试 / 未读关键通知</div>
              <div class="value">
                {{ dashboardData.exportNotice.retryCount }} / {{ dashboardData.exportNotice.unreadCritical }}
              </div>
            </div>
          </div>
          <a-divider />
          <a-space>
            <a-button type="link" @click="router.push('/ops/downloads?from=dashboard')">查看导出任务</a-button>
            <a-button type="link" @click="router.push('/ops/messages?priority=high&from=dashboard')">查看关键消息</a-button>
          </a-space>
        </a-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import GovernanceKpiBar from '../components/dashboard/GovernanceKpiBar.vue'
import GovernanceTodoList from '../components/dashboard/GovernanceTodoList.vue'
import GovernanceHealthGauge from '../components/dashboard/GovernanceHealthGauge.vue'
import SlaRiskDualAxes from '../components/dashboard/SlaRiskDualAxes.vue'
import ReviewFunnel from '../components/dashboard/ReviewFunnel.vue'
import RiskSourceStack from '../components/dashboard/RiskSourceStack.vue'
import HighRiskFeed from '../components/dashboard/HighRiskFeed.vue'
import { getDashboardGovernanceData } from '../mock/dashboard-governance'
import type {
  DashboardFilterState,
  GovernanceTodo,
  HighRiskFeedItem,
  ReviewFunnelNode,
  RiskSourceStackPoint,
  SlaTrendPoint,
} from '../types/dashboard'
import { dashboardFilterRouteMap } from '../utils/dashboardConfig'
import { themeMode } from '../utils/theme'
import '../styles/dashboard-v3.css'

const router = useRouter()
const isDark = computed(() => themeMode.value === 'dark')

const filterState = reactive<DashboardFilterState>({
  riskKey: 'all',
})

const loading = ref(false)
const dashboardData = ref(getDashboardGovernanceData(filterState.riskKey))

const collabLabelMap = {
  created: '协同任务创建',
  processing: '协同处理中',
  overdue: '协同逾期',
  closed: '协同已关闭',
} as const

const collabRows = computed(() => dashboardData.value.collabEfficiency)

const refreshByFilter = async (nextKey: DashboardFilterState['riskKey']) => {
  loading.value = true
  filterState.riskKey = nextKey
  await new Promise((resolve) => {
    window.setTimeout(resolve, 220)
  })
  dashboardData.value = getDashboardGovernanceData(nextKey)
  loading.value = false
}

const onKpiSelect = (key: DashboardFilterState['riskKey']) => {
  if (filterState.riskKey === key) {
    const route = dashboardFilterRouteMap[key]
    if (route.path !== '/dashboard') {
      router.push({ path: route.path, query: route.query })
    }
    return
  }
  void refreshByFilter(key)
}

const onTodoGo = (todo: GovernanceTodo) => {
  router.push(todo.route)
}

const onSlaPointClick = (point: SlaTrendPoint) => {
  router.push({ path: '/orders/list', query: { risk: '超时风险', date: point.date, from: 'dashboard' } })
}

const onFunnelClick = (point: ReviewFunnelNode) => {
  const queryMap: Record<ReviewFunnelNode['stage'], Record<string, string>> = {
    submitted: { status: 'submitted' },
    in_review: { status: 'in_review' },
    need_fix_rejected: { status: 'need_fix' },
    resubmitted: { status: 'resubmitted' },
    approved: { status: 'approved' },
  }
  router.push({ path: '/products/review', query: { ...queryMap[point.stage], from: 'dashboard' } })
}

const onRiskSourceClick = (point: RiskSourceStackPoint) => {
  const map: Record<RiskSourceStackPoint['source'], { path: string; query: Record<string, string> }> = {
    商品合规: { path: '/products/review', query: { source: 'compliance', from: 'dashboard', date: point.date } },
    履约: { path: '/orders/list', query: { source: 'fulfillment', from: 'dashboard', date: point.date } },
    售后: { path: '/after-sales/list', query: { source: 'after-sale', from: 'dashboard', date: point.date } },
    财务: { path: '/finance/settlement', query: { source: 'finance', from: 'dashboard', date: point.date } },
    风控规则: { path: '/risk/rules', query: { source: 'risk', from: 'dashboard', date: point.date } },
  }
  router.push(map[point.source])
}

const onHighRiskOpen = (item: HighRiskFeedItem) => {
  router.push(item.route)
}
</script>
