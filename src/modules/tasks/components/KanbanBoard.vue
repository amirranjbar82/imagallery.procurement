<template>
  <div class="kanban-board h-full overflow-x-auto">
    <div class="flex space-x-4 h-full min-w-max p-4">
      <!-- To Do Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          <div class="p-4 border-b bg-gray-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-gray-400 rounded-full"></div>
                <h3 class="font-semibold text-gray-700">To Do</h3>
                <span class="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">
                  {{ todoTasks.length }}
                </span>
              </div>
              <Button size="sm" variant="ghost" @click="createTask(TaskStatus.TODO)">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            class="flex-1 p-3 space-y-3 overflow-y-auto"
            @drop="handleDrop($event, TaskStatus.TODO)"
            @dragover.prevent
            @dragenter.prevent
          >
            <KanbanCard
              v-for="task in todoTasks"
              :key="task.id"
              :task="task"
              @edit="$emit('edit-task', task)"
              @delete="$emit('delete-task', task)"
            />
            <div v-if="todoTasks.length === 0" class="text-center py-8 text-gray-400">
              <FileText class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- In Progress Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          <div class="p-4 border-b bg-blue-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
                <h3 class="font-semibold text-blue-700">In Progress</h3>
                <span class="bg-blue-200 text-blue-600 px-2 py-1 rounded-full text-xs">
                  {{ inProgressTasks.length }}
                </span>
              </div>
              <Button size="sm" variant="ghost" @click="createTask(TaskStatus.IN_PROGRESS)">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            class="flex-1 p-3 space-y-3 overflow-y-auto"
            @drop="handleDrop($event, TaskStatus.IN_PROGRESS)"
            @dragover.prevent
            @dragenter.prevent
          >
            <KanbanCard
              v-for="task in inProgressTasks"
              :key="task.id"
              :task="task"
              @edit="$emit('edit-task', task)"
              @delete="$emit('delete-task', task)"
            />
            <div v-if="inProgressTasks.length === 0" class="text-center py-8 text-gray-400">
              <Clock class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Review Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          <div class="p-4 border-b bg-yellow-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <h3 class="font-semibold text-yellow-700">Review</h3>
                <span class="bg-yellow-200 text-yellow-600 px-2 py-1 rounded-full text-xs">
                  {{ reviewTasks.length }}
                </span>
              </div>
              <Button size="sm" variant="ghost" @click="createTask(TaskStatus.REVIEW)">
                <Plus class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div 
            class="flex-1 p-3 space-y-3 overflow-y-auto"
            @drop="handleDrop($event, TaskStatus.REVIEW)"
            @dragover.prevent
            @dragenter.prevent
          >
            <KanbanCard
              v-for="task in reviewTasks"
              :key="task.id"
              :task="task"
              @edit="$emit('edit-task', task)"
              @delete="$emit('delete-task', task)"
            />
            <div v-if="reviewTasks.length === 0" class="text-center py-8 text-gray-400">
              <Eye class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No tasks</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Completed Column -->
      <div class="kanban-column flex-shrink-0 w-80">
        <div class="bg-white rounded-lg shadow-sm border h-full flex flex-col">
          <div class="p-4 border-b bg-green-50 rounded-t-lg">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-2">
                <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                <h3 class="font-semibold text-green-700">Completed</h3>
                <span class="bg-green-200 text-green-600 px-2 py-1 rounded-full text-xs">
                  {{ completedTasks.length }}
                </span>
              </div>
            </div>
          </div>
          <div 
            class="flex-1 p-3 space-y-3 overflow-y-auto"
            @drop="handleDrop($event, TaskStatus.DONE)"
            @dragover.prevent
            @dragenter.prevent
          >
            <KanbanCard
              v-for="task in completedTasks"
              :key="task.id"
              :task="task"
              @edit="$emit('edit-task', task)"
              @delete="$emit('delete-task', task)"
            />
            <div v-if="completedTasks.length === 0" class="text-center py-8 text-gray-400">
              <CheckCircle class="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p class="text-sm">No completed tasks</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Plus, FileText, Clock, Eye, CheckCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import KanbanCard from './KanbanCard.vue'
import type { Task } from '../types/task'
import { TaskStatus } from '../types/common'

// Props & Emits
interface Props {
  tasks: Task[]
}

interface Emits {
  (e: 'edit-task', task: Task): void
  (e: 'delete-task', task: Task): void
  (e: 'create-task', status: TaskStatus): void
  (e: 'update-task-status', taskId: string, status: TaskStatus): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Computed properties for task columns
const todoTasks = computed(() => 
  props.tasks.filter(task => task.status === TaskStatus.TODO)
)

const inProgressTasks = computed(() => 
  props.tasks.filter(task => task.status === TaskStatus.IN_PROGRESS)
)

const reviewTasks = computed(() => 
  props.tasks.filter(task => task.status === TaskStatus.REVIEW)
)

const completedTasks = computed(() => 
  props.tasks.filter(task => task.status === TaskStatus.DONE)
)

// Drag and drop handlers
const handleDrop = (event: DragEvent, newStatus: TaskStatus) => {
  event.preventDefault()
  const taskId = event.dataTransfer?.getData('text/plain')
  if (taskId) {
    emit('update-task-status', taskId, newStatus)
  }
}

const createTask = (status: TaskStatus) => {
  emit('create-task', status)
}
</script>

<style scoped>
@reference "tailwindcss";
.kanban-board {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.kanban-column {
  min-height: 600px;
}

.kanban-column:hover {
  transform: translateY(-1px);
  transition: transform 0.2s ease;
}
</style>
