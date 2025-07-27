export type PermissionType = 'read' | 'write' | 'delete'

export interface UserSupplierAccess {
  id: string
  userId: string
  supplierId: string
  permissions: PermissionType[]
  createdAt: Date
  createdBy: string
  updatedAt: Date
}

export interface UserFieldPermission {
  id: string
  userId: string
  supplierId?: string // Optional: supplier-specific or global
  fieldName: string
  visible: boolean
  createdAt: Date
  createdBy: string
  updatedAt: Date
}

export interface CreateUserSupplierAccessRequest {
  userId: string
  supplierId: string
  permissions: PermissionType[]
}

export interface CreateUserFieldPermissionRequest {
  userId: string
  supplierId?: string
  fieldName: string
  visible: boolean
}

export interface UpdateUserSupplierAccessRequest {
  id: string
  permissions: PermissionType[]
}

export interface UpdateUserFieldPermissionRequest {
  id: string
  visible: boolean
}

// Field categories for easier management
export interface FieldCategory {
  name: string
  label: string
  fields: FieldDefinition[]
}

export interface FieldDefinition {
  name: string
  label: string
  description?: string
  category: string
}

// Predefined field categories
export const FIELD_CATEGORIES: FieldCategory[] = [
  {
    name: 'basic',
    label: 'Basic Information',
    fields: [
      { name: 'supplier.name', label: 'Supplier Name', category: 'basic' },
      { name: 'supplier.code', label: 'Supplier Code', category: 'basic' },
      { name: 'supplier.contactPerson', label: 'Contact Person', category: 'basic' },
      { name: 'supplier.email', label: 'Email', category: 'basic' },
      { name: 'supplier.phone', label: 'Phone', category: 'basic' },
      { name: 'supplier.status', label: 'Status', category: 'basic' }
    ]
  },
  {
    name: 'financial',
    label: 'Financial Information',
    fields: [
      { name: 'supplier.paymentTerms', label: 'Payment Terms', category: 'financial' },
      { name: 'supplier.currency', label: 'Currency', category: 'financial' },
      { name: 'supplier.taxId', label: 'Tax ID', category: 'financial' },
      { name: 'supplier.totalSpend', label: 'Total Spend', category: 'financial' },
      { name: 'supplier.totalOrders', label: 'Total Orders', category: 'financial' }
    ]
  },
  {
    name: 'banking',
    label: 'Banking Details',
    fields: [
      { name: 'supplier.bankDetails.bankName', label: 'Bank Name', category: 'banking' },
      { name: 'supplier.bankDetails.accountNumber', label: 'Account Number', category: 'banking' },
      { name: 'supplier.bankDetails.routingNumber', label: 'Routing Number', category: 'banking' },
      { name: 'supplier.bankDetails.swiftCode', label: 'SWIFT Code', category: 'banking' },
      { name: 'supplier.bankDetails.iban', label: 'IBAN', category: 'banking' }
    ]
  },
  {
    name: 'address',
    label: 'Address Information',
    fields: [
      { name: 'supplier.address.street', label: 'Street Address', category: 'address' },
      { name: 'supplier.address.city', label: 'City', category: 'address' },
      { name: 'supplier.address.state', label: 'State/Province', category: 'address' },
      { name: 'supplier.address.country', label: 'Country', category: 'address' },
      { name: 'supplier.address.postalCode', label: 'Postal Code', category: 'address' }
    ]
  },
  {
    name: 'metadata',
    label: 'Metadata',
    fields: [
      { name: 'supplier.description', label: 'Description', category: 'metadata' },
      { name: 'supplier.tags', label: 'Tags', category: 'metadata' },
      { name: 'supplier.rating', label: 'Rating', category: 'metadata' },
      { name: 'supplier.createdAt', label: 'Created Date', category: 'metadata' },
      { name: 'supplier.updatedAt', label: 'Updated Date', category: 'metadata' }
    ]
  }
]

// Permission presets for quick assignment
export interface PermissionPreset {
  name: string
  label: string
  description: string
  fieldPermissions: Record<string, boolean>
}

export const PERMISSION_PRESETS: PermissionPreset[] = [
  {
    name: 'full_access',
    label: 'Full Access',
    description: 'Can view all supplier information including sensitive financial data',
    fieldPermissions: Object.fromEntries(
      FIELD_CATEGORIES.flatMap(cat => cat.fields).map(field => [field.name, true])
    )
  },
  {
    name: 'basic_viewer',
    label: 'Basic Viewer',
    description: 'Can view basic supplier information only',
    fieldPermissions: Object.fromEntries([
      ['supplier.name', true],
      ['supplier.code', true],
      ['supplier.contactPerson', true],
      ['supplier.email', true],
      ['supplier.phone', true],
      ['supplier.status', true],
      ['supplier.address.street', true],
      ['supplier.address.city', true],
      ['supplier.address.state', true],
      ['supplier.address.country', true],
      ['supplier.address.postalCode', true],
      ...FIELD_CATEGORIES.flatMap(cat => cat.fields)
        .filter(field => !['supplier.name', 'supplier.code', 'supplier.contactPerson', 'supplier.email', 'supplier.phone', 'supplier.status'].includes(field.name) && !field.name.startsWith('supplier.address'))
        .map(field => [field.name, false])
    ])
  },
  {
    name: 'financial_viewer',
    label: 'Financial Viewer',
    description: 'Can view basic and financial information but not banking details',
    fieldPermissions: Object.fromEntries([
      ...FIELD_CATEGORIES.filter(cat => ['basic', 'financial', 'address'].includes(cat.name))
        .flatMap(cat => cat.fields).map(field => [field.name, true]),
      ...FIELD_CATEGORIES.filter(cat => ['banking', 'metadata'].includes(cat.name))
        .flatMap(cat => cat.fields).map(field => [field.name, false])
    ])
  },
  {
    name: 'contact_only',
    label: 'Contact Only',
    description: 'Can only view contact and address information',
    fieldPermissions: Object.fromEntries([
      ['supplier.name', true],
      ['supplier.contactPerson', true],
      ['supplier.email', true],
      ['supplier.phone', true],
      ...FIELD_CATEGORIES.find(cat => cat.name === 'address')!.fields.map(field => [field.name, true]),
      ...FIELD_CATEGORIES.filter(cat => !['address'].includes(cat.name))
        .flatMap(cat => cat.fields)
        .filter(field => !['supplier.name', 'supplier.contactPerson', 'supplier.email', 'supplier.phone'].includes(field.name))
        .map(field => [field.name, false])
    ])
  }
]

// User summary for access control UI
export interface UserAccessSummary {
  userId: string
  userName: string
  userEmail: string
  userRole: string
  supplierCount: number
  lastUpdated: Date
}
