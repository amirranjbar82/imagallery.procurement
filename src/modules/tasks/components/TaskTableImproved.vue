<template>
  <div class="bg-white rounded-lg border">
    <!-- Table Controls -->
    <div class="flex justify-between items-center p-4 border-b">
      <h2 class="text-lg font-semibold text-gray-900">Tasks</h2>
      <div class="flex items-center space-x-2">
        <Button variant="outline" size="sm" @click="expandAll">
          <ChevronDown class="h-4 w-4 mr-1" />
          Expand All
        </Button>
        <Button variant="outline" size="sm" @click="collapseAll">
          <ChevronRight class="h-4 w-4 mr-1" />
          Collapse All
        </Button>
      </div>
    </div>
    
    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th class="px-3 py-2 text-left w-8">
              <span class="text-xs font-medium text-gray-700">+</span>
            </th>
            <th class="px-3 py-2 text-center w-12">
              <span class="text-xs font-medium text-gray-700">✓</span>
            </th>
            <th class="px-3 py-2 text-left min-w-[300px]">
              <span class="text-xs font-medium text-gray-700">Task</span>
            </th>
            <th class="px-3 py-2 text-center w-24">
              <span class="text-xs font-medium text-gray-700">Status</span>
            </th>
            <th class="px-3 py-2 text-center w-20">
              <span class="text-xs font-medium text-gray-700">Priority</span>
            </th>
            <th class="px-3 py-2 text-center w-32">
              <span class="text-xs font-medium text-gray-700">Assignee</span>
            </th>
            <th class="px-3 py-2 text-center w-24">
              <span class="text-xs font-medium text-gray-700">Due Date</span>
            </th>
            <th class="px-3 py-2 text-center w-20">
              <span class="text-xs font-medium text-gray-700">Progress</span>
            </th>
            <th class="px-3 py-2 text-center w-24">
              <span class="text-xs font-medium text-gray-700">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <template v-for="task in tasks" :key="task.id">
            <!-- Main Task Row -->
            <tr class="hover:bg-gray-50 transition-colors" :class="{ 'bg-blue-50': expandedTasks.includes(task.id) }">
              <!-- Expand/Collapse Button -->
              <td class="px-3 py-2">
                <Button 
                  v-if="task.subtasks && task.subtasks.length > 0"
                  variant="ghost" 
                  size="sm" 
                  @click="toggleTaskExpansion(task.id)"
                  class="h-6 w-6 p-0 text-gray-600 hover:text-gray-800"
                >
                  <ChevronRight v-if="!expandedTasks.includes(task.id)" class="h-3 w-3" />
                  <ChevronDown v-else class="h-3 w-3" />
                </Button>
              </td>

              <!-- Done Checkbox -->
              <td class="px-3 py-2 text-center">
                <input
                  type="checkbox"
                  :checked="task.status === 'done'"
                  @change="$emit('toggle-completion', task)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </td>

              <!-- Task Title -->
              <td class="px-3 py-2">
                <div class="flex items-center space-x-2">
                  <span class="font-medium text-gray-900">{{ task.title }}</span>
                  <Badge v-if="task.subtasks && task.subtasks.length > 0" variant="secondary" class="text-xs">
                    {{ task.subtasks.length }} subtasks
                  </Badge>
                </div>
                <p v-if="task.description" class="text-sm text-gray-600 mt-1 truncate">{{ task.description }}</p>
              </td>

              <!-- Status -->
              <td class="px-3 py-2 text-center">
                <Badge :variant="getStatusVariant(task.status)" class="text-xs">
                  {{ task.status }}
                </Badge>
              </td>

              <!-- Priority -->
              <td class="px-3 py-2 text-center">
                <Badge :variant="getPriorityVariant(task.priority)" class="text-xs">
                  {{ task.priority }}
                </Badge>
              </td>

              <!-- Assignee -->
              <td class="px-3 py-2 text-center">
                <div class="flex items-center justify-center">
                  <Avatar class="h-6 w-6">
                    <AvatarFallback class="text-xs">
                      {{ getAssigneeInitials(task.assignedTo) }}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </td>

              <!-- Due Date -->
              <td class="px-3 py-2 text-center">
                <span class="text-xs text-gray-600">
                  {{ formatDate(task.dueDate) }}
                </span>
              </td>

              <!-- Progress -->
              <td class="px-3 py-2 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <div class="w-12 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      :style="{ width: `${task.progress || 0}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-gray-600">{{ task.progress || 0 }}%</span>
                </div>
              </td>

              <!-- Actions -->
              <td class="px-3 py-2 text-center">
                <div class="flex items-center justify-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="$emit('add-subtask', task)"
                    class="h-6 w-6 p-0 text-blue-600 hover:text-blue-700"
                  >
                    <Plus class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="$emit('edit', task)"
                    class="h-6 w-6 p-0 text-gray-600 hover:text-gray-700"
                  >
                    <Edit class="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="$emit('delete', task)"
                    class="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="h-3 w-3" />
                  </Button>
                </div>
              </td>
            </tr>

            <!-- Subtasks Rows (Inline Display) -->
            <template v-if="expandedTasks.includes(task.id) && task.subtasks && task.subtasks.length > 0">
              <SubtaskRowInline 
                v-for="(subtask, index) in task.subtasks" 
                :key="`${task.id}-${subtask.id}`"
                :subtask="subtask"
                :task-id="task.id"
                :depth="1"
                :is-last="index === task.subtasks.length - 1"
                :expanded-subtasks="expandedSubtasks"
                @toggle-completion="$emit('subtask-toggle', $event)"
                @add-nested-subtask="$emit('add-nested-subtask', $event)"
                @edit-subtask="$emit('edit-subtask', $event)"
                @delete-subtask="$emit('delete-subtask', $event)"
                @toggle-subtask-expansion="toggleSubtaskExpansion"
              />
            </template>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Empty state -->
    <div v-if="tasks.length === 0" class="text-center py-12">
      <FileText class="h-12 w-12 mx-auto text-gray-400 mb-4" />
      <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
      <p class="text-gray-500 mb-4">Get started by creating your first task.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Edit,
  Trash2,
  FileText
} from 'lucide-vue-next'
import SubtaskRowInline from './SubtaskRowInline.vue'

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: string | string[]
  dueDate?: string | Date
  progress?: number
  subtasks?: Task[]
}

interface Props {
  tasks: Task[]
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits([
  'toggle-completion',
  'add-subtask',
  'edit',
  'delete',
  'subtask-toggle',
  'add-nested-subtask',
  'edit-subtask',
  'delete-subtask'
])

// Reactive state
const expandedTasks = ref<string[]>([])
const expandedSubtasks = ref<string[]>([])

// Task expansion functions
const toggleTaskExpansion = (taskId: string) => {
  const index = expandedTasks.value.indexOf(taskId)
  if (index > -1) {
    expandedTasks.value.splice(index, 1)
  } else {
    expandedTasks.value.push(taskId)
  }
}

const toggleSubtaskExpansion = (subtaskId: string) => {
  const index = expandedSubtasks.value.indexOf(subtaskId)
  if (index > -1) {
    expandedSubtasks.value.splice(index, 1)
  } else {
    expandedSubtasks.value.push(subtaskId)
  }
}

const expandAll = () => {
  expandedTasks.value = props.tasks
    .filter(task => task.subtasks && task.subtasks.length > 0)
    .map(task => task.id)
}

const collapseAll = () => {
  expandedTasks.value = []
  expandedSubtasks.value = []
}

// Helper functions
const getStatusVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'done':
      return 'default'
    case 'in-progress':
    case 'in progress':
      return 'secondary'
    case 'todo':
    case 'to-do':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    default:
      return 'outline'
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'destructive'
    case 'medium':
      return 'secondary'
    case 'low':
      return 'outline'
    default:
      return 'outline'
  }
}

const getAssigneeInitials = (assignedTo: string | string[] | null | undefined) => {
  if (!assignedTo) return 'UN'
  
  if (Array.isArray(assignedTo)) {
    return assignedTo[0]?.substring(0, 2).toUpperCase() || 'UN'
  }
  
  return assignedTo.substring(0, 2).toUpperCase()
}

const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-'
  
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: '2-digit'
    })
  } catch {
    return '-'
  }
}
</script>

<style scoped>
@reference "tailwindcss";
.bg-gray-25 {
  background-color: #fafafa;
}
</style>
