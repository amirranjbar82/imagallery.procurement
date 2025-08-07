export interface Department {
  departmentId: string;
  name: string;
  description?: string;
  parentDepartmentId?: string | null;
  departmentHead?: string | null;
  permissions: DepartmentPermissions;
  isActive: boolean;
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  originalParentId?: string | null; // Store original parent for restore
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DepartmentPermissions {
  canViewOtherDepartments: boolean;
  canManageSubDepartments: boolean;
  canApproveBudget: boolean;
  maxApprovalAmount?: number;
  allowedModules: string[];
  customPermissions?: { [key: string]: boolean };
}

export interface DepartmentAssignment {
  userId: string;
  departmentId: string;
  role: string;
  permissions: string[];
  isPrimary: boolean;
  assignedBy: string;
  assignedAt: Date;
}

export interface DepartmentHierarchy {
  department: Department;
  children: DepartmentHierarchy[];
  userCount: number;
  level: number;
}
