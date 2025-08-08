<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>
          {{ parentSubtask ? 'Add Nested Subtask' : 'Add Subtask' }}
        </DialogTitle>
        <DialogDescription>
          {{ parentSubtask 
            ? `Add a nested subtask under "${parentSubtask.title}"` 
            : `Add a subtask to "${parentTask?.title}"` 
          }}
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Subtask Title -->
        <div class="space-y-2">
          <Label for="title">Subtask Title *</Label>
          <Input
            id="title"
            v-model="form.title"
            placeholder="Enter subtask title"
            required
          />
        </div>

        <!-- Subtask Description -->
        <div class="space-y-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Enter subtask description"
            rows="3"
          />
        </div>

        <!-- Priority and Due Date Row -->
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
            <DualCalendar
              id="dueDate"
              label="Due Date"
              v-model="form.dueDate"
            />
          </div>
        </div>

        <!-- Assignee -->
        <div class="space-y-2">
          <Label for="assignee">Assignee</Label>
          <Select v-model="form.assigneeId">
            <SelectTrigger>
              <SelectValue placeholder="Select assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unassigned">Unassigned</SelectItem>
              <SelectItem 
                v-for="user in users" 
                :key="user.id" 
                :value="user.uid || user.id"
              >
                {{ user.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            @click="handleCancel"
            :disabled="loading"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="loading || !form.title"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            {{ parentSubtask ? 'Add Nested Subtask' : 'Add Subtask' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
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
import { Loader2 } from 'lucide-vue-next'
import DualCalendar from './DualCalendar.vue'
import type { Task, SubTask } from '../types'
import { TaskPriority } from '../types'

interface Props {
  open: boolean
  parentTask?: Task
  parentSubtask?: SubTask
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'subtask-created', subtask: Partial<SubTask>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const authStore = useAuthStore()
const loading = ref(false)

const form = ref({
  title: '',
  description: '',
  priority: 'medium',
  assigneeId: '',
  dueDate: ''
})

// Computed properties for dropdown data
const users = computed(() => {
  if (!authStore.users || authStore.users.length === 0) {
    return []
  }
  return authStore.users.map(user => ({
    id: user.uid,
    name: user.name || user.email || 'Unknown User',
    uid: user.uid
  }))
})

const handleSubmit = async () => {
  if (!form.value.title) {
    return
  }

  loading.value = true
  
  try {
    const now = new Date()
    const level = props.parentSubtask ? props.parentSubtask.level + 1 : 1
    
    // Prepare subtask data
    const subtaskData: Partial<SubTask> = {
      id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: form.value.title,
      description: form.value.description,
      completed: false,
      assignedTo: (form.value.assigneeId && form.value.assigneeId !== 'unassigned') ? form.value.assigneeId : undefined,
      assignedUserName: form.value.assigneeId && form.value.assigneeId !== 'unassigned' 
        ? users.value.find(u => u.id === form.value.assigneeId)?.name 
        : undefined,
      parentTaskId: props.parentTask?.id,
      parentSubTaskId: props.parentSubtask?.id,
      level,
      subtasks: [],
      dueDate: form.value.dueDate ? new Date(form.value.dueDate) : undefined,
      priority: form.value.priority as TaskPriority,
      progress: 0,
      createdAt: now,
      updatedAt: now,
      createdBy: authStore.user?.uid || ''
    }
    
    // Reset form
    form.value = {
      title: '',
      description: '',
      priority: 'medium',
      assigneeId: '',
      dueDate: ''
    }

    emit('subtask-created', subtaskData)
    emit('update:open', false)
  } catch (error) {
    console.error('Error creating subtask:', error)
  } finally {
    loading.value = false
  }
}

// Handle cancel/close dialog
const handleCancel = () => {
  // Reset form when canceling
  form.value = {
    title: '',
    description: '',
    priority: 'medium',
    assigneeId: '',
    dueDate: ''
  }
  emit('update:open', false)
}

onMounted(async () => {
  try {
    // Only fetch users if user is admin
    if (authStore.isAdmin) {
      await authStore.fetchUsers()
    }
  } catch (error) {
    console.warn('Error loading users in CreateSubTaskDialog:', error)
  }
})
</script>
