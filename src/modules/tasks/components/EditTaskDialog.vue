<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogDescription>
          Update task details and save changes.
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
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
            rows="3"
          />
        </div>

        <!-- Priority -->
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

        <!-- Status -->
        <div class="space-y-2">
          <Label for="status">Status</Label>
          <Select v-model="form.status">
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="to-do">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              <SelectItem value="">No Project</SelectItem>
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

        <!-- Due Date -->
        <div class="space-y-2">
          <Label for="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            v-model="form.dueDate"
          />
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

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            @click="$emit('update:open', false)"
          >
            Cancel
          </Button>
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
import type { Task } from '../types/task'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

// State
const loading = ref(false)
const tagsInput = ref('')
const selectedAssignee = ref('')

// Form data
const form = ref({
  title: '',
  description: '',
  priority: 'medium',
  status: 'to-do',
  departmentId: '',
  projectId: '',
  dueDate: '',
  estimatedHours: 0,
  progress: 0,
  tags: [] as string[]
})

// Computed properties for dropdown data
// TODO: Add departments store when available
const departments = computed(() => [] as Array<{id: string, name: string}>)
// TODO: Add users store when available  
const users = computed(() => [] as Array<{id: string, name: string}>)
const { projects } = projectsStore

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
      status: newTask.status,
      departmentId: newTask.departmentId,
      projectId: newTask.projectId || '',
      dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: newTask.estimatedHours || 0,
      progress: newTask.progress || 0,
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
      status: form.value.status as any,
      departmentId: form.value.departmentId || 'default',
      progress: form.value.progress || 0
    }

    // Add optional fields if they have values
    if (form.value.description) {
      updateData.description = form.value.description
    }
    if (selectedAssignee.value) {
      updateData.assignedTo = [selectedAssignee.value]
    }
    if (form.value.projectId) {
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
