<template>
  <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
    <!-- Dashboard - Single Item -->
    <NavigationItem 
      :item="dashboardItem" 
      :current-route="currentRoute"
      @click="$emit('item-click')" 
    />

    <!-- Divider -->
    <div class="border-t border-gray-200 my-4"></div>

    <!-- Accordion Sections -->
    <div v-for="section in accordionSections" :key="section.id" class="mb-2">
      <!-- Section Header -->
      <button
        @click="toggleSection(section.id)"
        class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md transition-colors duration-200"
        :class="{ 'bg-gray-50': expandedSections.has(section.id) }"
      >
        <div class="flex items-center">
          <component
            :is="section.icon"
            class="mr-3 h-5 w-5 flex-shrink-0 text-gray-400"
          />
          <span>{{ section.label }}</span>
        </div>
        <ChevronDown
          class="h-4 w-4 transform transition-transform duration-200"
          :class="{ 'rotate-180': expandedSections.has(section.id) }"
        />
      </button>

      <!-- Section Content -->
      <Transition
        enter-active-class="transition-all duration-200 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div v-if="expandedSections.has(section.id)" class="mt-1 space-y-1 overflow-hidden">
          <NavigationItem
            v-for="item in section.items"
            :key="item.name"
            :item="item"
            :current-route="currentRoute"
            :is-sub-item="true"
            @click="$emit('item-click')"
          />
        </div>
      </Transition>
    </div>

    <!-- Divider -->
    <div class="border-t border-gray-200 my-4"></div>

    <!-- Settings - Single Item (Admin/Manager Only) -->
    <NavigationItem 
      v-if="showSettings"
      :item="settingsItem" 
      :current-route="currentRoute"
      @click="$emit('item-click')" 
    />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ChevronDown, LayoutDashboard, CheckSquare, ShoppingCart, Package, Building2, Users, FileText, Settings } from 'lucide-vue-next'
import NavigationItem from './NavigationItem.vue'

interface NavigationItemType {
  name: string
  label: string
  icon: any
  to: string
}

interface AccordionSection {
  id: string
  label: string
  icon: any
  items: NavigationItemType[]
}

interface Props {
  currentRoute: string | symbol | null | undefined
  userRole?: string
}

const props = defineProps<Props>()
defineEmits<{
  'item-click': []
}>()

const expandedSections = ref(new Set<string>(['tasks', 'procurement'])) // Default expanded sections

const dashboardItem: NavigationItemType = {
  name: 'dashboard',
  label: 'Dashboard',
  icon: LayoutDashboard,
  to: '/dashboard'
}

const settingsItem: NavigationItemType = {
  name: 'settings',
  label: 'Settings',
  icon: Settings,
  to: '/settings'
}

const accordionSections = computed((): AccordionSection[] => [
  {
    id: 'tasks',
    label: 'Tasks & Projects',
    icon: CheckSquare,
    items: [
      {
        name: 'tasks',
        label: 'All Tasks',
        icon: CheckSquare,
        to: '/tasks'
      },
      {
        name: 'projects',
        label: 'Projects',
        icon: CheckSquare,
        to: '/tasks/projects'
      },
      {
        name: 'calendar',
        label: 'Calendar',
        icon: CheckSquare,
        to: '/tasks/calendar'
      }
    ]
  },
  {
    id: 'sales',
    label: 'Sales & Orders',
    icon: ShoppingCart,
    items: [
      {
        name: 'orders',
        label: 'Orders',
        icon: ShoppingCart,
        to: '/orders'
      },
      {
        name: 'customers',
        label: 'Customers',
        icon: Users,
        to: '/sales/customers'
      },
      {
        name: 'quotes',
        label: 'Quotes',
        icon: FileText,
        to: '/sales/quotes'
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    items: [
      {
        name: 'products',
        label: 'Products',
        icon: Package,
        to: '/products'
      },
      {
        name: 'stock',
        label: 'Stock Levels',
        icon: Package,
        to: '/inventory/stock'
      },
      {
        name: 'warehouse',
        label: 'Warehouses',
        icon: Building2,
        to: '/inventory/warehouses'
      }
    ]
  },
  {
    id: 'procurement',
    label: 'Procurement',
    icon: Building2,
    items: [
      {
        name: 'suppliers',
        label: 'Suppliers',
        icon: Building2,
        to: '/suppliers'
      },
      {
        name: 'purchase-orders',
        label: 'Purchase Orders',
        icon: FileText,
        to: '/procurement/purchase-orders'
      },
      {
        name: 'rfqs',
        label: 'RFQs',
        icon: FileText,
        to: '/procurement/rfqs'
      }
    ]
  },
  {
    id: 'organization',
    label: 'Organization',
    icon: Users,
    items: [
      {
        name: 'organization',
        label: 'Departments',
        icon: Users,
        to: '/organization'
      },
      {
        name: 'employees',
        label: 'Employees',
        icon: Users,
        to: '/organization/employees'
      },
      {
        name: 'roles',
        label: 'Roles',
        icon: Users,
        to: '/organization/roles'
      }
    ]
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FileText,
    items: [
      {
        name: 'documents',
        label: 'All Documents',
        icon: FileText,
        to: '/documents'
      },
      {
        name: 'templates',
        label: 'Templates',
        icon: FileText,
        to: '/documents/templates'
      },
      {
        name: 'reports',
        label: 'Reports',
        icon: FileText,
        to: '/documents/reports'
      }
    ]
  }
])

const showSettings = computed(() => {
  return props.userRole === 'admin' || props.userRole === 'manager'
})

const toggleSection = (sectionId: string) => {
  if (expandedSections.value.has(sectionId)) {
    expandedSections.value.delete(sectionId)
  } else {
    expandedSections.value.add(sectionId)
  }
}
</script>
