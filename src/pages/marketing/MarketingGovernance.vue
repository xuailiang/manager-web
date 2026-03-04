<template>
  <div class="page-wrap">
    <a-card :bordered="false" title="活动治理与归因">
      <div class="dashboard-grid">
        <a-card size="small" :bordered="false" title="活动ROI TOP">
          <a-list :data-source="roiList" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="todo-row">
                  <span>{{ item.name }}</span>
                  <strong>{{ item.roi }}</strong>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
        <a-card size="small" :bordered="false" title="核销异常">
          <a-list :data-source="abnormalList" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <div class="todo-row">
                  <span>{{ item.name }}</span>
                  <a-tag color="red">{{ item.count }}</a-tag>
                </div>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
const roiList = [
  { name: '春季宠物节', roi: '3.84' },
  { name: '数码焕新周', roi: '2.97' },
  { name: '满减冲刺场', roi: '2.52' },
]

const abnormalList = [
  { name: '跨店重复核销', count: '12' },
  { name: '凌晨异常集中核销', count: '8' },
  { name: '单用户高频领券', count: '5' },
]
</script>
