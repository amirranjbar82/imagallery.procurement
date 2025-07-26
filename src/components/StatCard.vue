<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center">
      <div class="flex-shrink-0">
        <div :class="[
          'flex items-center justify-center h-12 w-12 rounded-md',
          colorClasses
        ]">
          <component :is="iconComponent" class="h-6 w-6 text-white" />
        </div>
      </div>
      <div class="ml-4 flex-1">
        <div class="flex items-baseline">
          <p class="text-2xl font-semibold text-gray-900">{{ value }}</p>
        </div>
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p class="text-xs text-gray-500 mt-1">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Building2, Package, ShoppingCart, DollarSign, BarChart3 } from 'lucide-vue-next'

interface Props {
  title: string
  value: string
  icon: string
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red'
  description: string
}

const props = defineProps<Props>()

const iconComponent = computed(() => {
  const icons = {
    Building2,
    Package,
    ShoppingCart,
    DollarSign,
    BarChart3
  }
  return icons[props.icon as keyof typeof icons]
})

const colorClasses = computed(() => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500'
  }
  return colors[props.color]
})
</script>
