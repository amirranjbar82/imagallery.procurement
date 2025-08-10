<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Project</DialogTitle>
        <DialogDescription>
          Create a new project to organize your tasks and collaborate with your team.
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Project Information Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <!-- Project -->
            <div class="space-y-2">
              <Label for="name">Project *</Label>
              <Input
                id="name"
                v-model="form.name"
                placeholder="Enter project name"
                required
              />
            </div>

            <!-- Description -->
            <div class="space-y-2">
              <Label for="description">Description</Label>
              <Textarea
                id="description"
                v-model="form.description"
                placeholder="Project description (optional)"
                rows="4"
              />
            </div>

            <!-- Status and Department -->
            <div class="grid grid-cols-1 gap-4">
              <div class="space-y-2">
                <Label for="status">Status</Label>
                <Select v-model="form.status">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div class="space-y-2">
                <Label for="department">Department *</Label>
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
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <!-- Project Manager -->
            <div class="space-y-2">
              <Label for="manager">Project Manager</Label>
              <Select v-model="form.projectManager">
                <SelectTrigger>
                  <SelectValue placeholder="Select project manager" />
                </SelectTrigger>
                <SelectContent>
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

            <!-- Timeline -->
            <div class="grid grid-cols-2 gap-4">
              <DualCalendar
                id="startDate"
                label="Start Date"
                v-model="form.startDate"
              />
              <DualCalendar
                id="endDate"
                label="End Date"
                v-model="form.endDate"
              />
            </div>

            <!-- Budget and Estimated Hours -->
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="budget">Budget</Label>
                <Input
                  id="budget"
                  type="number"
                  v-model.number="form.budget"
                  placeholder="Budget (optional)"
                  min="0"
                  step="0.01"
                />
              </div>

              <div class="space-y-2">
                <Label for="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  v-model.number="form.estimatedHours"
                  placeholder="Hours (optional)"
                  min="0"
                  step="0.5"
                />
              </div>
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
            :disabled="loading || !form.name"
          >
            <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Create Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useProjectsStore } from '../stores/projects'
import { useOrganizationStore } from '@/modules/organization/stores/organization'
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
import DualCalendar from './DualCalendar.vue'

// Props & Emits
interface Props {
  open: boolean
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'project-created'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const projectsStore = useProjectsStore()
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()

// State
const loading = ref(false)
const tagsInput = ref('')

// Form data
const form = ref({
  name: '',
  description: '',
  status: 'planning',
  departmentId: '',
  projectManager: '',
  startDate: '',
  endDate: '',
  budget: 0,
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

const handleSubmit = async () => {
  console.log('Form data before validation:', form.value)
  if (!form.value.name || !form.value.description || !form.value.projectManager) {
    console.log('Required fields missing')
    return
  }

  loading.value = true
  
  try {
    // Process tags
    form.value.tags = processedTags.value

    // Create project data matching CreateProjectRequest interface
    const projectData: any = {
      name: form.value.name,
      description: form.value.description,
      departmentId: form.value.departmentId || 'default',
      projectManager: form.value.projectManager,
      timeline: {
        startDate: form.value.startDate ? new Date(form.value.startDate) : new Date(),
        endDate: form.value.endDate ? new Date(form.value.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days from now
        estimatedHours: form.value.estimatedHours || 40 // Default 40 hours
      },
      budget: {
        total: form.value.budget || 1000, // Default budget
        currency: 'USD'
      },
      category: 'general', // Default category
      priority: 'medium' as any // Default priority
    }

    // Add optional fields if they have values
    if (form.value.departmentId) {
      projectData.collaboratingDepartments = [form.value.departmentId]
    }
    if (processedTags.value.length > 0) {
      projectData.tags = processedTags.value
    }
    
    console.log('Sending project data:', projectData)
    await projectsStore.createProject(projectData)
    
    // Reset form
    form.value = {
      name: '',
      description: '',
      status: 'planning',
      departmentId: '',
      projectManager: '',
      startDate: '',
      endDate: '',
      budget: 0,
      estimatedHours: 0,
      tags: []
    }
    tagsInput.value = ''

    emit('project-created')
    emit('update:open', false)
  } catch (error) {
    console.error('Error creating project:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    // Load required data
    await Promise.all([
      organizationStore.fetchDepartments(),
      // Only fetch users if user is admin
      authStore.isAdmin ? authStore.fetchUsers() : Promise.resolve()
    ])
  } catch (error) {
    console.warn('Error loading data in CreateProjectDialog:', error)
  }
})
</script>
