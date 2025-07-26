<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Documents</h1>
        <p class="text-gray-600 mt-1">Manage invoices, shipments, and payment documentation</p>
      </div>
      <button class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center">
        <Upload class="h-4 w-4 mr-2" />
        Upload Document
      </button>
    </div>

    <!-- Document Types Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Receipt class="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Invoices</h3>
        <p class="text-sm text-gray-600 mb-4">Track and verify supplier invoices</p>
        <div class="text-2xl font-bold text-blue-600">0</div>
        <p class="text-xs text-gray-500">Total invoices</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <Truck class="h-12 w-12 mx-auto text-green-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Shipments</h3>
        <p class="text-sm text-gray-600 mb-4">Monitor delivery and logistics</p>
        <div class="text-2xl font-bold text-green-600">0</div>
        <p class="text-xs text-gray-500">Active shipments</p>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <CreditCard class="h-12 w-12 mx-auto text-purple-500 mb-4" />
        <h3 class="font-semibold text-gray-900 mb-2">Payments</h3>
        <p class="text-sm text-gray-600 mb-4">Process and track payments</p>
        <div class="text-2xl font-bold text-purple-600">0</div>
        <p class="text-xs text-gray-500">Pending payments</p>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <FileText class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Document Management System</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will provide comprehensive document management for all 
          procurement-related paperwork and compliance tracking.
        </p>
        <div class="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-purple-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-purple-800 space-y-1 text-left">
            <li>• Invoice processing and verification</li>
            <li>• Shipment tracking and milestone updates</li>
            <li>• Payment processing and compliance</li>
            <li>• Document linking to orders and suppliers</li>
            <li>• Automated notifications and alerts</li>
            <li>• Digital signature and approval workflows</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileText, Upload, Receipt, Truck, CreditCard } from 'lucide-vue-next'
</script>
