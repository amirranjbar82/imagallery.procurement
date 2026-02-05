<template>
  <div 
    class="kanban-card bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 cursor-move"
    draggable="true"
    @dragstart="handleDragStart"
    @click="$emit('edit', task)"
  >
    <div class="p-4">
      <!-- Header with priority and actions -->
      <div class="flex items-start justify-between mb-3">
        <Badge :variant="getPriorityVariant(task.priority)" class="text-xs">
          {{ getPriorityLabel(task.priority) }}
        </Badge>
        <div class="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" @click.stop="$emit('edit', task)">
            <Edit class="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" @click.stop="$emit('delete', task)">
            <Trash2 class="w-3 h-3" />
          </Button>
        </div>
      </div>

      <!-- Task title -->
      <h4 class="font-semibold text-sm mb-2 line-clamp-2 text-gray-900">
        {{ task.title }}
      </h4>

      <!-- Description -->
      <p v-if="task.description" class="text-xs text-gray-600 mb-3 line-clamp-2">
        {{ task.description }}
      </p>

      <!-- Progress bar -->
      <div v-if="task.progress && task.progress > 0" class="mb-3">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-gray-500">Progress</span>
          <span class="text-xs text-gray-700 font-medium">{{ task.progress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            class="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${task.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Tags -->
      <div v-if="task.tags && task.tags.length > 0" class="flex flex-wrap gap-1 mb-3">
        <span
          v-for="tag in task.tags.slice(0, 3)"
          :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
        >
          {{ tag }}
        </span>
        <span v-if="task.tags.length > 3" class="text-xs text-gray-400">
          +{{ task.tags.length - 3 }}
        </span>
      </div>

      <!-- Footer with assignee and due date -->
      <div class="flex items-center justify-between">
        <!-- Assignee -->
        <div class="flex items-center space-x-1" v-if="task.assignedUsers?.length">
          <div class="flex -space-x-1">
            <Avatar 
              v-for="user in task.assignedUsers.slice(0, 2)" 
              :key="user.id" 
              class="w-6 h-6 border-2 border-white"
            >
              <AvatarImage :src="user.avatar" :alt="user.name" />
              <AvatarFallback class="text-xs">
                {{ user.name.charAt(0).toUpperCase() }}
              </AvatarFallback>
            </Avatar>
            <div 
              v-if="task.assignedUsers.length > 2"
              class="w-6 h-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center"
            >
              <span class="text-xs text-gray-600">+{{ task.assignedUsers.length - 2 }}</span>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center space-x-1 text-gray-400">
          <UserX class="w-4 h-4" />
        </div>

        <!-- Due date -->
        <div v-if="task.dueDate" class="flex items-center space-x-1">
          <Calendar class="w-3 h-3" :class="getDueDateColor(task.dueDate)" />
          <span class="text-xs" :class="getDueDateColor(task.dueDate)">
            {{ formatDueDate(task.dueDate) }}
          </span>
        </div>
      </div>

      <!-- Estimated hours -->
      <div v-if="task.estimatedHours" class="mt-2 flex items-center space-x-1 text-gray-500">
        <Clock class="w-3 h-3" />
        <span class="text-xs">{{ task.estimatedHours }}h</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Trash2, Calendar, Clock, UserX } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { Task } from '../types/task'

// Props & Emits
interface Props {
  task: Task
}

interface Emits {
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Drag and drop
const handleDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', props.task.id)
    event.dataTransfer.effectAllowed = 'move'
  }
}

// Priority helpers
const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'default'
    case 'low': return 'secondary'
    default: return 'default'
  }
}

const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case 'critical': return 'Critical'
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    default: return 'Medium'
  }
}

// Due date helpers
const getDueDateColor = (dueDate: Date) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'text-red-600' // Overdue
  if (diffDays <= 1) return 'text-orange-600' // Due soon
  if (diffDays <= 3) return 'text-yellow-600' // Due this week
  return 'text-gray-600' // Normal
}

const formatDueDate = (dueDate: Date) => {
  const now = new Date()
  const due = new Date(dueDate)
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays <= 7) return `${diffDays}d left`
  
  return due.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })
}
</script>

<style scoped>
@reference "tailwindcss";
.kanban-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kanban-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
