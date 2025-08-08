export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedBy: string
  uploadedAt: Date
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorName: string
  createdAt: Date
  updatedAt?: Date
  mentions: string[]
}

export interface TimeEntry {
  id: string
  userId: string
  startTime: Date
  endTime?: Date
  duration: number // in minutes
  description?: string
  createdAt: Date
}

export interface SubTask {
  id: string
  title: string
  description?: string
  completed: boolean
  assignedTo?: string
  assignedUserName?: string
  parentTaskId?: string
  parentSubTaskId?: string // For nested subtasks
  level: number // 0 = main task, 1 = first level subtask, etc.
  subtasks: SubTask[] // Nested subtasks
  dueDate?: Date
  priority?: TaskPriority
  progress: number // 0-100
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface TeamMember {
  userId: string
  userName: string
  role: string
  departmentId: string
  departmentName: string
  joinedAt: Date
}

export interface Milestone {
  id: string
  title: string
  description?: string
  dueDate: Date
  completed: boolean
  completedAt?: Date
}

export interface ProjectBudget {
  total: number
  spent: number
  currency: string
  departmentAllocations: {
    departmentId: string
    allocated: number
    spent: number
  }[]
}

export interface ProjectTimeline {
  startDate: Date
  endDate: Date
  estimatedHours: number
  actualHours: number
}

export interface DepartmentStats {
  departmentId: string
  departmentName: string
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalBudget: number
  spentBudget: number
}

export interface NotificationSettings {
  email: boolean
  browser: boolean
  mobile: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
}

export interface UserPreferences {
  defaultView: 'list' | 'kanban' | 'calendar' | 'gantt'
  theme: 'light' | 'dark' | 'system'
  notifications: NotificationSettings
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
}
