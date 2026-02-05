<template>
  <div class="space-y-6">
    <!-- Welcome Section -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            Welcome back, {{ authStore.userProfile?.name?.split(' ')[0] }}!
          </h1>
          <p class="text-gray-600 mt-1">
            Here's what's happening with your procurement system today.
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-gray-500">{{ currentDate }}</p>
          <p class="text-xs text-gray-400 capitalize">{{ authStore.userProfile?.role }}</p>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <StatCard
        title="Products"
        value="0"
        icon="Package"
        color="green"
        description="Products in catalog"
      />
      <StatCard
        title="Pending Orders"
        value="0"
        icon="ShoppingCart"
        color="orange"
        description="Orders awaiting approval"
      />
      <StatCard
        title="This Month's Spend"
        value="$0"
        icon="DollarSign"
        color="purple"
        description="Total spend this month"
      />
    </div>

    <!-- Recent Activity & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Activity -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div class="space-y-4">
          <div class="flex items-center justify-center py-12 text-gray-500">
            <div class="text-center">
              <Clock class="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No recent activity</p>
              <p class="text-sm text-gray-400 mt-2">Activity will appear here once you start using the system</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div class="grid grid-cols-2 gap-4">
          <QuickActionCard
            title="Add Product"
            description="Add products to catalog"
            icon="Package"
            to="/products"
          />
          <QuickActionCard
            title="Create Order"
            description="Create a new order"
            icon="ShoppingCart"
            to="/orders"
          />
          <QuickActionCard
            title="View Reports"
            description="Generate reports"
            icon="BarChart3"
            to="/reports"
          />
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">All systems operational</span>
        </div>
        <div class="flex items-center">
          <div class="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">Firebase connected</span>
        </div>
        <div class="flex items-center">
          <div class="h-3 w-3 bg-yellow-500 rounded-full mr-2"></div>
          <span class="text-sm text-gray-600">AI processing ready (awaiting configuration)</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock } from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/stores/auth'
import StatCard from '@/components/StatCard.vue'
import QuickActionCard from '@/components/QuickActionCard.vue'

const authStore = useAuthStore()

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
})
</script>
