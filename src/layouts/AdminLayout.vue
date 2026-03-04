<template>
  <a-layout class="layout-root">
    <a-layout-sider
      v-model:collapsed="collapsed"
      collapsible
      width="240"
      :collapsed-width="0"
      breakpoint="lg"
      class="layout-sider"
      :trigger="null"
      @breakpoint="(broken: boolean) => (collapsed = broken)"
    >
      <div class="brand-block">
        <div class="brand-logo">YC</div>
        <div v-if="!collapsed" class="brand-text-wrap">
          <div class="brand-title">商城治理后台</div>
          <div class="brand-subtitle">Mall Governance Center</div>
        </div>
      </div>

      <div class="menu-wrap">
        <div v-for="root in menuTree" :key="root.key" class="menu-root-block">
          <div class="root-item" :class="{ active: openRootKey === root.key }" @click="toggleRoot(root.key)">
            <component :is="root.icon" class="menu-icon" />
            <span v-if="!collapsed" class="menu-label">{{ root.label }}</span>
            <span v-if="!collapsed && root.children?.length" class="root-arrow" :class="{ expanded: openRootKey === root.key }">
              >
            </span>
          </div>
          <div class="child-wrap" :class="{ expanded: !collapsed && openRootKey === root.key }">
            <div class="child-list">
              <div
                v-for="child in root.children ?? []"
                :key="child.key"
                class="child-item"
                :class="{ active: activeKey === child.key }"
                @click="goTo(child.path || '/dashboard', child.key)"
              >
                {{ child.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-layout-sider>

    <a-layout class="layout-main">
      <a-layout-header class="layout-header">
        <div class="header-left">
          <a-button type="text" @click="collapsed = !collapsed">
            <MenuUnfoldOutlined v-if="collapsed" />
            <MenuFoldOutlined v-else />
          </a-button>
          <div class="header-title">{{ pageTitle }}</div>
          <a-tag color="green">营业中</a-tag>
        </div>
        <div class="header-right">
          <a-space size="middle">
            <a-space size="small">
              <span class="theme-label">主题</span>
              <a-switch :checked="isDark" checked-children="暗" un-checked-children="亮" @change="toggleTheme" />
            </a-space>

            <a-popover placement="bottomRight" trigger="click" overlayClassName="notification-popover" v-model:open="popoverVisible">
              <a-badge :count="unreadCount" :offset="[2, 2]" style="cursor: pointer;">
                <BellOutlined class="header-icon" />
              </a-badge>

              <template #content>
                <div class="notification-panel">
                  <a-tabs v-model:activeKey="activeMsgTab">
                    <a-tab-pane key="all" :tab="'全部通知'"></a-tab-pane>
                    <a-tab-pane key="alert" :tab="'风控预警'"></a-tab-pane>
                    <a-tab-pane key="todo" :tab="'待办事项'"></a-tab-pane>
                  </a-tabs>
                  
                  <div class="msg-list-container">
                    <a-list item-layout="horizontal" :data-source="filteredMessages" :locale="{ emptyText: '暂无新消息' }">
                      <template #renderItem="{ item }">
                        <a-list-item 
                          class="msg-item" 
                          :class="{ 'is-read': item.isRead }"
                          @click="onMessageClick(item)"
                        >
                          <a-list-item-meta :description="item.description">
                            <template #title>
                              <div class="msg-title-wrap">
                                <span class="msg-title">{{ item.title }}</span>
                                <a-tag v-if="item.type === 'alert'" color="error" size="small">告警</a-tag>
                                <a-tag v-else-if="item.type === 'todo'" color="processing" size="small">待办</a-tag>
                              </div>
                            </template>
                            <template #avatar>
                              <a-avatar 
                                :style="{ backgroundColor: item.type === 'alert' ? '#fff1f0' : '#e6f4ff', color: item.type === 'alert' ? '#cf1322' : '#1677ff' }"
                              >
                                <NotificationOutlined v-if="item.type === 'notification'" />
                                <WarningOutlined v-else-if="item.type === 'alert'" />
                                <CheckSquareOutlined v-else-if="item.type === 'todo'" />
                                <MessageOutlined v-else />
                              </a-avatar>
                            </template>
                          </a-list-item-meta>
                          <div class="msg-time">{{ item.createdAt }}</div>
                        </a-list-item>
                      </template>
                    </a-list>
                  </div>
                  
                  <div class="msg-footer">
                    <a-button type="link" size="small" @click="handleClearRead">清空已读</a-button>
                    <a-button type="link" size="small" @click="handleMarkAllRead">全部标为已读</a-button>
                    <a-button type="link" size="small" @click="goToMessageCenter">查看更多历史</a-button>
                  </div>
                </div>
              </template>
            </a-popover>

            <a-dropdown>
              <a-space class="user-entry">
                <a-avatar size="small" class="header-avatar">平</a-avatar>
                <div class="user-name-wrap">
                  <div class="user-name">{{ displayName }}</div>
                  <div class="user-role">{{ roleLabel }}</div>
                </div>
                <DownOutlined />
              </a-space>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="router.push('/system/roles')">权限设置</a-menu-item>
                  <a-menu-item @click="router.push('/ops/messages')">站内信归档</a-menu-item>
                  <a-menu-divider />
                  <a-menu-item @click="logout">退出登录</a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </a-space>
        </div>
      </a-layout-header>

      <div class="layout-tabs">
        <div class="tabs-scroll">
          <button
            v-for="tab in visitedTabs"
            :key="tab.key"
            type="button"
            class="top-tab"
            :class="{ active: activeTabKey === tab.key }"
            @click="onTabClick(tab)"
          >
            <span class="top-tab-title">{{ tab.title }}</span>
            <span
              v-if="canCloseTab(tab)"
              class="top-tab-close"
              @click.stop="closeTab(tab.key)"
            >
              ×
            </span>
          </button>
        </div>
      </div>

      <a-layout-content ref="contentRef" class="layout-content" @scroll.passive="lockContentHorizontal">
        <RouterView />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import { BellOutlined, DownOutlined, MenuFoldOutlined, MenuUnfoldOutlined, NotificationOutlined, WarningOutlined, CheckSquareOutlined, MessageOutlined } from '@ant-design/icons-vue'
import { menuTree } from '../utils/menu'
import { clearAuth, getName, getRole } from '../utils/auth'
import { setThemeMode, themeMode } from '../utils/theme'
import { getMessages, getUnreadCount, markAsRead, markAllAsRead, clearAllRead } from '../mock/message'
import type { SiteMessage } from '../types/message'

const router = useRouter()
const route = useRoute()

type VisitedTab = {
  key: string
  title: string
  path: string
}

type ContentRef = HTMLElement | { $el?: HTMLElement } | null

const TAB_STORAGE_KEY = 'mall_admin_visited_tabs'
const DASHBOARD_TAB: VisitedTab = { key: 'dashboard', title: '仪表盘', path: '/dashboard' }

const readStoredTabs = (): VisitedTab[] => {
  try {
    const raw = localStorage.getItem(TAB_STORAGE_KEY)
    if (!raw) return [DASHBOARD_TAB]
    const parsed = JSON.parse(raw) as VisitedTab[]
    if (!Array.isArray(parsed) || parsed.length === 0) return [DASHBOARD_TAB]
    return parsed
  } catch {
    return [DASHBOARD_TAB]
  }
}

const collapsed = ref(false)
const activeKey = ref((route.meta.key as string) || 'dashboard')
const activeTabKey = ref((route.meta.key as string) || 'dashboard')
const openRootKey = ref((route.meta.root as string) || 'dashboard')
const visitedTabs = ref<VisitedTab[]>(readStoredTabs())
const contentRef = ref<ContentRef>(null)

const persistTabs = () => {
  localStorage.setItem(TAB_STORAGE_KEY, JSON.stringify(visitedTabs.value))
}

const getContentEl = () => {
  const node = contentRef.value
  if (!node) return null
  if (node instanceof HTMLElement) return node
  if (node.$el instanceof HTMLElement) return node.$el
  return null
}

const resetHorizontalOffsets = () => {
  const contentEl = getContentEl()
  if (contentEl && contentEl.scrollLeft !== 0) {
    contentEl.scrollLeft = 0
  }
  const mainEl = contentEl?.closest('.layout-main') as HTMLElement | null
  if (mainEl && mainEl.scrollLeft !== 0) {
    mainEl.scrollLeft = 0
  }
  const rootEl = document.querySelector('.layout-root') as HTMLElement | null
  if (rootEl && rootEl.scrollLeft !== 0) {
    rootEl.scrollLeft = 0
  }
}

watch(
  () => route.fullPath,
  () => {
    const key = (route.meta.key as string) || 'dashboard'
    const title = (route.meta.title as string) || '仪表盘'
    activeKey.value = key
    activeTabKey.value = key
    openRootKey.value = (route.meta.root as string) || 'dashboard'
    const hit = visitedTabs.value.find((tab) => tab.key === key)
    if (hit) {
      hit.path = route.fullPath
      hit.title = title
    } else {
      visitedTabs.value.push({ key, title, path: route.fullPath })
    }
    persistTabs()
    nextTick(() => {
      resetHorizontalOffsets()
    })
  },
  { immediate: true },
)

const lockContentHorizontal = () => {
  resetHorizontalOffsets()
}

const onWindowResize = () => {
  resetHorizontalOffsets()
}

onMounted(() => {
  nextTick(() => {
    resetHorizontalOffsets()
  })
  window.addEventListener('resize', onWindowResize, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onWindowResize)
})

const goTo = (path: string, key: string) => {
  activeKey.value = key
  router.push(path)
}

const toggleRoot = (rootKey: string) => {
  if (collapsed.value) {
    collapsed.value = false
  }
  const root = menuTree.find((item) => item.key === rootKey)
  if (!root) return
  const hasChildren = Boolean(root.children && root.children.length)
  if (!hasChildren && root.path) {
    goTo(root.path, root.key)
    return
  }
  openRootKey.value = openRootKey.value === rootKey ? '' : rootKey
}

const onTabClick = (tab: VisitedTab) => {
  activeTabKey.value = tab.key
  router.push(tab.path)
}

const canCloseTab = (tab: VisitedTab) => tab.key !== 'dashboard'

const closeTab = (key: string) => {
  const idx = visitedTabs.value.findIndex((item) => item.key === key)
  if (idx < 0 || visitedTabs.value[idx].key === 'dashboard') return
  const isCurrent = activeTabKey.value === key
  visitedTabs.value.splice(idx, 1)
  if (visitedTabs.value.length === 0) {
    visitedTabs.value.push(DASHBOARD_TAB)
  }
  if (isCurrent) {
    const next = visitedTabs.value[idx] || visitedTabs.value[idx - 1] || visitedTabs.value[0]
    activeTabKey.value = next.key
    router.push(next.path)
  }
  persistTabs()
}

const pageTitle = computed(() => (route.meta.title as string) || '商城管理后台')
const displayName = computed(() => getName())
const roleLabel = computed(() => {
  const role = getRole()
  if (role === 'super_admin') return '超级管理员'
  if (role === 'auditor') return '平台审核员'
  if (role === 'finance') return '财务管理员'
  return '平台运营'
})

const isDark = computed(() => themeMode.value === 'dark')
const toggleTheme = (checked: boolean) => setThemeMode(checked ? 'dark' : 'light')

const logout = () => {
  clearAuth()
  router.replace('/login')
}

// --- Notification Logic ---
const popoverVisible = ref(false)
const activeMsgTab = ref('all')
const messages = ref<SiteMessage[]>([])
const unreadCount = ref(0)

const reloadMessages = () => {
  messages.value = getMessages()
  unreadCount.value = getUnreadCount()
}

// Trigger initial load
onMounted(() => {
  reloadMessages()
})

const filteredMessages = computed(() => {
  if (activeMsgTab.value === 'all') return messages.value
  return messages.value.filter(m => m.type === activeMsgTab.value)
})

const onMessageClick = (item: SiteMessage) => {
  if (!item.isRead) {
    markAsRead(item.id)
    reloadMessages() // Soft reload instead of full page
  }
}

const handleMarkAllRead = () => {
  markAllAsRead()
  reloadMessages()
}

const handleClearRead = () => {
  clearAllRead()
  reloadMessages()
}

const goToMessageCenter = () => {
  popoverVisible.value = false
  router.push('/ops/messages')
}
</script>

<style scoped>
.notification-panel {
  width: 320px;
}
.notification-panel :deep(.ant-tabs-nav) {
  margin-bottom: 0;
  padding: 0 16px;
}
.msg-list-container {
  max-height: 380px;
  overflow-y: auto;
  padding: 0 16px;
}
.msg-item {
  cursor: pointer;
  transition: background-color 0.3s;
  padding: 12px 8px !important;
  border-radius: 6px;
  margin-top: 4px;
}
.msg-item:hover {
  background-color: var(--hover-bg);
}
.msg-item.is-read {
  opacity: 0.6;
}
.msg-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}
.msg-title {
  font-weight: 500;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.msg-time {
  font-size: 12px;
  color: var(--text-sub);
  margin-top: 8px;
}
.msg-footer {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
}

:global(.notification-popover .ant-popover-inner) {
  padding: 0;
  border-radius: 8px;
  overflow: hidden;
}
</style>
