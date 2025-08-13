<template>
  <div class="flex flex-col items-center">
    <!-- Current Department Node -->
    <div 
      :class="[
        'border-2 rounded-md bg-white shadow-sm text-center transition-all duration-200 hover:shadow-md relative group',
        level === 0 ? 'p-3 min-w-40' : level === 1 ? 'p-2.5 min-w-36' : 'p-2 min-w-28',
        selected?.departmentId === node.department.departmentId 
          ? 'border-blue-500 bg-blue-50' 
          : level === 0 ? 'border-gray-300' : 'border-gray-200'
      ]"
    >
      <!-- Corner Actions (icon-only, show on hover) -->
      <button
        @click.stop="$emit('add', node.department)"
        class="absolute top-1 left-1 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Add Sub-Department"
        aria-label="Add Sub-Department"
      >
        <Plus class="h-3 w-3" />
      </button>
      <button
        @click.stop="$emit('delete', node.department)"
        class="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
        title="Delete Department"
        aria-label="Delete Department"
      >
        <X class="h-3 w-3" />
      </button>
      
      <!-- Department Content (clickable area) -->
      <div @click="$emit('select', node.department)" class="cursor-pointer">
      <div class="flex items-center justify-center mb-1.5">
        <Building2 :class="[
          'text-blue-600 mr-2',
          level === 0 ? 'h-5 w-5' : level === 1 ? 'h-4.5 w-4.5' : 'h-4 w-4'
        ]" />
        <h3 :class="[
          'font-semibold',
          level === 0 ? 'text-sm' : level === 1 ? 'text-xs' : 'text-[11px]'
        ]">
          {{ node.department.name }}
        </h3>
      </div>
      
      <p v-if="level === 0 && node.department.description" 
         class="text-[13px] text-gray-600 mb-1">
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
             'mt-1 px-1.5 py-0.5 rounded text-[11px] font-medium',
             level === 1 ? 'bg-green-100 text-green-700' : 
             level === 2 ? 'bg-yellow-100 text-yellow-700' : 
             'bg-red-100 text-red-700'
           ]">
        Level {{ level + 1 }}
      </div>
      </div>
    </div>
    
    <!-- Children Departments (Recursive) -->
    <div v-if="node.children && node.children.length > 0" class="mt-3">
      <!-- Connector Line -->
      <div class="w-[2px] h-5 bg-gray-400/80 mx-auto"></div>
      
      <!-- Children Container -->
      <div :class="[
        'flex justify-center',
        level === 0 ? 'space-x-6' : level === 1 ? 'space-x-4' : 'space-x-3'
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
          @add="$emit('add', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Building2, Plus, X } from 'lucide-vue-next'
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
  add: [department: Department]
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
