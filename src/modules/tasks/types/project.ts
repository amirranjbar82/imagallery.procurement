import type { 
  TeamMember, 
  Milestone, 
  ProjectBudget, 
  ProjectTimeline,
  Comment
} from './common'
import type { TaskAttachment } from './tasks'
import { ProjectStatus } from './common'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  
  // Department & Team
  departmentId: string // Primary department
  departmentName?: string
  collaboratingDepartments: string[] // Additional departments
  collaboratingDepartmentNames?: string[]
  
  // Team management
  team: TeamMember[]
  projectManager: string // User ID
  projectManagerName?: string
  
  // Timeline & Budget
  budget: ProjectBudget
  timeline: ProjectTimeline
  
  // Progress tracking
  progress: number // 0-100
  milestones: Milestone[]
  
  // Metadata
  createdAt: Date
  updatedAt: Date
  createdBy: string
  createdByName?: string
  
  // Organization
  tags: string[]
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  // Collaboration
  attachments: TaskAttachment[]
  comments: Comment[]
  
  // Settings
  isPublic: boolean
  allowExternalCollaboration: boolean
  
  // Custom fields
  customFields: Record<string, any>
  
  // Statistics (calculated fields)
  totalTasks?: number
  completedTasks?: number
  overdueTasks?: number
  teamSize?: number
}

export interface ProjectFilter {
  status?: ProjectStatus[]
  departmentId?: string[]
  projectManager?: string[]
  category?: string[]
  priority?: ('low' | 'medium' | 'high' | 'critical')[]
  tags?: string[]
  startDateFrom?: Date
  startDateTo?: Date
  endDateFrom?: Date
  endDateTo?: Date
  search?: string
  myProjects?: boolean
  overdue?: boolean
  budgetMin?: number
  budgetMax?: number
}

export interface ProjectSort {
  field: 'name' | 'status' | 'priority' | 'startDate' | 'endDate' | 'progress' | 'budget' | 'createdAt'
  direction: 'asc' | 'desc'
}

export interface CreateProjectRequest {
  name: string
  description: string
  departmentId: string
  collaboratingDepartments?: string[]
  projectManager: string
  timeline: {
    startDate: Date
    endDate: Date
    estimatedHours: number
  }
  budget: {
    total: number
    currency: string
    departmentAllocations?: {
      departmentId: string
      allocated: number
    }[]
  }
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  team?: string[] // User IDs
  milestones?: {
    title: string
    description?: string
    dueDate: Date
  }[]
  isPublic?: boolean
  allowExternalCollaboration?: boolean
  customFields?: Record<string, any>
}

export interface UpdateProjectRequest {
  id: string
  name?: string
  description?: string
  status?: ProjectStatus
  departmentId?: string
  collaboratingDepartments?: string[]
  projectManager?: string
  timeline?: Partial<ProjectTimeline>
  budget?: Partial<ProjectBudget>
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  tags?: string[]
  progress?: number
  isPublic?: boolean
  allowExternalCollaboration?: boolean
  customFields?: Record<string, any>
}

export interface ProjectTemplate {
  id: string
  name: string
  description: string
  departmentId: string
  category: string
  template: Partial<CreateProjectRequest>
  taskTemplates: {
    title: string
    description?: string
    priority: 'low' | 'medium' | 'high' | 'critical'
    estimatedHours?: number
    dependencies?: string[]
  }[]
  milestoneTemplates: {
    title: string
    description?: string
    daysFromStart: number
  }[]
  createdBy: string
  createdAt: Date
  isPublic: boolean
}

export interface ProjectActivity {
  id: string
  projectId: string
  userId: string
  userName: string
  action: 'created' | 'updated' | 'team_added' | 'team_removed' | 'milestone_added' | 'milestone_completed' | 'status_changed' | 'budget_updated' | 'completed' | 'deleted'
  details: Record<string, any>
  timestamp: Date
}

export interface ProjectStats {
  total: number
  byStatus: Record<ProjectStatus, number>
  byDepartment: Record<string, number>
  byCategory: Record<string, number>
  byPriority: Record<string, number>
  overdue: number
  completedThisMonth: number
  totalBudget: number
  spentBudget: number
  averageProgress: number
}

export interface ProjectDashboard {
  stats: ProjectStats
  recentProjects: Project[]
  overdueProjects: Project[]
  upcomingMilestones: (Milestone & { projectName: string })[]
  departmentPerformance: {
    departmentId: string
    departmentName: string
    projectCount: number
    completionRate: number
    averageProgress: number
    budgetUtilization: number
  }[]
  teamWorkload: {
    userId: string
    userName: string
    activeProjects: number
    totalTasks: number
    completedTasks: number
    workloadPercentage: number
  }[]
}
