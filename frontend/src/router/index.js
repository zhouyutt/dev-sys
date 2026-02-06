import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppLayout from '../layouts/AppLayout.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/enroll',
    name: 'Enroll',
    component: () => import('../views/Enroll.vue'),
    meta: { public: true }
  },
  {
    path: '/display',
    name: 'Display',
    component: () => import('../views/Display.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    redirect: { name: 'dashboard' },
    children: [
      {
        name: 'dashboard',
        path: 'dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: {
          requiresAuth: true,
          // 只允许 Admin 和 Front Desk（manager）访问 Dashboard
          roles: ['admin', 'super_admin', 'manager'],
        },
      },
      {
        path: 'students',
        name: 'Students',
        component: () => import('../views/Students.vue'),
        meta: {
          requiresAuth: true,
          // 学员管理：Admin + Front Desk
          roles: ['admin', 'super_admin', 'manager'],
        },
      },
      {
        path: 'rooms',
        name: 'Rooms',
        component: () => import('../views/Rooms.vue'),
        meta: {
          requiresAuth: true,
          // 房间管理：Admin + Front Desk
          roles: ['admin', 'super_admin', 'manager'],
        },
      },
      {
        path: 'trips',
        name: 'Trips',
        component: () => import('../views/Trips.vue'),
        meta: {
          requiresAuth: true,
          // 行程管理：Admin + Front Desk
          roles: ['admin', 'super_admin', 'manager'],
        },
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫：处理登录态 + 角色访问控制
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 公共路由（报名 / 大屏）直接放行
  if (to.meta.public) {
    return next()
  }

  // 需要登录的路由
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  // 已登录访问登录页，直接跳到 Dashboard
  if (to.path === '/login' && authStore.isAuthenticated) {
    return next('/dashboard')
  }

  // 基于角色的访问控制（纯 JS 写法）
  const routeRoles = Array.isArray(to.meta.roles) ? to.meta.roles : undefined
  const currentRole = authStore.role

  if (routeRoles && currentRole && !routeRoles.includes(currentRole)) {
    // 角色无权访问：简单跳回 Dashboard，如果也没权限则回登录
    if (authStore.isAuthenticated) {
      return next('/dashboard')
    }
    return next('/login')
  }

  next()
})

export default router
