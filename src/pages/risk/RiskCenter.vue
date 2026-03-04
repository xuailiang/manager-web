<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>风险与合规规则库</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索风控规则名称"
            style="width: 260px"
            allow-clear
          />
        </a-space>
      </template>

      <a-table
        :columns="columns"
        :data-source="filteredRules"
        row-key="id"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'name'">
            <div style="font-weight: 500;">{{ record.name }}</div>
            <div class="is-muted" style="font-size: 13px; margin-top: 4px;">{{ record.description }}</div>
          </template>

          <template v-else-if="column.key === 'category'">
            <a-tag v-if="record.category === 'product'" color="blue">商品防控</a-tag>
            <a-tag v-else-if="record.category === 'merchant'" color="cyan">账号防线</a-tag>
            <a-tag v-else-if="record.category === 'shipping'" color="purple">履约异常</a-tag>
            <a-tag v-else color="orange">营销灰产</a-tag>
          </template>

          <template v-else-if="column.key === 'punishment'">
            <a-space wrap>
              <a-tag v-for="p in record.punishment" :key="p" color="error" style="border-radius: 4px;">{{ p }}</a-tag>
            </a-space>
          </template>

          <template v-else-if="column.key === 'threshold'">
            <div style="display: flex; align-items: center; gap: 12px; max-width: 200px;">
              <a-slider 
                v-model:value="record.threshold" 
                :min="50" 
                :max="100" 
                style="flex: 1" 
                @afterChange="() => handleThresholdChange(record)"
              />
              <span style="min-width: 40px">{{ record.threshold }}%</span>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-switch
              checked-children="运行中"
              un-checked-children="停用"
              :checked="record.status === 'active'"
              @change="(checked: boolean) => handleStatusChange(record, checked)"
            />
            <div v-if="record.status === 'evaluating'" class="is-muted" style="margin-top: 4px; font-size: 12px;">评估观察中...</div>
          </template>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { getRiskRules, updateRuleConfig } from '../../mock/risk'
import type { RiskRuleItem } from '../../types/risk'

const rules = ref<RiskRuleItem[]>(getRiskRules())
const keyword = ref('')

const filteredRules = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return rules.value
  return rules.value.filter(r => r.name.toLowerCase().includes(kw))
})

const columns: TableColumnsType<RiskRuleItem> = [
  { title: '规则特征集', key: 'name', width: 340 },
  { title: '业务域防线', key: 'category', width: 140 },
  { title: '联动处罚矩阵', key: 'punishment', width: 280 },
  { title: '灵敏度阈值控制', key: 'threshold', width: 260 },
  { title: '规则启停', key: 'status', width: 150 },
  { title: '最后修订时间', dataIndex: 'updatedAt', width: 180 },
]

const handleThresholdChange = (record: RiskRuleItem) => {
  try {
    updateRuleConfig(record.id, record.threshold, record.status)
    message.success(`安全防线控制参数已更新: [${record.name}] 灵敏度 -> ${record.threshold}%`)
  } catch (err: any) {
    message.error(err.message)
  }
}

const handleStatusChange = (record: RiskRuleItem, checked: boolean) => {
  try {
    const newStatus = checked ? 'active' : 'disabled'
    updateRuleConfig(record.id, record.threshold, newStatus)
    record.status = newStatus
    message.success(`规则运转切换：[${record.name}] 已${checked ? '生效' : '休眠'}`)
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
