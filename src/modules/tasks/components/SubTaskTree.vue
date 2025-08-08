<template>
  <div class="space-y-2">
    <div
      v-for="subtask in subtasks"
      :key="subtask.id"
      :class="[
        'border rounded-lg p-3 bg-white',
        `ml-${subtask.level * 4}` // Indentation based on level
      ]"
    >
      <!-- Subtask Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3 flex-1">
          <!-- Completion Checkbox -->
          <input
            type="checkbox"
            :checked="subtask.completed"
            @change="toggleSubtaskCompletion(subtask)"
            class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          
          <!-- Subtask Title -->
          <div class="flex-1">
            <h4 
              :class="[
                'font-medium text-sm',
                subtask.completed ? 'line-through text-gray-500' : 'text-gray-900'
              ]"
            >
              {{ subtask.title }}
            </h4>
            <p 
              v-if="subtask.description" 
              class="text-xs text-gray-600 mt-1"
            >
              {{ subtask.description }}
            </p>
          </div>
          
          <!-- Progress Bar (if has nested subtasks) -->
          <div v-if="subtask.subtasks.length > 0" class="flex items-center space-x-2">
            <div class="w-16 bg-gray-200 rounded-full h-2">
              <div 
                class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: `${subtask.progress}%` }"
              ></div>
            </div>
            <span class="text-xs text-gray-500">{{ subtask.progress }}%</span>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex items-center space-x-1">
          <!-- Priority Badge -->
          <Badge 
            v-if="subtask.priority" 
            :variant="getPriorityVariant(subtask.priority)" 
            class="text-xs"
          >
            {{ getPriorityLabel(subtask.priority) }}
          </Badge>
          
          <!-- Due Date -->
          <span 
            v-if="subtask.dueDate" 
            :class="[
              'text-xs',
              isOverdue(subtask.dueDate) ? 'text-red-600' : 'text-gray-500'
            ]"
          >
            {{ formatDate(subtask.dueDate) }}
          </span>
          
          <!-- Assigned User -->
          <Avatar v-if="subtask.assignedUserName" class="w-6 h-6">
            <AvatarImage :src="''" />
            <AvatarFallback class="text-xs">
              {{ getInitials(subtask.assignedUserName) }}
            </AvatarFallback>
          </Avatar>
          
          <!-- Add Nested Subtask Button -->
          <Button 
            variant="ghost" 
            size="sm" 
            @click="$emit('add-nested-subtask', subtask)"
            title="Add Nested Subtask"
            class="w-6 h-6 p-0"
          >
            <Plus class="w-3 h-3" />
          </Button>
          
          <!-- Edit Subtask Button -->
          <Button 
            variant="ghost" 
            size="sm" 
            @click="$emit('edit-subtask', subtask)"
            title="Edit Subtask"
            class="w-6 h-6 p-0"
          >
            <Edit class="w-3 h-3" />
          </Button>
          
          <!-- Delete Subtask Button -->
          <Button 
            variant="ghost" 
            size="sm" 
            @click="$emit('delete-subtask', subtask)"
            title="Delete Subtask"
            class="w-6 h-6 p-0 text-red-600 hover:text-red-700"
          >
            <Trash2 class="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <!-- Nested Subtasks (Recursive) -->
      <div v-if="subtask.subtasks.length > 0" class="mt-3">
        <SubTaskTree
          :subtasks="subtask.subtasks"
          @toggle-completion="$emit('toggle-completion', $event)"
          @add-nested-subtask="$emit('add-nested-subtask', $event)"
          @edit-subtask="$emit('edit-subtask', $event)"
          @delete-subtask="$emit('delete-subtask', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Edit, Trash2 } from 'lucide-vue-next'
import type { SubTask } from '../types/common'
import { TaskPriority } from '../types/common'

interface Props {
  subtasks: SubTask[]
}

interface Emits {
  (e: 'toggle-completion', subtask: SubTask): void
  (e: 'add-nested-subtask', subtask: SubTask): void
  (e: 'edit-subtask', subtask: SubTask): void
  (e: 'delete-subtask', subtask: SubTask): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions
const getPriorityVariant = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.CRITICAL: return 'destructive'
    case TaskPriority.HIGH: return 'destructive'
    case TaskPriority.MEDIUM: return 'secondary'
    case TaskPriority.LOW: return 'outline'
    default: return 'outline'
  }
}

const getPriorityLabel = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.CRITICAL: return 'Critical'
    case TaskPriority.HIGH: return 'High'
    case TaskPriority.MEDIUM: return 'Medium'
    case TaskPriority.LOW: return 'Low'
    default: return 'Low'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

const isOverdue = (dueDate: Date) => {
  return new Date() > new Date(dueDate)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const toggleSubtaskCompletion = (subtask: SubTask) => {
  emit('toggle-completion', subtask)
}
</script>

<style scoped>
/* Custom indentation classes */
.ml-0 { margin-left: 0; }
.ml-4 { margin-left: 1rem; }
.ml-8 { margin-left: 2rem; }
.ml-12 { margin-left: 3rem; }
.ml-16 { margin-left: 4rem; }
.ml-20 { margin-left: 5rem; }
</style>
