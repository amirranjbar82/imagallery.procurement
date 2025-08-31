import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { 
  ProductCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryHierarchy,
  CategoryStats
} from '@/modules/procurement/types/category'

export const useCategoryStore = defineStore('category', () => {
  // State
  const categories = ref<ProductCategory[]>([])
  const selectedCategory = ref<ProductCategory | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const categoryHierarchy = computed((): CategoryHierarchy[] => {
    return buildHierarchy(categories.value.filter(c => c.isActive))
  })

  const categoryStats = computed((): CategoryStats => {
    const totalCategories = categories.value.filter(c => c.isActive).length
    const levels = [...new Set(categories.value.map(c => c.level))]
    const totalLevels = Math.max(...levels, 0)
    
    const categoriesByLevel: Record<number, number> = {}
    levels.forEach(level => {
      categoriesByLevel[level] = categories.value.filter(c => c.level === level && c.isActive).length
    })

    return {
      totalCategories,
      totalLevels,
      categoriesByLevel
    }
  })

  const rootCategories = computed(() =>
    categories.value
      .filter(c => !c.parentId && c.isActive)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
  )

  // Firestore collection reference
  const categoriesCollection = collection(db, 'productCategories')

  // Helper function to build hierarchy
  function buildHierarchy(cats: ProductCategory[], parentId?: string, depth = 0): CategoryHierarchy[] {
    const children = cats.filter(c => c.parentId === parentId)

    return children
      // Sort alphabetically by name at each level (case-insensitive)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
      .map(category => {
        const path = getPathToCategory(cats, category.categoryId)
        return {
          category,
          children: buildHierarchy(cats, category.categoryId, depth + 1),
          depth,
          path
        }
      })
  }

  function getPathToCategory(cats: ProductCategory[], categoryId: string): string[] {
    const path: string[] = []
    let currentId: string | undefined = categoryId

    while (currentId) {
      const category = cats.find(c => c.categoryId === currentId)
      if (category) {
        path.unshift(category.name)
        currentId = category.parentId
      } else {
        break
      }
    }

    return path
  }

  // Actions
  async function fetchCategories() {
    try {
      loading.value = true
      error.value = null

      const q = query(categoriesCollection, orderBy('level'), orderBy('sortOrder'))
      const snapshot = await getDocs(q)

      const categoryList: ProductCategory[] = []
      snapshot.forEach(doc => {
        const data = doc.data() as any
        categoryList.push({
          categoryId: doc.id,
          name: data.name,
          code: data.code,
          description: data.description,
          level: data.level,
          parentId: data.parentId ?? undefined,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProductCategory)
      })

      categories.value = categoryList
      
    } catch (err) {
      console.error('Error fetching categories:', err)
      error.value = 'Failed to fetch categories'
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryById(categoryId: string): Promise<ProductCategory | null> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(categoriesCollection, categoryId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as any
        return {
          categoryId: docSnap.id,
          name: data.name,
          code: data.code,
          description: data.description,
          level: data.level,
          parentId: data.parentId ?? undefined,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as ProductCategory
      }

      return null
      
    } catch (err) {
      console.error('Error fetching category:', err)
      error.value = 'Failed to fetch category'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCategory(categoryData: CreateCategoryRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      // Auto-generate code if not provided
      if (!categoryData.code) {
        categoryData.code = generateCategoryCode(categoryData.name, categoryData.level)
      }

      const docData = {
        ...categoryData,
        // Firestore does not accept undefined; use null for root categories
        parentId: categoryData.parentId ?? null,
        sortOrder: categoryData.sortOrder || 0,
        isActive: true,
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      // Remove any undefined fields before persisting
      const cleanDocData = Object.fromEntries(
        Object.entries(docData as Record<string, any>).filter(([, v]) => v !== undefined)
      )

      const docRef = await addDoc(categoriesCollection, cleanDocData)

      const newCategory: ProductCategory = {
        categoryId: docRef.id,
        // spread but fix parentId null -> undefined for TS type compatibility
        ...(cleanDocData as any),
        parentId: (cleanDocData as any).parentId ?? undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      categories.value.push(newCategory)
      return docRef.id
      
    } catch (err) {
      console.error('Error creating category:', err)
      error.value = 'Failed to create category'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(categoryData: UpdateCategoryRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const { categoryId, ...updateData } = categoryData
      const docRef = doc(categoriesCollection, categoryId)

      // Remove undefined values to avoid Firestore rejections
      const cleanUpdate = Object.fromEntries(
        Object.entries(updateData).filter(([, v]) => v !== undefined)
      ) as Partial<UpdateCategoryRequest>

      await updateDoc(docRef, {
        ...cleanUpdate,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = categories.value.findIndex(c => c.categoryId === categoryId)
      if (index !== -1) {
        categories.value[index] = {
          ...categories.value[index],
          ...(cleanUpdate as any),
          updatedAt: new Date()
        }
      }

      return true
      
    } catch (err) {
      console.error('Error updating category:', err)
      error.value = 'Failed to update category'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(categoryId: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      // Check if category has children
      const hasChildren = categories.value.some(c => c.parentId === categoryId)
      if (hasChildren) {
        error.value = 'Cannot delete category with subcategories'
        return false
      }

      const docRef = doc(categoriesCollection, categoryId)
      await deleteDoc(docRef)

      // Remove from local state
      categories.value = categories.value.filter(c => c.categoryId !== categoryId)
      
      return true
      
    } catch (err) {
      console.error('Error deleting category:', err)
      error.value = 'Failed to delete category'
      return false
    } finally {
      loading.value = false
    }
  }

  function generateCategoryCode(name: string, level: number): string {
    const prefix = name.substring(0, 3).toUpperCase()
    const levelPrefix = `L${level}`
    const timestamp = Date.now().toString().slice(-4)
    return `${levelPrefix}-${prefix}-${timestamp}`
  }

  function clearError() {
    error.value = null
  }

  function setSelectedCategory(category: ProductCategory | null) {
    selectedCategory.value = category
  }

  return {
    // State
    categories,
    selectedCategory,
    loading,
    error,
    
    // Computed
    categoryHierarchy,
    categoryStats,
    rootCategories,
    
    // Actions
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    clearError,
    setSelectedCategory
  }
})
