<template>
  <div class="bg-white rounded-lg border">
    <!-- Table Controls -->
    <div class="flex justify-between items-center p-4 border-b">
      <h2 class="text-lg font-semibold text-gray-900">Tasks</h2>
      <ColumnChooser
        :available-columns="availableColumns"
        :visible-columns="visibleColumns"
        @update:visible-columns="updateVisibleColumns"
      />
    </div>
    
    <!-- Table Header -->
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th v-if="isColumnVisible('done')" class="px-1 py-0.5 text-center w-12 border-r border-gray-200">
              <span class="font-semibold text-gray-900 text-xs">Done</span>
            </th>
            <th v-if="isColumnVisible('title')" class="px-2 py-0.5 text-left border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                @click="toggleSort('title')"
                class="font-semibold text-gray-900 hover:text-gray-700 text-xs p-1"
              >
                Task
                <ArrowUpDown class="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th v-if="isColumnVisible('status')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('status')">
              <div class="flex items-center justify-center space-x-1">
                <span>Status</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('priority')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('priority')">
              <div class="flex items-center justify-center space-x-1">
                <span>Priority</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('assignee')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('createdBy')">
              <div class="flex items-center justify-center space-x-1">
                <span>Creator</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('startDate')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('startDate')">
              <div class="flex items-center justify-center space-x-1">
                <span>Start Date</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('dueDate')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('dueDate')">
              <div class="flex items-center justify-center space-x-1">
                <span>Due Date</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('progress')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('progress')">
              <div class="flex items-center justify-center space-x-1">
                <span>Progress</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('assignedTo')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('assignedTo')">
              <div class="flex items-center justify-center space-x-1">
                <span>Assigned To</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('department')" class="px-2 py-1.5 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider border-b cursor-pointer" @click="toggleSort('departmentId')">
              <div class="flex items-center justify-center space-x-1">
                <span>Department</span>
                <ArrowUpDown class="h-3 w-3" />
              </div>
            </th>
            <th v-if="isColumnVisible('description')" class="px-2 py-0.5 text-left border-r border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                @click="toggleSort('description')"
                class="font-semibold text-gray-900 hover:text-gray-700 text-xs p-1"
              >
                Description
                <ArrowUpDown class="ml-1 h-3 w-3" />
              </Button>
            </th>
            <th v-if="isColumnVisible('rating')" class="px-2 py-0.5 text-center border-r border-gray-200">
              <span class="font-semibold text-gray-900 text-xs">Rating</span>
            </th>
            <th v-if="isColumnVisible('actions')" class="px-2 py-0.5 text-center">
              <span class="font-semibold text-gray-900 text-xs">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <template v-for="task in sortedTasks" :key="task.id">
            <tr class="hover:bg-gray-50 transition-colors">
            <!-- Done Checkbox -->
            <td v-if="isColumnVisible('done')" class="px-2 py-1 text-center border-r border-gray-200">
              <input
                type="checkbox"
                :checked="task.status === 'done'"
                @change="toggleTaskDone(task)"
                class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
            </td>
            
            <!-- Task Title & Description -->
            <td v-if="isColumnVisible('title')" class="px-2 py-0.5 border-r border-gray-200 w-64">
              <div class="max-w-md">
                <InlineEditCell
                  :value="task.title"
                  type="text"
                  @update:value="(value) => handleInlineEdit(task, 'title', value)"
                  class="font-medium text-sm"
                />
                <div class="flex items-center space-x-1 mt-0.5" v-if="task.departmentName || task.projectName">
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
            <td v-if="isColumnVisible('status')" class="px-2 py-0.5 text-center">
              <InlineEditCell
                :value="task.status"
                type="status"
                @update:value="(value) => handleInlineEdit(task, 'status', value)"
              />
            </td>

            <!-- Priority -->
            <td v-if="isColumnVisible('priority')" class="px-2 py-0.5 text-center">
              <InlineEditCell
                :value="task.priority"
                type="priority"
                @update:value="(value) => handleInlineEdit(task, 'priority', value)"
              />
            </td>

            <!-- Creator (Non-editable) -->
            <td v-if="isColumnVisible('assignee')" class="px-2 py-0.5 text-center">
              <div class="flex items-center justify-center space-x-2" v-if="getCurrentUserName()">
                <Avatar class="w-6 h-6 border-2 border-background">
                  <AvatarFallback class="text-xs">{{ getInitials(getCurrentUserName()) }}</AvatarFallback>
                </Avatar>
                <span class="text-xs text-gray-700">{{ getCurrentUserName() }}</span>
              </div>
              <span v-else class="text-xs text-gray-400">Unknown</span>
            </td>

            <!-- Start Date -->
            <td v-if="isColumnVisible('startDate')" class="px-2 py-0.5 text-center">
              <InlineEditCell
                :value="task.startDate"
                type="date"
                placeholder="No start date"
                @update:value="(value) => handleInlineEdit(task, 'startDate', value)"
              />
            </td>

            <!-- Due Date -->
            <td v-if="isColumnVisible('dueDate')" class="px-2 py-0.5 text-center">
              <div class="space-y-1">
                <InlineEditCell
                  :value="task.dueDate"
                  type="date"
                  placeholder="No due date"
                  @update:value="(value) => handleInlineEdit(task, 'dueDate', value)"
                />
                <div v-if="task.dueDate" class="text-xs" :class="{
                  'text-red-600': getDaysRemaining(task.dueDate) < 0,
                  'text-orange-600': getDaysRemaining(task.dueDate) >= 0 && getDaysRemaining(task.dueDate) <= 3,
                  'text-green-600': getDaysRemaining(task.dueDate) > 3
                }">
                  {{ getDaysRemaining(task.dueDate) < 0 ? `${Math.abs(getDaysRemaining(task.dueDate))} days overdue` : 
                     getDaysRemaining(task.dueDate) === 0 ? 'Due today' : 
                     `${getDaysRemaining(task.dueDate)} days left` }}
                </div>
              </div>
            </td>

            <!-- Progress -->
            <td v-if="isColumnVisible('progress')" class="px-2 py-0.5 text-center">
              <div class="w-full">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs font-medium text-gray-700">{{ task.progress || 0 }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :class="{
                      'bg-red-500': (task.progress || 0) < 25,
                      'bg-yellow-500': (task.progress || 0) >= 25 && (task.progress || 0) < 50,
                      'bg-blue-500': (task.progress || 0) >= 50 && (task.progress || 0) < 75,
                      'bg-green-500': (task.progress || 0) >= 75
                    }"
                    :style="{ width: `${task.progress || 0}%` }"
                  ></div>
                </div>
              </div>
            </td>

            <!-- Assigned To -->
            <td v-if="isColumnVisible('assignedTo')" class="px-2 py-0.5 text-center">
              <InlineEditCell
                :value="task.assignedTo"
                type="assignedTo"
                placeholder="Unassigned"
                @update:value="(value) => handleInlineEdit(task, 'assignedTo', value)"
              />
            </td>

            <!-- Department -->
            <td v-if="isColumnVisible('department')" class="px-2 py-0.5 text-center">
              <InlineEditCell
                :value="task.departmentId"
                type="department"
                placeholder="No Department"
                @update:value="(value) => handleInlineEdit(task, 'departmentId', value)"
              />
            </td>

            <!-- Description -->
            <td v-if="isColumnVisible('description')" class="px-2 py-0.5 border-r border-gray-200">
              <InlineEditCell
                :value="task.description"
                type="description"
                placeholder="No description"
                @update:value="(value) => handleInlineEdit(task, 'description', value)"
              />
            </td>

            <!-- Rating -->
            <td v-if="isColumnVisible('rating')" class="px-2 py-0.5 text-center border-r border-gray-200">
              <div class="flex items-center justify-center space-x-1">
                <button
                  v-for="star in 5"
                  :key="star"
                  @click="updateTaskRating(task, star)"
                  class="text-gray-300 hover:text-yellow-400 transition-colors"
                  :class="{ 'text-yellow-400': star <= (task.rating || 0) }"
                >
                  <Star class="w-4 h-4" :fill="star <= (task.rating || 0) ? 'currentColor' : 'none'" />
                </button>
              </div>
            </td>

            <!-- Actions -->
            <td class="px-1 py-0.5">
              <div class="flex items-center justify-center space-x-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('add-subtask', task)"
                  class="h-6 w-6 p-0"
                >
                  <Plus class="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('edit', task)"
                  class="h-6 w-6 p-0"
                >
                  <Edit class="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('view-log', task)"
                  class="h-6 w-6 p-0"
                >
                  <History class="h-3 w-3" />
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
          
          <!-- Subtasks Row -->
          <tr v-if="task.subtasks && task.subtasks.length > 0" class="bg-gray-50">
            <td colspan="9" class="px-4 py-3">
              <div class="ml-8">
                <h4 class="text-sm font-medium text-gray-700 mb-2">Subtasks</h4>
                <SubTaskTree
                  :subtasks="task.subtasks"
                  @toggle-completion="handleSubtaskToggle"
                  @add-nested-subtask="handleAddNestedSubtask"
                  @edit-subtask="handleEditSubtask"
                  @delete-subtask="handleDeleteSubtask"
                />
              </div>
            </td>
          </tr>
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
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import { 
  ArrowUpDown,
  Edit, 
  Trash2, 
  Plus,
  Star,
  History
} from 'lucide-vue-next'
import SubTaskTree from './SubTaskTree.vue'
import InlineEditCell from './InlineEditCell.vue'
import ColumnChooser, { type ColumnDefinition } from './ColumnChooser.vue'
import type { Task } from '../types'
import { TaskStatus, TaskPriority } from '../types'
import { useAuthStore } from '@/modules/auth/stores/auth'

// ... rest of the code remains the same ...
interface Props {
  tasks: Task[]
  loading?: boolean
}

interface Emits {
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'add-subtask', task: Task): void
  (e: 'statusChange', task: Task, status: TaskStatus): void
  (e: 'ratingChange', task: Task, rating: number): void
  (e: 'subtask-toggle', subtask: any): void
  (e: 'add-nested-subtask', subtask: any): void
  (e: 'edit-subtask', subtask: any): void
  (e: 'delete-subtask', subtask: any): void
  (e: 'view-log', task: Task): void
  (e: 'inline-edit', task: Task, field: string, value: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Initialize stores
const authStore = useAuthStore()

// Column visibility management
const availableColumns: ColumnDefinition[] = [
  { key: 'done', label: 'Done', required: true },
  { key: 'title', label: 'Task', required: true },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'assignee', label: 'Assignee' },
  { key: 'startDate', label: 'Start Date' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'progress', label: 'Progress' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'department', label: 'Department' },
  { key: 'description', label: 'Description' },
  { key: 'rating', label: 'Rating' },
  { key: 'actions', label: 'Actions', required: true }
]

const visibleColumns = ref<string[]>([
  'done', 'title', 'status', 'priority', 'startDate', 'dueDate', 'progress', 'description', 'actions'
])

const updateVisibleColumns = (columns: string[]) => {
  visibleColumns.value = columns
}

const isColumnVisible = (columnKey: string) => {
  return visibleColumns.value.includes(columnKey)
}

// Sorting
const sortField = ref<string>('createdAt')
const sortDirection = ref<'asc' | 'desc'>('desc')

const toggleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const sortedTasks = computed(() => {
  const tasks = [...props.tasks]
  
  return tasks.sort((a, b) => {
    let aValue: any = (a as any)[sortField.value]
    let bValue: any = (b as any)[sortField.value]

    // Handle special cases
    if (sortField.value === 'assignedTo') {
      aValue = a.assignedUsers?.length || 0
      bValue = b.assignedUsers?.length || 0
    }

    // Handle dates
    if (aValue instanceof Date) aValue = aValue.getTime()
    if (bValue instanceof Date) bValue = bValue.getTime()

    // Handle strings
    if (typeof aValue === 'string') aValue = aValue.toLowerCase()
    if (typeof bValue === 'string') bValue = bValue.toLowerCase()

    if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
    return 0
  })
})

// Status and Priority helpers
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

const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.DONE: return 'default'
    case TaskStatus.IN_PROGRESS: return 'secondary'
    case TaskStatus.REVIEW: return 'secondary'
    case TaskStatus.BLOCKED: return 'destructive'
    case TaskStatus.TODO: return 'outline'
    default: return 'outline'
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
    default: return 'To Do'
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
    day: 'numeric',
    year: '2-digit'
  }).format(new Date(date))
}

const getDaysRemaining = (dueDate: Date) => {
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getCreatorName = (createdBy: string) => {
  const user = authStore.users.find(u => u.uid === createdBy)
  return user?.name || 'Unknown User'
}

const getCurrentUserName = () => {
  return authStore.userProfile?.name || 'Current User'
}

// Actions
const updateTaskStatus = (task: Task, status: TaskStatus) => {
  emit('statusChange', task, status)
}

const toggleTaskDone = (task: Task) => {
  const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE
  emit('statusChange', task, newStatus)
}

const updateTaskRating = (task: Task, rating: number) => {
  emit('ratingChange', task, rating)
}

const handleInlineEdit = (task: Task, field: string, value: any) => {
  emit('inline-edit', task, field, value)
}

// Subtask handlers
const handleSubtaskToggle = (subtask: any) => {
  // Emit event to parent to handle subtask completion toggle
  emit('subtask-toggle', subtask)
}

const handleAddNestedSubtask = (subtask: any) => {
  // Emit event to parent to handle adding nested subtask
  emit('add-nested-subtask', subtask)
}

const handleEditSubtask = (subtask: any) => {
  // Emit event to parent to handle editing subtask
  emit('edit-subtask', subtask)
}

const handleDeleteSubtask = (subtask: any) => {
  // Emit event to parent to handle deleting subtask
  emit('delete-subtask', subtask)
}
</script>

<style scoped>
/* Custom scrollbar for table */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
