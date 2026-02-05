// Local address type since we're removing the supplier module
type Address = {
  street: string
  city: string
  state?: string
  country: string
  postalCode: string
  phone?: string
  email?: string
}

export type OrderStatus = 'draft' | 'sent' | 'acknowledged' | 'in_progress' | 'shipped' | 'delivered' | 'completed' | 'cancelled'
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent'
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'

export interface OrderAttachment {
  attachmentId: string
  orderId: string
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  description?: string
  uploadedBy: string
  uploadedAt: Date
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
  notes?: string
}

export interface PurchaseOrder {
  orderId: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: OrderStatus
  priority: OrderPriority
  items: OrderItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  shippingCost: number
  totalAmount: number
  currency: string
  paymentTerms: string
  paymentStatus: PaymentStatus
  orderDate: Date
  deliveryDate: Date
  expectedDeliveryDate?: Date
  actualDeliveryDate?: Date
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  internalNotes?: string
  attachments: OrderAttachment[]
  approvalRequired: boolean
  approvedBy?: string
  approvedAt?: Date
  rejectionReason?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateOrderRequest {
  supplierId?: string  // Made optional since we're removing supplier functionality
  priority: OrderPriority
  items: Omit<OrderItem, 'itemId'>[]
  deliveryDate: Date
  shippingAddress: Address
  billingAddress?: Address
  notes?: string
  internalNotes?: string
  paymentTerms?: string
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
  orderId: string
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  actualDeliveryDate?: Date
  approvalRequired?: boolean
}

export interface OrderFilters {
  search?: string
  status?: OrderStatus[]
  priority?: OrderPriority[]
  supplierId?: string[]
  paymentStatus?: PaymentStatus[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface OrderStats {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  cancelledOrders: number
  totalValue: number
  averageOrderValue: number
  onTimeDeliveryRate: number
}

// Order Templates for recurring orders
export interface OrderTemplate {
  templateId: string
  name: string
  description?: string
  supplierId: string
  items: Omit<OrderItem, 'itemId'>[]
  defaultDeliveryDays: number
  defaultPaymentTerms: string
  isActive: boolean
  createdBy: string
  createdAt: Date
  lastUsed?: Date
  usageCount: number
}

export interface CreateOrderFromTemplate {
  templateId: string
  deliveryDate: Date
  modifications?: {
    items?: Partial<OrderItem>[]
    shippingAddress?: SupplierAddress
    notes?: string
  }
}
