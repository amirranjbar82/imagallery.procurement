<template>
  <div class="p-6">
    <!-- Header with Stats -->
    <div class="mb-3">
      <div class="flex justify-between items-center mb-2">
        <div class="flex items-center justify-between w-full">
          <!-- Left side: Search and Filters -->
          <div class="flex items-center gap-3 flex-1 max-w-4xl">
            <div class="flex-1 min-w-64">
              <Input 
                placeholder="Search tasks..." 
                v-model="searchQuery"
                class="h-8"
              />
            </div>
            <Select v-model="statusFilter">
              <SelectTrigger class="w-40 h-8">
                <SelectValue placeholder="Status" />
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
              <SelectTrigger class="w-40 h-8">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <!-- Right side: Action Buttons -->
          <div class="flex items-center space-x-3 ml-4">
            <!-- NotificationCenter temporarily disabled for debugging -->
            <!-- <NotificationCenter /> -->

            <Button @click="showCreateProject = true" variant="outline" size="sm">
              <FolderPlus class="h-4 w-4 mr-2" />
              Create Project
            </Button>
            <Button @click="showCreateTask = true" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>
      </div>
      
      <!-- Quick Stats -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <CheckCircle class="w-4 h-4 text-green-500" />
              <div>
                <div class="text-xl font-bold">{{ taskStats.completed }}</div>
                <div class="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <Clock class="w-4 h-4 text-blue-500" />
              <div>
                <div class="text-xl font-bold">{{ taskStats.inProgress }}</div>
                <div class="text-xs text-muted-foreground">In Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <AlertCircle class="w-4 h-4 text-red-500" />
              <div>
                <div class="text-xl font-bold">{{ taskStats.overdue }}</div>
                <div class="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <FolderOpen class="w-4 h-4 text-purple-500" />
              <div>
                <div class="text-xl font-bold">{{ projectStats.total }}</div>
                <div class="text-xs text-muted-foreground">Projects</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>



    <!-- Tasks/Projects/Kanban Tabs -->
    <div class="mb-3">
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
          <button
            @click="activeTab = 'kanban'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'kanban'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Kanban Board
          </button>
        </nav>
      </div>
    </div>

    <!-- Tasks View -->
    <div v-if="activeTab === 'tasks'" class="space-y-2">
      <!-- Task Table -->
      <div v-if="!showKanban">
        <TaskTable
          :tasks="filteredTasks"
          @edit="openEditTaskDialog"
          @delete="openDeleteTaskDialog"
          @add-subtask="handleAddSubtask"
          @view-log="handleViewTaskLog"
          @statusChange="handleTaskStatusChange"
          @ratingChange="handleTaskRatingChange"
          @inline-edit="handleInlineEdit"
          @subtask-toggle="handleSubtaskToggle"
          @add-nested-subtask="handleAddNestedSubtask"
          @edit-subtask="handleEditSubtask"
          @delete-subtask="handleDeleteSubtask"
        />
      </div>
      <!-- Empty state -->
      <div v-if="filteredTasks.length === 0" class="text-center py-12">
        <FileText class="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p class="text-gray-500 mb-4">Get started by creating your first task.</p>
        <Button @click="showCreateTask = true">
          <Plus class="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>
    </div>

    <!-- Kanban Board Tab -->
    <div v-if="activeTab === 'kanban'" class="h-full">
      <KanbanBoard
        :tasks="tasks || []"
        @edit-task="handleTaskUpdate"
        @delete-task="handleTaskDelete"
        @create-task="handleCreateTaskWithStatus"
        @update-task-status="handleUpdateTaskStatus"
      />
    </div>

    <!-- Projects View -->
    <div v-if="activeTab === 'projects'">
      <!-- Projects Header -->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Projects</h3>
        <Button @click="showCreateProject = true">
          <FolderPlus class="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <div v-if="loading" class="flex items-center justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <ProjectCard 
          v-for="project in (projects || [])" 
          :key="project.id"
          :project="project"
          @update="handleProjectUpdate"
          @delete="handleProjectDelete"
        />
      </div>
      <div v-if="!loading && (projects?.length || 0) === 0" class="text-center py-8">
        <p class="text-gray-500">No projects found</p>
      </div>
    </div>

    <!-- Archived Tasks Section -->
    <div v-if="archivedTasks && archivedTasks.length > 0" class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-2">
          <Archive class="h-5 w-5 text-muted-foreground" />
          <h3 class="text-lg font-semibold text-muted-foreground">Archived Tasks ({{ archivedTasks.length }})</h3>
        </div>
      </div>
      
      <div class="space-y-2">
        <div 
          v-for="task in archivedTasks" 
          :key="task.id"
          class="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-dashed"
        >
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-medium text-muted-foreground">{{ task.title }}</span>
              <span class="text-xs text-muted-foreground/70">•</span>
              <span class="text-xs text-muted-foreground/70">
                Archived {{ new Date(task.deletedAt).toLocaleDateString() }}
              </span>
            </div>
            <p v-if="task.description" class="text-xs text-muted-foreground/70 mt-1 truncate">
              {{ task.description }}
            </p>
          </div>
          
          <div class="flex items-center gap-2">
            <Button 
              @click="tasksStore.restoreTask(task.id)" 
              variant="ghost" 
              size="sm"
              class="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw class="h-3 w-3 mr-1" />
              Restore
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Task Dialog -->
    <CreateTaskDialog 
      v-model:open="showCreateTask" 
      @task-created="handleTaskCreated"
    />
    
    <!-- Create Project Dialog -->
    <CreateProjectDialog 
      v-model:open="showCreateProject" 
      @project-created="handleProjectCreated"
    />
    
    <!-- Edit Task Dialog -->
    <EditTaskDialog 
      v-model:open="showEditTask" 
      :task="selectedTask"
      @task-updated="handleTaskUpdated"
    />
    
    <!-- Delete Confirm Dialog -->
    <DeleteConfirmDialog 
      v-model:open="showDeleteConfirm" 
      :item-type="deleteItem?.type || 'task'"
      :item-name="deleteItem?.name || ''"
      :item-description="deleteItem?.description"
      @confirm="handleDeleteConfirm"
    />
    
    <!-- Edit Project Dialog -->
    <EditProjectDialog 
      v-model:open="showEditProject" 
      :project="selectedProject"
      @project-updated="handleProjectUpdated"
    />
    
    <!-- Task Change Log Dialog -->
    <TaskChangeLogDialog 
      v-model:open="showChangeLog" 
      :task-id="selectedTaskForLog?.id || ''"
      :task-title="selectedTaskForLog?.title || ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTasksStore } from '../stores/tasks'
import { useProjectsStore } from '../stores/projects'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { 
  Plus, 
  Clock, 
  AlertCircle, 
  FolderOpen,
  FileText,
  FolderPlus,
  CheckCircle,
  Archive,
  RotateCcw 
} from 'lucide-vue-next'
import type { Task, Project } from '../types'
import { TaskStatus } from '../types'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import TaskTable from '../components/TaskTable.vue'
import ProjectCard from '../components/ProjectCard.vue'
import CreateTaskDialog from '../components/CreateTaskDialog.vue'
import CreateProjectDialog from '../components/CreateProjectDialog.vue'
import EditTaskDialog from '../components/EditTaskDialog.vue'
import DeleteConfirmDialog from '../components/DeleteConfirmDialog.vue'
import EditProjectDialog from '../components/EditProjectDialog.vue'
import KanbanBoard from '../components/KanbanBoard.vue'
// import NotificationCenter from '../components/NotificationCenter.vue'
import TaskChangeLogDialog from '../components/TaskChangeLogDialog.vue'

const tasksStore = useTasksStore()
const projectsStore = useProjectsStore()

// State
const activeTab = ref<'tasks' | 'projects' | 'kanban'>('tasks')
const searchQuery = ref('')
const statusFilter = ref('all')
const priorityFilter = ref('all')
const showCreateTask = ref(false)
const showCreateProject = ref(false)
const showEditTask = ref(false)
const showEditProject = ref(false)
const showCreateSubtask = ref(false)
const showEditSubtask = ref(false)
const selectedSubtask = ref<any>(null)
const showDeleteConfirm = ref(false)
const selectedTask = ref<Task | null>(null)
const selectedProject = ref<Project | null>(null)
const showChangeLog = ref(false)
const selectedTaskForLog = ref<Task | null>(null)
const deleteItem = ref<{type: 'task' | 'project', id: string, name: string, description?: string} | null>(null)

// Computed - using storeToRefs to maintain reactivity
const { tasks, archivedTasks, loading: tasksLoading } = storeToRefs(tasksStore)
const { projects, loading: projectsLoading, projectStats } = storeToRefs(projectsStore)
const loading = computed(() => tasksLoading.value || projectsLoading.value)

// Task statistics computed property
const taskStats = computed(() => {
  const allTasks = tasks.value || []
  const now = new Date()
  
  return {
    completed: allTasks.filter(task => task.status === TaskStatus.DONE).length,
    inProgress: allTasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length,
    overdue: allTasks.filter(task => 
      task.dueDate && 
      task.dueDate < now && 
      task.status !== TaskStatus.DONE
    ).length,
    total: allTasks.length
  }
})

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

// View state
const showKanban = ref(false)

// Event handlers
function handleTaskUpdate(task: Task) {
  console.log('Update task:', task)
  selectedTask.value = task
  showEditTask.value = true
}

function handleTaskDelete(task: Task) {
  deleteItem.value = {
    type: 'task',
    id: task.id,
    name: task.title,
    description: task.description
  }
  showDeleteConfirm.value = true
}

// Dialog handlers for TaskTable
function openEditTaskDialog(task: Task) {
  selectedTask.value = task
  showEditTask.value = true
}

function openDeleteTaskDialog(task: Task) {
  deleteItem.value = {
    type: 'task',
    id: task.id,
    name: task.title,
    description: task.description
  }
  showDeleteConfirm.value = true
}

function handleViewTaskLog(task: Task) {
  selectedTaskForLog.value = task
  showChangeLog.value = true
}

// Rating handler for TaskTable
const handleTaskRatingChange = async (task: Task, rating: number) => {
  try {
    // Only send the rating field to avoid Firebase undefined field errors
    const updateData = {
      rating: rating
    }
    await tasksStore.updateTask(task.id, updateData)
    console.log(`Task ${task.title} rated ${rating} stars`)
  } catch (error) {
    console.error('Failed to update task rating:', error)
  }
}

function handleProjectUpdate(project: Project) {
  console.log('Update project:', project)
  selectedProject.value = project
  showEditProject.value = true
}

function handleProjectDelete(project: Project) {
  deleteItem.value = {
    type: 'project',
    id: project.id,
    name: project.name,
    description: project.description
  }
  showDeleteConfirm.value = true
}

// Create handlers
const handleTaskCreated = () => {
  tasksStore.fetchTasks()
}

const handleProjectCreated = () => {
  projectsStore.fetchProjects()
}

const handleTaskUpdated = () => {
  tasksStore.fetchTasks()
}

const handleDeleteConfirm = async () => {
  if (!deleteItem.value) return
  
  try {
    if (deleteItem.value.type === 'task') {
      await tasksStore.deleteTask(deleteItem.value.id)
    } else {
      await projectsStore.deleteProject(deleteItem.value.id)
    }
    deleteItem.value = null
  } catch (error) {
    console.error('Error deleting item:', error)
  }
}

const handleProjectUpdated = () => {
  showEditProject.value = false
  selectedProject.value = null
  // Refresh projects list
  projectsStore.fetchProjects()
}

// Kanban-specific handlers
const handleCreateTaskWithStatus = () => {
  // Open create task dialog
  showCreateTask.value = true
}

const handleUpdateTaskStatus = async (taskId: string, newStatus: any) => {
  try {
    const updateData = {
      id: taskId,
      status: newStatus
    }
    await tasksStore.updateTask(taskId, updateData)
  } catch (error) {
    console.error('Failed to update task status:', error)
  }
}

// Status change handler for TaskTable
const handleTaskStatusChange = async (task: Task, status: TaskStatus) => {
  try {
    await tasksStore.updateTaskStatus(task.id, status)
  } catch (error) {
    console.error('Failed to update task status:', error)
  }
}

// Inline edit handler for TaskTable
const handleInlineEdit = async (task: Task, field: string, value: any) => {
  try {
    const updateData: Partial<Task> = {
      [field]: value
    }
    await tasksStore.updateTask(task.id, updateData)
  } catch (error) {
    console.error(`Failed to update task ${field}:`, error)
  }
}



// Subtask handlers
const handleAddSubtask = (task: Task) => {
  selectedTask.value = task
  showCreateSubtask.value = true
}

const handleSubtaskToggle = async (subtask: any) => {
  try {
    const taskId = subtask.parentTaskId || selectedTask.value?.id
    if (!taskId) return
    
    await tasksStore.updateSubtask(taskId, subtask.id, {
      completed: !subtask.completed
    })
  } catch (error) {
    console.error('Failed to toggle subtask:', error)
  }
}

const handleAddNestedSubtask = (parentSubtask: any) => {
  selectedSubtask.value = parentSubtask
  showCreateSubtask.value = true
}

const handleEditSubtask = (subtask: any) => {
  selectedSubtask.value = subtask
  showEditSubtask.value = true
}

const handleDeleteSubtask = async (subtask: any) => {
  try {
    const taskId = subtask.parentTaskId || selectedTask.value?.id
    if (!taskId) return
    
    await tasksStore.deleteSubtask(taskId, subtask.id)
  } catch (error) {
    console.error('Failed to delete subtask:', error)
  }
}

// Lifecycle
onMounted(async () => {
  const fetchAll = async () => {
    try {
      await Promise.all([
        tasksStore.fetchTasks(),
        projectsStore.fetchProjects(),
        tasksStore.fetchArchivedTasks()
      ])
    } catch (err) {
      console.error('TasksView init fetch error:', err)
    }
  }

  // If already authenticated, fetch immediately
  if (auth.currentUser) {
    await fetchAll()
    return
  }

  // Otherwise, wait for auth state to be ready, then fetch once
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    try {
      if (user) {
        await fetchAll()
      }
    } finally {
      unsubscribe()
    }
  })
})
</script>
