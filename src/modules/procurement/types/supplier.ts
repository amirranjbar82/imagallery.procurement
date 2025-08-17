export type SupplierStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type CommunicationPlatform = 'email' | 'whatsapp' | 'telegram' | 'wechat' | 'phone'

export interface SupplierAddress {
  street: string
  city: string
  state?: string
  country: string
  postalCode: string
}

export interface SupplierBankDetails {
  bankName: string
  accountNumber: string
  routingNumber?: string
  swiftCode?: string
  iban?: string
}

export interface Supplier {
  supplierId: string
  name: string
  code: string // Unique supplier code
  nameCode?: string // Auto-generated from company name initials
  contactPerson: string
  email: string
  phone: string
  address: SupplierAddress
  factoryAddress?: SupplierAddress
  paymentTerms: string // e.g., "Net 30", "Net 60"
  currency: string
  taxId?: string
  bankDetails?: SupplierBankDetails
  communicationPlatform: CommunicationPlatform
  description?: string
  tags: string[]
  status: SupplierStatus
  rating?: number // 1-5 stars
  totalOrders: number
  totalSpend: number
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSupplierRequest {
  name: string
  code: string
  nameCode?: string
  contactPerson: string
  email: string
  phone: string
  address: SupplierAddress
  factoryAddress?: SupplierAddress
  paymentTerms: string
  currency: string
  taxId?: string
  bankDetails?: SupplierBankDetails
  communicationPlatform: CommunicationPlatform
  description?: string
  tags: string[]
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {
  supplierId: string
  status?: SupplierStatus
  rating?: number
}

export interface SupplierListFilters {
  search?: string
  status?: SupplierStatus[]
  tags?: string[]
  currency?: string[]
  rating?: number
}

export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  pendingSuppliers: number
  totalSpend: number
  averageRating: number
}

// Document Management Types
export interface SupplierDocument {
  documentId: string
  supplierId: string
  fileName: string
  storagePath: string
  fileType: string
  fileSize: number
  description?: string
  uploadedBy: string
  createdAt: Date
}

export interface CreateSupplierDocumentRequest {
  supplierId: string
  fileName: string
  fileType: string
  fileSize: number
  description?: string
  file: File
}

export interface SupplierDocumentFilters {
  search?: string
  fileType?: string[]
  uploadedBy?: string
  category?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

// Custom Fields System
export interface CustomField {
  fieldId: string
  fieldName: string
  fieldType: 'text' | 'number' | 'date' | 'boolean' | 'select' | 'multiselect'
  options?: string[] // For select/multiselect types
  required: boolean
  defaultValue?: any
  description?: string
  createdBy: string
  createdAt: Date
}

export interface SupplierCustomFieldValue {
  supplierId: string
  fieldId: string
  value: any
  updatedBy: string
  updatedAt: Date
}

// Enhanced Document Management
export interface DocumentCategory {
  categoryId: string
  name: string
  description?: string
  color: string
  icon: string
  parentCategoryId?: string
  createdBy: string
  createdAt: Date
}

export interface EnhancedSupplierDocument extends SupplierDocument {
  categoryId?: string
  tags: string[]
  version: number
  isLatestVersion: boolean
  parentDocumentId?: string // For versioning
  metadata: Record<string, any>
  accessLevel: 'public' | 'restricted' | 'confidential'
  expiryDate?: Date
  approvalStatus: 'pending' | 'approved' | 'rejected'
  approvedBy?: string
  approvedAt?: Date
}

// AI Excel Import System
export interface ExcelImportMapping {
  excelColumn: string
  supplierField: string
  transformation?: 'uppercase' | 'lowercase' | 'trim' | 'phone_format' | 'email_format'
  defaultValue?: any
  required: boolean
}

export interface ExcelImportTemplate {
  templateId: string
  name: string
  description?: string
  mappings: ExcelImportMapping[]
  createdBy: string
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

export interface ExcelImportJob {
  jobId: string
  fileName: string
  templateId?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalRows: number
  processedRows: number
  successfulRows: number
  failedRows: number
  errors: string[]
  createdBy: string
  createdAt: Date
  completedAt?: Date
}

// Automatic Code Generation
export interface ItemCategory {
  categoryId: string
  name: string
  code: string // e.g., 'ELC' for Electronics
  description?: string
  codeFormat: string // e.g., 'ELC-{YYYY}-{####}'
  nextNumber: number
  parentCategoryId?: string
  createdBy: string
  createdAt: Date
}

export interface GeneratedCode {
  codeId: string
  categoryId: string
  generatedCode: string
  usedFor: 'supplier' | 'product' | 'order'
  entityId: string
  generatedBy: string
  generatedAt: Date
}

// Communication System
export interface CommunicationLog {
  logId: string
  supplierId: string
  platform: CommunicationPlatform
  messageType: 'sent' | 'received'
  subject?: string
  content: string
  attachments?: string[]
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sentBy: string
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
}

export interface CommunicationTemplate {
  templateId: string
  name: string
  platform: CommunicationPlatform
  subject?: string
  content: string
  variables: string[] // e.g., ['supplierName', 'orderNumber']
  isActive: boolean
  createdBy: string
  createdAt: Date
}

// Box Label System
export interface BoxLabel {
  labelId: string
  supplierId: string
  productName: string
  productCode: string
  specifications: Record<string, any>
  qrCodeData: string
  imageUrl?: string
  dimensions: {
    width: number
    height: number
    depth?: number
  }
  weight?: number
  batchNumber?: string
  expiryDate?: Date
  createdBy: string
  createdAt: Date
}

export interface LabelTemplate {
  templateId: string
  name: string
  description?: string
  layout: {
    width: number // in mm
    height: number // in mm
    elements: LabelElement[]
  }
  isDefault: boolean
  createdBy: string
  createdAt: Date
}

export interface LabelElement {
  elementId: string
  type: 'text' | 'image' | 'qr' | 'barcode' | 'line' | 'rectangle'
  position: { x: number; y: number }
  size: { width: number; height: number }
  content?: string
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  alignment?: 'left' | 'center' | 'right'
  color?: string
  backgroundColor?: string
  borderWidth?: number
  borderColor?: string
}

// Enhanced Order Types
export interface OrderAttachment {
  attachmentId: string
  orderId: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  uploadedBy: string
  uploadedAt: Date
}

export interface PurchaseOrder {
  orderId: string
  orderNumber: string
  supplierId: string
  status: 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  currency: string
  paymentTerms: string
  deliveryDate: Date
  shippingAddress: SupplierAddress
  notes?: string
  attachments: OrderAttachment[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  itemId: string
  productCode: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  specifications?: Record<string, any>
  deliveryDate?: Date
}

// Access Control Enhancement
export interface SupplierAccessControl {
  userId: string
  supplierId: string
  permissions: {
    view: boolean
    edit: boolean
    delete: boolean
    viewDocuments: boolean
    uploadDocuments: boolean
    deleteDocuments: boolean
    viewFinancials: boolean
    editFinancials: boolean
    communicate: boolean
    viewOrders: boolean
    createOrders: boolean
    editOrders: boolean
    viewReports: boolean
  }
  grantedBy: string
  grantedAt: Date
  expiresAt?: Date
}

// Enhanced Stats and Analytics
export interface SupplierPerformanceMetrics {
  supplierId: string
  period: 'monthly' | 'quarterly' | 'yearly'
  year: number
  month?: number
  quarter?: number
  metrics: {
    totalOrders: number
    totalValue: number
    averageOrderValue: number
    onTimeDeliveryRate: number
    qualityScore: number
    responseTime: number // in hours
    defectRate: number
    returnRate: number
  }
  calculatedAt: Date
}

export interface SupplierComparison {
  supplierId: string
  competitorSupplierId: string
  criteria: {
    pricing: number // 1-10 scale
    quality: number
    delivery: number
    service: number
    reliability: number
  }
  overallScore: number
  notes?: string
  comparedBy: string
  comparedAt: Date
}
