import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authAPI } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!token.value)
  const role = computed(() => user.value?.role || null)

  // 角色辅助：后端 RBAC 中约定：
  // admin  -> Admin
  // manager -> Front Desk
  // staff / readonly -> Staff（员工）
  const isAdmin = computed(() => role.value === 'admin' || role.value === 'super_admin')
  const isFrontDesk = computed(() => role.value === 'manager')
  const isStaff = computed(() => role.value === 'staff' || role.value === 'readonly')

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials)

      // 兼容不同的后端返回结构
      const success = response.success ?? true
      const data = response.data || response

      if (!success || !data) {
        return false
      }

      const accessToken = data.token || data.accessToken
      const userInfo = data.user || {
        id: data.id,
        username: data.username,
        name: data.nickname || data.name,
        role: Array.isArray(data.roles) ? data.roles[0] : data.role,
        email: data.email,
      }

      if (!accessToken) {
        return false
      }

      token.value = accessToken
      user.value = userInfo
      localStorage.setItem('token', accessToken)
      localStorage.setItem('user', JSON.stringify(userInfo))

      return true
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchUser = async () => {
    try {
      const response = await authAPI.getMe()
      if (response.success) {
        user.value = response.data
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      logout()
    }
  }

  return {
    token,
    user,
    role,
    isAuthenticated,
    isAdmin,
    isFrontDesk,
    isStaff,
    login,
    logout,
    fetchUser
  }
})
