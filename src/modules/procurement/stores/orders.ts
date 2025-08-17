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
  PurchaseOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
  OrderFilters,
  OrderStats,
  OrderTemplate,
  CreateOrderFromTemplate,
  OrderAttachment
} from '@/modules/procurement/types/orders'

export const useOrdersStore = defineStore('orders', () => {
  // State
  const orders = ref<PurchaseOrder[]>([])
  const selectedOrder = ref<PurchaseOrder | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastDoc = ref<any>(null)
  const hasMore = ref(true)
  const stats = ref<OrderStats>({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    totalValue: 0,
    averageOrderValue: 0,
    onTimeDeliveryRate: 0
  })
  
  const orderTemplates = ref<OrderTemplate[]>([])
  const orderAttachments = ref<OrderAttachment[]>([])

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const pendingOrders = computed(() => 
    orders.value.filter(o => ['draft', 'sent', 'acknowledged'].includes(o.status))
  )

  const completedOrders = computed(() => 
    orders.value.filter(o => o.status === 'completed')
  )

  const urgentOrders = computed(() => 
    orders.value.filter(o => o.priority === 'urgent' && !['completed', 'cancelled'].includes(o.status))
  )

  // Firestore collection reference
  const ordersCollection = collection(db, 'purchaseOrders')

  // Actions
  async function fetchOrders(filters?: OrderFilters, pageSize = 20) {
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

      if (filters?.priority && filters.priority.length > 0) {
        constraints.push(where('priority', 'in', filters.priority))
      }

      if (filters?.supplierId && filters.supplierId.length > 0) {
        constraints.push(where('supplierId', 'in', filters.supplierId))
      }

      const q = query(ordersCollection, ...constraints)
      const snapshot = await getDocs(q)

      const orderList: PurchaseOrder[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        orderList.push({
          orderId: doc.id,
          ...data,
          orderDate: data.orderDate?.toDate() || new Date(),
          deliveryDate: data.deliveryDate?.toDate() || new Date(),
          expectedDeliveryDate: data.expectedDeliveryDate?.toDate(),
          actualDeliveryDate: data.actualDeliveryDate?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as PurchaseOrder)
      })

      // Apply text search filter (client-side for now)
      let filteredOrders = orderList
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredOrders = orderList.filter(order =>
          order.orderNumber.toLowerCase().includes(searchTerm) ||
          order.supplierName.toLowerCase().includes(searchTerm) ||
          order.notes?.toLowerCase().includes(searchTerm) ||
          order.items.some(item => 
            item.productName.toLowerCase().includes(searchTerm) ||
            item.productCode.toLowerCase().includes(searchTerm)
          )
        )
      }

      orders.value = filteredOrders
      lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      hasMore.value = snapshot.docs.length === pageSize

    } catch (err) {
      console.error('Error fetching orders:', err)
      error.value = 'Failed to fetch orders'
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderById(orderId: string): Promise<PurchaseOrder | null> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(ordersCollection, orderId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        error.value = 'Order not found'
        return null
      }

      const data = docSnap.data()
      const order: PurchaseOrder = {
        orderId: docSnap.id,
        ...data,
        orderDate: data.orderDate?.toDate() || new Date(),
        deliveryDate: data.deliveryDate?.toDate() || new Date(),
        expectedDeliveryDate: data.expectedDeliveryDate?.toDate(),
        actualDeliveryDate: data.actualDeliveryDate?.toDate(),
        approvedAt: data.approvedAt?.toDate(),
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as PurchaseOrder

      selectedOrder.value = order
      return order

    } catch (err) {
      console.error('Error fetching order:', err)
      error.value = 'Failed to fetch order'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createOrder(orderData: CreateOrderRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      // Generate order number
      const orderNumber = `PO-${Date.now()}`

      // Calculate totals
      const subtotal = orderData.items.reduce((sum, item) => sum + item.totalPrice, 0)
      const taxAmount = subtotal * 0.1 // 10% tax (configurable)
      const totalAmount = subtotal + taxAmount

      const docData = {
        orderNumber,
        ...orderData,
        status: 'draft',
        paymentStatus: 'pending',
        orderDate: serverTimestamp(),
        subtotal,
        taxAmount,
        discountAmount: 0,
        shippingCost: 0,
        totalAmount,
        currency: 'USD', // Default currency
        paymentTerms: orderData.paymentTerms || 'Net 30',
        attachments: [],
        approvalRequired: totalAmount > 10000, // Configurable threshold
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(ordersCollection, docData)

      const newOrder: PurchaseOrder = {
        orderId: docRef.id,
        ...docData,
        orderDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      } as PurchaseOrder

      orders.value.unshift(newOrder)
      return docRef.id

    } catch (err) {
      console.error('Error creating order:', err)
      error.value = 'Failed to create order'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(orderData: UpdateOrderRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const { orderId, ...updateData } = orderData

      const docRef = doc(ordersCollection, orderId)
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const orderIndex = orders.value.findIndex(o => o.orderId === orderId)
      if (orderIndex >= 0) {
        orders.value[orderIndex] = {
          ...orders.value[orderIndex],
          ...updateData,
          updatedAt: new Date()
        }
      }

      if (selectedOrder.value?.orderId === orderId) {
        selectedOrder.value = {
          ...selectedOrder.value,
          ...updateData,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating order:', err)
      error.value = 'Failed to update order'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(orderId: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      await deleteDoc(doc(ordersCollection, orderId))

      // Remove from local state
      orders.value = orders.value.filter(o => o.orderId !== orderId)
      
      if (selectedOrder.value?.orderId === orderId) {
        selectedOrder.value = null
      }

      return true

    } catch (err) {
      console.error('Error deleting order:', err)
      error.value = 'Failed to delete order'
      return false
    } finally {
      loading.value = false
    }
  }

  async function uploadOrderAttachment(orderId: string, file: File, description?: string): Promise<OrderAttachment | null> {
    try {
      loading.value = true
      error.value = null

      const storagePath = `orders/${orderId}/attachments/${Date.now()}_${file.name}`
      const fileRef = storageRef(storage, storagePath)
      
      // Upload file to Firebase Storage
      await uploadBytes(fileRef, file)
      
      // Create attachment metadata in Firestore
      const attachmentData = {
        orderId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        storagePath,
        description: description || '',
        uploadedBy: authStore.user?.uid || 'unknown',
        uploadedAt: serverTimestamp()
      }
      
      const docRef = await addDoc(collection(db, 'orderAttachments'), attachmentData)
      
      // Return the created attachment
      const attachment: OrderAttachment = {
        attachmentId: docRef.id,
        ...attachmentData,
        uploadedAt: new Date()
      }
      
      orderAttachments.value.push(attachment)
      return attachment
      
    } catch (err) {
      console.error('Error uploading attachment:', err)
      error.value = 'Failed to upload attachment'
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchOrderStats(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // This would typically be done with aggregation queries or cloud functions
      // For now, we'll calculate from the current orders
      const totalOrders = orders.value.length
      const pendingCount = pendingOrders.value.length
      const completedCount = completedOrders.value.length
      const cancelledCount = orders.value.filter(o => o.status === 'cancelled').length
      const totalValue = orders.value.reduce((sum, order) => sum + order.totalAmount, 0)
      const averageOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0

      // Calculate on-time delivery rate
      const deliveredOrders = orders.value.filter(o => o.actualDeliveryDate)
      const onTimeDeliveries = deliveredOrders.filter(o => 
        o.actualDeliveryDate && o.expectedDeliveryDate && 
        o.actualDeliveryDate <= o.expectedDeliveryDate
      ).length
      const onTimeDeliveryRate = deliveredOrders.length > 0 ? (onTimeDeliveries / deliveredOrders.length) * 100 : 0

      stats.value = {
        totalOrders,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        cancelledOrders: cancelledCount,
        totalValue,
        averageOrderValue,
        onTimeDeliveryRate
      }

    } catch (err) {
      console.error('Error fetching order stats:', err)
      error.value = 'Failed to fetch order stats'
    } finally {
      loading.value = false
    }
  }

  async function createOrderTemplate(templateData: Omit<OrderTemplate, 'templateId' | 'createdAt' | 'usageCount'>): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      const docData = {
        ...templateData,
        usageCount: 0,
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp()
      }

      const docRef = await addDoc(collection(db, 'orderTemplates'), docData)

      const newTemplate: OrderTemplate = {
        templateId: docRef.id,
        ...templateData,
        usageCount: 0,
        createdAt: new Date()
      }

      orderTemplates.value.push(newTemplate)
      return docRef.id

    } catch (err) {
      console.error('Error creating order template:', err)
      error.value = 'Failed to create order template'
      return null
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setSelectedOrder(order: PurchaseOrder | null) {
    selectedOrder.value = order
  }

  return {
    // State
    orders,
    selectedOrder,
    loading,
    error,
    hasMore,
    stats,
    orderTemplates,
    orderAttachments,
    
    // Computed
    pendingOrders,
    completedOrders,
    urgentOrders,
    
    // Actions
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
    uploadOrderAttachment,
    fetchOrderStats,
    createOrderTemplate,
    clearError,
    setSelectedOrder
  }
})
