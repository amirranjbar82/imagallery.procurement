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
import { db, storage } from '@/lib/firebase'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject, ref as storageRefFromURL } from 'firebase/storage'
import { arrayUnion, arrayRemove } from 'firebase/firestore'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { 
  Invoice,
  Payment,
  CreateInvoiceRequest,
  CreatePaymentRequest,
  InvoiceFilters,
  PaymentFilters,
  InvoiceStats,
  PaymentStats
} from '@/modules/procurement/types/invoices'

export const useInvoicesStore = defineStore('invoices', () => {
  // State
  const invoices = ref<Invoice[]>([])
  const payments = ref<Payment[]>([])
  const selectedInvoice = ref<Invoice | null>(null)
  const selectedPayment = ref<Payment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastDoc = ref<any>(null)
  const hasMore = ref(true)
  const invoiceStats = ref<InvoiceStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    paidInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    averagePaymentDays: 0
  })
  const paymentStats = ref<PaymentStats>({
    totalPayments: 0,
    totalAmount: 0,
    averagePaymentAmount: 0,
    paymentsByMethod: {
      bank_transfer: 0,
      check: 0,
      credit_card: 0,
      cash: 0,
      letter_of_credit: 0,
      other: 0
    },
    monthlyPayments: []
  })

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const pendingInvoices = computed(() => 
    invoices.value.filter(i => ['draft', 'sent', 'received'].includes(i.status))
  )

  const overdueInvoices = computed(() => 
    invoices.value.filter(i => {
      const today = new Date()
      return i.dueDate < today && !['paid', 'cancelled'].includes(i.status)
    })
  )

  const paidInvoices = computed(() => 
    invoices.value.filter(i => i.status === 'paid')
  )

  // Firestore collection references
  const invoicesCollection = collection(db, 'invoices')
  const paymentsCollection = collection(db, 'payments')

  // Invoice Actions
  async function fetchInvoices(filters?: InvoiceFilters, pageSize = 20) {
    try {
      loading.value = true
      error.value = null

      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      ]

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status))
      }

      if (filters?.supplierId && filters.supplierId.length > 0) {
        constraints.push(where('supplierId', 'in', filters.supplierId))
      }

      const q = query(invoicesCollection, ...constraints)
      const snapshot = await getDocs(q)

      const invoiceList: Invoice[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        invoiceList.push({
          invoiceId: doc.id,
          ...data,
          invoiceDate: data.invoiceDate?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || new Date(),
          receivedDate: data.receivedDate?.toDate(),
          approvedDate: data.approvedDate?.toDate(),
          paidDate: data.paidDate?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Invoice)
      })

      // Apply text search filter (client-side for now)
      let filteredInvoices = invoiceList
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredInvoices = invoiceList.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchTerm) ||
          invoice.supplierName.toLowerCase().includes(searchTerm) ||
          invoice.orderNumber?.toLowerCase().includes(searchTerm) ||
          invoice.notes?.toLowerCase().includes(searchTerm)
        )
      }

      invoices.value = filteredInvoices
      lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      hasMore.value = snapshot.docs.length === pageSize

    } catch (err) {
      console.error('Error fetching invoices:', err)
      error.value = 'Failed to fetch invoices'
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(invoiceData: CreateInvoiceRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}`

      // Calculate totals
      const subtotal = invoiceData.lineItems.reduce((sum, item) => sum + item.totalPrice, 0)
      const totalTaxAmount = invoiceData.lineItems.reduce((sum, item) => sum + item.taxAmount, 0)
      const totalDiscountAmount = invoiceData.lineItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
      const totalAmount = subtotal + totalTaxAmount - totalDiscountAmount

      const docData = {
        invoiceNumber,
        ...invoiceData,
        status: 'draft',
        subtotal,
        totalTaxAmount,
        totalDiscountAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        currency: 'USD', // Default currency
        attachments: [],
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(invoicesCollection, docData)

      const newInvoice = {
        invoiceId: docRef.id,
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Invoice

      invoices.value.unshift(newInvoice)
      return docRef.id

    } catch (err) {
      console.error('Error creating invoice:', err)
      error.value = 'Failed to create invoice'
      return null
    } finally {
      loading.value = false
    }
  }

  // Remove an attachment URL from an invoice and attempt to delete the file from Storage
  async function removeInvoiceAttachment(invoiceId: string, url: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      await updateDoc(doc(invoicesCollection, invoiceId), {
        attachments: arrayRemove(url),
        updatedAt: serverTimestamp()
      })

      // Update local state
      const inv = invoices.value.find(i => i.invoiceId === invoiceId)
      if (inv) {
        inv.attachments = (inv.attachments || []).filter(u => u !== url)
        inv.updatedAt = new Date()
      }

      // Try to delete from Storage if URL is accessible
      try {
        const fileRef = storageRefFromURL(storage, url)
        await deleteObject(fileRef)
      } catch (e) {
        // Ignore storage deletion failures (may be cross-bucket or insufficient perms)
        console.warn('Storage delete skipped:', e)
      }

      return true
    } catch (err) {
      console.error('Error removing invoice attachment:', err)
      error.value = 'Failed to remove attachment'
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(invoicesCollection, invoiceId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const invoiceIndex = invoices.value.findIndex(i => i.invoiceId === invoiceId)
      if (invoiceIndex >= 0) {
        invoices.value[invoiceIndex] = {
          ...invoices.value[invoiceIndex],
          ...updates,
          updatedAt: new Date()
        }
      }

      if (selectedInvoice.value?.invoiceId === invoiceId) {
        selectedInvoice.value = {
          ...selectedInvoice.value,
          ...updates,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating invoice:', err)
      error.value = 'Failed to update invoice'
      return false
    } finally {
      loading.value = false
    }
  }

  // Payment Actions
  async function fetchPayments(filters?: PaymentFilters, pageSize = 20) {
    try {
      loading.value = true
      error.value = null

      const constraints: QueryConstraint[] = [
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      ]

      // Apply filters
      if (filters?.status && filters.status.length > 0) {
        constraints.push(where('status', 'in', filters.status))
      }

      if (filters?.paymentMethod && filters.paymentMethod.length > 0) {
        constraints.push(where('paymentMethod', 'in', filters.paymentMethod))
      }

      if (filters?.supplierId && filters.supplierId.length > 0) {
        constraints.push(where('supplierId', 'in', filters.supplierId))
      }

      const q = query(paymentsCollection, ...constraints)
      const snapshot = await getDocs(q)

      const paymentList: Payment[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        paymentList.push({
          paymentId: doc.id,
          ...data,
          paymentDate: data.paymentDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Payment)
      })

      payments.value = paymentList
      lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      hasMore.value = snapshot.docs.length === pageSize

    } catch (err) {
      console.error('Error fetching payments:', err)
      error.value = 'Failed to fetch payments'
    } finally {
      loading.value = false
    }
  }

  async function createPayment(paymentData: CreatePaymentRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      // Generate payment number
      const paymentNumber = `PAY-${Date.now()}`

      const docData = {
        paymentNumber,
        ...paymentData,
        status: 'pending',
        currency: 'USD', // Default currency
        attachments: [],
        processedBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(paymentsCollection, docData)

      const newPayment = {
        paymentId: docRef.id,
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Payment

      payments.value.unshift(newPayment)

      // Update related invoice
      const invoice = invoices.value.find(i => i.invoiceId === paymentData.invoiceId)
      if (invoice) {
        const newPaidAmount = invoice.paidAmount + paymentData.amount
        const newRemainingAmount = invoice.totalAmount - newPaidAmount
        const newStatus = newRemainingAmount <= 0 ? 'paid' : invoice.status

        await updateInvoice(paymentData.invoiceId, {
          paidAmount: newPaidAmount,
          remainingAmount: newRemainingAmount,
          status: newStatus,
          paidDate: newRemainingAmount <= 0 ? new Date() : undefined
        })
      }

      return docRef.id

    } catch (err) {
      console.error('Error creating payment:', err)
      error.value = 'Failed to create payment'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoiceStats(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // Calculate stats from current invoices
      const totalInvoices = invoices.value.length
      const pendingCount = pendingInvoices.value.length
      const overdueCount = overdueInvoices.value.length
      const paidCount = paidInvoices.value.length
      const totalAmount = invoices.value.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const totalPaid = invoices.value.reduce((sum, invoice) => sum + invoice.paidAmount, 0)
      const totalOutstanding = totalAmount - totalPaid

      // Calculate average payment days
      const paidInvoicesWithDates = paidInvoices.value.filter(i => i.paidDate && i.invoiceDate)
      const totalPaymentDays = paidInvoicesWithDates.reduce((sum, invoice) => {
        const daysDiff = Math.floor((invoice.paidDate!.getTime() - invoice.invoiceDate.getTime()) / (1000 * 60 * 60 * 24))
        return sum + daysDiff
      }, 0)
      const averagePaymentDays = paidInvoicesWithDates.length > 0 ? totalPaymentDays / paidInvoicesWithDates.length : 0

      invoiceStats.value = {
        totalInvoices,
        pendingInvoices: pendingCount,
        overdueInvoices: overdueCount,
        paidInvoices: paidCount,
        totalAmount,
        totalPaid,
        totalOutstanding,
        averagePaymentDays
      }

    } catch (err) {
      console.error('Error fetching invoice stats:', err)
      error.value = 'Failed to fetch invoice stats'
    } finally {
      loading.value = false
    }
  }

  // Upload attachment for an invoice (stores download URL in attachments[])
  async function uploadInvoiceAttachment(invoiceId: string, file: File): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      const path = `invoices/${invoiceId}/attachments/${Date.now()}_${file.name}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)

      await updateDoc(doc(invoicesCollection, invoiceId), {
        attachments: arrayUnion(url),
        updatedAt: serverTimestamp()
      })

      const inv = invoices.value.find(i => i.invoiceId === invoiceId)
      if (inv) {
        inv.attachments = [...(inv.attachments || []), url]
        inv.updatedAt = new Date()
      }

      return url
    } catch (err) {
      console.error('Error uploading invoice attachment:', err)
      error.value = 'Failed to upload attachment'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setSelectedInvoice(invoice: Invoice | null) {
    selectedInvoice.value = invoice
  }

  function setSelectedPayment(payment: Payment | null) {
    selectedPayment.value = payment
  }

  return {
    // State
    invoices,
    payments,
    selectedInvoice,
    selectedPayment,
    loading,
    error,
    hasMore,
    invoiceStats,
    paymentStats,
    
    // Computed
    pendingInvoices,
    overdueInvoices,
    paidInvoices,
    
    // Actions
    fetchInvoices,
    createInvoice,
    updateInvoice,
    fetchPayments,
    createPayment,
    fetchInvoiceStats,
    uploadInvoiceAttachment,
    removeInvoiceAttachment,
    clearError,
    setSelectedInvoice,
    setSelectedPayment
  }
})
