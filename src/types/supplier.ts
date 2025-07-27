export type SupplierStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type CommunicationPlatform = 'email' | 'whatsapp' | 'telegram' | 'slack' | 'teams' | 'phone'

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
  contactPerson: string
  email: string
  phone: string
  address: SupplierAddress
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
  contactPerson: string
  email: string
  phone: string
  address: SupplierAddress
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
  dateRange?: {
    start: Date
    end: Date
  }
}
