<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>类目治理框架</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索类目名称"
            style="width: 260px"
            allow-clear
            @search="handleSearch"
          />
          <a-button type="primary" @click="openAddRoot">新增一级类目</a-button>
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRows"
        row-key="id"
        :pagination="false"
        children-column-name="children"
        default-expand-all-rows
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'category'">
            <div class="table-main-cell">
              <span class="cell-title">{{ record.name }}</span>
              <a-tag v-if="record.level === 1" color="blue">级别 {{ record.level }}</a-tag>
              <a-tag v-else>级别 {{ record.level }}</a-tag>
            </div>
          </template>

          <template v-else-if="column.key === 'commissionRate'">
            <strong>{{ record.commissionRate.toFixed(1) }}%</strong>
          </template>

          <template v-else-if="column.key === 'depositAmount'">
            <div class="is-muted">¥ {{ record.depositAmount.toLocaleString() }}</div>
          </template>

          <template v-else-if="column.key === 'rules'">
            <a-space wrap>
              <a-tag v-if="record.requireCert" color="error">特殊商品资质</a-tag>
              <a-tag v-else color="success">普货</a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-badge
              :status="record.status === 'active' ? 'processing' : 'default'"
              :text="record.status === 'active' ? '启用' : '禁用'"
            />
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="openEditDrawer(record)">编辑规则</a-button>
              <a-button v-if="record.level < 3" type="link" size="small" @click="openAddLeaf(record)">添加子类目</a-button>
              <a-popconfirm
                :title="record.status === 'active' ? '确认禁用该类目及其全部子类目吗？' : '确认重新启用该类目向下经营吗？'"
                @confirm="toggleStatus(record)"
              >
                <a-button type="link" size="small" :danger="record.status === 'active'">
                  {{ record.status === 'active' ? '禁用' : '启用' }}
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <a-drawer
      :title="drawerTitle"
      placement="right"
      :open="drawerOpen"
      @close="drawerOpen = false"
      width="480"
    >
      <a-form :model="formState" layout="vertical">
        <a-form-item v-if="parentName" label="挂靠上级类目">
          <a-input :value="parentName" disabled />
        </a-form-item>
        <a-form-item label="类目名称" required>
          <a-input v-model:value="formState.name" placeholder="输入类目名称" />
        </a-form-item>
        <a-form-item label="基准扣点 (0-100%)" required>
          <a-input-number v-model:value="formState.commissionRate" :min="0" :max="100" style="width: 100%" addon-after="%" />
        </a-form-item>
        <a-form-item label="管控基准保证金 (元)" required>
          <a-input-number v-model:value="formState.depositAmount" :min="0" style="width: 100%" />
        </a-form-item>
        <a-form-item label="强制资质">
          <a-switch v-model:checked="formState.requireCert" checked-children="需提供商品资质" un-checked-children="普货" />
        </a-form-item>
        <a-form-item v-if="!editingId" label="发布即启用">
          <a-switch v-model:checked="formState.publishActive" />
        </a-form-item>
      </a-form>
      <template #extra>
        <a-space>
          <a-button @click="drawerOpen = false">取消</a-button>
          <a-button type="primary" @click="handleSaveCategory">提交保存</a-button>
        </a-space>
      </template>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getCategoryTree, toggleCategoryStatus, upsertGovernanceCategory } from '../../mock/governance'
import type { CategoryItem } from '../../types/governance'
import '../../styles/product-governance-v2.css'

const rows = ref<CategoryItem[]>(getCategoryTree())
const keyword = ref('')

const reloadData = () => {
  rows.value = getCategoryTree()
}

const filterTree = (nodes: CategoryItem[], kw: string): CategoryItem[] => {
  if (!kw) return nodes
  return nodes
    .map(node => {
      const match = node.name.toLowerCase().includes(kw)
      const filteredChildren = node.children ? filterTree(node.children, kw) : undefined
      if (match || (filteredChildren && filteredChildren.length > 0)) {
        return { ...node, children: filteredChildren } as CategoryItem
      }
      return null
    })
    .filter((n): n is CategoryItem => n !== null)
}

const filteredRows = computed(() => {
  const kw = keyword.value.toLowerCase()
  return filterTree(rows.value, kw)
})

const columns: TableColumnsType<CategoryItem> = [
  { title: '类目树', key: 'category', width: 340 },
  { title: '基础扣点', key: 'commissionRate', width: 140 },
  { title: '保证金门槛', key: 'depositAmount', width: 160 },
  { title: '管控规则', key: 'rules', width: 220 },
  { title: '状态', key: 'status', width: 120 },
  { title: '管控配置', key: 'actions', width: 260 },
]

const handleSearch = () => {
  // handled by computed
}

const toggleStatus = (record: CategoryItem) => {
  const willDisable = record.status === 'active'
  try {
    toggleCategoryStatus(record.id, true)
    message.success(willDisable ? `已级联下级禁用子树 [${record.name}]` : `已恢复 [${record.name}] 及其子树层级状态`)
    reloadData()
  } catch (err: any) {
    message.error(err.message)
  }
}

// Drawer state
const drawerOpen = ref(false)
const drawerTitle = ref('新增根节点类目')
const editingId = ref('')
const parentId = ref<string | null>(null)
const parentName = ref('')
const formState = ref({
  name: '',
  commissionRate: 5.0,
  depositAmount: 10000,
  requireCert: false,
  publishActive: true,
  level: 1,
})

const openAddRoot = () => {
  editingId.value = ''
  parentId.value = null
  parentName.value = ''
  drawerTitle.value = '新增一级类目'
  formState.value = {
    name: '',
    commissionRate: 5.0,
    depositAmount: 10000,
    requireCert: false,
    publishActive: true,
    level: 1,
  }
  drawerOpen.value = true
}

const openAddLeaf = (parentRecord: CategoryItem) => {
  editingId.value = ''
  parentId.value = parentRecord.id
  parentName.value = parentRecord.name
  drawerTitle.value = `添加子类目 -> ${parentRecord.name}`
  formState.value = {
    name: '',
    commissionRate: parentRecord.commissionRate,
    depositAmount: parentRecord.depositAmount,
    requireCert: parentRecord.requireCert,
    publishActive: true,
    level: parentRecord.level + 1,
  }
  drawerOpen.value = true
}

const openEditDrawer = (record: CategoryItem) => {
  editingId.value = record.id
  parentId.value = record.parentId
  parentName.value = record.parentId ? `Level ${record.level} 节点` : '根节点'
  drawerTitle.value = `修整类目模型 -> ${record.name}`
  formState.value = {
    name: record.name,
    commissionRate: record.commissionRate,
    depositAmount: record.depositAmount,
    requireCert: record.requireCert,
    publishActive: record.status === 'active',
    level: record.level,
  }
  drawerOpen.value = true
}

const handleSaveCategory = () => {
  if (!formState.value.name) {
    message.error('请输入类目名称')
    return
  }
  try {
    upsertGovernanceCategory({
      id: editingId.value,
      name: formState.value.name,
      level: formState.value.level,
      commissionRate: formState.value.commissionRate,
      depositAmount: formState.value.depositAmount,
      requireCert: formState.value.requireCert,
      status: editingId.value ? undefined : (formState.value.publishActive ? 'active' : 'disabled'),
    }, parentId.value)
    
    message.success(editingId.value ? '规则配置已保存生效' : '新增业务类目已挂载')
    drawerOpen.value = false
    reloadData()
  } catch (err: any) {
    message.error(err.message)
  }
}
</script>

<style scoped>
.is-muted {
  color: var(--text-sub);
}
</style>
