export interface InventoryItem {
  itemId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  specifications?: { [key: string]: any };
  unitOfMeasure: string;
  costPrice: number;
  sellPrice: number;
  currency: string;
  supplierId?: string;
  alternateSuppliers: string[];
  reorderPoint: number;
  reorderQuantity: number;
  leadTime: number;
  serialTracked: boolean;
  batchTracked: boolean;
  status: InventoryItemStatus;
  images: string[];
  documents: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockLevel {
  stockId: string;
  itemId: string;
  locationId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  quantityOnOrder: number;
  lastStockTake?: Date;
  lastMovementDate?: Date;
  averageCost: number;
  totalValue: number;
  updatedAt: Date;
}

export interface StockMovement {
  movementId: string;
  itemId: string;
  locationId: string;
  movementType: MovementType;
  referenceType: ReferenceType;
  referenceId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  serialNumbers: string[];
  reason?: string;
  processedBy: string;
  processedAt: Date;
  createdAt: Date;
}

export type InventoryItemStatus = 'active' | 'inactive' | 'discontinued';
export type MovementType = 'receipt' | 'issue' | 'transfer' | 'adjustment' | 'count';
export type ReferenceType = 'po' | 'so' | 'transfer' | 'adjustment';

export interface Location {
  locationId: string;
  name: string;
  type: 'warehouse' | 'store' | 'transit';
  address?: string;
  isActive: boolean;
}
