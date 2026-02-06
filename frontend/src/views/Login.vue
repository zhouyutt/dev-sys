<template>
  <div class="login-page">
    <div class="login-container">
      <VaCard class="login-card">
        <VaCardContent class="login-card__content">
          <!-- Logo and Title -->
          <div class="text-center mb-8">
            <div class="logo-container">
              <div class="logo-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="white">
                  <path d="M12,2C6.5,2,2,6.5,2,12s4.5,10,10,10s10-4.5,10-10S17.5,2,12,2z M12,20c-4.4,0-8-3.6-8-8s3.6-8,8-8s8,3.6,8,8 S16.4,20,12,20z M7,13h2v2H7V13z M11,13h2v2h-2V13z M15,13h2v2h-2V13z M9,9h6v2H9V9z"/>
                </svg>
              </div>
            </div>
            <h1 class="page-title">仙本那潜水店ERP</h1>
            <p class="page-subtitle">欢迎回来，请登录您的账户</p>
          </div>

          <!-- Login Form -->
          <form @submit.prevent="handleLogin">
            <VaInput
              v-model="form.username"
              label="用户名"
              placeholder="请输入用户名"
              class="mb-4"
              :error="!!errors.username"
              :error-messages="errors.username"
            >
              <template #prependInner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,12c2.21,0,4-1.79,4-4s-1.79-4-4-4S8,5.79,8,8S9.79,12,12,12z M12,14c-2.67,0-8,1.34-8,4v2h16v-2 C20,15.34,14.67,14,12,14z"/>
                </svg>
              </template>
            </VaInput>

            <VaInput
              v-model="form.password"
              type="password"
              label="密码"
              placeholder="请输入密码"
              class="mb-6"
              :error="!!errors.password"
              :error-messages="errors.password"
            >
              <template #prependInner>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18,8h-1V6c0-2.76-2.24-5-5-5S7,3.24,7,6v2H6c-1.1,0-2,0.9-2,2v10c0,1.1,0.9,2,2,2h12c1.1,0,2-0.9,2-2V10 C20,8.9,19.1,8,18,8z M9,6c0-1.66,1.34-3,3-3s3,1.34,3,3v2H9V6z M18,20H6V10h12V20z M12,17c1.1,0,2-0.9,2-2s-0.9-2-2-2 s-2,0.9-2,2S10.9,17,12,17z"/>
                </svg>
              </template>
            </VaInput>

            <VaButton
              type="submit"
              class="login-button w-full"
              :loading="loading"
              size="large"
              block
            >
              登录
            </VaButton>
          </form>

          <!-- Demo Credentials -->
          <VaDivider class="my-6">
            <span class="divider-text">演示账号</span>
          </VaDivider>
          
          <div class="demo-info">
            <div class="demo-item">
              <span class="demo-label">用户名:</span>
              <span class="demo-value">admin</span>
            </div>
            <div class="demo-item">
              <span class="demo-label">密码:</span>
              <span class="demo-value">admin123</span>
            </div>
          </div>
        </VaCardContent>
      </VaCard>

      <!-- Footer -->
      <div class="login-footer">
        <p>&copy; 2024 仙本那潜水店ERP系统</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vuestic-ui'

const router = useRouter()
const authStore = useAuthStore()
const { init: notify } = useToast()

const form = reactive({
  username: '',
  password: ''
})

const errors = reactive({
  username: '',
  password: ''
})

const loading = ref(false)

const validateForm = () => {
  errors.username = ''
  errors.password = ''

  if (!form.username) {
    errors.username = '请输入用户名'
    return false
  }
  if (!form.password) {
    errors.password = '请输入密码'
    return false
  }
  return true
}

const handleLogin = async () => {
  if (!validateForm()) return

  loading.value = true

  try {
    const success = await authStore.login({ username: form.username, password: form.password })

    if (!success) {
      notify({
        message: '登录失败，请检查用户名和密码',
        color: 'danger',
        duration: 3000,
      })
      return
    }

    notify({
      message: '登录成功！',
      color: 'success',
      duration: 2000,
    })

    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  } catch (error) {
    notify({
      message: error.response?.data?.message || '登录失败，请检查用户名和密码',
      color: 'danger',
      duration: 3000
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background-image: 
      radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 20%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
    pointer-events: none;
    animation: float 20s ease-in-out infinite;
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  33% {
    transform: translate(30px, -30px) rotate(120deg);
  }
  66% {
    transform: translate(-20px, 20px) rotate(240deg);
  }
}

.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
}

.login-card {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.98);

  &__content {
    padding: 3rem 2.5rem;
  }
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.logo-icon {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 15px 40px rgba(102, 126, 234, 0.6);
  }
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #666;
  font-size: 0.95rem;
  margin: 0;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
}

.divider-text {
  color: #999;
  font-size: 0.875rem;
  padding: 0 1rem;
  background: white;
}

.demo-info {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-radius: 12px;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-around;
  gap: 1rem;
}

.demo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.demo-label {
  font-size: 0.75rem;
  color: #999;
  font-weight: 500;
}

.demo-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: #667eea;
  font-family: 'Monaco', 'Consolas', monospace;
}

.login-footer {
  text-align: center;
  margin-top: 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  
  p {
    margin: 0;
  }
}

@media (max-width: 640px) {
  .login-card__content {
    padding: 2rem 1.5rem;
  }

  .page-title {
    font-size: 1.75rem;
  }

  .logo-icon {
    width: 70px;
    height: 70px;
  }

  .demo-info {
    flex-direction: column;
    align-items: center;
  }
}
</style>
