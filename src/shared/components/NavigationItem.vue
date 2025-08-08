<template>
  <RouterLink
    :to="item.to"
    class="flex items-center text-sm font-medium rounded-md transition-colors duration-200"
    :class="[
      isSubItem ? 'px-6 py-1.5 ml-6' : 'px-3 py-2',
      isActive
        ? 'text-white'
        : 'text-gray-700 hover:text-white'
    ]"
    :style="{
      backgroundColor: isActive ? '#9d8869' : 'transparent'
    }"
    @mouseenter="$event.target.style.backgroundColor = '#9d8869'"
    @mouseleave="$event.target.style.backgroundColor = isActive ? '#9d8869' : 'transparent'"
    @click="$emit('click')"
  >
    <component
      v-if="!isSubItem"
      :is="item.icon"
      class="mr-3 h-5 w-5 flex-shrink-0"
      :class="[
        isActive
          ? 'text-white'
          : 'text-gray-400 group-hover:text-white'
      ]"
    />
    <div v-else class="w-2 h-2 bg-gray-400 rounded-full mr-3 flex-shrink-0"></div>
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
  isSubItem?: boolean
}

const props = defineProps<Props>()
defineEmits<{
  click: []
}>()

const isActive = computed(() => {
  return props.currentRoute === props.item.name
})
</script>
