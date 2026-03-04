<template>
  <div class="premium-login-wrapper">
    <!-- 动态流光背景层 -->
    <div class="dynamic-bg-container">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
      <div class="orb orb-4"></div>
    </div>

    <!-- 居中的登录磨砂晶体盒 -->
    <div class="glass-login-box">
      <div class="login-header">
        <div class="brand-logo">YC</div>
        <div class="header-text">
          <h1>商城高级治理中心</h1>
          <p>Mall Governance Admin Workspace</p>
        </div>
      </div>

      <div class="login-form-body">
        <a-form layout="vertical" class="premium-form">
          <a-form-item label="企业账号">
            <a-input v-model:value="account" placeholder="admin@mall.com" size="large" class="glass-input">
              <template #prefix>
                <UserOutlined style="color: rgba(255,255,255,0.7);" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item label="安全密钥">
            <a-input-password v-model:value="password" placeholder="请输入密钥" size="large" class="glass-input">
              <template #prefix>
                <LockOutlined style="color: rgba(255,255,255,0.7);" />
              </template>
            </a-input-password>
          </a-form-item>

          <a-form-item label="登入身份">
            <a-select v-model:value="role" :options="roleOptions" size="large" class="glass-input" />
          </a-form-item>

          <a-button 
            type="primary" 
            block 
            size="large" 
            :loading="loading" 
            @click="login"
            class="premium-btn"
          >
            安全接入系统 (Secure Login)
          </a-button>
        </a-form>
      </div>
      
      <div class="login-footer">
        <p>© 2026 YC E-Commerce Governance System. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue'
import { setName, setRole, setToken, type UserRole } from '../utils/auth'

const router = useRouter()
const account = ref('platform@yc.com')
const password = ref('123456')
const role = ref<UserRole>('super_admin')
const loading = ref(false)

const roleOptions = [
  { label: '超级管理员 (Super Admin)', value: 'super_admin' },
  { label: '平台风控审核员 (Auditor)', value: 'auditor' },
  { label: '品牌与营销运营 (Operator)', value: 'operator' },
  { label: '核销财务管理员 (Finance)', value: 'finance' },
]

const login = () => {
  loading.value = true
  window.setTimeout(() => {
    setToken(`mall-admin-token-${Date.now()}`)
    setRole(role.value)
    setName('一卡通中枢管理组')
    loading.value = false
    router.replace('/dashboard')
  }, 600)
}
</script>

<style scoped>
/* 整个容器填满视口 */
.premium-login-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #0b0f19; /* 极深蓝底色 */
}

/* --- 动态流光背景特效 --- */
.dynamic-bg-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
  animation: float 20s infinite ease-in-out alternate;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: #3b82f6; /* Blue */
  top: -10%;
  left: -10%;
  animation-duration: 25s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: #8b5cf6; /* Violet */
  top: 40%;
  right: -5%;
  animation-duration: 22s;
  animation-delay: -5s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: #0ea5e9; /* Sky Blue */
  bottom: -15%;
  left: 20%;
  animation-duration: 18s;
  animation-delay: -2s;
}

.orb-4 {
  width: 300px;
  height: 300px;
  background: #ec4899; /* Pink */
  top: 10%;
  left: 50%;
  animation-duration: 30s;
  animation-delay: -10s;
  opacity: 0.3;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(100px, -50px) scale(1.1); }
  66% { transform: translate(-50px, 100px) scale(0.9); }
  100% { transform: translate(0, 0) scale(1); }
}

/* --- 居中毛玻璃卡片 --- */
.glass-login-box {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 440px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  color: #fff;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: boxFadeIn 0.8s ease-out forwards;
}

.glass-login-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

@keyframes boxFadeIn {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* 头部品牌层 */
.login-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 40px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  display: grid;
  place-items: center;
  color: white;
  font-weight: 800;
  font-size: 24px;
  box-shadow: 0 8px 16px rgba(59, 130, 246, 0.4);
}

.header-text h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.header-text p {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  letter-spacing: 0.5px;
}

/* 表单主体重构 */
.premium-form :deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  font-weight: 500;
}

.premium-form :deep(.ant-input-affix-wrapper),
.premium-form :deep(.ant-input),
.premium-form :deep(.ant-select-selector) {
  background: rgba(0, 0, 0, 0.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
}

.premium-form :deep(.ant-input-affix-wrapper):hover,
.premium-form :deep(.ant-input):hover,
.premium-form :deep(.ant-select-selector):hover,
.premium-form :deep(.ant-input-affix-wrapper-focused) {
  background: rgba(0, 0, 0, 0.3) !important;
  border-color: rgba(139, 92, 246, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
}

.premium-form :deep(.ant-select-selection-item),
.premium-form :deep(input::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

/* 特效 Login 按钮 */
.premium-btn {
  margin-top: 12px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 1px;
  box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

.premium-btn:hover {
  background: linear-gradient(90deg, #4f91ff 0%, #9f75ff 100%);
  box-shadow: 0 10px 25px rgba(139, 92, 246, 0.5);
  transform: translateY(-1px);
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  color: rgba(255, 255, 255, 0.3);
  font-size: 12px;
  margin: 0;
}
</style>
