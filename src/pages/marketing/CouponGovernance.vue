<template>
  <div class="page-wrap pg-page">
    <a-card :bordered="false" class="pg-table-card" style="width: 100%; overflow: hidden;">
      <template #title>
        <div class="pg-card-title">
          <span>券池核销监控大盘</span>
        </div>
      </template>
      <template #extra>
        <a-space>
          <a-input-search
            v-model:value="keyword"
            placeholder="搜索卡券名称"
            style="width: 260px"
            allow-clear
          />
        </a-space>
      </template>

      <a-row :gutter="16">
        <a-col :span="8" v-for="pool in filteredPools" :key="pool.id">
          <a-card hoverable class="coupon-card">
            <template #title>
              <div class="coupon-header">
                <span class="coupon-title">{{ pool.name }}</span>
                <a-tag :color="pool.sponsor === 'platform' ? 'red' : 'blue'">
                  {{ pool.sponsor === 'platform' ? '平台出资' : '商家券' }}
                </a-tag>
              </div>
            </template>
            <template #extra>
              <a-badge 
                :status="pool.status === 'issuing' ? 'processing' : (pool.status === 'depleted' ? 'default' : 'warning')" 
                :text="statusText(pool.status)" 
              />
            </template>

            <a-descriptions :column="1" size="small">
              <a-descriptions-item label="限制">
                {{ pool.rules.targetAudience === 'new_user' ? '仅限新客' : (pool.rules.targetAudience === 'vip' ? '核心会员' : '所有用户') }}，
                每人限 {{ pool.rules.limitPerUser }} 张
              </a-descriptions-item>
              <a-descriptions-item label="总预算">
                ¥ {{ pool.totalBudget.toLocaleString() }}
              </a-descriptions-item>
            </a-descriptions>

            <div class="progress-wrap">
              <div style="font-size: 13px; color: #666; margin-bottom: 4px;">发券/核销进度</div>
              <a-progress :percent="(pool.redeemedCount / pool.issuedCount * 100) || 0" :format="() => `${pool.redeemedCount} / ${pool.issuedCount}`" />
            </div>

            <div class="card-actions">
               <a-button type="link" size="small">追加预算</a-button>
               <a-button type="link" size="small">核销明细</a-button>

               <a-popconfirm
                v-if="pool.status === 'issuing'"
                title="警告：冻结券池将导致已领取券无法核销，防灰产专线使用，确认吗？"
                @confirm="handleFreeze(pool)"
               >
                 <a-button type="link" size="small" danger>紧急冻结</a-button>
               </a-popconfirm>
            </div>
          </a-card>
        </a-col>
      </a-row>

      <a-empty v-if="filteredPools.length === 0" description="暂无优惠券配置" style="margin: 40px 0" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { message } from 'ant-design-vue'
import { getCouponPools, freezeCouponPool } from '../../mock/marketing'
import type { CouponPoolItem } from '../../types/marketing'

const pools = ref<CouponPoolItem[]>(getCouponPools())
const keyword = ref('')

const filteredPools = computed(() => {
  const kw = keyword.value.trim().toLowerCase()
  if (!kw) return pools.value
  return pools.value.filter(p => p.name.toLowerCase().includes(kw))
})

const statusText = (status: string) => {
  const map: Record<string, string> = {
    issuing: '发卡中',
    paused: '风控冻结',
    depleted: '已发完',
    expired: '已失效',
  }
  return map[status] || status
}

const handleFreeze = (pool: CouponPoolItem) => {
  try {
    freezeCouponPool(pool.id)
    message.warning(`操作成功：券池 [${pool.name}] 已紧急被冻结`)
    pools.value = getCouponPools()
  } catch (err: any) {
    message.error(err.message)
  }
}
</script>

<style scoped>
.coupon-card {
  margin-bottom: 16px;
  border-radius: 8px;
}
.coupon-header {
  display: flex;
  align-items: center;
  gap: 8px;
}
.coupon-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.progress-wrap {
  margin-top: 16px;
  margin-bottom: 16px;
}
.card-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 8px;
}
</style>
