import { defineStore } from 'pinia'
import { ref } from 'vue'
import { collection, query, orderBy, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Supplier {
  supplierId: string
  name: string
  contactName?: string
  email?: string
  phone?: string
  address?: string
  taxId?: string
  paymentTerms?: string
  creditLimit?: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSuppliers() {
    loading.value = true
    error.value = null

    try {
      const q = query(collection(db, 'suppliers'), orderBy('name', 'asc'))
      const querySnapshot = await getDocs(q)

      suppliers.value = querySnapshot.docs.map(doc => ({
        supplierId: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Supplier[]
    } catch (err: any) {
      console.error('Error fetching suppliers:', err)
      error.value = err.message || 'Failed to fetch suppliers'

      // Fallback to mock data in development
      if (import.meta.env.DEV) {
        suppliers.value = [
          {
            supplierId: 'mock-1',
            name: 'ABC Supplies Ltd',
            contactName: 'John Doe',
            email: 'john@abc.com',
            phone: '+1234567890',
            address: '123 Main St, City, Country',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            supplierId: 'mock-2',
            name: 'XYZ Corporation',
            contactName: 'Jane Smith',
            email: 'jane@xyz.com',
            phone: '+1234567891',
            address: '456 Oak Ave, City, Country',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      }
    } finally {
      loading.value = false
    }
  }

  async function createSupplier(supplierData: Omit<Supplier, 'supplierId' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'suppliers'), {
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const newSupplier: Supplier = {
        supplierId: docRef.id,
        ...supplierData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      suppliers.value.push(newSupplier)
      return docRef.id
    } catch (err: any) {
      console.error('Error creating supplier:', err)
      throw new Error(err.message || 'Failed to create supplier')
    }
  }

  async function updateSupplier(supplierId: string, updates: Partial<Supplier>) {
    try {
      await updateDoc(doc(db, 'suppliers', supplierId), {
        ...updates,
        updatedAt: new Date()
      })

      const index = suppliers.value.findIndex(s => s.supplierId === supplierId)
      if (index > -1) {
        suppliers.value[index] = {
          ...suppliers.value[index],
          ...updates,
          updatedAt: new Date()
        }
      }
    } catch (err: any) {
      console.error('Error updating supplier:', err)
      throw new Error(err.message || 'Failed to update supplier')
    }
  }

  async function deleteSupplier(supplierId: string) {
    try {
      await deleteDoc(doc(db, 'suppliers', supplierId))
      suppliers.value = suppliers.value.filter(s => s.supplierId !== supplierId)
    } catch (err: any) {
      console.error('Error deleting supplier:', err)
      throw new Error(err.message || 'Failed to delete supplier')
    }
  }

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
})
