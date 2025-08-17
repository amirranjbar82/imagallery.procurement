export type InvoiceStatus = 'draft' | 'sent' | 'received' | 'approved' | 'paid' | 'overdue' | 'disputed' | 'cancelled'
export type PaymentMethod = 'bank_transfer' | 'check' | 'credit_card' | 'cash' | 'letter_of_credit' | 'other'
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

export interface InvoiceLineItem {
  lineId: string
  orderId?: string
  orderItemId?: string
  productCode: string
  productName: string
  description?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  discountRate?: number
  discountAmount?: number
}

export interface Invoice {
  invoiceId: string
  invoiceNumber: string
  supplierId: string
  supplierName: string
  orderId?: string
  orderNumber?: string
  status: InvoiceStatus
  invoiceDate: Date
  dueDate: Date
  receivedDate?: Date
  approvedDate?: Date
  paidDate?: Date
  lineItems: InvoiceLineItem[]
  subtotal: number
  totalTaxAmount: number
  totalDiscountAmount: number
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  currency: string
  paymentTerms: string
  notes?: string
  internalNotes?: string
  attachments: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface Payment {
  paymentId: string
  paymentNumber: string
  invoiceId: string
  supplierId: string
  amount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentDate: Date
  status: PaymentStatus
  referenceNumber?: string
  bankDetails?: {
    bankName: string
    accountNumber: string
    routingNumber?: string
    swiftCode?: string
  }
  notes?: string
  attachments: string[]
  processedBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateInvoiceRequest {
  supplierId: string
  orderId?: string
  invoiceDate: Date
  dueDate: Date
  lineItems: Omit<InvoiceLineItem, 'lineId'>[]
  paymentTerms: string
  notes?: string
  internalNotes?: string
}

export interface CreatePaymentRequest {
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: Date
  referenceNumber?: string
  bankDetails?: Payment['bankDetails']
  notes?: string
}

export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus[]
  supplierId?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
  overdueDays?: number
}

export interface PaymentFilters {
  search?: string
  status?: PaymentStatus[]
  paymentMethod?: PaymentMethod[]
  supplierId?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  amountRange?: {
    min: number
    max: number
  }
}

export interface InvoiceStats {
  totalInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  paidInvoices: number
  totalAmount: number
  totalPaid: number
  totalOutstanding: number
  averagePaymentDays: number
}

export interface PaymentStats {
  totalPayments: number
  totalAmount: number
  averagePaymentAmount: number
  paymentsByMethod: Record<PaymentMethod, number>
  monthlyPayments: Array<{
    month: string
    amount: number
    count: number
  }>
}
