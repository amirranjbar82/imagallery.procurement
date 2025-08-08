<template>
  <Card class="hover:shadow-md transition-shadow cursor-pointer" @click="$emit('click', project)">
    <CardContent class="p-6">
      <!-- Header with status and actions -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <Badge :variant="getStatusVariant(project.status)" class="text-xs">
            {{ getStatusLabel(project.status) }}
          </Badge>
          <Badge :variant="getPriorityVariant(project.priority)" class="text-xs">
            {{ getPriorityLabel(project.priority) }}
          </Badge>
        </div>
        <div class="flex items-center space-x-1">
          <Button variant="ghost" size="sm" @click.stop="$emit('edit', project)">
            <Edit class="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" @click.stop="$emit('delete', project)">
            <Trash2 class="w-4 h-4" />
          </Button>
        </div>
      </div>

      <!-- Project name and description -->
      <div class="mb-4">
        <h3 class="font-semibold text-xl mb-2 line-clamp-1">{{ project.name }}</h3>
        <p class="text-sm text-muted-foreground line-clamp-2" v-if="project.description">
          {{ project.description }}
        </p>
      </div>

      <!-- Department and category info -->
      <div class="flex items-center space-x-4 mb-4 text-sm text-muted-foreground">
        <div class="flex items-center space-x-1" v-if="project.departmentName">
          <Building2 class="w-4 h-4" />
          <span>{{ project.departmentName }}</span>
        </div>
        <div class="flex items-center space-x-1" v-if="project.category">
          <Tag class="w-4 h-4" />
          <span>{{ project.category }}</span>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium">Progress</span>
          <span class="text-sm text-muted-foreground">{{ project.progress }}%</span>
        </div>
        <div class="w-full bg-secondary rounded-full h-2">
          <div 
            class="bg-primary h-2 rounded-full transition-all duration-300" 
            :style="{ width: `${project.progress}%` }"
          ></div>
        </div>
      </div>

      <!-- Team members -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center space-x-2">
          <Users class="w-4 h-4 text-muted-foreground" />
          <div class="flex -space-x-2">
            <Avatar 
              v-for="member in project.team.slice(0, 4)" 
              :key="member.userId" 
              class="w-7 h-7 border-2 border-background"
            >
              <AvatarImage :src="member.avatar" />
              <AvatarFallback class="text-xs">{{ getInitials(member.userName) }}</AvatarFallback>
            </Avatar>
            <div 
              v-if="project.team.length > 4"
              class="w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
            >
              +{{ project.team.length - 4 }}
            </div>
          </div>
        </div>
        
        <!-- Project Manager -->
        <div class="flex items-center space-x-1 text-sm text-muted-foreground" v-if="project.projectManagerName">
          <Crown class="w-4 h-4" />
          <span>{{ project.projectManagerName }}</span>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid grid-cols-3 gap-4 mb-4">
        <!-- Tasks stats -->
        <div class="text-center">
          <div class="text-lg font-semibold">{{ project.totalTasks || 0 }}</div>
          <div class="text-xs text-muted-foreground">Tasks</div>
        </div>
        
        <!-- Budget -->
        <div class="text-center">
          <div class="text-lg font-semibold">
            ${{ formatCurrency(project.budget.total) }}
          </div>
          <div class="text-xs text-muted-foreground">Budget</div>
        </div>
        
        <!-- Milestones -->
        <div class="text-center">
          <div class="text-lg font-semibold">{{ completedMilestones }}/{{ project.milestones.length }}</div>
          <div class="text-xs text-muted-foreground">Milestones</div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="flex items-center justify-between mb-4 text-sm text-muted-foreground">
        <div class="flex items-center space-x-1">
          <Calendar class="w-4 h-4" />
          <span>{{ formatDate(project.timeline.startDate) }}</span>
        </div>
        <ArrowRight class="w-4 h-4" />
        <div class="flex items-center space-x-1">
          <span :class="{ 'text-destructive': isOverdue(project.timeline.endDate) }">
            {{ formatDate(project.timeline.endDate) }}
          </span>
        </div>
      </div>

      <!-- Tags -->
      <div class="flex flex-wrap gap-1 mb-4" v-if="project.tags.length">
        <Badge variant="outline" class="text-xs" v-for="tag in project.tags.slice(0, 3)" :key="tag">
          {{ tag }}
        </Badge>
        <Badge variant="outline" class="text-xs" v-if="project.tags.length > 3">
          +{{ project.tags.length - 3 }}
        </Badge>
      </div>

      <!-- Footer actions -->
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4 text-sm text-muted-foreground">
          <div class="flex items-center space-x-1" v-if="project.comments?.length">
            <MessageCircle class="w-4 h-4" />
            <span>{{ project.comments.length }}</span>
          </div>
          <div class="flex items-center space-x-1" v-if="project.attachments?.length">
            <Paperclip class="w-4 h-4" />
            <span>{{ project.attachments.length }}</span>
          </div>
          <div class="flex items-center space-x-1" v-if="project.overdueTasks">
            <AlertCircle class="w-4 h-4 text-destructive" />
            <span class="text-destructive">{{ project.overdueTasks }} overdue</span>
          </div>
        </div>
        
        <Button variant="outline" size="sm" @click.stop="$emit('viewTasks', project)">
          <ListTodo class="w-4 h-4 mr-1" />
          View Tasks
        </Button>
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
  Tag,
  Users, 
  Crown,
  Calendar,
  ArrowRight,
  MessageCircle, 
  Paperclip,
  AlertCircle,
  ListTodo
} from 'lucide-vue-next'
import type { Project } from '../types'
import { ProjectStatus } from '../types'

interface Props {
  project: Project
  loading?: boolean
}

interface Emits {
  (e: 'click', project: Project): void
  (e: 'edit', project: Project): void
  (e: 'delete', project: Project): void
  (e: 'viewTasks', project: Project): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const completedMilestones = computed(() => {
  return props.project.milestones.filter(m => m.completed).length
})

const getStatusVariant = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.COMPLETED: return 'default'
    case ProjectStatus.ACTIVE: return 'secondary'
    case ProjectStatus.PLANNING: return 'outline'
    case ProjectStatus.ON_HOLD: return 'destructive'
    case ProjectStatus.CANCELLED: return 'destructive'
    default: return 'outline'
  }
}

const getStatusLabel = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.PLANNING: return 'Planning'
    case ProjectStatus.ACTIVE: return 'Active'
    case ProjectStatus.ON_HOLD: return 'On Hold'
    case ProjectStatus.COMPLETED: return 'Completed'
    case ProjectStatus.CANCELLED: return 'Cancelled'
    default: return 'Planning'
  }
}

const getPriorityVariant = (priority: 'low' | 'medium' | 'high' | 'critical') => {
  switch (priority) {
    case 'critical': return 'destructive'
    case 'high': return 'destructive'
    case 'medium': return 'secondary'
    case 'low': return 'outline'
    default: return 'outline'
  }
}

const getPriorityLabel = (priority: 'low' | 'medium' | 'high' | 'critical') => {
  switch (priority) {
    case 'critical': return 'Critical'
    case 'high': return 'High'
    case 'medium': return 'Medium'
    case 'low': return 'Low'
    default: return 'Low'
  }
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2)
}

const isOverdue = (endDate: Date) => {
  return new Date() > new Date(endDate)
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
