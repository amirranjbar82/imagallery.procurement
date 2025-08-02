export interface Department {
  departmentId: string;
  name: string;
  description?: string;
  parentDepartmentId?: string;
  departmentHead?: string;
  budget?: number;
  currency?: string;
  permissions: DepartmentPermissions;
  isActive: boolean;
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
