export interface ProductCategory {
  categoryId: string
  name: string
  code: string
  description?: string
  level: number // 1, 2, 3, etc.
  parentId?: string // Reference to parent category
  children?: ProductCategory[] // Child categories
  isActive: boolean
  sortOrder: number
  // Metadata
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCategoryRequest {
  name: string
  code: string
  description?: string
  level: number
  parentId?: string
  sortOrder?: number
}

export interface UpdateCategoryRequest {
  categoryId: string
  name?: string
  code?: string
  description?: string
  parentId?: string
  sortOrder?: number
  isActive?: boolean
}

export interface CategoryHierarchy {
  category: ProductCategory
  children: CategoryHierarchy[]
  depth: number
  path: string[] // Array of category names from root to current
}

export interface CategoryStats {
  totalCategories: number
  totalLevels: number
  categoriesByLevel: Record<number, number>
}
