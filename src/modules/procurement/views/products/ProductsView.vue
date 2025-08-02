<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Products</h1>
        <p class="text-gray-600 mt-1">Manage your product catalog with AI-powered processing</p>
      </div>
      <div class="flex space-x-3">
        <button class="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 flex items-center">
          <Upload class="h-4 w-4 mr-2" />
          AI Import
        </button>
        <button class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center">
          <Plus class="h-4 w-4 mr-2" />
          Add Product
        </button>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <Package class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Product Catalog Management</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will provide comprehensive product catalog management with 
          AI-powered catalog processing capabilities.
        </p>
        <div class="bg-green-50 border border-green-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-green-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-green-800 space-y-1 text-left">
            <li>• Product groups and catalog organization</li>
            <li>• AI-powered PDF/Excel catalog ingestion</li>
            <li>• Automated product data extraction</li>
            <li>• Image management and optimization</li>
            <li>• Bulk import/export operations</li>
            <li>• Product approval workflows</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Package, Plus, Upload } from 'lucide-vue-next'
</script>
