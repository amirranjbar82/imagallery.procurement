<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-gray-300">404</h1>
      </div>
      <div class="mb-8">
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h2>
        <p class="text-gray-600 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>
      <div class="space-y-4">
        <RouterLink
          to="/dashboard"
          class="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors"
        >
          <Home class="h-4 w-4 mr-2" />
          Go to Dashboard
        </RouterLink>
        <div>
          <button
            @click="$router.go(-1)"
            class="text-slate-600 hover:text-slate-900 text-sm underline"
          >
            Go back to previous page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Home } from 'lucide-vue-next'
</script>
