<template>
  <RouterLink
    :to="to"
    class="block p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
  >
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div class="flex items-center justify-center h-10 w-10 rounded-md bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <component :is="iconComponent" class="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium text-gray-900 group-hover:text-gray-700">{{ title }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ description }}</p>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Building2, Package, ShoppingCart, BarChart3, Plus } from 'lucide-vue-next'

interface Props {
  title: string
  description: string
  icon: string
  to: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  const icons = {
    Building2,
    Package,
    ShoppingCart,
    BarChart3,
    Plus
  }
  return icons[props.icon as keyof typeof icons]
})
</script>
