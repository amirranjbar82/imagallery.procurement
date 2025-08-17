<template>
  <div class="p-6">
    <!-- Header with Stats -->
    <div class="mb-3">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center justify-between w-full">
          <!-- Left side: Search and Filters -->
          <div class="flex items-center gap-3 flex-1 max-w-4xl">
            <div v-if="$slots.search" class="flex-1 min-w-64">
              <slot name="search" />
            </div>
            <div v-if="$slots.filters" class="flex items-center gap-3">
              <slot name="filters" />
            </div>
          </div>

          <!-- Right side: Action Buttons -->
          <div class="flex items-center space-x-3 ml-4">
            <slot name="actions" />
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div v-if="$slots.stats" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <slot name="stats" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Pure layout component to standardize header area across procurement views
// Matches Tasks header layout (sizes: h-8 inputs/select triggers, spacing, grid stats cards)
</script>
