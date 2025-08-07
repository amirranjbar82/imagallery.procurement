export interface Customer {
  customerId: string;
  customerNumber: string;
  name: string;
  type: CustomerType;
  parentCustomerId?: string;
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
  paymentTerms: string;
  creditLimit: number;
  currency: string;
  taxId?: string;
  industry?: string;
  website?: string;
  notes?: string;
  status: CustomerStatus;
  rating: number;
  totalSales: number;
  totalOrders: number;
  lastOrderDate?: Date;
  assignedSalesRep?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerContact {
  contactId: string;
  name: string;
  title?: string;
  email: string;
  phone?: string;
  isPrimary: boolean;
}

export interface CustomerAddress {
  addressId: string;
  type: AddressType;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface CustomerInteraction {
  interactionId: string;
  customerId: string;
  type: InteractionType;
  subject: string;
  description: string;
  contactId?: string;
  followUpDate?: Date;
  status: InteractionStatus;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CustomerType = 'individual' | 'business' | 'government' | 'nonprofit';
export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'blocked';
export type AddressType = 'billing' | 'shipping' | 'both';
export type InteractionType = 'call' | 'email' | 'meeting' | 'note' | 'task';
export type InteractionStatus = 'completed' | 'pending' | 'cancelled';

// Customer summary for dashboard
export interface CustomerSummary {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  topCustomersByRevenue: Customer[];
}
