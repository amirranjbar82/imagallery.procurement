<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Orders</h1>
        <p class="text-gray-600 mt-1">Track and manage purchase orders with approval workflows</p>
      </div>
      <button class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center">
        <Plus class="h-4 w-4 mr-2" />
        Create Order
      </button>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <ShoppingCart class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Order Management System</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will provide comprehensive order management with approval workflows, 
          tracking, and complete audit trails.
        </p>
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-orange-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-orange-800 space-y-1 text-left">
            <li>• Order creation and line item management</li>
            <li>• Multi-level approval workflows</li>
            <li>• Order status tracking (Draft → Approved → Completed)</li>
            <li>• Purchase order generation and printing</li>
            <li>• Order modification and history tracking</li>
            <li>• Integration with supplier and product catalogs</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ShoppingCart, Plus } from 'lucide-vue-next'
</script>
