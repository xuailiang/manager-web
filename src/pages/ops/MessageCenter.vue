<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="消息中心">
      <div class="review-layout">
        <a-card :bordered="false" class="left-pane" title="待处理队列">
          <a-space class="mb12" wrap>
            <a-checkbox v-model:checked="onlyUnread">仅未读</a-checkbox>
            <a-checkbox v-model:checked="onlyFailed">仅失败</a-checkbox>
            <a-checkbox v-model:checked="onlyHighPriority">仅高优先</a-checkbox>
          </a-space>
          <a-list :data-source="filteredMessages" size="small">
            <template #renderItem="{ item }">
              <a-list-item class="review-task" :class="{ active: active?.id === item.id }" @click="active = item">
                <div>
                  <div class="task-title">{{ item.title }}</div>
                  <div class="task-sub">{{ item.type }} · {{ item.time }}</div>
                  <div class="task-sub">业务号：{{ item.bizNo }} · 优先级 {{ item.priority }}</div>
                </div>
                <a-tag :color="item.status === '失败' ? 'red' : item.status === '未读' ? 'orange' : 'green'">{{ item.status }}</a-tag>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        <a-card :bordered="false" class="right-pane" title="消息详情">
          <template v-if="active">
            <h3>{{ active.title }}</h3>
            <p>{{ active.content }}</p>
            <a-descriptions :column="1" size="small" bordered>
              <a-descriptions-item label="模板键">{{ active.templateKey }}</a-descriptions-item>
              <a-descriptions-item label="业务号">{{ active.bizNo }}</a-descriptions-item>
              <a-descriptions-item label="状态">{{ active.status }}</a-descriptions-item>
              <a-descriptions-item label="重试次数">{{ active.retry }}/{{ active.maxRetry }}</a-descriptions-item>
            </a-descriptions>
            <a-space class="mt16">
              <a-button type="primary" @click="jumpBiz(active)">跳转业务</a-button>
              <a-button :disabled="active.retry >= active.maxRetry || active.status !== '失败'" @click="retry(active.id)">失败重试</a-button>
              <a-button :disabled="active.status === '已读'" @click="markRead(active.id)">标记已读</a-button>
            </a-space>
          </template>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getGovernanceMessages,
  markGovernanceMessageRead,
  retryGovernanceMessage,
} from '../../mock/governance'
import type { GovernanceMessage } from '../../types/governance'

const route = useRoute()
const router = useRouter()
const rows = ref<GovernanceMessage[]>([])
const active = ref<GovernanceMessage | null>(null)
const onlyUnread = ref(false)
const onlyFailed = ref(false)
const onlyHighPriority = ref(false)

const refresh = () => {
  rows.value = getGovernanceMessages()
  if (!rows.value.length) {
    active.value = null
    return
  }
  if (!active.value || !rows.value.some((item) => item.id === active.value?.id)) {
    active.value = rows.value[0]
  }
}

refresh()

watch(
  () => route.query.bizNo,
  (bizNo) => {
    if (!bizNo) return
    refresh()
    const hit = rows.value.find((item) => item.bizNo === String(bizNo))
    if (hit) active.value = hit
  },
  { immediate: true },
)

const filteredMessages = computed(() =>
  rows.value.filter((item) => {
    if (onlyUnread.value && item.status !== '未读') return false
    if (onlyFailed.value && item.status !== '失败') return false
    if (onlyHighPriority.value && item.priority !== '高') return false
    return true
  }),
)

const markRead = (id: string) => {
  markGovernanceMessageRead(id)
  refresh()
}

const retry = (id: string) => {
  const ok = retryGovernanceMessage(id)
  if (ok) {
    message.success('已重新投递站内信')
    refresh()
    return
  }
  message.warning('已达到最大重试次数')
}

const jumpBiz = (row: GovernanceMessage) => {
  if (!row.routePath) {
    message.info('当前消息未配置业务跳转')
    return
  }
  markGovernanceMessageRead(row.id)
  router.push({
    path: row.routePath,
    query: {
      ...(row.routeQuery ?? {}),
      bizNo: row.bizNo,
    },
  })
}
</script>
