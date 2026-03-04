<template>
  <div class="page-wrap">
    <a-card :bordered="false">
      <h2>{{ title }}</h2>
      <p class="placeholder-sub">{{ subtitle }}</p>
      <a-divider />
      <a-empty description="该模块已完成路由与布局接入，可按排期扩展业务交互。" />
    </a-card>
  </div>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>()
</script>
