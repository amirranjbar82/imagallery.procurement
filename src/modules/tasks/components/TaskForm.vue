<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Title -->
    <div class="space-y-2">
      <Label for="title">Task Title *</Label>
      <Input
        id="title"
        v-model="form.title"
        placeholder="Enter task title"
        required
        :disabled="loading"
      />
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <Label for="description">Description</Label>
      <Textarea
        id="description"
        v-model="form.description"
        placeholder="Enter task description"
        rows="3"
        :disabled="loading"
      />
    </div>

    <!-- Priority and Status -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="priority">Priority *</Label>
        <Select v-model="form.priority" :disabled="loading">
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Low</span>
              </div>
            </SelectItem>
            <SelectItem value="medium">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Medium</span>
              </div>
            </SelectItem>
            <SelectItem value="high">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full bg-orange-500"></div>
                <span>High</span>
              </div>
            </SelectItem>
            <SelectItem value="critical">
              <div class="flex items-center space-x-2">
                <div class="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Critical</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2" v-if="isEdit">
        <Label for="status">Status</Label>
        <Select v-model="form.status" :disabled="loading">
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="done">Done</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Department and Project -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="department">Department *</Label>
        <Select v-model="form.departmentId" :disabled="loading" @update:model-value="onDepartmentChange">
          <SelectTrigger>
            <Building2 class="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="dept in departments" 
              :key="dept.id" 
              :value="dept.id"
            >
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>{{ dept.name }}</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label for="project">Project (Optional)</Label>
        <Select v-model="form.projectId" :disabled="loading || !availableProjects.length">
          <SelectTrigger>
            <FolderOpen class="w-4 h-4 mr-2" />
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No Project</SelectItem>
            <SelectItem 
              v-for="project in availableProjects" 
              :key="project.id" 
              :value="project.id"
            >
              {{ project.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Assigned Users -->
    <div class="space-y-2">
      <Label>Assigned To</Label>
      <div class="border rounded-md p-3 space-y-2">
        <div class="flex flex-wrap gap-2" v-if="selectedUsers.length">
          <Badge 
            v-for="user in selectedUsers" 
            :key="user.id" 
            variant="secondary"
            class="flex items-center space-x-1"
          >
            <Avatar class="w-4 h-4">
              <AvatarImage :src="user.avatar" />
              <AvatarFallback class="text-xs">{{ getInitials(user.name) }}</AvatarFallback>
            </Avatar>
            <span>{{ user.name }}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              class="h-4 w-4 p-0 ml-1"
              @click="removeUser(user.id)"
            >
              <X class="w-3 h-3" />
            </Button>
          </Badge>
        </div>
        
        <Select @update:model-value="addUser" :disabled="loading">
          <SelectTrigger class="w-full">
            <Users class="w-4 h-4 mr-2" />
            <SelectValue placeholder="Add team member" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem 
              v-for="user in availableUsers" 
              :key="user.id" 
              :value="user.id"
            >
              <div class="flex items-center space-x-2">
                <Avatar class="w-6 h-6">
                  <AvatarImage :src="user.avatar" />
                  <AvatarFallback class="text-xs">{{ getInitials(user.name) }}</AvatarFallback>
                </Avatar>
                <span>{{ user.name }}</span>
                <Badge variant="outline" class="text-xs">{{ user.departmentName }}</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Dates -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          v-model="startDateString"
          :disabled="loading"
        />
      </div>

      <div class="space-y-2">
        <Label for="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          v-model="dueDateString"
          :disabled="loading"
        />
      </div>
    </div>

    <!-- Estimated Hours -->
    <div class="space-y-2">
      <Label for="estimatedHours">Estimated Hours</Label>
      <Input
        id="estimatedHours"
        type="number"
        v-model.number="form.estimatedHours"
        placeholder="0"
        min="0"
        step="0.5"
        :disabled="loading"
      />
    </div>

    <!-- Tags -->
    <div class="space-y-2">
      <Label>Tags</Label>
      <div class="border rounded-md p-3 space-y-2">
        <div class="flex flex-wrap gap-1" v-if="form.tags.length">
          <Badge 
            v-for="tag in form.tags" 
            :key="tag" 
            variant="outline"
            class="flex items-center space-x-1"
          >
            <span>{{ tag }}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              class="h-4 w-4 p-0 ml-1"
              @click="removeTag(tag)"
            >
              <X class="w-3 h-3" />
            </Button>
          </Badge>
        </div>
        
        <div class="flex space-x-2">
          <Input
            v-model="newTag"
            placeholder="Add tag"
            @keydown.enter.prevent="addTag"
            :disabled="loading"
            class="flex-1"
          />
          <Button type="button" variant="outline" @click="addTag" :disabled="!newTag.trim() || loading">
            <Plus class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Progress (Edit mode only) -->
    <div class="space-y-2" v-if="isEdit">
      <Label for="progress">Progress (%)</Label>
      <div class="space-y-2">
        <Input
          id="progress"
          type="range"
          v-model.number="form.progress"
          min="0"
          max="100"
          step="5"
          :disabled="loading"
          class="w-full"
        />
        <div class="text-center text-sm text-muted-foreground">{{ form.progress }}%</div>
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-end space-x-2 pt-4 border-t">
      <Button type="button" variant="outline" @click="$emit('cancel')" :disabled="loading">
        Cancel
      </Button>
      <Button type="submit" :disabled="!isFormValid || loading">
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        {{ isEdit ? 'Update Task' : 'Create Task' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Building2, FolderOpen, Users, X, Plus, Loader2 } from 'lucide-vue-next'
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types'
import { TaskPriority, TaskStatus } from '../types'

interface Department {
  id: string
  name: string
}

interface Project {
  id: string
  name: string
  departmentId: string
}

interface User {
  id: string
  name: string
  avatar?: string
  departmentName: string
}

interface Props {
  task?: Task
  departments: Department[]
  projects: Project[]
  users: User[]
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: CreateTaskRequest | UpdateTaskRequest): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEdit = computed(() => !!props.task)

// Form data
const form = ref({
  title: '',
  description: '',
  priority: TaskPriority.MEDIUM,
  status: TaskStatus.TODO,
  departmentId: '',
  projectId: '',
  assignedTo: [] as string[],
  startDate: undefined as Date | undefined,
  dueDate: undefined as Date | undefined,
  estimatedHours: undefined as number | undefined,
  tags: [] as string[],
  progress: 0
})

// Additional form state
const newTag = ref('')
const selectedUsers = ref<User[]>([])

// Computed properties
const startDateString = computed({
  get: () => form.value.startDate ? form.value.startDate.toISOString().split('T')[0] : '',
  set: (value: string) => {
    form.value.startDate = value ? new Date(value) : undefined
  }
})

const dueDateString = computed({
  get: () => form.value.dueDate ? form.value.dueDate.toISOString().split('T')[0] : '',
  set: (value: string) => {
    form.value.dueDate = value ? new Date(value) : undefined
  }
})

const availableProjects = computed(() => {
  return props.projects.filter(p => p.departmentId === form.value.departmentId)
})

const availableUsers = computed(() => {
  return props.users.filter(u => !form.value.assignedTo.includes(u.id))
})

const isFormValid = computed(() => {
  return form.value.title.trim() && form.value.departmentId && form.value.priority
})

// Methods
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

const onDepartmentChange = () => {
  // Clear project if it doesn't belong to the new department
  if (form.value.projectId && !availableProjects.value.find(p => p.id === form.value.projectId)) {
    form.value.projectId = ''
  }
}

const addUser = (userId: string) => {
  if (!form.value.assignedTo.includes(userId)) {
    form.value.assignedTo.push(userId)
    const user = props.users.find(u => u.id === userId)
    if (user) {
      selectedUsers.value.push(user)
    }
  }
}

const removeUser = (userId: string) => {
  form.value.assignedTo = form.value.assignedTo.filter(id => id !== userId)
  selectedUsers.value = selectedUsers.value.filter(u => u.id !== userId)
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !form.value.tags.includes(tag)) {
    form.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (tag: string) => {
  form.value.tags = form.value.tags.filter(t => t !== tag)
}

const handleSubmit = () => {
  if (!isFormValid.value) return

  const data = {
    title: form.value.title.trim(),
    description: form.value.description?.trim(),
    priority: form.value.priority,
    departmentId: form.value.departmentId,
    projectId: form.value.projectId || undefined,
    assignedTo: form.value.assignedTo,
    startDate: form.value.startDate,
    dueDate: form.value.dueDate,
    estimatedHours: form.value.estimatedHours,
    tags: form.value.tags
  }

  if (isEdit.value) {
    emit('submit', {
      id: props.task!.id,
      ...data,
      status: form.value.status,
      progress: form.value.progress
    } as UpdateTaskRequest)
  } else {
    emit('submit', data as CreateTaskRequest)
  }
}

// Initialize form with task data if editing
watch(() => props.task, (task) => {
  if (task) {
    form.value = {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      departmentId: task.departmentId,
      projectId: task.projectId || '',
      assignedTo: [...task.assignedTo],
      startDate: task.startDate,
      dueDate: task.dueDate,
      estimatedHours: task.estimatedHours,
      tags: [...task.tags],
      progress: task.progress
    }
    
    // Update selected users
    selectedUsers.value = task.assignedUsers?.filter(u => task.assignedTo.includes(u.id)) || []
  }
}, { immediate: true })
</script>
