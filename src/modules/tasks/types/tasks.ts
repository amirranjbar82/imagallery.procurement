export interface Task {
  taskId: string;
  title: string;
  description?: string;
  projectId?: string;
  parentTaskId?: string;
  assignedTo: string[];
  assignedBy: string;
  departmentId: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  checklist: ChecklistItem[];
  dependencies: string[];
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  projectId: string;
  name: string;
  description?: string;
  departmentId: string;
  projectManager: string;
  teamMembers: string[];
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: Date;
  endDate?: Date;
  budget?: number;
  actualCost?: number;
  progress: number;
  milestones: ProjectMilestone[];
  tags: string[];
  attachments: TaskAttachment[];
  templateId?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TaskStatus = 'to-do' | 'in-progress' | 'review' | 'completed' | 'cancelled';
export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: Date;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  departmentId: string;
  assigneeId?: string;
  projectId?: string;
  dueDate?: Date | string;
  estimatedHours?: number;
  tags?: string[];
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description?: string;
  targetDate: Date;
  completedDate?: Date;
  status: 'pending' | 'completed' | 'overdue';
}
