import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, getDocs, addDoc, updateDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Customer, SalesOrder, SalesOrderStatus } from '../types/sales'

export const useSalesStore = defineStore('sales', () => {
  // State
  const customers = ref<Customer[]>([])
  const salesOrders = ref<SalesOrder[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeCustomers = computed(() => {
    return customers.value.filter(customer => customer.status === 'active')
  })

  const getOrdersByCustomer = computed(() => (customerId: string) => {
    return salesOrders.value.filter(order => order.customerId === customerId)
  })

  const getOrdersByStatus = computed(() => (status: SalesOrderStatus) => {
    return salesOrders.value.filter(order => order.status === status)
  })

  const totalSalesValue = computed(() => {
    return salesOrders.value
      .filter(order => order.status !== 'cancelled')
      .reduce((total, order) => total + order.totalAmount, 0)
  })

  const topCustomers = computed(() => {
    return customers.value
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)
  })

  // Actions
  async function fetchCustomers(filters?: { status?: string; salesRep?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'customers'), orderBy('name'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.salesRep) {
        q = query(q, where('assignedSalesRep', '==', filters.salesRep))
      }
      
      const querySnapshot = await getDocs(q)
      customers.value = querySnapshot.docs.map(doc => ({
        customerId: doc.id,
        ...doc.data()
      })) as Customer[]
    } catch (err) {
      error.value = 'Failed to fetch customers'
      console.error('Error fetching customers:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchSalesOrders(filters?: { customerId?: string; status?: string; salesRep?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'salesOrders'), orderBy('createdAt', 'desc'))
      
      if (filters?.customerId) {
        q = query(q, where('customerId', '==', filters.customerId))
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.salesRep) {
        q = query(q, where('salesRep', '==', filters.salesRep))
      }
      
      const querySnapshot = await getDocs(q)
      salesOrders.value = querySnapshot.docs.map(doc => ({
        salesOrderId: doc.id,
        ...doc.data()
      })) as SalesOrder[]
    } catch (err) {
      error.value = 'Failed to fetch sales orders'
      console.error('Error fetching sales orders:', err)
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(customer: Omit<Customer, 'customerId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'customers'), {
        ...customer,
        createdAt: now,
        updatedAt: now
      })
      
      const newCustomer: Customer = {
        customerId: docRef.id,
        ...customer,
        createdAt: now,
        updatedAt: now
      }
      
      customers.value.push(newCustomer)
      return newCustomer
    } catch (err) {
      error.value = 'Failed to create customer'
      console.error('Error creating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(customerId: string, updates: Partial<Customer>) {
    loading.value = true
    error.value = null
    try {
      const customerRef = doc(db, 'customers', customerId)
      await updateDoc(customerRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = customers.value.findIndex(c => c.customerId === customerId)
      if (index !== -1) {
        customers.value[index] = { ...customers.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update customer'
      console.error('Error updating customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createSalesOrder(order: Omit<SalesOrder, 'salesOrderId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'salesOrders'), {
        ...order,
        createdAt: now,
        updatedAt: now
      })
      
      const newOrder: SalesOrder = {
        salesOrderId: docRef.id,
        ...order,
        createdAt: now,
        updatedAt: now
      }
      
      salesOrders.value.unshift(newOrder)
      return newOrder
    } catch (err) {
      error.value = 'Failed to create sales order'
      console.error('Error creating sales order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSalesOrder(orderId: string, updates: Partial<SalesOrder>) {
    loading.value = true
    error.value = null
    try {
      const orderRef = doc(db, 'salesOrders', orderId)
      await updateDoc(orderRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = salesOrders.value.findIndex(o => o.salesOrderId === orderId)
      if (index !== -1) {
        salesOrders.value[index] = { ...salesOrders.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update sales order'
      console.error('Error updating sales order:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId: string, status: SalesOrderStatus) {
    const updates: Partial<SalesOrder> = { status }
    if (status === 'delivered') {
      updates.completedAt = new Date()
    }
    await updateSalesOrder(orderId, updates)
  }

  return {
    // State
    customers,
    salesOrders,
    loading,
    error,
    
    // Getters
    activeCustomers,
    getOrdersByCustomer,
    getOrdersByStatus,
    totalSalesValue,
    topCustomers,
    
    // Actions
    fetchCustomers,
    fetchSalesOrders,
    createCustomer,
    updateCustomer,
    createSalesOrder,
    updateSalesOrder,
    updateOrderStatus
  }
})
