import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/auth/stores/auth'
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
      component: () => import('../modules/auth/views/AuthLayout.vue'),
      meta: { requiresGuest: true },
      children: [
        {
          path: '',
          redirect: '/auth/login'
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../modules/auth/views/LoginView.vue')
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../modules/auth/views/RegisterView.vue')
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('../modules/auth/views/ForgotPasswordView.vue')
        }
      ]
    },
    
    // Main application routes
    {
      path: '/',
      component: () => import('../shared/views/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('../shared/views/DashboardView.vue'),
          meta: { title: 'Dashboard' }
        },
        // Organization Management
        {
          path: 'organization',
          name: 'organization',
          component: () => import('../modules/organization/views/OrganizationView.vue'),
          meta: { title: 'Organization' }
        },
        {
          path: 'organization/employees',
          name: 'employees',
          component: () => import('../modules/organization/views/EmployeesView.vue'),
          meta: { title: 'Employees' }
        },
        {
          path: 'organization/roles',
          name: 'roles',
          component: () => import('../modules/organization/views/RolesView.vue'),
          meta: { title: 'Roles' }
        },
        
        // Procurement Module
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('../modules/procurement/views/suppliers/SuppliersView.vue'),
          meta: { title: 'Suppliers' }
        },
        {
          path: 'suppliers/:id',
          name: 'supplier-detail',
          component: () => import('../modules/procurement/views/suppliers/SupplierDetailWrapper.vue'),
          meta: { title: 'Supplier Details' }
        },
        {
          path: 'suppliers/:id/documents',
          name: 'supplier-documents',
          component: () => import('../modules/procurement/views/suppliers/documents/SupplierDocuments.vue'),
          meta: { title: 'Supplier Documents' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('../modules/procurement/views/products/ProductsView.vue'),
          meta: { title: 'Products' }
        },
        {
          path: 'orders',
          name: 'orders',
          component: () => import('../modules/procurement/views/orders/OrdersView.vue'),
          meta: { title: 'Orders' }
        },
        {
          path: 'procurement/purchase-orders',
          name: 'purchase-orders',
          component: () => import('../modules/procurement/views/PurchaseOrdersView.vue'),
          meta: { title: 'Purchase Orders' }
        },
        {
          path: 'procurement/rfqs',
          name: 'rfqs',
          component: () => import('../modules/procurement/views/RfqsView.vue'),
          meta: { title: 'RFQs' }
        },
        
        // Tasks & Projects
        {
          path: 'tasks',
          name: 'tasks',
          component: () => import('../modules/tasks/views/TasksView.vue'),
          meta: { title: 'Tasks & Projects' }
        },
        {
          path: 'tasks/projects',
          name: 'projects',
          component: () => import('../modules/tasks/views/ProjectsView.vue'),
          meta: { title: 'Projects' }
        },
        {
          path: 'tasks/calendar',
          name: 'calendar',
          component: () => import('../modules/tasks/views/CalendarView.vue'),
          meta: { title: 'Calendar' }
        },
        
        // Inventory Management
        {
          path: 'inventory',
          name: 'inventory',
          component: () => import('../modules/inventory/views/InventoryView.vue'),
          meta: { title: 'Inventory' }
        },
        {
          path: 'inventory/stock',
          name: 'stock',
          component: () => import('../modules/inventory/views/StockView.vue'),
          meta: { title: 'Stock Levels' }
        },
        {
          path: 'inventory/warehouses',
          name: 'warehouse',
          component: () => import('../modules/inventory/views/WarehouseView.vue'),
          meta: { title: 'Warehouses' }
        },
        
        // Sales & CRM
        {
          path: 'sales',
          name: 'sales',
          component: () => import('../modules/sales/views/SalesView.vue'),
          meta: { title: 'Sales' }
        },
        {
          path: 'sales/customers',
          name: 'sales-customers',
          component: () => import('../modules/sales/views/CustomersView.vue'),
          meta: { title: 'Sales Customers' }
        },
        {
          path: 'sales/quotes',
          name: 'quotes',
          component: () => import('../modules/sales/views/QuotesView.vue'),
          meta: { title: 'Quotes' }
        },
        
        // Customer Management
        {
          path: 'customers',
          name: 'customers',
          component: () => import('../modules/customers/views/CustomersView.vue'),
          meta: { title: 'Customer Management' }
        },
        {
          path: 'customers/interactions',
          name: 'customer-interactions',
          component: () => import('../modules/customers/views/CustomersView.vue'),
          meta: { title: 'Customer Interactions' }
        },
        {
          path: 'customers/reports',
          name: 'customer-reports',
          component: () => import('../modules/customers/views/CustomersView.vue'),
          meta: { title: 'Customer Reports' }
        },
        
        // Accounting & Finance
        {
          path: 'accounting',
          name: 'accounting',
          component: () => import('../modules/accounting/views/AccountingView.vue'),
          meta: { title: 'Accounting Dashboard' }
        },
        {
          path: 'accounting/accounts',
          name: 'accounts',
          component: () => import('../modules/accounting/views/AccountingView.vue'),
          meta: { title: 'Chart of Accounts' }
        },
        {
          path: 'accounting/transactions',
          name: 'transactions',
          component: () => import('../modules/accounting/views/AccountingView.vue'),
          meta: { title: 'Transactions' }
        },
        {
          path: 'accounting/invoices',
          name: 'invoices',
          component: () => import('../modules/accounting/views/AccountingView.vue'),
          meta: { title: 'Invoices' }
        },
        {
          path: 'accounting/payments',
          name: 'payments',
          component: () => import('../modules/accounting/views/AccountingView.vue'),
          meta: { title: 'Payments' }
        },
        
        // Document Management
        {
          path: 'documents',
          name: 'documents',
          component: () => import('../modules/documents/views/DocumentsView.vue'),
          meta: { title: 'Documents' }
        },
        {
          path: 'documents/templates',
          name: 'templates',
          component: () => import('../modules/documents/views/TemplatesView.vue'),
          meta: { title: 'Templates' }
        },
        {
          path: 'documents/reports',
          name: 'document-reports',
          component: () => import('../modules/documents/views/DocumentReportsView.vue'),
          meta: { title: 'Document Reports' }
        },
        
        // Reports & Analytics
        {
          path: 'reports',
          name: 'reports',
          component: () => import('../modules/reports/views/ReportsView.vue'),
          meta: { title: 'Reports' }
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('../shared/views/settings/SettingsView.vue'),
          meta: { title: 'Settings', roles: ['admin', 'manager'] }
        },
        {
          path: 'settings/access-control',
          name: 'access-control',
          component: () => import('../shared/views/settings/access-control/UserAccessControl.vue'),
          meta: { title: 'Access Control', roles: ['admin'] }
        },
        {
          path: 'settings/user-management',
          name: 'user-management',
          component: () => import('../shared/views/settings/user-management/UserManagement.vue'),
          meta: { title: 'User Management', roles: ['admin'] }
        }
      ]
    },
    
    // Catch all 404
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../shared/views/NotFoundView.vue')
    }
  ]
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
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
