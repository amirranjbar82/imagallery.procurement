<template>
  <div class="relative">
    <Button
      variant="outline"
      size="sm"
      @click="isOpen = !isOpen"
      class="flex items-center space-x-2"
    >
      <Settings class="w-4 h-4" />
      <span>Columns</span>
      <ChevronDown class="w-4 h-4" />
    </Button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
    >
      <div class="p-4">
        <h3 class="text-sm font-semibold text-gray-900 mb-3">Show/Hide Columns</h3>
        
        <div class="space-y-2">
          <div
            v-for="column in availableColumns"
            :key="column.key"
            class="flex items-center justify-between"
          >
            <label class="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                :checked="visibleColumns.includes(column.key)"
                @change="toggleColumn(column.key)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span class="text-sm text-gray-700">{{ column.label }}</span>
            </label>
            
            <Badge
              v-if="column.required"
              variant="secondary"
              class="text-xs"
            >
              Required
            </Badge>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-gray-200 flex justify-between">
          <Button
            variant="ghost"
            size="sm"
            @click="resetToDefault"
            class="text-xs"
          >
            Reset to Default
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            @click="isOpen = false"
            class="text-xs"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Settings, ChevronDown } from 'lucide-vue-next'

export interface ColumnDefinition {
  key: string
  label: string
  required?: boolean
}

interface Props {
  availableColumns: ColumnDefinition[]
  visibleColumns: string[]
}

interface Emits {
  (e: 'update:visibleColumns', columns: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(false)

const toggleColumn = (columnKey: string) => {
  const column = props.availableColumns.find(col => col.key === columnKey)
  
  // Don't allow hiding required columns
  if (column?.required && props.visibleColumns.includes(columnKey)) {
    return
  }
  
  const newVisibleColumns = props.visibleColumns.includes(columnKey)
    ? props.visibleColumns.filter(key => key !== columnKey)
    : [...props.visibleColumns, columnKey]
  
  emit('update:visibleColumns', newVisibleColumns)
}

const resetToDefault = () => {
  const defaultColumns = props.availableColumns
    .filter(col => col.required || ['title', 'status', 'priority', 'assignedTo', 'dueDate'].includes(col.key))
    .map(col => col.key)
  
  emit('update:visibleColumns', defaultColumns)
}

// Close dropdown when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    isOpen.value = false
  }
}

// Add event listener when component mounts
import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
