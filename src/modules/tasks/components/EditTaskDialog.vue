<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>
          Update task details and save changes.
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Two-column layout like CreateTaskDialog -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Task Title -->
            <div class="space-y-2">
              <Label for="title">Task Title *</Label>
              <Input
                id="title"
                v-model="form.title"
                placeholder="Enter task title"
                required
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Task description (optional)"
                rows="4"
              />
            </div>

            <!-- Priority and Status Row -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="priority">Priority</Label>
                <Select v-model="form.priority">
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-2">
                <Label for="status">Status</Label>
                <Select v-model="statusModel" @update:modelValue="val => (statusModel = val as string)">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div class="grid grid-cols-1 gap-4">
              <!-- Department -->
              <div class="space-y-2">
                <Label for="department">Department</Label>
                <Select v-model="form.departmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="dept in departments" 
                      :key="dept.id" 
                      :value="dept.id"
                    >
                      {{ dept.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Assignee -->
              <div class="space-y-2">
                <Label for="assignee">Assignee</Label>
                <Select v-model="selectedAssignee">
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem 
                      v-for="user in users" 
                      :key="user.id" 
                      :value="user.id"
                    >
                      {{ user.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Project -->
              <div class="space-y-2">
                <Label for="project">Project (Optional)</Label>
                <Select v-model="form.projectId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    <SelectItem 
                      v-for="project in projects" 
                      :key="project.id" 
                      :value="project.id"
                    >
                      {{ project.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <!-- Due Date (Popover DualCalendar) -->
              <div class="space-y-2">
                <Label for="dueDate">Due Date</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-start text-left font-normal">
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ form.dueDate ? formatDisplayDate(form.dueDate) : 'Pick a date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <DualCalendar id="dueDate" label="Due Date" v-model="form.dueDate" />
                  </PopoverContent>
                </Popover>
              </div>

              <!-- Estimated Hours -->
              <div class="space-y-2">
                <Label for="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  v-model.number="form.estimatedHours"
                  placeholder="Estimated hours (optional)"
                  min="0"
                  step="0.5"
                />
              </div>

              <!-- Progress -->
              <div class="space-y-2">
                <Label for="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  v-model.number="form.progress"
                  placeholder="Progress percentage"
                  min="0"
                  max="100"
                  :disabled="statusModel === 'done'"
                />
              </div>

              <!-- Tags -->
              <div class="space-y-2">
                <Label for="tags">Tags</Label>
                <Input
                  id="tags"
                  v-model="tagsInput"
                  placeholder="Enter tags separated by commas"
                />
                <div v-if="processedTags.length > 0" class="flex flex-wrap gap-1 mt-2">
                  <span
                    v-for="tag in processedTags"
                    :key="tag"
                    class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                  >
                    {{ tag }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Conversation -->
        <div class="pt-2">
          <TaskComments v-if="props.task" :task-id="props.task.id" />
        </div>

        <DialogFooter>
          <DialogClose as-child>
            <Button 
              type="button" 
              variant="outline" 
              @click="$emit('update:open', false)"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            type="submit" 
            :disabled="loading || !form.title"
          >
            <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Update Task
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useOrganizationStore } from '../../organization/stores/organization'
import { useAuthStore } from '../../auth/stores/auth'
import type { Task } from '../types/task'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import TaskComments from './TaskComments.vue'
import DualCalendar from './DualCalendar.vue'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover'

// Helper to normalize status across sources to canonical enum values
function normalizeStatus(v: any): string {
  const s = String(v || '').toLowerCase().trim()
  // map kebab to snake
  const snake = s.replace(/-/g, '_')
  if (snake === 'completed') return 'done'
  if (snake === 'to_do') return 'todo'
  if (snake === 'in_progress') return 'in_progress'
  if (snake === 'to-do') return 'todo'
  if (snake === 'in-progress') return 'in_progress'
  // if already canonical or other values like review/done
  return snake
}

// v-model adapter for Status Select: normalizes and syncs progress on user changes
const statusModel = computed<string>({
  get() {
    return form.value.status
  },
  set(val: string) {
    const normalized = normalizeStatus(val)
    console.debug('[EditTaskDialog] statusModel set -> raw:', val, 'normalized:', normalized)
    form.value.status = normalized
    if (normalized === 'done' || normalized === 'completed') {
      console.debug('[EditTaskDialog] setting progress to 100 because status is done')
      form.value.progress = 100
    } else {
      console.debug('[EditTaskDialog] setting progress to 0 because status is not done')
      form.value.progress = 0
    }
  }
})

// Props & Emits
interface Props {
  open: boolean
  task: Task | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'task-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const tagsInput = ref('')
const selectedAssignee = ref('')

// Form data
const form = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'todo',
  departmentId: '',
  projectId: 'none',
  dueDate: '',
  estimatedHours: 0,
  progress: 0,
  tags: [] as string[]
})

// When status becomes done (or legacy 'completed'), force progress to 100; else 0
watch(() => form.value.status, (newStatus) => {
  const statusStr = normalizeStatus(String(newStatus || '').trim())
  // debug (can be removed later)
  console.debug('[EditTaskDialog] status changed to:', statusStr)
  if (statusStr === 'done' || statusStr === 'completed') {
    form.value.progress = 100
  } else {
    form.value.progress = 0
  }
}, { immediate: true })

// Computed properties for dropdown data (align with CreateTaskDialog)
const departments = computed(() => {
  if (!organizationStore.departments || organizationStore.departments.length === 0) return []
  return organizationStore.departments.map(dept => ({ id: dept.departmentId, name: dept.name }))
})

const users = computed(() => {
  if (!authStore.users || authStore.users.length === 0) return []
  return authStore.users.map(user => ({ id: user.uid, name: user.name || user.email || 'Unknown User' }))
})

const { projects } = projectsStore

// Display formatter: returns "DD Mon YYYY" (e.g., 15 Aug 2025)
function formatDisplayDate(value?: string | Date | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (isNaN(d.getTime())) return ''
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d)
}

// Process tags from input
const processedTags = computed(() => {
  return tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

// Watch for task changes to populate form
watch(() => props.task, (newTask) => {
  if (newTask) {
    form.value = {
      title: newTask.title,
      description: newTask.description || '',
      priority: newTask.priority,
      status: normalizeStatus(newTask.status),
      departmentId: newTask.departmentId,
      projectId: newTask.projectId || 'none',
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: newTask.estimatedHours || 0,
      progress: (normalizeStatus(newTask.status) === 'done' || normalizeStatus(newTask.status) === 'completed') ? 100 : (newTask.progress || 0),
      tags: newTask.tags || []
    }
    
    // Set assignee
    selectedAssignee.value = newTask.assignedTo?.[0] || ''
    
    // Set tags input
    tagsInput.value = (newTask.tags || []).join(', ')
  }
}, { immediate: true })

const handleSubmit = async () => {
  console.log('Form data before validation:', form.value)
  if (!form.value.title || !props.task) {
    console.log('Title is empty or no task selected, returning')
    return
  }

  loading.value = true
  
  try {
    // Process tags
    form.value.tags = processedTags.value

    // Create update data
    const updateData: any = {
      title: form.value.title,
      priority: form.value.priority as any,
      status: normalizeStatus(form.value.status) as any,
      departmentId: form.value.departmentId || 'default',
      // enforce progress 100 if status is done (or legacy 'completed')
      progress: ((normalizeStatus(form.value.status) === 'done') || (normalizeStatus(form.value.status) === 'completed'))
                ? 100 : (form.value.progress || 0)
    }

    // Add optional fields if they have values
    if (form.value.description) {
      updateData.description = form.value.description
    }
    if (selectedAssignee.value) {
      updateData.assignedTo = [selectedAssignee.value]
    }
    if (form.value.projectId === 'none') {
      // Explicitly clear project assignment
      updateData.projectId = ''
    } else if (form.value.projectId) {
      updateData.projectId = form.value.projectId
    }
    if (form.value.dueDate) {
      updateData.dueDate = new Date(form.value.dueDate)
    }
    if (form.value.estimatedHours > 0) {
      updateData.estimatedHours = form.value.estimatedHours
    }
    if (processedTags.value.length > 0) {
      updateData.tags = processedTags.value
    }
    
    console.log('Sending update data:', updateData)
    await tasksStore.updateTask(props.task.id, updateData)
    
    emit('task-updated')
    emit('update:open', false)
  } catch (error) {
    console.error('Error updating task:', error)
  } finally {
    loading.value = false
  }
}
</script>
