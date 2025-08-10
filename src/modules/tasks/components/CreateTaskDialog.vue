<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogDescription>
          Create a new task and assign it to team members
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Basic Information Section -->
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

            <!-- Task Description -->
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Enter task description"
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
                <Select v-model="form.status">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="to-do">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Department and Assignee Row -->
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="department">Department *</Label>
                <Select v-model="form.departmentId">
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
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
                      :key="user.uid || user.id" 
                      :value="user.uid || user.id"
                    >
                      {{ user.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Project Assignment -->
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

            <!-- Start Date and End Date -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-start text-left font-normal">
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ form.startDate ? formatDisplayDate(form.startDate) : 'Pick a date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <DualCalendar id="startDate" label="Start Date" v-model="form.startDate" />
                  </PopoverContent>
                </Popover>
              </div>

              <div class="space-y-2">
                <Label for="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger as-child>
                    <Button variant="outline" class="w-full justify-start text-left font-normal">
                      <CalendarIcon class="mr-2 h-4 w-4" />
                      {{ form.endDate ? formatDisplayDate(form.endDate) : 'Pick a date' }}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-auto p-0" align="start">
                    <DualCalendar id="endDate" label="End Date" v-model="form.endDate" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <!-- Estimated Hours -->
            <div class="space-y-2">
              <Label for="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                v-model.number="form.estimatedHours"
                type="number"
                min="0"
                step="0.5"
                placeholder="0"
              />
            </div>

            <!-- Tags -->
            <div class="space-y-2">
              <Label for="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                v-model="tagsInput"
                placeholder="urgent, frontend, bug-fix"
              />
            </div>
          </div>
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
            :disabled="loading || !form.title || form.departmentId === 'none'"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Create Task
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { useOrganizationStore } from '../../organization/stores/organization'
import { useAuthStore } from '../../auth/stores/auth'


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Label } from '../../../components/ui/label'
import { Loader2 } from 'lucide-vue-next'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover'
import DualCalendar from './DualCalendar.vue'

interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'task-created'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()

const loading = ref(false)
const tagsInput = ref('')

const form = ref({
  title: '',
  description: '',
  status: 'to-do',
  priority: 'medium',
  departmentId: 'none',
  assigneeId: 'unassigned',
  projectId: 'none',
  startDate: '',
  endDate: '',
  estimatedHours: 0,
  tags: [] as string[]
})

// Computed properties for dropdown data
const departments = computed(() => {
  if (!organizationStore.departments || organizationStore.departments.length === 0) {
    return []
  }
  return organizationStore.departments.map(dept => ({
    id: dept.departmentId,
    name: dept.name
  }))
})

const projects = computed(() => {
  if (!projectsStore.projects || projectsStore.projects.length === 0) {
    return []
  }
  return projectsStore.projects
})

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

// Process tags from input
const processedTags = computed(() => {
  return tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

const formatDisplayDate = (iso: string) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString()
}

const handleSubmit = async () => {
  console.log('Form data before validation:', form.value)
  if (!form.value.title || form.value.departmentId === 'none') {
    console.log('Required fields missing')
    return
  }

  loading.value = true
  
  try {
    // Process tags
    form.value.tags = processedTags.value

    // Prepare complete task data
    const taskData = {
      title: form.value.title,
      description: form.value.description,
      status: form.value.status as any,
      priority: form.value.priority as any,
      departmentId: form.value.departmentId,
      assignedTo: (form.value.assigneeId && form.value.assigneeId !== 'unassigned') ? [form.value.assigneeId] : [],
      projectId: (form.value.projectId && form.value.projectId !== 'none') ? form.value.projectId : undefined,
      startDate: form.value.startDate ? new Date(form.value.startDate) : undefined,
      endDate: form.value.endDate ? new Date(form.value.endDate) : undefined,
      estimatedHours: form.value.estimatedHours || 0,
      // ensure done tasks start at 100% progress
      progress: form.value.status === 'done' ? 100 : 0,
      tags: form.value.tags,
      customFields: {}
    }
    
    console.log('Sending task data:', taskData)
    await tasksStore.createTask(taskData)
    
    // Reset form
    form.value = {
      title: '',
      description: '',
      status: 'to-do',
      priority: 'medium',
      departmentId: 'none',
      assigneeId: 'unassigned',
      projectId: 'none',
      startDate: '',
      endDate: '',
      estimatedHours: 0,
      tags: []
    }
    tagsInput.value = ''

    emit('task-created')
    emit('update:open', false)
  } catch (error) {
    console.error('Error creating task:', error)
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
    status: 'to-do',
    priority: 'medium',
    departmentId: 'none',
    assigneeId: 'unassigned',
    projectId: 'none',
    startDate: '',
    endDate: '',
    estimatedHours: 0,
    tags: []
  }
  tagsInput.value = ''
  emit('update:open', false)
}

onMounted(async () => {
  try {
    // Load required data
    await Promise.all([
      projectsStore.fetchProjects(),
      organizationStore.fetchDepartments(),
      // Only fetch users if user is admin
      authStore.isAdmin ? authStore.fetchUsers() : Promise.resolve()
    ])
  } catch (error) {
    console.warn('Error loading data in CreateTaskDialog:', error)
  }
})
</script>
