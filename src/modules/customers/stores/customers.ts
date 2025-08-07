import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Customer, CustomerContact, CustomerAddress, CustomerInteraction, CustomerStatus, CustomerSummary } from '../types/customers'

export const useCustomersStore = defineStore('customers', () => {
  // State
  const customers = ref<Customer[]>([])
  const customerInteractions = ref<CustomerInteraction[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeCustomers = computed(() => {
    return customers.value.filter(customer => customer.status === 'active')
  })

  const prospectCustomers = computed(() => {
    return customers.value.filter(customer => customer.status === 'prospect')
  })

  const getCustomersByStatus = computed(() => (status: CustomerStatus) => {
    return customers.value.filter(customer => customer.status === status)
  })

  const getCustomerById = computed(() => (customerId: string) => {
    return customers.value.find(customer => customer.customerId === customerId)
  })

  const topCustomersByRevenue = computed(() => {
    return customers.value
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10)
  })

  const customerSummary = computed((): CustomerSummary => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    return {
      totalCustomers: customers.value.length,
      activeCustomers: activeCustomers.value.length,
      newCustomersThisMonth: customers.value.filter(c => c.createdAt >= startOfMonth).length,
      topCustomersByRevenue: topCustomersByRevenue.value
    }
  })

  // Actions
  async function fetchCustomers(filters?: { status?: string; salesRep?: string; industry?: string }) {
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
      if (filters?.industry) {
        q = query(q, where('industry', '==', filters.industry))
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

  async function fetchCustomerInteractions(customerId?: string) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'customerInteractions'), orderBy('createdAt', 'desc'))
      
      if (customerId) {
        q = query(q, where('customerId', '==', customerId))
      }
      
      const querySnapshot = await getDocs(q)
      customerInteractions.value = querySnapshot.docs.map(doc => ({
        interactionId: doc.id,
        ...doc.data()
      })) as CustomerInteraction[]
    } catch (err) {
      error.value = 'Failed to fetch customer interactions'
      console.error('Error fetching customer interactions:', err)
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

  async function deleteCustomer(customerId: string) {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'customers', customerId))
      const index = customers.value.findIndex(c => c.customerId === customerId)
      if (index !== -1) {
        customers.value.splice(index, 1)
      }
    } catch (err) {
      error.value = 'Failed to delete customer'
      console.error('Error deleting customer:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createCustomerInteraction(interaction: Omit<CustomerInteraction, 'interactionId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'customerInteractions'), {
        ...interaction,
        createdAt: now,
        updatedAt: now
      })
      
      const newInteraction: CustomerInteraction = {
        interactionId: docRef.id,
        ...interaction,
        createdAt: now,
        updatedAt: now
      }
      
      customerInteractions.value.unshift(newInteraction)
      return newInteraction
    } catch (err) {
      error.value = 'Failed to create customer interaction'
      console.error('Error creating customer interaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    customers,
    customerInteractions,
    loading,
    error,
    
    // Getters
    activeCustomers,
    prospectCustomers,
    getCustomersByStatus,
    getCustomerById,
    topCustomersByRevenue,
    customerSummary,
    
    // Actions
    fetchCustomers,
    fetchCustomerInteractions,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    createCustomerInteraction
  }
})
