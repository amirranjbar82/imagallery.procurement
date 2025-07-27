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
  where,
  orderBy,
  limit,
  QueryConstraint,
  serverTimestamp
} from 'firebase/firestore'
import { 
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import { useAuthStore } from './auth'
import type { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest,
  SupplierListFilters,
  SupplierStats,
  SupplierDocument,
  CreateSupplierDocumentRequest
} from '@/types/supplier'

export const useSupplierStore = defineStore('supplier', () => {
  // State
  const suppliers = ref<Supplier[]>([])
  const selectedSupplier = ref<Supplier | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastDoc = ref<any>(null)
  const hasMore = ref(true)
  const stats = ref<SupplierStats>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    pendingSuppliers: 0,
    totalSpend: 0,
    averageRating: 0
  })

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const activeSuppliers = computed(() => 
    suppliers.value.filter(s => s.status === 'active')
  )

  const pendingSuppliers = computed(() => 
    suppliers.value.filter(s => s.status === 'pending')
  )

  // Firestore collection reference
  const suppliersCollection = collection(db, 'suppliers')

  // Actions
  async function fetchSuppliers(filters?: SupplierListFilters, pageSize = 20) {
    try {
      loading.value = true
      error.value = null

      const constraints: QueryConstraint[] = [
        orderBy('name'),
        limit(pageSize)
      ]

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status))
      }

      if (filters?.currency && filters.currency.length > 0) {
        constraints.push(where('currency', 'in', filters.currency))
      }

      if (filters?.tags && filters.tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', filters.tags))
      }

      const q = query(suppliersCollection, ...constraints)
      const snapshot = await getDocs(q)

      const supplierList: Supplier[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        supplierList.push({
          supplierId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Supplier)
      })

      // Apply text search filter (client-side for now)
      let filteredSuppliers = supplierList
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredSuppliers = supplierList.filter(supplier =>
          supplier.name.toLowerCase().includes(searchTerm) ||
          supplier.code.toLowerCase().includes(searchTerm) ||
          supplier.contactPerson.toLowerCase().includes(searchTerm) ||
          supplier.email.toLowerCase().includes(searchTerm)
        )
      }

      suppliers.value = filteredSuppliers
      lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      hasMore.value = snapshot.docs.length === pageSize

    } catch (err) {
      console.error('Error fetching suppliers:', err)
      error.value = 'Failed to fetch suppliers'
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplierById(supplierId: string): Promise<Supplier | null> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(suppliersCollection, supplierId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        error.value = 'Supplier not found'
        return null
      }

      const data = docSnap.data()
      const supplier: Supplier = {
        supplierId: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Supplier

      selectedSupplier.value = supplier
      return supplier

    } catch (err) {
      console.error('Error fetching supplier:', err)
      error.value = 'Failed to fetch supplier'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createSupplier(supplierData: CreateSupplierRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      // Check if supplier code already exists
      const codeQuery = query(suppliersCollection, where('code', '==', supplierData.code))
      const codeSnapshot = await getDocs(codeQuery)
      
      if (!codeSnapshot.empty) {
        error.value = 'Supplier code already exists'
        return null
      }

      const newSupplier = {
        ...supplierData,
        status: 'pending' as const,
        rating: 0,
        totalOrders: 0,
        totalSpend: 0,
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(suppliersCollection, newSupplier)
      
      // Add to local state
      const createdSupplier: Supplier = {
        ...newSupplier,
        supplierId: docRef.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      suppliers.value.unshift(createdSupplier)
      
      return docRef.id

    } catch (err) {
      console.error('Error creating supplier:', err)
      error.value = 'Failed to create supplier'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateSupplier(supplierData: UpdateSupplierRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const { supplierId, ...updateData } = supplierData

      // If updating code, check for duplicates
      if (updateData.code) {
        const codeQuery = query(
          suppliersCollection, 
          where('code', '==', updateData.code)
        )
        const codeSnapshot = await getDocs(codeQuery)
        
        const duplicate = codeSnapshot.docs.find(doc => doc.id !== supplierId)
        if (duplicate) {
          error.value = 'Supplier code already exists'
          return false
        }
      }

      const docRef = doc(suppliersCollection, supplierId)
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = suppliers.value.findIndex(s => s.supplierId === supplierId)
      if (index !== -1) {
        suppliers.value[index] = {
          ...suppliers.value[index],
          ...updateData,
          updatedAt: new Date()
        }
      }

      // Update selected supplier if it's the same
      if (selectedSupplier.value?.supplierId === supplierId) {
        selectedSupplier.value = {
          ...selectedSupplier.value,
          ...updateData,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating supplier:', err)
      error.value = 'Failed to update supplier'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplier(supplierId: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      // TODO: Check if supplier has associated orders/products before deleting
      // For now, we'll just mark as inactive instead of hard delete
      return await updateSupplier({ 
        supplierId, 
        status: 'inactive' 
      })

    } catch (err) {
      console.error('Error deleting supplier:', err)
      error.value = 'Failed to delete supplier'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplierStats() {
    try {
      // This could be optimized with Firestore aggregation queries
      // For now, we'll use the current suppliers list
      const total = suppliers.value.length
      const active = suppliers.value.filter(s => s.status === 'active').length
      const pending = suppliers.value.filter(s => s.status === 'pending').length
      const totalSpend = suppliers.value.reduce((sum, s) => sum + s.totalSpend, 0)
      const avgRating = suppliers.value.reduce((sum, s) => sum + (s.rating || 0), 0) / total

      stats.value = {
        totalSuppliers: total,
        activeSuppliers: active,
        pendingSuppliers: pending,
        totalSpend,
        averageRating: avgRating
      }
    } catch (err) {
      console.error('Error fetching supplier stats:', err)
    }
  }

  function clearError() {
    error.value = null
  }

  function setSelectedSupplier(supplier: Supplier | null) {
    selectedSupplier.value = supplier
  }

  // Document Management Functions
  async function uploadSupplierDocument(request: CreateSupplierDocumentRequest): Promise<SupplierDocument | null> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      // Generate unique document ID
      const documentId = Math.random().toString(36).substr(2, 9)
      
      // Create storage reference using documentId as filename
      const fileExtension = request.file.name.split('.').pop()
      const storagePath = `suppliers/${request.supplierId}/documents/${documentId}.${fileExtension}`
      const fileRef = storageRef(storage, storagePath)
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, request.file)
      
      // Create document metadata in Firestore
      const docData = {
        supplierId: request.supplierId,
        fileName: request.fileName,
        storagePath,
        fileType: request.fileType,
        fileSize: request.fileSize,
        description: request.description || '',
        uploadedBy: authStore.user.uid,
        createdAt: serverTimestamp()
      }
      

      const docRef = await addDoc(collection(db, 'supplierDocuments'), docData)
      
      // Return the created document
      const document: SupplierDocument = {
        documentId: docRef.id,
        ...docData,
        uploadedBy: authStore.userProfile?.name || authStore.user.email || 'Unknown',
        createdAt: new Date()
      }
      
      return document
      
    } catch (err) {
      console.error('Error uploading document:', err)
      error.value = 'Failed to upload document'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplierDocuments(supplierId: string): Promise<SupplierDocument[]> {
    try {
      loading.value = true
      error.value = null
      
    const q = query(
      collection(db, 'supplierDocuments'),
      where('supplierId', '==', supplierId),
      orderBy('createdAt', 'desc')
    )
    
    const snapshot = await getDocs(q)
      
      const documents: SupplierDocument[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        documents.push({
          documentId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as SupplierDocument)
      })
      return documents
      
    } catch (err) {
      console.error('Error fetching documents:', err)
      error.value = 'Failed to fetch documents'
      return []
    } finally {
      loading.value = false
    }
  }

  async function updateSupplierDocument(documentId: string, updates: Partial<SupplierDocument>): Promise<boolean> {
    try {
      loading.value = true
      error.value = null
      
      const docRef = doc(db, 'supplierDocuments', documentId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })
      
      return true
      
    } catch (err) {
      console.error('Error updating document:', err)
      error.value = 'Failed to update document'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplierDocument(document: SupplierDocument): Promise<boolean> {
    try {
      loading.value = true
      error.value = null
      
      // Delete file from Firebase Storage
      const fileRef = storageRef(storage, document.storagePath)
      await deleteObject(fileRef)
      
      // Delete document metadata from Firestore
      await deleteDoc(doc(db, 'supplierDocuments', document.documentId))
      
      return true
      
    } catch (err) {
      console.error('Error deleting document:', err)
      error.value = 'Failed to delete document'
      return false
    } finally {
      loading.value = false
    }
  }

  async function getDocumentDownloadURL(document: SupplierDocument): Promise<string | null> {
    try {
      const fileRef = storageRef(storage, document.storagePath)
      const url = await getDownloadURL(fileRef)
      return url
    } catch (err) {
      console.error('Error getting download URL:', err)
      error.value = 'Failed to get download URL'
      return null
    }
  }

  return {
    // State
    suppliers,
    selectedSupplier,
    loading,
    error,
    hasMore,
    stats,
    
    // Computed
    activeSuppliers,
    pendingSuppliers,
    
    // Actions
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    fetchSupplierStats,
    clearError,
    setSelectedSupplier,
    
    // Document Management Actions
    uploadSupplierDocument,
    fetchSupplierDocuments,
    updateSupplierDocument,
    deleteSupplierDocument,
    getDocumentDownloadURL
  }
})
