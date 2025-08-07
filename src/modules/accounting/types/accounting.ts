export interface Account {
  accountId: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  parentAccountId?: string;
  description?: string;
  isActive: boolean;
  balance: number;
  currency: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  transactionId: string;
  transactionNumber: string;
  date: Date;
  description: string;
  reference?: string;
  totalAmount: number;
  currency: string;
  status: TransactionStatus;
  entries: TransactionEntry[];
  attachments?: string[];
  createdBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionEntry {
  entryId: string;
  accountId: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
}

export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  type: InvoiceType;
  customerId?: string;
  supplierId?: string;
  issueDate: Date;
  dueDate: Date;
  paymentTerms: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  currency: string;
  status: InvoiceStatus;
  items: InvoiceItem[];
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountRate: number;
  totalAmount: number;
}

export interface Payment {
  paymentId: string;
  paymentNumber: string;
  type: PaymentType;
  invoiceId?: string;
  amount: number;
  currency: string;
  paymentDate: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  bankAccount?: string;
  status: PaymentStatus;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BankAccount {
  bankAccountId: string;
  accountName: string;
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  balance: number;
  isActive: boolean;
  accountType: BankAccountType;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaxRate {
  taxRateId: string;
  name: string;
  rate: number;
  description?: string;
  isActive: boolean;
  applicableFrom: Date;
  applicableTo?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
export type TransactionStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'posted';
export type InvoiceType = 'sales' | 'purchase' | 'credit_note' | 'debit_note';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'partially_paid';
export type PaymentType = 'receipt' | 'payment';
export type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'online';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled';
export type BankAccountType = 'checking' | 'savings' | 'credit' | 'loan';

// Financial summary for dashboard
export interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  accountsReceivable: number;
  accountsPayable: number;
  cashBalance: number;
  outstandingInvoices: number;
  overdueInvoices: number;
}
