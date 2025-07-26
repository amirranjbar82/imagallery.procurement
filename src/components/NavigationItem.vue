<template>
  <RouterLink
    :to="item.to"
    class="flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200"
    :class="[
      isActive
        ? 'bg-slate-900 text-white'
        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
    ]"
    @click="$emit('click')"
  >
    <component
      :is="item.icon"
      class="mr-3 h-5 w-5 flex-shrink-0"
      :class="[
        isActive
          ? 'text-white'
          : 'text-gray-400 group-hover:text-gray-500'
      ]"
    />
    {{ item.label }}
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface NavigationItem {
  name: string
  label: string
  icon: any
  to: string
}

interface Props {
  item: NavigationItem
  currentRoute: string | symbol | null | undefined
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const isActive = computed(() => {
  return props.currentRoute === props.item.name
})
</script>
