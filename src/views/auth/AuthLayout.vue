<template>
  <div class="min-h-screen flex">
    <!-- Left side - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-slate-900 items-center justify-center p-12">
      <div class="max-w-md text-center">
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-white mb-4">ImaGallery</h1>
          <p class="text-xl text-slate-300">Procurement System</p>
        </div>
        <div class="space-y-4 text-slate-400">
          <p class="text-lg">Streamline your B2B procurement process</p>
          <ul class="space-y-2 text-left max-w-sm mx-auto">
            <li class="flex items-center">
              <CheckCircle class="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
              Supplier & Product Management
            </li>
            <li class="flex items-center">
              <CheckCircle class="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
              AI-Powered Catalog Processing
            </li>
            <li class="flex items-center">
              <CheckCircle class="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
              Order Tracking & Analytics
            </li>
            <li class="flex items-center">
              <CheckCircle class="h-5 w-5 text-emerald-400 mr-3 flex-shrink-0" />
              Document Management
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- Right side - Auth form -->
    <div class="flex-1 flex items-center justify-center p-8">
      <div class="w-full max-w-md">
        <div class="lg:hidden text-center mb-8">
          <h1 class="text-3xl font-bold text-slate-900 mb-2">ImaGallery</h1>
          <p class="text-slate-600">Procurement System</p>
        </div>
        
        <RouterView />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CheckCircle } from 'lucide-vue-next'
</script>
