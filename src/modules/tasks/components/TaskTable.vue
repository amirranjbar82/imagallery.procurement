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
      <table class="w-full table-fixed">
        <thead class="bg-gray-100 border-b">
          <tr>
            <th v-if="isColumnVisible('done')" class="px-2 py-1 text-center w-12 border-r border-gray-300">
              <span class="font-medium text-gray-700 text-sm">Done</span>
            </th>
            <th v-if="isColumnVisible('title')" class="px-2 py-1 text-left border-r border-gray-300" :style="{ width: taskColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Task</span>
                <Button variant="ghost" size="sm" @click="toggleSort('title')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('status')" class="px-2 py-1 text-center border-r border-gray-300" :style="{ width: statusColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Status</span>
                <div class="flex items-center space-x-0.5">
                  <Button variant="ghost" size="sm" @click="toggleSort('status')" class="p-0 h-auto">
                    <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" class="p-0 h-auto">
                        <Filter class="h-2.5 w-2.5 text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" class="w-48">
                    <div class="p-2">
                      <div class="text-sm font-medium mb-2">Filter by Status</div>
                      <div v-for="status in getUniqueValues('status')" :key="String(status)" class="flex items-center space-x-2 py-1">
                        <input 
                          type="checkbox" 
                          :id="`status-${status}`"
                          :checked="filters.status.includes(status)"
                          @change="(e) => {
                            const checked = (e.target as HTMLInputElement).checked
                            if (checked) {
                              filters.status.push(status)
                            } else {
                              const index = filters.status.indexOf(status)
                              if (index > -1) filters.status.splice(index, 1)
                            }
                          }"
                          class="rounded"
                        />
                        <label :for="`status-${status}`" class="text-sm">{{ status }}</label>
                      </div>
                      <DropdownMenuSeparator />
                      <Button variant="ghost" size="sm" @click="clearFilter('status')" class="w-full text-xs">
                        Clear Filter
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </th>
            <th v-if="isColumnVisible('priority')" class="px-2 py-1 text-center border-r border-gray-300" :style="{ width: priorityColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Priority</span>
                <div class="flex items-center space-x-0.5">
                  <Button variant="ghost" size="sm" @click="toggleSort('priority')" class="p-0 h-auto">
                    <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" class="p-0 h-auto">
                        <Filter class="h-2.5 w-2.5 text-gray-700" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="center" class="w-48">
                    <div class="p-2">
                      <div class="text-sm font-medium mb-2">Filter by Priority</div>
                      <div v-for="priority in getUniqueValues('priority')" :key="String(priority)" class="flex items-center space-x-2 py-1">
                        <input 
                          type="checkbox" 
                          :id="`priority-${priority}`"
                          :checked="filters.priority.includes(priority)"
                          @change="(e) => {
                            const checked = (e.target as HTMLInputElement).checked
                            if (checked) {
                              filters.priority.push(priority)
                            } else {
                              const index = filters.priority.indexOf(priority)
                              if (index > -1) filters.priority.splice(index, 1)
                            }
                          }"
                          class="rounded"
                        />
                        <label :for="`priority-${priority}`" class="text-sm">{{ priority }}</label>
                      </div>
                      <DropdownMenuSeparator />
                      <Button variant="ghost" size="sm" @click="clearFilter('priority')" class="w-full text-xs">
                        Clear Filter
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>
            </th>
            <th v-if="isColumnVisible('assignee')" class="px-2 py-1 text-center border-r border-gray-300">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Creator</span>
                <Button variant="ghost" size="sm" @click="toggleSort('createdBy')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('startDate')" class="px-2 py-1 text-center border-r border-gray-300" :style="{ width: startDateColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Start date</span>
                <Button variant="ghost" size="sm" @click="toggleSort('startDate')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('dueDate')" class="px-2 py-1 text-center border-r border-gray-300" :style="{ width: dueDateColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Due date</span>
                <Button variant="ghost" size="sm" @click="toggleSort('dueDate')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('daysRemaining')" class="px-2 py-1 text-center border-r border-gray-300" :style="{ width: daysRemainingColumnWidth }">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Days Remaining</span>
                <Button variant="ghost" size="sm" @click="toggleSort('daysRemaining')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('progress')" class="px-2 py-1 text-center border-r border-gray-300">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Progress</span>
                <Button variant="ghost" size="sm" @click="toggleSort('progress')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('assignedTo')" class="px-2 py-1 text-center border-r border-gray-300">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Assigned to</span>
                <Button variant="ghost" size="sm" @click="toggleSort('assignedTo')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('department')" class="px-2 py-1 text-center border-r border-gray-300">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Department</span>
                <Button variant="ghost" size="sm" @click="toggleSort('departmentId')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('description')" class="px-2 py-1 text-left border-r border-gray-300">
              <div class="flex items-center justify-between">
                <span class="font-medium text-gray-700 text-sm">Description</span>
                <Button variant="ghost" size="sm" @click="toggleSort('description')" class="p-0 h-auto">
                  <ArrowUpDown class="h-2.5 w-2.5 text-gray-700" />
                </Button>
              </div>
            </th>
            <th v-if="isColumnVisible('rating')" class="px-2 py-1 text-center border-r border-gray-300">
              <span class="font-medium text-gray-700 text-sm">Rating</span>
            </th>
            <th v-if="isColumnVisible('actions')" class="px-2 py-1 text-center">
              <span class="font-medium text-gray-700 text-sm">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <template v-for="task in sortedTasks" :key="task.id">
            <tr class="hover:bg-gray-50 transition-colors h-12" :class="{ 'bg-gray-50': sortedTasks.indexOf(task) % 2 === 1, 'bg-white': sortedTasks.indexOf(task) % 2 === 0 }">
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
            <td v-if="isColumnVisible('title')" class="px-2 py-0.5 border-r border-gray-200 whitespace-nowrap overflow-hidden" :style="{ width: taskColumnWidth }">
              <div class="max-w-md truncate">
                <InlineEditCell
                  :value="task.title"
                  type="text"
                  @update:value="(value) => handleInlineEdit(task, 'title', value)"
                  class="font-medium text-sm truncate"
                />
                <div class="flex items-center space-x-1 mt-0.5 overflow-hidden" v-if="task.departmentName || task.projectName">
                  <Badge variant="outline" class="text-xs whitespace-nowrap" v-if="task.departmentName">
                    <Building2 class="w-3 h-3 mr-1" />
                    {{ task.departmentName }}
                  </Badge>
                  <Badge variant="outline" class="text-xs whitespace-nowrap" v-if="task.projectName">
                    <FolderOpen class="w-3 h-3 mr-1" />
                    {{ task.projectName }}
                  </Badge>
                </div>
              </div>
            </td>

            <!-- Status -->
            <td v-if="isColumnVisible('status')" class="px-2 py-0.5 text-center whitespace-nowrap" :style="{ width: statusColumnWidth }">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div class="cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <Badge 
                      :variant="getStatusVariant(task.status)"
                      class="text-xs"
                    >
                      {{ getStatusLabel(task.status) }}
                    </Badge>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" class="w-32">
                  <div class="p-2">
                    <div class="text-sm font-medium mb-2">Set Status</div>
                    <div class="space-y-1">
                      <DropdownMenuItem
                        v-for="status in [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.DONE, TaskStatus.CANCELLED]" 
                        :key="status"
                        @click="emit('inline-edit', task, 'status', status)"
                        class="flex items-center px-2 py-1 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        :class="{ 'bg-blue-50 text-blue-700': task.status === status }"
                      >
                        <Badge 
                          :variant="getStatusVariant(status)"
                          class="text-xs mr-2"
                        >
                          {{ getStatusLabel(status) }}
                        </Badge>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>

            <!-- Priority -->
            <td v-if="isColumnVisible('priority')" class="px-2 py-0.5 text-center whitespace-nowrap" :style="{ width: priorityColumnWidth }">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div class="cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <Badge 
                      :variant="getPriorityVariant(task.priority)"
                      class="text-xs"
                    >
                      {{ getPriorityLabel(task.priority) }}
                    </Badge>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" class="w-32">
                  <div class="p-2">
                    <div class="text-sm font-medium mb-2">Set Priority</div>
                    <div class="space-y-1">
                      <DropdownMenuItem
                        v-for="priority in [TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL]" 
                        :key="priority"
                        @click="emit('inline-edit', task, 'priority', priority)"
                        class="flex items-center px-2 py-1 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        :class="{ 'bg-blue-50 text-blue-700': task.priority === priority }"
                      >
                        <Badge 
                          :variant="getPriorityVariant(priority)"
                          class="text-xs mr-2"
                        >
                          {{ getPriorityLabel(priority) }}
                        </Badge>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>

            <!-- Creator (Non-editable) -->
            <td v-if="isColumnVisible('assignee')" class="px-2 py-0.5 text-center whitespace-nowrap">
              <div class="flex items-center justify-center space-x-2" v-if="getCurrentUserName()">
                <Avatar class="w-6 h-6 border-2 border-background">
                  <AvatarFallback class="text-xs">{{ getInitials(getCurrentUserName()) }}</AvatarFallback>
                </Avatar>
                <span class="text-xs text-gray-700">{{ getCurrentUserName() }}</span>
              </div>
              <span v-else class="text-xs text-gray-400">Unknown</span>
            </td>

            <!-- Start Date -->
            <td v-if="isColumnVisible('startDate')" class="px-2 py-0.5 text-center whitespace-nowrap" :style="{ width: startDateColumnWidth }">
              <InlineEditCell
                :value="task.startDate"
                type="date"
                placeholder="No start date"
                @update:value="(value) => handleInlineEdit(task, 'startDate', value)"
              />
            </td>

            <!-- Due Date -->
            <td v-if="isColumnVisible('dueDate')" class="px-2 py-0.5 text-center whitespace-nowrap" :style="{ width: dueDateColumnWidth }">
              <InlineEditCell
                :value="task.dueDate"
                type="date"
                placeholder="No due date"
                @update:value="(value) => handleInlineEdit(task, 'dueDate', value)"
              />
            </td>

            <!-- Days Remaining -->
            <td v-if="isColumnVisible('daysRemaining')" class="px-2 py-0.5 text-center whitespace-nowrap" :style="{ width: daysRemainingColumnWidth }">
              <div v-if="task.dueDate" class="flex items-center justify-center">
                <span 
                  class="text-xs font-medium"
                  :class="getDaysRemainingTextColor(getDaysRemaining(task.dueDate?.toString() || ''))"
                >
                  {{ getDaysRemaining(task.dueDate?.toString() || '') < 0 ? `${Math.abs(getDaysRemaining(task.dueDate?.toString() || ''))} overdue` : 
                     getDaysRemaining(task.dueDate?.toString() || '') === 0 ? 'Due today' : 
                     `${getDaysRemaining(task.dueDate?.toString() || '')} days left` }}
                </span>
              </div>
              <span v-else class="text-xs text-gray-400">No due date</span>
            </td>

            <!-- Progress -->
            <td v-if="isColumnVisible('progress')" class="px-2 py-0.5 text-center whitespace-nowrap">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div class="w-full cursor-pointer hover:bg-gray-50 p-1 rounded">
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
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" class="w-32">
                  <div class="p-2">
                    <div class="text-sm font-medium mb-2">Set Progress</div>
                    <div class="space-y-1">
                      <DropdownMenuItem
                        v-for="percentage in [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]" 
                        :key="percentage"
                        @click="emit('inline-edit', task, 'progress', percentage)"
                        class="flex items-center justify-between px-2 py-1 text-sm hover:bg-gray-100 rounded cursor-pointer"
                        :class="{ 'bg-blue-50 text-blue-700': task.progress === percentage }"
                      >
                        <span>{{ percentage }}%</span>
                        <div class="w-8 h-1 bg-gray-200 rounded-full ml-2">
                          <div 
                            class="h-1 rounded-full"
                            :class="{
                              'bg-red-500': percentage < 25,
                              'bg-yellow-500': percentage >= 25 && percentage < 50,
                              'bg-blue-500': percentage >= 50 && percentage < 75,
                              'bg-green-500': percentage >= 75
                            }"
                            :style="{ width: `${percentage}%` }"
                          ></div>
                        </div>
                      </DropdownMenuItem>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>

            <!-- Assigned To -->
            <td v-if="isColumnVisible('assignedTo')" class="px-2 py-0.5 text-center whitespace-nowrap">
              <InlineEditCell
                :value="task.assignedTo"
                type="assignedTo"
                placeholder="Unassigned"
                @update:value="(value) => handleInlineEdit(task, 'assignedTo', value)"
              />
            </td>

            <!-- Department -->
            <td v-if="isColumnVisible('department')" class="px-2 py-0.5 text-center whitespace-nowrap">
              <InlineEditCell
                :value="task.departmentId"
                type="department"
                placeholder="No Department"
                @update:value="(value) => handleInlineEdit(task, 'departmentId', value)"
              />
            </td>

            <!-- Description -->
            <td v-if="isColumnVisible('description')" class="px-2 py-0.5 border-r border-gray-200 whitespace-nowrap overflow-hidden">
              <InlineEditCell
                :value="task.description"
                type="description"
                placeholder="No description"
                @update:value="(value) => handleInlineEdit(task, 'description', value)"
              />
            </td>

            <!-- Rating -->
            <td v-if="isColumnVisible('rating')" class="px-2 py-0.5 text-center border-r border-gray-200 whitespace-nowrap">
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
            <td class="px-1 py-0.5 whitespace-nowrap">
              <div class="flex items-center justify-center space-x-0.5">
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('add-subtask', task)"
                  class="h-6 w-6 p-0"
                >
                  <Plus class="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('edit', task)"
                  class="h-6 w-6 p-0"
                >
                  <Edit class="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('view-log', task)"
                  class="h-6 w-6 p-0"
                >
                  <History class="h-2.5 w-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  @click="$emit('delete', task)"
                  class="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 class="h-2.5 w-2.5" />
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'

import { 
  ArrowUpDown,
  Edit, 
  Trash2, 
  Plus,
  Star,
  History,
  FileText,
  Building2,
  FolderOpen,
  Filter
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
  { key: 'daysRemaining', label: 'Days Remaining' },
  { key: 'progress', label: 'Progress' },
  { key: 'assignedTo', label: 'Assigned To' },
  { key: 'department', label: 'Department' },
  { key: 'description', label: 'Description' },
  { key: 'rating', label: 'Rating' },
  { key: 'actions', label: 'Actions', required: true }
]

const visibleColumns = ref<string[]>([
  'done', 'title', 'status', 'priority', 'startDate', 'dueDate', 'daysRemaining', 'progress', 'description', 'actions'
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

// Filtering
const filters = ref<Record<string, any>>({
  status: [],
  priority: [],
  assignee: [],
  department: [],
  progress: { min: 0, max: 100 }
})

const updateFilter = (column: string, value: any) => {
  filters.value[column] = value
}

const clearFilter = (column: string) => {
  if (column === 'progress') {
    filters.value[column] = { min: 0, max: 100 }
  } else {
    filters.value[column] = []
  }
}

const getUniqueValues = (column: string) => {
  const values = new Set()
  props.tasks.forEach(task => {
    const value = task[column as keyof Task]
    if (value !== null && value !== undefined && value !== '') {
      values.add(value)
    }
  })
  return Array.from(values)
}

// Dynamic Task column width calculation
const taskColumnWidth = computed(() => {
  if (!props.tasks.length) return '200px'
  
  // Find the longest task title
  let maxLength = 0
  props.tasks.forEach(task => {
    const titleLength = (task.title || '').length
    if (titleLength > maxLength) {
      maxLength = titleLength
    }
  })
  
  // Calculate width: approximately 8px per character + reasonable margin + padding
  const baseWidth = maxLength * 8
  const reasonableMargin = 50 // 50px right margin for better spacing
  const totalWidth = baseWidth + reasonableMargin + 32 // 32px for padding
  
  // Set minimum and maximum constraints
  const minWidth = 150
  const maxWidth = 400
  
  return `${Math.min(Math.max(totalWidth, minWidth), maxWidth)}px`
})

// Fixed Status column width calculation
const statusColumnWidth = computed(() => {
  const statusOptions = ['To Do', 'In Progress', 'Review', 'Done', 'Cancelled']
  let maxLength = 0
  
  statusOptions.forEach(status => {
    if (status.length > maxLength) {
      maxLength = status.length
    }
  })
  
  // Calculate width: approximately 8px per character + small margins on both sides
  const baseWidth = maxLength * 8
  const sideMargins = 24 // 12px margin on each side
  const totalWidth = baseWidth + sideMargins + 16 // 16px for padding
  
  return `${Math.max(totalWidth, 80)}px` // minimum 80px
})

// Fixed Priority column width calculation
const priorityColumnWidth = computed(() => {
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical']
  let maxLength = 0
  
  priorityOptions.forEach(priority => {
    if (priority.length > maxLength) {
      maxLength = priority.length
    }
  })
  
  // Calculate width: approximately 8px per character + small margins on both sides
  const baseWidth = maxLength * 8
  const sideMargins = 24 // 12px margin on each side
  const totalWidth = baseWidth + sideMargins + 16 // 16px for padding
  
  return `${Math.max(totalWidth, 80)}px` // minimum 80px
})

// Fixed Start Date column width calculation
const startDateColumnWidth = computed(() => {
  // Date format is typically "YYYY-MM-DD" (10 characters)
  // Plus some padding for the date picker and spacing
  return '120px' // Fixed width for date display
})

// Fixed Due Date column width calculation  
const dueDateColumnWidth = computed(() => {
  // Date format is typically "YYYY-MM-DD" (10 characters)
  // Just for the date picker, no extra text
  return '120px' // Fixed width for date display only
})

// Fixed Days Remaining column width calculation
const daysRemainingColumnWidth = computed(() => {
  // Width for "X days left" or "overdue" badges
  return '140px' // Fixed width for days remaining badges
})

const sortedTasks = computed(() => {
  let tasks = [...props.tasks]
  
  // Apply filters
  tasks = tasks.filter(task => {
    // Status filter
    if (filters.value.status.length > 0 && !filters.value.status.includes(task.status)) {
      return false
    }
    
    // Priority filter
    if (filters.value.priority.length > 0 && !filters.value.priority.includes(task.priority)) {
      return false
    }
    
    // Assignee filter
    if (filters.value.assignee.length > 0 && !filters.value.assignee.includes(task.createdBy)) {
      return false
    }
    
    // Department filter
    if (filters.value.department.length > 0 && !filters.value.department.includes(task.departmentId)) {
      return false
    }
    
    // Progress filter
    if (task.progress < filters.value.progress.min || task.progress > filters.value.progress.max) {
      return false
    }
    
    return true
  })
  
  // Apply sorting
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
    case TaskPriority.CRITICAL: return 'critical'     // Dark Red - Urgent/Critical
    case TaskPriority.HIGH: return 'warning'          // Yellow - High attention
    case TaskPriority.MEDIUM: return 'info'           // Blue - Normal priority
    case TaskPriority.LOW: return 'low'               // Gray - Low priority
    default: return 'low'
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
    case TaskStatus.DONE: return 'success'        // Green - Completed successfully
    case TaskStatus.IN_PROGRESS: return 'info'    // Blue - Currently working
    case TaskStatus.REVIEW: return 'warning'      // Yellow - Needs attention
    case TaskStatus.BLOCKED: return 'destructive' // Red - Blocked/Issues
    case TaskStatus.CANCELLED: return 'outline'   // Gray - Cancelled/Inactive
    case TaskStatus.TODO: return 'outline'        // Light gray - Not started
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

const getDaysRemaining = (dueDate: string) => {
  if (!dueDate) return 0
  const today = new Date()
  const due = new Date(dueDate)
  const diffTime = due.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

const getDaysRemainingVariant = (daysRemaining: number) => {
  if (daysRemaining < 0) {
    return 'destructive' // Red for overdue
  } else if (daysRemaining === 0) {
    return 'critical' // Critical red for due today
  } else if (daysRemaining <= 3) {
    return 'warning' // Orange/yellow for urgent (1-3 days)
  } else if (daysRemaining <= 7) {
    return 'info' // Blue for coming up (4-7 days)
  } else {
    return 'success' // Green for plenty of time (8+ days)
  }
}

const getDaysRemainingTextColor = (daysRemaining: number) => {
  if (daysRemaining < 0) {
    return 'text-red-600' // Red for overdue
  } else if (daysRemaining === 0) {
    return 'text-red-700' // Dark red for due today
  } else if (daysRemaining <= 3) {
    return 'text-orange-600' // Orange for urgent (1-3 days)
  } else if (daysRemaining <= 7) {
    return 'text-blue-600' // Blue for coming up (4-7 days)
  } else {
    return 'text-green-600' // Green for plenty of time (8+ days)
  }
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
