<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Suppliers</h1>
        <p class="text-gray-600 mt-1">Manage your supplier relationships and vendor information</p>
      </div>
      <button class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center">
        <Plus class="h-4 w-4 mr-2" />
        Add Supplier
      </button>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <Building2 class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Supplier Management</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will allow you to manage suppliers, track their information, 
          and organize your vendor relationships efficiently.
        </p>
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-blue-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-blue-800 space-y-1 text-left">
            <li>• Supplier registration and profiles</li>
            <li>• Contact management and communication tracking</li>
            <li>• Performance ratings and reviews</li>
            <li>• Document management for certifications</li>
            <li>• Payment terms and financial information</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, Plus } from 'lucide-vue-next'
</script>
