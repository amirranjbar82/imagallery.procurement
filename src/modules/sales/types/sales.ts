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

export interface SalesOrder {
  salesOrderId: string;
  orderNumber: string;
  customerId: string;
  contactId: string;
  orderDate: Date;
  requestedDeliveryDate?: Date;
  promisedDeliveryDate?: Date;
  status: SalesOrderStatus;
  priority: OrderPriority;
  salesRep: string;
  lineItems: SalesOrderLineItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  shippingAddress: CustomerAddress;
  billingAddress: CustomerAddress;
  shippingMethod?: string;
  trackingNumber?: string;
  customerPO?: string;
  quotationId?: string;
  terms?: string;
  comments: OrderComment[];
  attachments: string[];
  invoiceIds: string[];
  shipmentIds: string[];
  createdBy: string;
  assignedTo: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface SalesOrderLineItem {
  lineId: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  lineTotal: number;
  deliveryDate?: Date;
  status: LineItemStatus;
}

export interface OrderComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

export type CustomerType = 'individual' | 'company' | 'government';
export type CustomerStatus = 'active' | 'inactive' | 'prospect' | 'blocked';
export type AddressType = 'billing' | 'shipping' | 'both';
export type SalesOrderStatus = 'draft' | 'confirmed' | 'in-production' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LineItemStatus = 'pending' | 'confirmed' | 'in-production' | 'shipped' | 'delivered';
