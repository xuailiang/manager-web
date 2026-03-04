<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="login-brand">商城管理后台</div>
      <h1>平台治理登录</h1>
      <p>用于商品审核、订单治理、风控与协同处置。</p>
      <a-form layout="vertical">
        <a-form-item label="账号">
          <a-input v-model:value="account" placeholder="admin@mall.com" />
        </a-form-item>
        <a-form-item label="密码">
          <a-input-password v-model:value="password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="角色">
          <a-select v-model:value="role" :options="roleOptions" />
        </a-form-item>
        <a-button type="primary" block size="large" :loading="loading" @click="login">登录</a-button>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setName, setRole, setToken, type UserRole } from '../utils/auth'

const router = useRouter()
const account = ref('platform@yc.com')
const password = ref('123456')
const role = ref<UserRole>('super_admin')
const loading = ref(false)

const roleOptions = [
  { label: '超级管理员', value: 'super_admin' },
  { label: '平台审核员', value: 'auditor' },
  { label: '平台运营', value: 'operator' },
  { label: '财务管理员', value: 'finance' },
]

const login = () => {
  loading.value = true
  window.setTimeout(() => {
    setToken(`mall-admin-token-${Date.now()}`)
    setRole(role.value)
    setName('一卡通商城平台')
    loading.value = false
    router.replace('/dashboard')
  }, 450)
}
</script>
