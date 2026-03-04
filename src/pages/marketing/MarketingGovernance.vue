<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>活动治理大盘</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索活动名称"
            style="width: 260px"
            allow-clear
          />
          <a-button type="primary" @click="openDrawer()">新建大促活动</a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRows"
        row-key="id"
        :pagination="{ pageSize: 10 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div class="table-main-cell">
              <span class="cell-title">{{ record.name }}</span>
              <a-tag v-if="record.level === 'platform'" color="red">S级大促</a-tag>
              <a-tag v-else-if="record.level === 'category'" color="blue">行业活动</a-tag>
              <a-tag v-else color="default">商户自促</a-tag>
            </div>
            <div class="is-muted" style="margin-top: 4px; font-size: 13px;">
              {{ record.timeRange[0] }} ~ {{ record.timeRange[1] }}
            </div>
          </template>

          <template v-else-if="column.key === 'budget'">
            <strong>¥ {{ record.budget.toLocaleString() }}</strong>
          </template>

          <template v-else-if="column.key === 'merchantCount'">
            <a-badge status="processing" :text="`${record.merchantCount} 家`" />
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag v-if="record.status === 'recruiting'" color="processing">招商中</a-tag>
            <a-tag v-else-if="record.status === 'active'" color="success">进行中</a-tag>
            <a-tag v-else-if="record.status === 'ended'" color="default">已结束</a-tag>
            <a-tag v-else color="error">已下线</a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="openDrawer(record)" :disabled="record.status === 'ended' || record.status === 'offline'">
                调整配置
              </a-button>
              <a-popconfirm
                v-if="record.status !== 'offline' && record.status !== 'ended'"
                title="强制下线该活动会导致相关商户/买家发生资损及客诉，是否确认？"
                @confirm="handleOffline(record)"
              >
                <a-button type="link" size="small" danger>强制下线</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :title="editingId ? '活动配置调整' : '创建新大促活动'"
      placement="right"
      :open="drawerOpen"
      @close="drawerOpen = false"
      width="560"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="活动主标题" required>
          <a-input v-model:value="formState.name" placeholder="如：双11百亿补贴狂欢" :disabled="!!editingId" />
        </a-form-item>
        <a-form-item label="活动定级" required>
          <a-radio-group v-model:value="formState.level" :disabled="!!editingId">
            <a-radio-button value="platform">全平台 S 级</a-radio-button>
            <a-radio-button value="category">行业品类 A 级</a-radio-button>
            <a-radio-button value="merchant">商户自主</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="活动周期 (包含预热期)" required>
          <a-range-picker v-model:value="timeRange" show-time format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </a-form-item>
        <a-form-item label="活动总预算投入 (元)" required>
          <a-input-number v-model:value="formState.budget" :min="0" style="width: 100%" />
        </a-form-item>
      </a-form>
      <template #extra>
        <a-space>
          <a-button @click="drawerOpen = false">取消</a-button>
          <a-button type="primary" @click="handleSave">确认提交</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { getMarketingActivities, toggleActivityStatus, upsertMarketingActivity } from '../../mock/marketing'
import type { MarketingActivityItem } from '../../types/marketing'

const list = ref<MarketingActivityItem[]>(getMarketingActivities())
const keyword = ref('')

const filteredRows = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return list.value
  return list.value.filter(item => item.name.toLowerCase().includes(kw))
})

const columns: TableColumnsType<MarketingActivityItem> = [
  { title: '活动档案', key: 'name', width: 340 },
  { title: '平台/商户参与量', key: 'merchantCount', width: 150 },
  { title: '核定补贴池预算', key: 'budget', width: 180 },
  { title: '运行状态', key: 'status', width: 120 },
  { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '风控与配置', key: 'actions', width: 200 },
]

const handleOffline = (record: MarketingActivityItem) => {
  try {
    toggleActivityStatus(record.id, 'offline')
    message.success(`安全风控拦截：已强制熔断下线活动 [${record.name}]`)
    list.value = getMarketingActivities()
  } catch (err: any) {
    message.error(err.message)
  }
}

// Drawer Form
const drawerOpen = ref(false)
const editingId = ref('')
const timeRange = ref<[Dayjs, Dayjs]>([dayjs(), dayjs().add(7, 'day')])

const defaultForm = () => ({
  name: '',
  level: 'category' as 'platform'|'category'|'merchant',
  budget: 500000,
})

const formState = ref({ ...defaultForm() })

const openDrawer = (record?: MarketingActivityItem) => {
  if (record) {
    editingId.value = record.id
    formState.value = {
      name: record.name,
      level: record.level,
      budget: record.budget,
    }
    timeRange.value = [dayjs(record.timeRange[0]), dayjs(record.timeRange[1])]
  } else {
    editingId.value = ''
    formState.value = { ...defaultForm() }
    timeRange.value = [dayjs(), dayjs().add(7, 'day')]
  }
  drawerOpen.value = true
}

const handleSave = () => {
  if (!formState.value.name.trim()) {
    message.error('请输入有效的主标题')
    return
  }
  if (!timeRange.value || !timeRange.value[0] || !timeRange.value[1]) {
    message.error('请选择完整时间周期')
    return
  }

  const rangeStr: [string, string] = [
    timeRange.value[0].format('YYYY-MM-DD HH:mm:ss'),
    timeRange.value[1].format('YYYY-MM-DD HH:mm:ss')
  ]

  try {
    upsertMarketingActivity({
      id: editingId.value,
      name: formState.value.name,
      level: formState.value.level,
      budget: formState.value.budget,
      timeRange: rangeStr
    })
    message.success(editingId.value ? '大促资金及配置补充完毕' : '一场新活动立项成功，进入招商阶段')
    list.value = getMarketingActivities()
    drawerOpen.value = false
  } catch (err: any) {
    message.error(err.message)
  }
}
</script>

<style scoped>
.is-muted {
  color: var(--text-sub);
}
.table-main-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cell-title {
  font-weight: 500;
  font-size: 14px;
}
</style>
