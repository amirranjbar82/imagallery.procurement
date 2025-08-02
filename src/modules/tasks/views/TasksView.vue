<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Task Management</h1>
        <p class="text-gray-600">Manage tasks and projects</p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="showCreateProject = true">
          <FolderPlus class="w-4 h-4 mr-2" />
          New Project
        </Button>
        <Button @click="showCreateTask = true">
          <Plus class="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>
    </div>

    <!-- Filter Bar -->
    <Card class="mb-6">
      <CardContent class="pt-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <Input 
              placeholder="Search tasks..." 
              v-model="searchQuery"
              class="w-full"
            />
          </div>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="to-do">To Do</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="priorityFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Tasks/Projects Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'tasks'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Tasks ({{ filteredTasks.length }})
          </button>
          <button
            @click="activeTab = 'projects'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'projects'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Projects ({{ projects?.length || 0 }})
          </button>
        </nav>
      </div>
    </div>

    <!-- Tasks View -->
    <div v-if="activeTab === 'tasks'">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <TaskCard 
          v-for="task in filteredTasks" 
          :key="task.taskId"
          :task="task"
          @update="handleTaskUpdate"
          @delete="handleTaskDelete"
        />
      </div>
      <div v-if="!loading && filteredTasks.length === 0" class="text-center py-8">
        <p class="text-gray-500">No tasks found</p>
      </div>
    </div>

    <!-- Projects View -->
    <div v-if="activeTab === 'projects'">
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard 
          v-for="project in (projects || [])" 
          :key="project.projectId"
          :project="project"
          @update="handleProjectUpdate"
          @delete="handleProjectDelete"
        />
      </div>
      <div v-if="!loading && (projects?.length || 0) === 0" class="text-center py-8">
        <p class="text-gray-500">No projects found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, FolderPlus } from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import type { Task, Project } from '../types/tasks'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Placeholder components - would need to be implemented
const TaskCard = { 
  props: ['task'],
  emits: ['update', 'delete'],
  template: '<div class="border rounded p-4">Task Card - {{ task.title }}</div>' 
}
const ProjectCard = { 
  props: ['project'],
  emits: ['update', 'delete'],
  template: '<div class="border rounded p-4">Project Card - {{ project.name }}</div>' 
}

const tasksStore = useTasksStore()

// State
const activeTab = ref<'tasks' | 'projects'>('tasks')
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const showCreateTask = ref(false)
const showCreateProject = ref(false)

// Computed - using storeToRefs to maintain reactivity
const { tasks, projects, loading } = storeToRefs(tasksStore)

const filteredTasks = computed(() => {
  // Safe fallback to prevent undefined errors during initial load
  let filtered = tasks.value || []

  if (searchQuery.value) {
    filtered = filtered.filter(task => 
      task.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    filtered = filtered.filter(task => task.status === statusFilter.value)
  }

  if (priorityFilter.value && priorityFilter.value !== 'all') {
    filtered = filtered.filter(task => task.priority === priorityFilter.value)
  }

  return filtered
})

// Methods
function handleTaskUpdate(task: Task) {
  console.log('Update task:', task)
  // Implementation would update the task
}

function handleTaskDelete(task: Task) {
  console.log('Delete task:', task)
  // Implementation would delete the task
}

function handleProjectUpdate(project: Project) {
  console.log('Update project:', project)
  // Implementation would update the project
}

function handleProjectDelete(project: Project) {
  console.log('Delete project:', project)
  // Implementation would delete the project
}

// Lifecycle
onMounted(() => {
  tasksStore.fetchTasks()
  tasksStore.fetchProjects()
})
</script>
