import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Promise that resolves when initial auth state is determined
const getAuthStatePromise = () => {
  return new Promise<void>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      unsubscribe() // Only resolve once for initial state
      resolve()
    })
  })
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Auth routes
    {
      path: '/auth',
      component: () => import('../views/auth/AuthLayout.vue'),
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          redirect: '/auth/login'
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/auth/LoginView.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/RegisterView.vue')
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../views/auth/ForgotPasswordView.vue')
        }
      ]
    },
    
    // Main application routes
    {
      path: '/',
      component: () => import('../views/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../views/DashboardView.vue'),
          meta: { title: 'Dashboard' }
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('../views/suppliers/SuppliersView.vue'),
          meta: { title: 'Suppliers' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../views/products/ProductsView.vue'),
          meta: { title: 'Products' }
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../views/orders/OrdersView.vue'),
          meta: { title: 'Orders' }
        },
        {
          path: 'documents',
          name: 'documents',
          component: () => import('../views/documents/DocumentsView.vue'),
          meta: { title: 'Documents' }
        },
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../views/reports/ReportsView.vue'),
          meta: { title: 'Reports' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../views/settings/SettingsView.vue'),
          meta: { title: 'Settings', roles: ['admin', 'manager'] }
        },
        {
          path: 'settings/access-control',
          name: 'access-control',
          component: () => import('../views/settings/UserAccessControl.vue'),
          meta: { title: 'Access Control', roles: ['admin'] }
        }
      ]
    },
    
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Wait for initial auth state to be determined
  await getAuthStatePromise()
  
  const authStore = useAuthStore()
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next('/auth/login')
      return
    }
    
    // Check role-based access
    if (to.meta.roles && Array.isArray(to.meta.roles)) {
      if (!authStore.userProfile || !to.meta.roles.includes(authStore.userProfile.role)) {
        next('/dashboard') // Redirect to dashboard if no access
        return
      }
    }
  }
  
  // Check if route requires guest (not authenticated)
  if (to.matched.some(record => record.meta.requiresGuest)) {
    if (authStore.isAuthenticated) {
      next('/dashboard')
      return
    }
  }
  
  next()
})

export default router
