import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { InventoryItem, StockLevel, StockMovement } from '../types/inventory'

export const useInventoryStore = defineStore('inventory', () => {
  // State
  const inventoryItems = ref<InventoryItem[]>([])
  const stockLevels = ref<StockLevel[]>([])
  const stockMovements = ref<StockMovement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const lowStockItems = computed(() => {
    return inventoryItems.value.filter(item => {
      const stock = stockLevels.value.find(s => s.itemId === item.itemId)
      return stock && stock.quantityAvailable <= item.reorderPoint
    })
  })

  const getStockByItem = computed(() => (itemId: string) => {
    return stockLevels.value.filter(stock => stock.itemId === itemId)
  })

  const totalInventoryValue = computed(() => {
    return stockLevels.value.reduce((total, stock) => total + stock.totalValue, 0)
  })

  // Actions
  async function fetchInventoryItems(filters?: { category?: string; supplierId?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'inventoryItems'), orderBy('name'))
      
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }
      if (filters?.supplierId) {
        q = query(q, where('supplierId', '==', filters.supplierId))
      }
      
      const querySnapshot = await getDocs(q)
      inventoryItems.value = querySnapshot.docs.map(doc => ({
        itemId: doc.id,
        ...doc.data()
      })) as InventoryItem[]
    } catch (err) {
      error.value = 'Failed to fetch inventory items'
      console.error('Error fetching inventory items:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchStockLevels(locationId?: string) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'stockLevels'))
      
      if (locationId) {
        q = query(q, where('locationId', '==', locationId))
      }
      
      const querySnapshot = await getDocs(q)
      stockLevels.value = querySnapshot.docs.map(doc => ({
        stockId: doc.id,
        ...doc.data()
      })) as StockLevel[]
    } catch (err) {
      error.value = 'Failed to fetch stock levels'
      console.error('Error fetching stock levels:', err)
    } finally {
      loading.value = false
    }
  }

  async function createInventoryItem(item: Omit<InventoryItem, 'itemId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'inventoryItems'), {
        ...item,
        createdAt: now,
        updatedAt: now
      })
      
      const newItem: InventoryItem = {
        itemId: docRef.id,
        ...item,
        createdAt: now,
        updatedAt: now
      }
      
      inventoryItems.value.push(newItem)
      return newItem
    } catch (err) {
      error.value = 'Failed to create inventory item'
      console.error('Error creating inventory item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInventoryItem(itemId: string, updates: Partial<InventoryItem>) {
    loading.value = true
    error.value = null
    try {
      const itemRef = doc(db, 'inventoryItems', itemId)
      await updateDoc(itemRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = inventoryItems.value.findIndex(item => item.itemId === itemId)
      if (index !== -1) {
        inventoryItems.value[index] = { ...inventoryItems.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update inventory item'
      console.error('Error updating inventory item:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function recordStockMovement(movement: Omit<StockMovement, 'movementId' | 'createdAt'>) {
    loading.value = true
    error.value = null
    try {
      const docRef = await addDoc(collection(db, 'stockMovements'), {
        ...movement,
        createdAt: new Date()
      })
      
      const newMovement: StockMovement = {
        movementId: docRef.id,
        ...movement,
        createdAt: new Date()
      }
      
      stockMovements.value.unshift(newMovement)
      
      // Update stock levels
      await updateStockLevelsFromMovement(movement)
      
      return newMovement
    } catch (err) {
      error.value = 'Failed to record stock movement'
      console.error('Error recording stock movement:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateStockLevelsFromMovement(movement: Omit<StockMovement, 'movementId' | 'createdAt'>) {
    // This would implement the logic to update stock levels based on the movement
    // For now, just a placeholder
    console.log('Updating stock levels from movement:', movement)
  }

  return {
    // State
    inventoryItems,
    stockLevels,
    stockMovements,
    loading,
    error,
    
    // Getters
    lowStockItems,
    getStockByItem,
    totalInventoryValue,
    
    // Actions
    fetchInventoryItems,
    fetchStockLevels,
    createInventoryItem,
    updateInventoryItem,
    recordStockMovement
  }
})
