import type { 
  Comment, 
  TimeEntry, 
  SubTask 
} from './common'
import type { TaskAttachment } from './tasks'
import { TaskStatus, TaskPriority } from './common'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  
  // Assignment & Department
  assignedTo: string[] // User IDs
  assignedUsers?: { id: string; name: string; avatar?: string }[] // Populated data
  departmentId: string
  departmentName?: string // Populated from department data
  
  // Project relation
  projectId?: string
  projectName?: string
  
  // Dates
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  startDate?: Date
  completedAt?: Date
  
  // Organization
  tags: string[]
  labels: string[]
  
  // Relations
  dependencies: string[] // Task IDs that must be completed first
  blockedBy: string[] // Task IDs that are blocking this task
  subtasks: SubTask[]
  parentTaskId?: string
  
  // Collaboration
  attachments: TaskAttachment[]
  comments: Comment[]
  watchers: string[] // User IDs watching this task
  
  // Time tracking
  timeTracking: TimeEntry[]
  estimatedHours?: number
  actualHours: number
  
  // Metadata
  createdBy: string
  createdByName?: string
  lastModifiedBy: string
  lastModifiedByName?: string
  
  // Custom fields
  customFields: Record<string, any>
  
  // Progress
  progress: number // 0-100
  completionPercentage: number // Based on subtasks
  
  // Rating
  rating?: number // 1-5 stars
}

// Extended interface for deleted tasks
export interface DeletedTask extends Task {
  deletedAt: Date
  deletedBy: {
    id: string
    name: string
    avatar?: string
  }
}

// Change log interface
export interface TaskChangeLog {
  id: string
  taskId: string
  changeType: 'created' | 'updated' | 'status_changed' | 'assigned' | 'archived' | 'restored'
  fieldName?: string
  oldValue?: any
  newValue?: any
  changedBy: {
    id: string
    name: string
    avatar?: string
  }
  changedAt: Date
  description: string
}

export interface TaskFilter {
  status?: TaskStatus[]
  priority?: TaskPriority[]
  assignedTo?: string[]
  departmentId?: string[]
  projectId?: string[]
  tags?: string[]
  labels?: string[]
  dueDateFrom?: Date
  dueDateTo?: Date
  createdDateFrom?: Date
  createdDateTo?: Date
  search?: string
  overdue?: boolean
  unassigned?: boolean
  myTasks?: boolean
  watchedTasks?: boolean
}

export interface TaskSort {
  field: 'title' | 'status' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt' | 'assignedTo' | 'department'
  direction: 'asc' | 'desc'
}

export interface CreateTaskRequest {
  title: string
  description?: string
  status?: TaskStatus
  priority: TaskPriority
  assignedTo?: string[]
  departmentId: string
  projectId?: string
  dueDate?: Date
  startDate?: Date
  tags?: string[]
  labels?: string[]
  estimatedHours?: number
  parentTaskId?: string
  customFields?: Record<string, any>
}

export interface UpdateTaskRequest {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignedTo?: string[]
  departmentId?: string
  projectId?: string
  dueDate?: Date
  startDate?: Date
  tags?: string[]
  labels?: string[]
  estimatedHours?: number
  progress?: number
  rating?: number
  customFields?: Record<string, any>
}

export interface TaskTemplate {
  id: string
  name: string
  description: string
  departmentId: string
  template: Partial<CreateTaskRequest>
  subtaskTemplates: {
    title: string
    description?: string
    estimatedHours?: number
  }[]
  createdBy: string
  createdAt: Date
  isPublic: boolean
}

export interface TaskActivity {
  id: string
  taskId: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'assigned' | 'unassigned' | 'commented' | 'status_changed' | 'priority_changed' | 'completed' | 'deleted'
  details: Record<string, any>
  timestamp: Date
}

export interface TaskStats {
  total: number
  byStatus: Record<TaskStatus, number>
  byPriority: Record<TaskPriority, number>
  byDepartment: Record<string, number>
  overdue: number
  dueToday: number
  dueThisWeek: number
  completed: number
  inProgress: number
  unassigned: number
}
