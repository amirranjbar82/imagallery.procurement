export interface DeliveryOrder {
  id: string
  invoiceNo: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  locationLink?: string
  
  // Order Details
  items: DeliveryItem[]
  totalValue: number
  
  // Service Type
  serviceType: 'delivery_only' | 'installation_delivery' | 'uninstallation_delivery'
  
  // Status & Workflow
  status: DeliveryOrderStatus
  currentStep: WorkflowStep
  
  // Scheduling
  scheduledDate?: Date
  scheduledTimeSlot?: string
  bufferDate?: Date
  allowedDays: ('tuesday' | 'thursday' | 'saturday')[]
  
  // Payment
  paymentStatus: PaymentStatus
  paymentMethod?: 'prepaid' | 'on_site_card' | 'cash'
  
  // Technical Requirements
  technicalChecklist: TechnicalChecklist
  
  // Assignment
  coordinatorId: string
  teamLeaderId?: string
  assignedTeam?: string[]
  
  // Tracking
  createdAt: Date
  updatedAt: Date
  completedAt?: Date
  
  // Logs
  workflowLogs: WorkflowLog[]
  
  // KPIs
  isOnTime: boolean
  requiresRevisit: boolean
  revisitCount: number
}

export interface DeliveryItem {
  id: string
  name: string
  type: 'chandelier' | 'furniture' | 'appliance' | 'other'
  quantity: number
  weight?: number
  dimensions?: string
  installationHeight?: number
  ceilingType?: string
  layers?: number
  accessories: string[]
  specialRequirements: string[]
  location: 'warehouse' | 'store' | 'multiple'
}

export type DeliveryOrderStatus = 
  | 'created'           // Step 1: Order created
  | 'planned'           // Step 2: Weekly planning done
  | 'technical_check'   // Step 3: Technical check in progress
  | 'payment_pending'   // Step 4: Waiting for payment confirmation
  | 'scheduled'         // Step 5: Customer scheduling done
  | 'ready'            // Step 6: Daily program published
  | 'in_progress'      // Step 7: Team executing
  | 'completed'        // Step 9: Successfully completed
  | 'failed'           // Failed execution
  | 'rescheduled'      // Moved to buffer day

export type WorkflowStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'on_site'

export interface TechnicalChecklist {
  id: string
  orderId: string
  
  // Item Details
  itemType: string
  installationHeight?: number
  ceilingCondition?: string
  layers?: number
  weight?: number
  dimensions?: string
  
  // Equipment Needs
  needsLadder: boolean
  needsLift: boolean
  specialTools: string[]
  
  // Accessories
  accessoriesComplete: boolean
  missingAccessories: string[]
  
  // Building Restrictions
  buildingRestrictions: {
    entryHours?: string
    requiresPermit: boolean
    elevatorAccess: boolean
    parkingAvailable: boolean
    specialRules: string[]
  }
  
  // Transport
  vehicleType: 'van' | 'truck' | 'small_car'
  multipleLocations: boolean
  pickupLocations: string[]
  
  // Completion
  isComplete: boolean
  checkedBy: string
  checkedAt?: Date
  notes: string
}

export interface WorkflowLog {
  id: string
  orderId: string
  step: WorkflowStep
  action: string
  performedBy: string
  performedAt: Date
  details: string
  previousStatus?: DeliveryOrderStatus
  newStatus: DeliveryOrderStatus
}

export interface DailyProgram {
  id: string
  date: Date
  day: string
  orders: DailyProgramOrder[]
  publishedBy: string
  publishedAt: Date
  notes?: string
}

export interface DailyProgramOrder {
  invoiceNo: string
  serviceType: 'Delivery' | 'Installation' | 'Uninstallation+Delivery'
  address: string
  locationLink?: string
  contactName: string
  phone: string
  timeSlot: string
  specialNotes?: string
}

export interface WeeklyOverview {
  id: string
  weekStart: Date
  weekEnd: Date
  
  // Capacity Planning
  tuesdayCapacity: number
  thursdayCapacity: number
  saturdayCapacity: number
  
  // Scheduled Orders
  scheduledOrders: {
    tuesday: string[]    // Order IDs
    thursday: string[]
    saturday: string[]
  }
  
  // Buffer Days
  bufferDays: {
    wednesday: string[]  // Buffer for Tuesday
    friday: string[]     // Buffer for Thursday
    sunday: string[]     // Buffer for Saturday
  }
  
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface PaymentConfirmation {
  id: string
  orderId: string
  invoiceNo: string
  amount: number
  method: 'prepaid' | 'on_site_card' | 'cash'
  status: PaymentStatus
  confirmedBy: string
  confirmedAt?: Date
  notes?: string
}

// KPI Interfaces
export interface DeliveryKPIs {
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  
  // Success Metrics
  totalOrders: number
  successfulDeliveries: number
  successRate: number
  
  // Time Metrics
  onTimeDeliveries: number
  onTimeRate: number
  averageDelay: number // in hours
  
  // Quality Metrics
  revisitCount: number
  revisitRate: number
  customerComplaints: number
  
  // Process Metrics
  paymentIssues: number
  technicalIssues: number
  coordinationIssues: number
  
  // Team Performance
  teamUtilization: number
  averageOrdersPerDay: number
}

// Form Templates
export interface FormTemplate {
  id: string
  name: string
  type: 'daily_program' | 'technical_checklist' | 'payment_confirmation' | 'weekly_overview'
  template: string
  isActive: boolean
  createdBy: string
  createdAt: Date
}

// User Roles for this module
export type DeliveryRole = 'coordinator' | 'team_leader' | 'installer' | 'driver' | 'admin'

export interface DeliveryUserPermissions {
  userId: string
  role: DeliveryRole
  permissions: {
    canCreateOrders: boolean
    canSchedule: boolean
    canConfirmPayment: boolean
    canPublishPrograms: boolean
    canViewReports: boolean
    canManageTeams: boolean
  }
}
