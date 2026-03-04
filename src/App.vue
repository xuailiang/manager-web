<template>
  <a-config-provider :theme="themeConfig">
    <RouterView />
  </a-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { theme as antdTheme } from 'ant-design-vue'
import { themeMode } from './utils/theme'

const themeConfig = computed(() => ({
  token: {
    colorPrimary: '#1f6feb',
    borderRadius: 10,
    colorBgLayout: themeMode.value === 'dark' ? '#0f172a' : '#f5f6f8',
    colorBgContainer: themeMode.value === 'dark' ? '#111827' : '#ffffff',
    colorText: themeMode.value === 'dark' ? '#f9fafb' : '#111827',
    colorTextSecondary: themeMode.value === 'dark' ? '#9ca3af' : '#6b7280',
    colorBorderSecondary: themeMode.value === 'dark' ? '#1f2937' : '#e5e7eb',
    fontFamily:
      '"PingFang SC", "Noto Sans SC", "Microsoft YaHei", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  algorithm: themeMode.value === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
}))
</script>
