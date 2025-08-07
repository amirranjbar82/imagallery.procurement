<template>
  <div class="flex flex-col items-center">
    <!-- Current Department Node -->
    <div 
      :class="[
        'border-2 rounded-lg bg-white shadow-sm text-center transition-all duration-200 hover:shadow-md relative group',
        level === 0 ? 'p-4 min-w-48' : level === 1 ? 'p-3 min-w-40' : 'p-2 min-w-32',
        selected?.departmentId === node.department.departmentId 
          ? 'border-blue-500 bg-blue-50' 
          : level === 0 ? 'border-gray-300' : 'border-gray-200'
      ]"
    >
      <!-- Delete Button (appears on hover) -->
      <button
        @click.stop="$emit('delete', node.department)"
        class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-xs font-bold hover:bg-red-600"
        title="Delete Department"
      >
        ×
      </button>
      
      <!-- Department Content (clickable area) -->
      <div @click="$emit('select', node.department)" class="cursor-pointer">
      <div class="flex items-center justify-center mb-2">
        <Building2 :class="[
          'text-blue-600 mr-2',
          level === 0 ? 'h-6 w-6' : level === 1 ? 'h-5 w-5' : 'h-4 w-4'
        ]" />
        <h3 :class="[
          'font-semibold',
          level === 0 ? 'text-base' : level === 1 ? 'text-sm' : 'text-xs'
        ]">
          {{ node.department.name }}
        </h3>
      </div>
      
      <p v-if="level === 0 && node.department.description" 
         class="text-sm text-gray-600 mb-1">
        {{ node.department.description }}
      </p>
      
      <p :class="[
        'text-gray-500',
        level === 0 ? 'text-xs' : 'text-xs'
      ]">
        {{ getDepartmentUserCount(node.department.departmentId) }} users
      </p>
      
      <!-- Level indicator for debugging -->
      <div v-if="level > 0" 
           :class="[
             'mt-1 px-2 py-1 rounded text-xs font-medium',
             level === 1 ? 'bg-green-100 text-green-700' : 
             level === 2 ? 'bg-yellow-100 text-yellow-700' : 
             'bg-red-100 text-red-700'
           ]">
        Level {{ level + 1 }}
      </div>
      </div>
    </div>
    
    <!-- Children Departments (Recursive) -->
    <div v-if="node.children && node.children.length > 0" class="mt-4">
      <!-- Connector Line -->
      <div class="w-px h-4 bg-gray-300 mx-auto"></div>
      
      <!-- Children Container -->
      <div :class="[
        'flex justify-center',
        level === 0 ? 'space-x-8' : level === 1 ? 'space-x-6' : 'space-x-4'
      ]">
        <!-- Recursive Child Nodes -->
        <OrgChartNode 
          v-for="child in node.children" 
          :key="child.department.departmentId"
          :node="child"
          :level="level + 1"
          :selected="selected"
          @select="$emit('select', $event)"
          @delete="$emit('delete', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'
import type { Department } from '../types/organization'

// Define the hierarchy node type
interface DepartmentHierarchy {
  department: Department
  children: DepartmentHierarchy[]
  userCount: number
  level: number
}

// Props
interface Props {
  node: DepartmentHierarchy
  level: number
  selected?: Department | null
}

defineProps<Props>()

// Emits
defineEmits<{
  select: [department: Department]
  delete: [department: Department]
}>()

// Helper function for user count (mock implementation)
function getDepartmentUserCount(departmentId: string): number {
  // Mock user counts based on department level and ID
  const hash = departmentId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0)
    return a & a
  }, 0)
  
  return Math.abs(hash % 20) + 1 // Random number between 1-20
}
</script>
