<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="text-gray-600 mt-1">Generate insights and track procurement performance</p>
      </div>
      <button class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center">
        <Plus class="h-4 w-4 mr-2" />
        Create Report
      </button>
    </div>

    <!-- Report Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <BarChart3 class="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">SOA Reports</h3>
        <p class="text-sm text-gray-600">Statement of Actual costs</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <TrendingUp class="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Spend Analysis</h3>
        <p class="text-sm text-gray-600">Supplier spend breakdown</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Target class="h-12 w-12 mx-auto text-orange-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Order Analytics</h3>
        <p class="text-sm text-gray-600">Order volume and metrics</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Award class="h-12 w-12 mx-auto text-purple-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Supplier Performance</h3>
        <p class="text-sm text-gray-600">Vendor performance tracking</p>
      </div>
    </div>

    <!-- Export Options -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Options</h3>
      <div class="flex space-x-4">
        <button class="flex items-center px-4 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100 border border-red-200">
          <FileText class="h-4 w-4 mr-2" />
          PDF
        </button>
        <button class="flex items-center px-4 py-2 bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200">
          <Table class="h-4 w-4 mr-2" />
          Excel
        </button>
        <button class="flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 border border-blue-200">
          <Database class="h-4 w-4 mr-2" />
          CSV
        </button>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <BarChart3 class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Advanced Reporting & Analytics</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will provide comprehensive reporting capabilities with 
          real-time analytics and customizable dashboards.
        </p>
        <div class="bg-indigo-50 border border-indigo-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-indigo-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-indigo-800 space-y-1 text-left">
            <li>• SOA (Statement of Actual) reports</li>
            <li>• Spend analysis and trend tracking</li>
            <li>• Supplier performance dashboards</li>
            <li>• Custom report builder</li>
            <li>• Scheduled report generation</li>
            <li>• Multi-format exports (PDF, Excel, CSV)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  BarChart3, 
  Plus, 
  TrendingUp, 
  Target, 
  Award, 
  FileText, 
  Table, 
  Database 
} from 'lucide-vue-next'
</script>
