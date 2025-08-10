<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogDescription>
          Update project details and save changes.
        </DialogDescription>
      </DialogHeader>
      
      <form @submit.prevent="handleSubmit" class="space-y-4">
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
          <Label for="description">Description *</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Project description"
            rows="3"
            required
          />
        </div>

        <!-- Status -->
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

        <!-- Project Manager -->
        <div class="space-y-2">
          <Label for="manager">Project Manager *</Label>
          <Select v-model="form.projectManager">
            <SelectTrigger>
              <SelectValue placeholder="Select project manager" />
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

        <!-- Timeline -->
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              v-model="form.startDate"
            />
          </div>
          <div class="space-y-2">
            <Label for="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              v-model="form.endDate"
            />
          </div>
        </div>

        <!-- Budget -->
        <div class="space-y-2">
          <Label for="budget">Budget</Label>
          <Input
            id="budget"
            type="number"
            v-model.number="form.budget"
            placeholder="Project budget"
            min="0"
            step="0.01"
          />
        </div>

        <!-- Estimated Hours -->
        <div class="space-y-2">
          <Label for="estimatedHours">Estimated Hours</Label>
          <Input
            id="estimatedHours"
            type="number"
            v-model.number="form.estimatedHours"
            placeholder="Estimated hours"
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
            placeholder="Project progress"
            min="0"
            max="100"
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
            :disabled="loading || !form.name || !form.description || !form.projectManager"
          >
            <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Update Project
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useProjectsStore } from '../stores/projects'
import type { Project } from '../types/project'

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
  project: Project | null
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'project-updated'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Stores
const projectsStore = useProjectsStore()

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
  progress: 0,
  priority: 'medium',
  tags: [] as string[]
})

// Computed properties for dropdown data
// TODO: Add departments store when available
const departments = computed(() => [] as Array<{id: string, name: string}>)
// TODO: Add users store when available  
const users = computed(() => [] as Array<{id: string, name: string}>)

// Process tags from input
const processedTags = computed(() => {
  return tagsInput.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
})

// Watch for project changes to populate form
watch(() => props.project, (newProject) => {
  if (newProject) {
    form.value = {
      name: newProject.name,
      description: newProject.description,
      status: newProject.status,
      departmentId: newProject.departmentId,
      projectManager: newProject.projectManager || '',
      startDate: newProject.timeline?.startDate ? new Date(newProject.timeline.startDate).toISOString().split('T')[0] : '',
      endDate: newProject.timeline?.endDate ? new Date(newProject.timeline.endDate).toISOString().split('T')[0] : '',
      budget: newProject.budget?.total || 0,
      estimatedHours: newProject.timeline?.estimatedHours || 0,
      progress: newProject.progress || 0,
      priority: newProject.priority || 'medium',
      tags: newProject.tags || []
    }
    
    // Set tags input
    tagsInput.value = (newProject.tags || []).join(', ')
  }
}, { immediate: true })

const handleSubmit = async () => {
  console.log('Form data before validation:', form.value)
  if (!form.value.name || !form.value.description || !form.value.projectManager || !props.project) {
    console.log('Required fields missing or no project selected')
    return
  }

  loading.value = true
  
  try {
    // Process tags
    form.value.tags = processedTags.value

    // Create update data matching UpdateProjectRequest interface
    const updateData: any = {
      name: form.value.name,
      description: form.value.description,
      status: form.value.status as any,
      departmentId: form.value.departmentId || 'default',
      projectManager: form.value.projectManager,
      priority: form.value.priority as any,
      progress: form.value.progress || 0
    }

    // Add timeline if dates are provided
    if (form.value.startDate || form.value.endDate || form.value.estimatedHours > 0) {
      updateData.timeline = {
        startDate: form.value.startDate ? new Date(form.value.startDate) : new Date(),
        endDate: form.value.endDate ? new Date(form.value.endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        estimatedHours: form.value.estimatedHours || 40
      }
    }

    // Add budget if provided
    if (form.value.budget > 0) {
      updateData.budget = {
        total: form.value.budget,
        currency: 'USD'
      }
    }

    // Add tags if provided
    if (processedTags.value.length > 0) {
      updateData.tags = processedTags.value
    }
    
    console.log('Sending update data:', updateData)
    await projectsStore.updateProject(props.project.id, updateData)
    
    emit('project-updated')
    emit('update:open', false)
  } catch (error) {
    console.error('Error updating project:', error)
  } finally {
    loading.value = false
  }
}
</script>
