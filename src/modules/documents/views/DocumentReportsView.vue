<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Document Reports</h1>
      <p class="text-gray-600 mt-1">Generate and view reports for document analytics</p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Statistics Cards -->
      <div class="bg-white rounded-lg border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Documents</p>
            <p class="text-2xl font-bold text-gray-900">1,234</p>
          </div>
          <div class="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">This Month</p>
            <p class="text-2xl font-bold text-gray-900">89</p>
          </div>
          <div class="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
      </div>
      
      <div class="bg-white rounded-lg border p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Storage Used</p>
            <p class="text-2xl font-bold text-gray-900">4.2 GB</p>
          </div>
          <div class="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg class="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4V7M4 7c0-2.21 1.79-4 4-4h8c2.21 0 4-1.79 4-4M4 7h16" />
            </svg>
          </div>
        </div>
      </div>
    </div>
    
    <div class="bg-white rounded-lg border">
      <div class="px-6 py-4 border-b">
        <h2 class="text-lg font-semibold text-gray-900">Report Generation</h2>
        <p class="text-sm text-gray-600">Generate custom reports for document analytics</p>
      </div>
      <div class="p-6">
        <div class="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <div class="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-gray-500 mb-2">Advanced reporting features coming soon</p>
          <p class="text-sm text-gray-400">Generate detailed analytics, usage reports, and document insights</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Document Reports View - placeholder component
// This will be enhanced with actual reporting functionality
</script>

<style scoped>
/* Component-specific styles */
</style>
