<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Deleted Tasks</h1>
        <p class="text-gray-600 mt-1">Manage deleted tasks - restore or permanently delete them</p>
      </div>
      
      <div class="flex items-center space-x-3">
        <Button
          v-if="selectedTasks.length > 0"
          variant="outline"
          @click="bulkRestore"
          class="flex items-center space-x-2"
        >
          <RotateCcw class="w-4 h-4" />
          <span>Restore Selected ({{ selectedTasks.length }})</span>
        </Button>
        
        <Button
          v-if="selectedTasks.length > 0"
          variant="destructive"
          @click="bulkPermanentDelete"
          class="flex items-center space-x-2"
        >
          <Trash2 class="w-4 h-4" />
          <span>Delete Permanently ({{ selectedTasks.length }})</span>
        </Button>
        
        <Button
          v-if="deletedTasks.length > 0"
          variant="outline"
          @click="clearAll"
          class="text-red-600 hover:text-red-700"
        >
          Clear All
        </Button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <Trash2 class="w-6 h-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Deleted</p>
            <p class="text-2xl font-bold text-gray-900">{{ deletedTasks.length }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Clock class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">This Week</p>
            <p class="text-2xl font-bold text-gray-900">{{ thisWeekDeleted }}</p>
          </div>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg border">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <RotateCcw class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Recoverable</p>
            <p class="text-2xl font-bold text-gray-900">{{ deletedTasks.length }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Deleted Tasks Table -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Deleted Tasks</h2>
          
          <div class="flex items-center space-x-3">
            <!-- Search -->
            <div class="relative">
              <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search deleted tasks..."
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <!-- Select All -->
            <div class="flex items-center space-x-2">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span class="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-4 py-3 text-left w-12">
                <span class="sr-only">Select</span>
              </th>
              <th class="px-4 py-3 text-left font-semibold text-gray-900">Task</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-900">Status</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-900">Priority</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-900">Deleted Date</th>
              <th class="px-4 py-3 text-left font-semibold text-gray-900">Deleted By</th>
              <th class="px-4 py-3 text-center font-semibold text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="task in filteredDeletedTasks"
              :key="task.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <!-- Select Checkbox -->
              <td class="px-4 py-3">
                <input
                  type="checkbox"
                  :checked="selectedTasks.includes(task.id)"
                  @change="toggleTaskSelection(task.id)"
                  class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
              </td>
              
              <!-- Task Info -->
              <td class="px-4 py-3">
                <div class="max-w-xs">
                  <div class="font-medium text-gray-900 truncate">{{ task.title }}</div>
                  <div class="text-sm text-gray-500 truncate" v-if="task.description">
                    {{ task.description }}
                  </div>
                  <div class="flex items-center space-x-2 mt-1" v-if="task.departmentName || task.projectName">
                    <Badge variant="outline" class="text-xs" v-if="task.departmentName">
                      <Building2 class="w-3 h-3 mr-1" />
                      {{ task.departmentName }}
                    </Badge>
                    <Badge variant="outline" class="text-xs" v-if="task.projectName">
                      <FolderOpen class="w-3 h-3 mr-1" />
                      {{ task.projectName }}
                    </Badge>
                  </div>
                </div>
              </td>
              
              <!-- Status -->
              <td class="px-4 py-3">
                <Badge :variant="getStatusVariant(task.status)" class="text-xs">
                  {{ getStatusLabel(task.status) }}
                </Badge>
              </td>
              
              <!-- Priority -->
              <td class="px-4 py-3">
                <Badge :variant="getPriorityVariant(task.priority)" class="text-xs">
                  {{ getPriorityLabel(task.priority) }}
                </Badge>
              </td>
              
              <!-- Deleted Date -->
              <td class="px-4 py-3">
                <div class="text-sm text-gray-900">
                  {{ formatDate(task.deletedAt) }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ getTimeAgo(task.deletedAt) }}
                </div>
              </td>
              
              <!-- Deleted By -->
              <td class="px-4 py-3">
                <div class="flex items-center space-x-2">
                  <Avatar class="w-6 h-6">
                    <AvatarImage :src="task.deletedBy?.avatar" />
                    <AvatarFallback class="text-xs">
                      {{ getInitials(task.deletedBy?.name || 'Unknown') }}
                    </AvatarFallback>
                  </Avatar>
                  <span class="text-sm text-gray-900">{{ task.deletedBy?.name || 'Unknown' }}</span>
                </div>
              </td>
              
              <!-- Actions -->
              <td class="px-4 py-3">
                <div class="flex items-center justify-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="restoreTask(task)"
                    title="Restore Task"
                    class="text-blue-600 hover:text-blue-700"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="permanentDeleteTask(task)"
                    title="Delete Permanently"
                    class="text-red-600 hover:text-red-700"
                  >
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="filteredDeletedTasks.length === 0" class="text-center py-12">
        <Trash2 class="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          {{ searchQuery ? 'No matching deleted tasks' : 'No deleted tasks' }}
        </h3>
        <p class="text-gray-500">
          {{ searchQuery ? 'Try adjusting your search criteria.' : 'Deleted tasks will appear here for recovery or permanent deletion.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks'
import type { DeletedTask } from '../types/task'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import {
  Trash2,
  RotateCcw,
  Clock,
  Search,
  Building2,
  FolderOpen
} from 'lucide-vue-next'
import { TaskStatus, TaskPriority } from '../types'

const tasksStore = useTasksStore()

// Reactive state
const searchQuery = ref('')
const selectedTasks = ref<string[]>([])

// Computed properties
const deletedTasks = computed(() => tasksStore.deletedTasks || [])

const filteredDeletedTasks = computed(() => {
  if (!searchQuery.value) return deletedTasks.value
  
  const query = searchQuery.value.toLowerCase()
  return deletedTasks.value.filter((task: DeletedTask) =>
    task.title.toLowerCase().includes(query) ||
    task.description?.toLowerCase().includes(query) ||
    task.departmentName?.toLowerCase().includes(query) ||
    task.projectName?.toLowerCase().includes(query)
  )
})

const thisWeekDeleted = computed(() => {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  
  return deletedTasks.value.filter((task: DeletedTask) => 
    task.deletedAt && new Date(task.deletedAt) >= oneWeekAgo
  ).length
})

const allSelected = computed(() => {
  return filteredDeletedTasks.value.length > 0 && 
         selectedTasks.value.length === filteredDeletedTasks.value.length
})

// Methods
const toggleTaskSelection = (taskId: string) => {
  const index = selectedTasks.value.indexOf(taskId)
  if (index > -1) {
    selectedTasks.value.splice(index, 1)
  } else {
    selectedTasks.value.push(taskId)
  }
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedTasks.value = []
  } else {
    selectedTasks.value = filteredDeletedTasks.value.map((task: DeletedTask) => task.id)
  }
}

const restoreTask = async (task: DeletedTask) => {
  try {
    await tasksStore.restoreTask(task.id)
    // Remove from selected if it was selected
    const index = selectedTasks.value.indexOf(task.id)
    if (index > -1) {
      selectedTasks.value.splice(index, 1)
    }
  } catch (error) {
    console.error('Failed to restore task:', error)
  }
}

const permanentDeleteTask = async (task: DeletedTask) => {
  if (confirm(`Are you sure you want to permanently delete "${task.title}"? This action cannot be undone.`)) {
    try {
      await tasksStore.permanentDeleteTask(task.id)
      // Remove from selected if it was selected
      const index = selectedTasks.value.indexOf(task.id)
      if (index > -1) {
        selectedTasks.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Failed to permanently delete task:', error)
    }
  }
}

const bulkRestore = async () => {
  if (confirm(`Are you sure you want to restore ${selectedTasks.value.length} tasks?`)) {
    try {
      await Promise.all(selectedTasks.value.map(async (taskId) => {
        const task = deletedTasks.value.find((t: DeletedTask) => t.id === taskId)
        if (task) {
          await tasksStore.restoreTask(taskId)
        }
      }))
      selectedTasks.value = []
    } catch (error) {
      console.error('Failed to bulk restore tasks:', error)
    }
  }
}

const bulkPermanentDelete = async () => {
  if (confirm(`Are you sure you want to permanently delete ${selectedTasks.value.length} tasks? This action cannot be undone.`)) {
    try {
      await Promise.all(selectedTasks.value.map(async (taskId) => {
        const task = deletedTasks.value.find((t: DeletedTask) => t.id === taskId)
        if (task) {
          await tasksStore.permanentDeleteTask(taskId)
        }
      }))
      selectedTasks.value = []
    } catch (error) {
      console.error('Failed to bulk delete tasks:', error)
    }
  }
}

const clearAll = async () => {
  if (confirm(`Are you sure you want to permanently delete all ${deletedTasks.value.length} deleted tasks? This action cannot be undone.`)) {
    try {
      await tasksStore.clearAllDeletedTasks()
      selectedTasks.value = []
    } catch (error) {
      console.error('Failed to clear all deleted tasks:', error)
    }
  }
}

// Helper functions
const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO: return 'secondary'
    case TaskStatus.IN_PROGRESS: return 'default'
    case TaskStatus.REVIEW: return 'secondary'
    case TaskStatus.DONE: return 'default'
    case TaskStatus.BLOCKED: return 'destructive'
    case TaskStatus.CANCELLED: return 'outline'
    default: return 'secondary'
  }
}

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO: return 'To Do'
    case TaskStatus.IN_PROGRESS: return 'In Progress'
    case TaskStatus.REVIEW: return 'Review'
    case TaskStatus.DONE: return 'Done'
    case TaskStatus.BLOCKED: return 'Blocked'
    case TaskStatus.CANCELLED: return 'Cancelled'
    default: return 'Unknown'
  }
}

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

const formatDate = (date: Date | string) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

const getTimeAgo = (date: Date | string) => {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

// Load deleted tasks on mount
onMounted(() => {
  tasksStore.fetchDeletedTasks()
})
</script>
