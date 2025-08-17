export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed_delivery' | 'returned'
export type ShipmentMethod = 'air' | 'sea' | 'land' | 'rail' | 'courier' | 'pickup'

export interface ShipmentItem {
  itemId: string
  orderId: string
  orderItemId: string
  productCode: string
  productName: string
  quantity: number
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
}

export interface TrackingEvent {
  eventId: string
  timestamp: Date
  status: ShipmentStatus
  location: string
  description: string
  updatedBy?: string
}

export interface Shipment {
  shipmentId: string
  shipmentNumber: string
  orderId: string
  orderNumber: string
  supplierId: string
  supplierName: string
  status: ShipmentStatus
  method: ShipmentMethod
  carrier?: string
  trackingNumber?: string
  items: ShipmentItem[]
  totalWeight?: number
  totalVolume?: number
  packageCount: number
  shippingCost: number
  currency: string
  pickupDate?: Date
  estimatedDeliveryDate: Date
  actualDeliveryDate?: Date
  shippingAddress: {
    street: string
    city: string
    state?: string
    country: string
    postalCode: string
    contactPerson: string
    contactPhone: string
  }
  trackingEvents: TrackingEvent[]
  notes?: string
  attachments: string[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateShipmentRequest {
  orderId: string
  method: ShipmentMethod
  carrier?: string
  trackingNumber?: string
  items: Omit<ShipmentItem, 'itemId'>[]
  estimatedDeliveryDate: Date
  shippingCost: number
  notes?: string
}

export interface UpdateShipmentRequest extends Partial<CreateShipmentRequest> {
  shipmentId: string
  status?: ShipmentStatus
  actualDeliveryDate?: Date
}

export interface ShipmentFilters {
  search?: string
  status?: ShipmentStatus[]
  method?: ShipmentMethod[]
  supplierId?: string[]
  carrier?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
}

export interface ShipmentStats {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  onTimeDeliveryRate: number
  averageDeliveryDays: number
  totalShippingCost: number
}
