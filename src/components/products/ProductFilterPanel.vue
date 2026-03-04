<template>
  <a-card :bordered="false" class="toolbar-card pg-filter-card">
    <a-form layout="inline" class="toolbar-form pg-filter-row">
      <a-form-item label="关键词">
        <a-input
          :value="model.keyword"
          placeholder="商品名/编码/商户"
          allow-clear
          style="width: 220px"
          @update:value="setField('keyword', $event)"
        />
      </a-form-item>
      <a-form-item label="商品状态">
        <a-select :value="model.status" style="width: 140px" :options="statusOptions" @update:value="setField('status', $event)" />
      </a-form-item>
      <a-form-item label="审核状态">
        <a-select
          :value="model.auditStatus"
          style="width: 140px"
          :options="auditStatusOptions"
          @update:value="setField('auditStatus', $event)"
        />
      </a-form-item>
      <a-form-item label="风险等级">
        <a-select :value="model.riskLevel" style="width: 130px" :options="riskOptions" @update:value="setField('riskLevel', $event)" />
      </a-form-item>
      <a-form-item label="商户">
        <a-input
          :value="model.merchantKeyword"
          placeholder="商户/店铺"
          allow-clear
          style="width: 180px"
          @update:value="setField('merchantKeyword', $event)"
        />
      </a-form-item>
      <a-form-item>
        <a-button @click="toggleAdvanced">{{ model.advancedOpen ? '收起高级' : '高级筛选' }}</a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="emit('reset')">重置</a-button>
      </a-form-item>
    </a-form>

    <transition name="fade-slide">
      <div v-if="model.advancedOpen" class="pg-advanced-panel">
        <div class="pg-range-item">
          <div class="pg-range-label">SLA 剩余(分钟)</div>
          <a-slider
            range
            :min="-120"
            :max="1440"
            :value="model.slaRange"
            @change="(value: any) => setField('slaRange', value as [number, number])"
          />
        </div>
        <div class="pg-range-item">
          <div class="pg-range-label">投诉率区间(%)</div>
          <a-slider
            range
            :min="0"
            :max="20"
            :step="0.5"
            :value="model.complaintRange"
            @change="(value: any) => setField('complaintRange', value as [number, number])"
          />
        </div>
        <div class="pg-range-item">
          <div class="pg-range-label">违规分</div>
          <a-slider
            range
            :min="0"
            :max="100"
            :value="model.violationRange"
            @change="(value: any) => setField('violationRange', value as [number, number])"
          />
        </div>
        <div class="pg-range-item">
          <div class="pg-range-label">素材完整度(%)</div>
          <a-slider
            range
            :min="0"
            :max="100"
            :value="model.mediaRange"
            @change="(value: any) => setField('mediaRange', value as [number, number])"
          />
        </div>
      </div>
    </transition>
  </a-card>
</template>

<script setup lang="ts">
import type { ProductFilterModel } from '../../types/product-list'
import type { MallProductGovernanceItem, ProductReviewStatus, RiskLevel } from '../../types/governance'

const props = defineProps<{
  model: ProductFilterModel
  statusOptions: { label: string; value: 'all' | MallProductGovernanceItem['status'] }[]
  auditStatusOptions: { label: string; value: 'all' | ProductReviewStatus }[]
  riskOptions: { label: string; value: 'all' | RiskLevel }[]
}>()

const emit = defineEmits<{
  updateModel: [value: ProductFilterModel]
  reset: []
}>()

const setField = <K extends keyof ProductFilterModel>(key: K, value: ProductFilterModel[K]) => {
  emit('updateModel', { ...props.model, [key]: value })
}

const toggleAdvanced = () => {
  setField('advancedOpen', !props.model.advancedOpen)
}
</script>
