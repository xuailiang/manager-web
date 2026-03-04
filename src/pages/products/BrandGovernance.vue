<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>品牌治理池</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索品牌名称/所属公司"
            style="width: 260px"
            allow-clear
            @search="handleSearch"
          />
          <a-select v-model:value="levelFilter" style="width: 120px" @change="handleSearch">
            <a-select-option value="all">全部分级</a-select-option>
            <a-select-option value="top">头部品牌</a-select-option>
            <a-select-option value="normal">普通品牌</a-select-option>
            <a-select-option value="risk">风险品牌</a-select-option>
            <a-select-option value="banned">清退封禁</a-select-option>
          </a-select>
          <a-button type="primary" @click="openAddDrawer">新增品牌库</a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRows"
        row-key="id"
        :pagination="{ pageSize: 12 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'brand'">
            <div class="table-main-cell">
              <a-avatar shape="square" :src="record.logo" :size="44" />
              <div>
                <div class="cell-title">{{ record.name }} <span v-if="record.enName" class="is-muted">({{ record.enName }})</span></div>
                <div class="cell-sub">{{ record.company }}</div>
              </div>
            </div>
          </template>

          <template v-else-if="column.key === 'level'">
            <a-tag :color="getLevelColor(record.level)">
              {{ getLevelLabel(record.level) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 'active' ? 'processing' : 'default'"
              :text="record.status === 'active' ? '生效中' : '已停用'"
            />
          </template>

          <template v-else-if="column.key === 'merchantCount'">
            <a-button type="link" style="padding: 0;">{{ record.merchantCount }} 家店</a-button>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editBrand(record)">编辑</a-button>
              <a-button type="link" size="small" @click="manageAuth(record)">授权审核</a-button>
              <a-popconfirm
                v-if="record.level !== 'banned'"
                :title="record.level === 'risk' ? '确认解除该品牌的风险观察期？' : '确认将该品牌列入高危风险观察？'"
                @confirm="toggleRisk(record)"
              >
                <a-button type="link" size="small" :danger="record.level !== 'risk'">
                  {{ record.level === 'risk' ? '解除风险' : '标为风险' }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :title="editingId ? '编辑品牌配置' : '新增入库品牌'"
      placement="right"
      :open="drawerOpen"
      @close="drawerOpen = false"
      width="480"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item label="品牌中文名称" required>
          <a-input v-model:value="formState.name" placeholder="请输入注册商标中文" />
        </a-form-item>
        <a-form-item label="品牌外文名称">
          <a-input v-model:value="formState.enName" placeholder="如没有可保留为空" />
        </a-form-item>
        <a-form-item label="归属公司主体" required>
          <a-input v-model:value="formState.company" placeholder="品牌所有人/运营主体公司名称" />
        </a-form-item>
        <a-form-item label="品牌 LOGO 地址">
          <a-input v-model:value="formState.logo" placeholder="https://..." />
          <div class="mt16" v-if="formState.logo">
            <a-avatar shape="square" :src="formState.logo" :size="64" />
          </div>
        </a-form-item>
        <a-form-item label="管理分段分级">
          <a-radio-group v-model:value="formState.level">
            <a-radio-button value="top">头部心智品牌</a-radio-button>
            <a-radio-button value="normal">普通库内品牌</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
      <template #extra>
        <a-space>
          <a-button @click="drawerOpen = false">取消</a-button>
          <a-button type="primary" @click="handleSaveBrand">保存</a-button>
        </a-space>
      </template>
    </a-drawer>

    <a-modal v-model:open="authModalOpen" title="商户品牌授权资质池" @ok="authModalOpen = false" width="680">
      <div v-if="currentAuthBrand" class="mb16">
        <a-alert :message="`正在审阅与 [${currentAuthBrand.name}] 相关的终端商户一级与二级销售链路授权声明。`" type="info" show-icon />
      </div>
      <a-table :data-source="mockAuthQueue" :pagination="false" bordered size="small">
        <a-table-column title="挂靠主体店" data-index="shop" />
        <a-table-column title="提交申请时" data-index="time" />
        <a-table-column title="仲裁 / 判决">
          <template #default="{ record }">
            <a-space>
              <a-button type="link" size="small" @click="processAuth(record, 'approve')">资质有效</a-button>
              <a-button type="link" size="small" danger @click="processAuth(record, 'reject')">仿冒/驳回</a-button>
            </a-space>
          </template>
        </a-table-column>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getBrandList, upsertGovernanceBrand, updateBrandRiskLevel, resolveBrandAuthorization } from '../../mock/governance'
import type { BrandItem } from '../../types/governance'
import '../../styles/product-governance-v2.css'

const rows = ref<BrandItem[]>(getBrandList())
const keyword = ref('')
const levelFilter = ref<'all' | BrandItem['level']>('all')

const reloadData = () => {
  rows.value = getBrandList()
}

const filteredRows = computed(() => {
  return rows.value.filter((item) => {
    const kw = keyword.value.toLowerCase()
    const hitKeyword = !kw || item.name.toLowerCase().includes(kw) || item.company.toLowerCase().includes(kw) || (item.enName && item.enName.toLowerCase().includes(kw))
    const hitLevel = levelFilter.value === 'all' || item.level === levelFilter.value
    return hitKeyword && hitLevel
  })
})

const levelLabels: Record<BrandItem['level'], string> = {
  top: '头部品牌',
  normal: '普通品牌',
  risk: '风险品牌',
  banned: '清退封禁',
}

const getLevelLabel = (level: BrandItem['level']) => levelLabels[level]

const getLevelColor = (level: BrandItem['level']) => {
  const map: Record<BrandItem['level'], string> = { top: 'purple', normal: 'blue', risk: 'orange', banned: 'red' }
  return map[level]
}

const columns: TableColumnsType<BrandItem> = [
  { title: '品牌信息', key: 'brand', width: 340 },
  { title: '管理分级', key: 'level', width: 140 },
  { title: '在售商户数', key: 'merchantCount', width: 140 },
  { title: '系统状态', key: 'status', width: 140 },
  { title: '入库时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
  { title: '治理动作', key: 'actions', width: 260 },
]

const handleSearch = () => {
  // handled by computed
}

// Drawer State
const drawerOpen = ref(false)
const editingId = ref('')
const formState = ref<{ name: string; enName: string; company: string; logo: string; level: 'top' | 'normal' }>({
  name: '',
  enName: '',
  company: '',
  logo: '',
  level: 'normal',
})

const openAddDrawer = () => {
  editingId.value = ''
  formState.value = { name: '', enName: '', company: '', logo: '', level: 'normal' }
  drawerOpen.value = true
}

const editBrand = (record: BrandItem) => {
  editingId.value = record.id
  formState.value = {
    name: record.name,
    enName: record.enName || '',
    company: record.company,
    logo: record.logo,
    level: record.level === 'top' ? 'top' : 'normal',
  }
  drawerOpen.value = true
}

const handleSaveBrand = () => {
  if (!formState.value.name || !formState.value.company) {
    message.error('品牌名称与所属公司为必填项')
    return
  }
  try {
    upsertGovernanceBrand({
      id: editingId.value,
      name: formState.value.name,
      enName: formState.value.enName,
      company: formState.value.company,
      logo: formState.value.logo,
      level: formState.value.level,
    })
    message.success(editingId.value ? '品牌配置已更新' : '新品牌已入库')
    drawerOpen.value = false
    reloadData()
  } catch (err: any) {
    message.error(err.message)
  }
}

const toggleRisk = (record: BrandItem) => {
  const isRisk = record.level !== 'risk'
  try {
    updateBrandRiskLevel(record.id, isRisk)
    message.success(isRisk ? `[${record.name}] 已被限制经营与流量降权保护` : `[${record.name}] 已解除风控状态`)
    reloadData()
  } catch (err: any) {
    message.error(err.message)
  }
}

// Auth Modal
const authModalOpen = ref(false)
const currentAuthBrand = ref<BrandItem | null>(null)
const mockAuthQueue = ref([{ id: '1', shop: '华北自营数码一店', time: '2026-03-03 14:22:00' }, { id: '2', shop: '深圳源头甄选', time: '2026-03-04 09:12:11' }])

const manageAuth = (record: BrandItem) => {
  currentAuthBrand.value = record
  mockAuthQueue.value = [{ id: '1', shop: '华北自营店', time: '2026-03-03 14:22:00' }, { id: '2', shop: '源头甄选', time: '2026-03-04 09:12:11' }]
  authModalOpen.value = true
}

const processAuth = (record: { id: string; shop: string }, type: 'approve' | 'reject') => {
  if (!currentAuthBrand.value) return
  try {
    resolveBrandAuthorization(currentAuthBrand.value.id, type)
    mockAuthQueue.value = mockAuthQueue.value.filter(q => q.id !== record.id)
    message.success(`已${type === 'approve' ? '签发' : '驳回'} [${record.shop}] 的品牌授权书`)
    reloadData()
    if (mockAuthQueue.value.length === 0) {
      authModalOpen.value = false
    }
  } catch (e: any) {
    message.error(e.message)
  }
}
</script>

<style scoped>
.is-muted {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: normal;
}
</style>
