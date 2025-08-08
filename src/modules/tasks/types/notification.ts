export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  read: boolean
  dismissed: boolean
  createdAt: Date
  readAt?: Date
  dismissedAt?: Date
  
  // Optional action data
  actionUrl?: string
  actionData?: Record<string, any>
  
  // Related entities
  taskId?: string
  projectId?: string
  userId?: string
  departmentId?: string
  
  // Metadata
  source: NotificationSource
  category: NotificationCategory
}

export type NotificationType = 
  | 'task_assigned'
  | 'task_completed'
  | 'task_overdue'
  | 'task_status_changed'
  | 'task_priority_changed'
  | 'task_comment_added'
  | 'task_due_soon'
  | 'project_created'
  | 'project_updated'
  | 'project_completed'
  | 'project_deadline_approaching'
  | 'project_member_added'
  | 'project_member_removed'
  | 'comment_added'
  | 'comment_mentioned'
  | 'deadline_reminder'
  | 'system_update'
  | 'maintenance_notice'

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical'

export type NotificationSource = 'system' | 'user' | 'automation' | 'integration'

export type NotificationCategory = 
  | 'task'
  | 'project' 
  | 'comment'
  | 'deadline'
  | 'assignment'
  | 'system'
  | 'social'

export interface NotificationSettings {
  email: boolean
  browser: boolean
  mobile: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  
  // Category-specific settings
  categories: {
    [K in NotificationCategory]: {
      enabled: boolean
      email: boolean
      browser: boolean
      mobile: boolean
    }
  }
  
  // Quiet hours
  quietHours: {
    enabled: boolean
    startTime: string // HH:mm format
    endTime: string   // HH:mm format
    timezone: string
  }
  
  // Auto-dismiss settings
  autoDismiss: {
    enabled: boolean
    afterDays: number
  }
}

export interface NotificationFilter {
  read?: boolean
  dismissed?: boolean
  type?: NotificationType[]
  priority?: NotificationPriority[]
  category?: NotificationCategory[]
  source?: NotificationSource[]
  dateFrom?: Date
  dateTo?: Date
  taskId?: string
  projectId?: string
  userId?: string
  departmentId?: string
}

export interface NotificationStats {
  total: number
  unread: number
  dismissed: number
  byType: Record<NotificationType, number>
  byPriority: Record<NotificationPriority, number>
  byCategory: Record<NotificationCategory, number>
  recentActivity: {
    today: number
    thisWeek: number
    thisMonth: number
  }
}

export interface CreateNotificationRequest {
  title: string
  message: string
  type: NotificationType
  priority: NotificationPriority
  category: NotificationCategory
  source: NotificationSource
  
  // Optional fields
  actionUrl?: string
  actionData?: Record<string, any>
  taskId?: string
  projectId?: string
  userId?: string
  departmentId?: string
  
  // Recipients (if not specified, uses current user)
  recipients?: string[] // User IDs
  
  // Scheduling
  scheduledFor?: Date
  expiresAt?: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  type: NotificationType
  category: NotificationCategory
  titleTemplate: string
  messageTemplate: string
  priority: NotificationPriority
  
  // Template variables
  variables: string[]
  
  // Conditions for auto-generation
  triggers: {
    event: string
    conditions?: Record<string, any>
  }[]
  
  // Settings
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

export interface NotificationRule {
  id: string
  name: string
  description: string
  enabled: boolean
  
  // Trigger conditions
  trigger: {
    event: string
    conditions: Record<string, any>
  }
  
  // Notification to create
  notification: {
    type: NotificationType
    priority: NotificationPriority
    category: NotificationCategory
    titleTemplate: string
    messageTemplate: string
    recipients: 'assignee' | 'watchers' | 'department' | 'custom'
    customRecipients?: string[]
  }
  
  // Scheduling and limits
  schedule?: {
    delay?: number // minutes
    maxPerDay?: number
    quietHours?: boolean
  }
  
  createdAt: Date
  updatedAt: Date
  createdBy: string
}

// Utility types for notification management
export interface NotificationBatch {
  id: string
  notifications: Notification[]
  createdAt: Date
  processedAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
  errors?: string[]
}

export interface NotificationDelivery {
  id: string
  notificationId: string
  userId: string
  channel: 'email' | 'browser' | 'mobile' | 'sms'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  sentAt?: Date
  deliveredAt?: Date
  failedAt?: Date
  error?: string
  attempts: number
  maxAttempts: number
}
