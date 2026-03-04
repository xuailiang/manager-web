<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>全局 ROI 营销归因看板</span>
        </div>
      </template>

      <div class="roi-container">
        <a-row :gutter="16">
          <a-col :span="16">
            <a-card title="活动与券池漏斗分析" size="small" :bordered="true">
              <div class="funnel-chart">
                <div class="funnel-stage" v-for="(val, key) in metrics.funnel" :key="key">
                  <div class="funnel-label">{{ funnelNames[key] }}</div>
                  <div class="funnel-bar">
                    <div class="funnel-fill" :style="{ width: getPercentage(val) + '%', backgroundColor: funnelColors[key] }"></div>
                  </div>
                  <div class="funnel-value">{{ val.toLocaleString() }}</div>
                </div>
              </div>
            </a-card>

            <a-card title="核心商户贡献榜 (Top 10)" size="small" :bordered="true" style="margin-top: 16px;">
              <a-table :dataSource="metrics.topMerchants" :columns="merchantCols" :pagination="false" size="small" rowKey="id">
                <template #bodyCell="{ column, record, index }">
                  <template v-if="column.key === 'rank'">
                    <span :class="'rank-badge rank-' + (index + 1)">{{ index + 1 }}</span>
                  </template>
                  <template v-else-if="column.key === 'gmv'">
                    ¥ {{ record.gmv.toLocaleString() }}
                  </template>
                </template>
              </a-table>
            </a-card>
          </a-col>

          <a-col :span="8">
            <a-card title="趋势看盘 (近7日)" size="small" :bordered="true">
              <a-timeline>
                <a-timeline-item v-for="trend in metrics.trends" :key="trend.date" color="blue">
                  <p class="trend-date">{{ trend.date }}</p>
                  <p class="trend-data">
                    <span class="is-muted">大盘 GMV: </span>¥{{ trend.gmv.toLocaleString() }}
                  </p>
                  <p class="trend-data">
                    <span class="is-muted">整体 ROI: </span> <strong style="color: #ff4d4f">{{ trend.roi.toFixed(2) }}</strong>
                  </p>
                </a-timeline-item>
              </a-timeline>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { getROIMetrics } from '../../mock/marketing'
import type { ROIMetrics } from '../../types/marketing'
import type { TableColumnsType } from 'ant-design-vue'

const metrics = ref<ROIMetrics>(getROIMetrics())

const funnelNames: Record<string, string> = {
  exposure: '大盘曝光流量',
  clicks: '会场主页点击',
  couponClaims: '会场领券数',
  couponUses: '用券去向数',
  paidOrders: '最终成单数',
}

const funnelColors: Record<string, string> = {
  exposure: '#bae0ff',
  clicks: '#91caff',
  couponClaims: '#69b1ff',
  couponUses: '#4096ff',
  paidOrders: '#1677ff',
}

const maxVal = computed(() => metrics.value.funnel.exposure)
const getPercentage = (val: number) => {
  return (val / maxVal.value) * 100
}

const merchantCols: TableColumnsType<any> = [
  { title: '排名', key: 'rank', width: 60, align: 'center' },
  { title: '商户名称', dataIndex: 'name', width: 160 },
  { title: '引流贡献 (GMV)', key: 'gmv', width: 150 },
  { title: '结算 ROI', dataIndex: 'roi', width: 100 },
]
</script>

<style scoped>
.roi-container {
  padding: 0 16px 24px 16px;
}
.trend-date {
  font-weight: 500;
  margin-bottom: 4px;
}
.trend-data {
  margin-bottom: 2px;
  font-size: 13px;
}
.is-muted {
  color: var(--text-sub);
}

.funnel-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px 0;
}
.funnel-stage {
  display: flex;
  align-items: center;
}
.funnel-label {
  width: 120px;
  text-align: right;
  padding-right: 16px;
  color: #666;
  font-size: 13px;
}
.funnel-bar {
  flex: 1;
  height: 24px;
  background-color: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}
.funnel-fill {
  height: 100%;
  transition: width 0.3s;
}
.funnel-value {
  width: 100px;
  text-align: right;
  font-weight: 500;
  padding-left: 16px;
}

.rank-badge {
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  background-color: #fafafa;
  border-radius: 50%;
  font-size: 12px;
  color: #666;
}
.rank-1 {
  background-color: #f5222d;
  color: white;
}
.rank-2 {
  background-color: #fa541c;
  color: white;
}
.rank-3 {
  background-color: #fa8c16;
  color: white;
}
</style>
