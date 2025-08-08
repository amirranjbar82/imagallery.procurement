<template>
  <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="$emit('click', task)">
    <CardContent class="p-4">
      <!-- Header with priority and status -->
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center space-x-2">
          <Badge :variant="getPriorityVariant(task.priority)" class="text-xs">
            {{ getPriorityLabel(task.priority) }}
          </Badge>
          <Badge :variant="getStatusVariant(task.status)" class="text-xs">
            {{ getStatusLabel(task.status) }}
          </Badge>
        </div>
        <div class="flex items-center space-x-1">
          <Button variant="ghost" size="sm" @click.stop="$emit('edit', task)">
            <Edit class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" @click.stop="$emit('delete', task)">
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Task title and description -->
      <div class="mb-3">
        <h3 class="font-semibold text-lg mb-1 line-clamp-2">{{ task.title }}</h3>
        <p class="text-sm text-muted-foreground line-clamp-2" v-if="task.description">
          {{ task.description }}
        </p>
      </div>

      <!-- Department and Project info -->
      <div class="flex items-center space-x-4 mb-3 text-sm text-muted-foreground">
        <div class="flex items-center space-x-1" v-if="task.departmentName">
          <Building2 class="w-4 h-4" />
          <span>{{ task.departmentName }}</span>
        </div>
        <div class="flex items-center space-x-1" v-if="task.projectName">
          <FolderOpen class="w-4 h-4" />
          <span>{{ task.projectName }}</span>
        </div>
      </div>

      <!-- Assigned users -->
      <div class="flex items-center space-x-2 mb-3" v-if="task.assignedUsers?.length">
        <Users class="w-4 h-4 text-muted-foreground" />
        <div class="flex -space-x-2">
          <Avatar 
            v-for="user in task.assignedUsers.slice(0, 3)" 
            :key="user.id" 
            class="w-6 h-6 border-2 border-background"
          >
            <AvatarImage :src="user.avatar" />
            <AvatarFallback class="text-xs">{{ getInitials(user.name) }}</AvatarFallback>
          </Avatar>
          <div 
            v-if="task.assignedUsers.length > 3"
            class="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
          >
            +{{ task.assignedUsers.length - 3 }}
          </div>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="mb-3" v-if="task.progress > 0">
        <div class="flex items-center justify-between mb-1">
          <span class="text-sm text-muted-foreground">Progress</span>
          <span class="text-sm font-medium">{{ task.progress }}%</span>
        </div>
        <div class="w-full bg-secondary rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300" 
            :style="{ width: `${task.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 mb-3" v-if="task.tags.length">
        <Badge variant="outline" class="text-xs" v-for="tag in task.tags.slice(0, 3)" :key="tag">
          {{ tag }}
        </Badge>
        <Badge variant="outline" class="text-xs" v-if="task.tags.length > 3">
          +{{ task.tags.length - 3 }}
        </Badge>
      </div>

      <!-- Footer with due date and actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 text-sm text-muted-foreground">
          <div class="flex items-center space-x-1" v-if="task.dueDate">
            <Calendar class="w-4 h-4" />
            <span :class="{ 'text-destructive': isOverdue(task.dueDate) }">
              {{ formatDate(task.dueDate) }}
            </span>
          </div>
          <div class="flex items-center space-x-1" v-if="task.comments.length">
            <MessageCircle class="w-4 h-4" />
            <span>{{ task.comments.length }}</span>
          </div>
          <div class="flex items-center space-x-1" v-if="task.attachments.length">
            <Paperclip class="w-4 h-4" />
            <span>{{ task.attachments.length }}</span>
          </div>
        </div>
        
        <div class="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            @click.stop="toggleStatus"
            :disabled="loading"
          >
            <CheckCircle class="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { 
  Edit, 
  Trash2, 
  Building2, 
  FolderOpen, 
  Users, 
  Calendar, 
  MessageCircle, 
  Paperclip,
  CheckCircle
} from 'lucide-vue-next'
import type { Task } from '../types'
import { TaskStatus, TaskPriority } from '../types'

interface Props {
  task: Task
  loading?: boolean
}

interface Emits {
  (e: 'click', task: Task): void
  (e: 'edit', task: Task): void
  (e: 'delete', task: Task): void
  (e: 'statusChange', task: Task, status: TaskStatus): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const getPriorityVariant = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.CRITICAL: return 'destructive'
    case TaskPriority.HIGH: return 'destructive'
    case TaskPriority.MEDIUM: return 'secondary'
    case TaskPriority.LOW: return 'outline'
    default: return 'outline'
  }
}

const getPriorityLabel = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.CRITICAL: return 'Critical'
    case TaskPriority.HIGH: return 'High'
    case TaskPriority.MEDIUM: return 'Medium'
    case TaskPriority.LOW: return 'Low'
    default: return 'Low'
  }
}

const getStatusVariant = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.DONE: return 'default'
    case TaskStatus.IN_PROGRESS: return 'secondary'
    case TaskStatus.REVIEW: return 'secondary'
    case TaskStatus.BLOCKED: return 'destructive'
    case TaskStatus.TODO: return 'outline'
    default: return 'outline'
  }
}

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.TODO: return 'To Do'
    case TaskStatus.IN_PROGRESS: return 'In Progress'
    case TaskStatus.REVIEW: return 'Review'
    case TaskStatus.DONE: return 'Done'
    case TaskStatus.BLOCKED: return 'Blocked'
    case TaskStatus.CANCELLED: return 'Cancelled'
    default: return 'To Do'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

const isOverdue = (dueDate: Date) => {
  return new Date() > new Date(dueDate)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(date))
}

const toggleStatus = () => {
  const nextStatus = props.task.status === TaskStatus.DONE 
    ? TaskStatus.TODO 
    : TaskStatus.DONE
  emit('statusChange', props.task, nextStatus)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
