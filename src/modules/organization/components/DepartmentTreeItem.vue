<template>
  <div 
    class="border rounded-lg p-3 transition-colors group"
    :class="{
      'ml-6 border-l-2 border-l-blue-200': department.level > 0,
      'shadow-sm': department.level === 0,
      'bg-blue-100 border-blue-300 shadow-md': isSelected,
      'hover:bg-gray-50': !isSelected,
      'hover:bg-blue-200': isSelected
    }"
  >
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div 
        class="flex items-center space-x-2 cursor-pointer flex-1"
        @click="$emit('select', department.department)"
      >
        <!-- Hierarchy indicator -->
        <div class="flex items-center space-x-1">
          <div 
            v-if="department.level > 0"
            class="w-4 h-0.5 bg-gray-300"
          ></div>
          <div 
            class="w-2 h-2 rounded-full"
            :class="{
              'bg-blue-500': department.level === 0,
              'bg-green-500': department.level === 1,
              'bg-yellow-500': department.level === 2,
              'bg-purple-500': department.level >= 3
            }"
          ></div>
        </div>
        <h3 
          class="font-medium text-gray-900"
          :class="{
            'text-lg': department.level === 0,
            'text-base': department.level === 1,
            'text-sm': department.level >= 2
          }"
        >
          {{ department.department.name }}
        </h3>
        <span 
          v-if="department.children && department.children.length > 0"
          class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
        >
          {{ department.children.length }} sub-dept{{ department.children.length > 1 ? 's' : '' }}
        </span>
      </div>
      
      <div class="flex items-center space-x-2">
        <span class="text-xs text-gray-500">{{ department.userCount }} users</span>
        <span 
          v-if="!department.department.isActive" 
          class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
        >
          Inactive
        </span>
        <button 
          class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-red-600 hover:text-red-700 hover:bg-red-50"
          @click.stop="$emit('delete', department.department)"
          title="Delete Department"
        >
          <Trash2 class="h-4 w-4" />
        </button>
      </div>
    </div>
    
    <!-- Description -->
    <div 
      v-if="department.department.description || department.department.departmentHead"
      class="mt-2 cursor-pointer"
      @click="$emit('select', department.department)"
    >
      <p 
        v-if="department.department.description" 
        class="text-sm text-gray-600"
      >
        {{ department.department.description }}
      </p>
      <div 
        v-if="department.department.departmentHead" 
        class="text-xs text-gray-500 mt-1"
      >
        <span class="font-medium">Head:</span> {{ department.department.departmentHead }}
      </div>
    </div>
    
    <!-- Children departments -->
    <div 
      v-if="department.children && department.children.length > 0" 
      class="mt-3 space-y-2"
    >
      <DepartmentTreeItem 
        v-for="child in department.children" 
        :key="child.department.departmentId"
        :department="child"
        :selectedDepartment="selectedDepartment"
        @select="$emit('select', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import type { DepartmentHierarchy, Department } from '../types/organization'

// Define component name for recursive usage
defineOptions({
  name: 'DepartmentTreeItem'
})

const props = defineProps<{
  department: DepartmentHierarchy
  selectedDepartment?: Department | null
}>()

// Computed property to check if this department is selected
const isSelected = computed(() => {
  if (!props.selectedDepartment) return false
  return props.selectedDepartment.departmentId === props.department.department.departmentId
})

defineEmits<{
  select: [department: any]
  delete: [department: any]
}>()
</script>
