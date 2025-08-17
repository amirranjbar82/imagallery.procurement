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
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { 
  Supplier, 
  CreateSupplierRequest, 
  UpdateSupplierRequest,
  SupplierListFilters,
  SupplierStats,
  SupplierDocument,
  CreateSupplierDocumentRequest,
  CustomField,
  SupplierCustomFieldValue,
  DocumentCategory,
  EnhancedSupplierDocument,
  ExcelImportTemplate,
  ExcelImportJob,
  ExcelImportMapping,
  ItemCategory,
  GeneratedCode,
  CommunicationLog,
  CommunicationTemplate,
  BoxLabel,
  LabelTemplate,
  SupplierAccessControl,
  SupplierPerformanceMetrics,
  SupplierComparison,
  CommunicationPlatform
} from '@/modules/procurement/types/supplier'

// Utility: deeply remove any undefined values from objects/arrays to avoid Firestore errors
function removeUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    // @ts-ignore - recursive sanitize
    return value
      .map(v => removeUndefinedDeep(v))
      .filter(v => v !== undefined) as any
  }
  if (value && typeof value === 'object') {
    const result: any = {}
    Object.entries(value as any).forEach(([k, v]) => {
      if (v === undefined) return
      // Recurse for nested structures
      const cleaned = removeUndefinedDeep(v as any)
      if (cleaned !== undefined) result[k] = cleaned
    })
    return result
  }
  return value
}

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
  
  // Advanced Features State
  const customFields = ref<CustomField[]>([])
  const customFieldValues = ref<SupplierCustomFieldValue[]>([])
  const documentCategories = ref<DocumentCategory[]>([])
  const excelImportTemplates = ref<ExcelImportTemplate[]>([])
  const excelImportJobs = ref<ExcelImportJob[]>([])
  const itemCategories = ref<ItemCategory[]>([])
  const communicationLogs = ref<CommunicationLog[]>([])
  const communicationTemplates = ref<CommunicationTemplate[]>([])
  const boxLabels = ref<BoxLabel[]>([])
  const labelTemplates = ref<LabelTemplate[]>([])
  const supplierAccessControls = ref<SupplierAccessControl[]>([])
  const performanceMetrics = ref<SupplierPerformanceMetrics[]>([])
  const supplierComparisons = ref<SupplierComparison[]>([])

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

      // Ensure required generated fields
      const ensuredCode = supplierData.code && supplierData.code.trim().length > 0
        ? supplierData.code
        : `SUP-${Date.now()}`
      const ensuredNameCode = (supplierData as any).nameCode || (supplierData.name || '')
        .split(' ')
        .map(w => w.charAt(0).toUpperCase())
        .join('')
        .substring(0, 6)

      // Check if supplier code already exists
      const codeQuery = query(suppliersCollection, where('code', '==', ensuredCode))
      const codeSnapshot = await getDocs(codeQuery)
      
      if (!codeSnapshot.empty) {
        error.value = 'Supplier code already exists'
        return null
      }

      // Build document and remove all undefineds to satisfy Firestore
      const baseData = {
        ...supplierData,
        code: ensuredCode,
        nameCode: ensuredNameCode
      } as any

      const newSupplier = {
        ...removeUndefinedDeep(baseData),
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
      // Clean update payload from undefineds and ensure updatedAt
      const cleanedUpdate = removeUndefinedDeep(updateData as any)
      await updateDoc(docRef, {
        ...cleanedUpdate,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = suppliers.value.findIndex(s => s.supplierId === supplierId)
      if (index !== -1) {
        suppliers.value[index] = {
          ...suppliers.value[index],
          ...cleanedUpdate,
          updatedAt: new Date()
        }
      }

      // Update selected supplier if it's the same
      if (selectedSupplier.value?.supplierId === supplierId) {
        selectedSupplier.value = {
          ...selectedSupplier.value,
          ...cleanedUpdate,
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

  // Custom Fields Management
  async function createCustomField(fieldData: Omit<CustomField, 'fieldId' | 'createdAt'>): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      const docData = {
        ...fieldData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'supplierCustomFields'), docData)
      
      const newField: CustomField = {
        fieldId: docRef.id,
        ...fieldData,
        createdAt: new Date()
      }
      
      customFields.value.push(newField)
      return docRef.id
      
    } catch (err) {
      console.error('Error creating custom field:', err)
      error.value = 'Failed to create custom field'
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function fetchCustomFields(): Promise<void> {
    try {
      loading.value = true
      error.value = null
      
      const q = query(
        collection(db, 'supplierCustomFields'),
        orderBy('fieldName')
      )
      
      const snapshot = await getDocs(q)
      const fields: CustomField[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        fields.push({
          fieldId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as CustomField)
      })
      
      customFields.value = fields
      
    } catch (err) {
      console.error('Error fetching custom fields:', err)
      error.value = 'Failed to fetch custom fields'
    } finally {
      loading.value = false
    }
  }
  
  async function updateCustomFieldValue(supplierId: string, fieldId: string, value: any): Promise<boolean> {
    try {
      loading.value = true
      error.value = null
      
      const existingValueIndex = customFieldValues.value.findIndex(
        v => v.supplierId === supplierId && v.fieldId === fieldId
      )
      
      const valueData = {
        supplierId,
        fieldId,
        value,
        updatedBy: authStore.user?.uid || 'unknown',
        updatedAt: serverTimestamp()
      }
      
      if (existingValueIndex >= 0) {
        // Update existing value
        const existingValue = customFieldValues.value[existingValueIndex]
        await updateDoc(doc(db, 'supplierCustomFieldValues', existingValue.supplierId + '_' + existingValue.fieldId), valueData)
        
        customFieldValues.value[existingValueIndex] = {
          ...valueData,
          updatedAt: new Date()
        }
      } else {
        // Create new value
        await addDoc(collection(db, 'supplierCustomFieldValues'), valueData)
        
        customFieldValues.value.push({
          ...valueData,
          updatedAt: new Date()
        })
      }
      
      return true
      
    } catch (err) {
      console.error('Error updating custom field value:', err)
      error.value = 'Failed to update custom field value'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // Document Categories Management
  async function createDocumentCategory(categoryData: Omit<DocumentCategory, 'categoryId' | 'createdAt'>): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      const docData = {
        ...categoryData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'supplierDocumentCategories'), docData)
      
      const newCategory: DocumentCategory = {
        categoryId: docRef.id,
        ...categoryData,
        createdAt: new Date()
      }
      
      documentCategories.value.push(newCategory)
      return docRef.id
      
    } catch (err) {
      console.error('Error creating document category:', err)
      error.value = 'Failed to create document category'
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function fetchDocumentCategories(): Promise<void> {
    try {
      loading.value = true
      error.value = null
      
      const q = query(
        collection(db, 'supplierDocumentCategories'),
        orderBy('name')
      )
      
      const snapshot = await getDocs(q)
      const categories: DocumentCategory[] = []
      
      snapshot.forEach(doc => {
        const data = doc.data()
        categories.push({
          categoryId: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date()
        } as DocumentCategory)
      })
      
      documentCategories.value = categories
      
    } catch (err) {
      console.error('Error fetching document categories:', err)
      error.value = 'Failed to fetch document categories'
    } finally {
      loading.value = false
    }
  }
  
  // AI Excel Import System
  async function createExcelImportTemplate(templateData: Omit<ExcelImportTemplate, 'templateId' | 'createdAt' | 'usageCount'>): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      const docData = {
        ...templateData,
        usageCount: 0,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'excelImportTemplates'), docData)
      
      const newTemplate: ExcelImportTemplate = {
        templateId: docRef.id,
        ...templateData,
        usageCount: 0,
        createdAt: new Date()
      }
      
      excelImportTemplates.value.push(newTemplate)
      return docRef.id
      
    } catch (err) {
      console.error('Error creating Excel import template:', err)
      error.value = 'Failed to create Excel import template'
      return null
    } finally {
      loading.value = false
    }
  }
  
  async function processExcelImport(file: File, templateId?: string): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      // Create import job
      const jobData = {
        fileName: file.name,
        templateId,
        status: 'pending' as const,
        totalRows: 0,
        processedRows: 0,
        successfulRows: 0,
        failedRows: 0,
        errors: [],
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp()
      }
      
      const jobRef = await addDoc(collection(db, 'excelImportJobs'), jobData)
      
      // TODO: Implement actual Excel processing logic
      // This would involve:
      // 1. Reading Excel file
      // 2. Applying template mappings
      // 3. Validating data
      // 4. Creating suppliers
      // 5. Updating job status
      
      const newJob: ExcelImportJob = {
        jobId: jobRef.id,
        ...jobData,
        createdAt: new Date()
      }
      
      excelImportJobs.value.push(newJob)
      return jobRef.id
      
    } catch (err) {
      console.error('Error processing Excel import:', err)
      error.value = 'Failed to process Excel import'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Automatic Code Generation
  async function generateSupplierCode(categoryId: string): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      const category = itemCategories.value.find(c => c.categoryId === categoryId)
      if (!category) {
        error.value = 'Category not found'
        return null
      }
      
      // Generate code based on format
      const currentYear = new Date().getFullYear()
      const nextNumber = category.nextNumber.toString().padStart(4, '0')
      
      let generatedCode = category.codeFormat
        .replace('{YYYY}', currentYear.toString())
        .replace('{####}', nextNumber)
      
      // Update category next number
      await updateDoc(doc(db, 'itemCategories', categoryId), {
        nextNumber: category.nextNumber + 1
      })
      
      // Log generated code
      const codeData = {
        categoryId,
        generatedCode,
        usedFor: 'supplier' as const,
        entityId: '', // Will be updated when supplier is created
        generatedBy: authStore.user?.uid || 'unknown',
        generatedAt: serverTimestamp()
      }
      
      await addDoc(collection(db, 'generatedCodes'), codeData)
      
      return generatedCode
      
    } catch (err) {
      console.error('Error generating supplier code:', err)
      error.value = 'Failed to generate supplier code'
      return null
    } finally {
      loading.value = false
    }
  }
  
  // Communication System
  async function sendCommunication(supplierId: string, platform: CommunicationPlatform, subject: string, content: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null
      
      const logData = {
        supplierId,
        platform,
        messageType: 'sent' as const,
        subject,
        content,
        status: 'pending' as const,
        sentBy: authStore.user?.uid || 'unknown',
        sentAt: serverTimestamp()
      }
      
      const logRef = await addDoc(collection(db, 'communicationLogs'), logData)
      
      // TODO: Implement actual communication sending logic
      // This would integrate with email services and WhatsApp API, etc.
      
      const newLog: CommunicationLog = {
        logId: logRef.id,
        ...logData,
        sentAt: new Date()
      }
      
      communicationLogs.value.push(newLog)
      
      // Update status to sent (in real implementation, this would be done by the communication service)
      setTimeout(async () => {
        await updateDoc(doc(db, 'communicationLogs', logRef.id), {
          status: 'sent',
          deliveredAt: serverTimestamp()
        })
      }, 1000)
      
      return true
      
    } catch (err) {
      console.error('Error sending communication:', err)
      error.value = 'Failed to send communication'
      return false
    } finally {
      loading.value = false
    }
  }
  
  // Box Label Generation
  async function generateBoxLabel(labelData: Omit<BoxLabel, 'labelId' | 'createdAt'>): Promise<string | null> {
    try {
      loading.value = true
      error.value = null
      
      const docData = {
        ...labelData,
        createdAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'boxLabels'), docData)
      
      const newLabel: BoxLabel = {
        labelId: docRef.id,
        ...labelData,
        createdAt: new Date()
      }
      
      boxLabels.value.push(newLabel)
      return docRef.id
      
    } catch (err) {
      console.error('Error generating box label:', err)
      error.value = 'Failed to generate box label'
      return null
    } finally {
      loading.value = false
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
    customFields,
    customFieldValues,
    documentCategories,
    excelImportTemplates,
    excelImportJobs,
    itemCategories,
    communicationLogs,
    communicationTemplates,
    boxLabels,
    labelTemplates,
    supplierAccessControls,
    performanceMetrics,
    supplierComparisons,
    
    // Computed
    activeSuppliers,
    pendingSuppliers,
    
    // Basic Actions
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
    getDocumentDownloadURL,
    
    // Advanced Features Actions
    createCustomField,
    fetchCustomFields,
    updateCustomFieldValue,
    createDocumentCategory,
    fetchDocumentCategories,
    createExcelImportTemplate,
    processExcelImport,
    generateSupplierCode,
    sendCommunication,
    generateBoxLabel
  }
})
