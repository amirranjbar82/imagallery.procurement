<template>
  <div class="flex flex-col items-center justify-center h-full p-8 text-center">
    <div class="max-w-md p-6 bg-white rounded-lg shadow-md">
      <div class="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </div>
      <h2 class="mb-2 text-xl font-semibold text-gray-800">Supplier Module</h2>
      <p class="mb-4 text-gray-600">This module is currently under development.</p>
      <p class="text-sm text-gray-500">A new and improved supplier management system is coming soon.</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SupplierPlaceholder',
  setup() {
    return {}
  }
})
</script>
