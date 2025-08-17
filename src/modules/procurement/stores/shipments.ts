import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
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
  Shipment,
  CreateShipmentRequest,
  UpdateShipmentRequest,
  ShipmentFilters,
  ShipmentStats,
  TrackingEvent
} from '@/modules/procurement/types/shipments'

export const useShipmentsStore = defineStore('shipments', () => {
  // State
  const shipments = ref<Shipment[]>([])
  const selectedShipment = ref<Shipment | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastDoc = ref<any>(null)
  const hasMore = ref(true)
  const stats = ref<ShipmentStats>({
    totalShipments: 0,
    pendingShipments: 0,
    inTransitShipments: 0,
    deliveredShipments: 0,
    onTimeDeliveryRate: 0,
    averageDeliveryDays: 0,
    totalShippingCost: 0
  })

  // Auth store
  const authStore = useAuthStore()

  // Computed
  const pendingShipments = computed(() => 
    shipments.value.filter(s => s.status === 'pending')
  )

  const inTransitShipments = computed(() => 
    shipments.value.filter(s => ['picked_up', 'in_transit', 'out_for_delivery'].includes(s.status))
  )

  const deliveredShipments = computed(() => 
    shipments.value.filter(s => s.status === 'delivered')
  )

  const delayedShipments = computed(() => 
    shipments.value.filter(s => {
      const today = new Date()
      return s.estimatedDeliveryDate < today && !['delivered', 'failed_delivery', 'returned'].includes(s.status)
    })
  )

  // Firestore collection reference
  const shipmentsCollection = collection(db, 'shipments')

  // Actions
  async function fetchShipments(filters?: ShipmentFilters, pageSize = 20) {
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

      if (filters?.method && filters.method.length > 0) {
        constraints.push(where('method', 'in', filters.method))
      }

      if (filters?.supplierId && filters.supplierId.length > 0) {
        constraints.push(where('supplierId', 'in', filters.supplierId))
      }

      if (filters?.carrier && filters.carrier.length > 0) {
        constraints.push(where('carrier', 'in', filters.carrier))
      }

      const q = query(shipmentsCollection, ...constraints)
      const snapshot = await getDocs(q)

      const shipmentList: Shipment[] = []
      snapshot.forEach(doc => {
        const data = doc.data()
        shipmentList.push({
          shipmentId: doc.id,
          ...data,
          pickupDate: data.pickupDate?.toDate(),
          estimatedDeliveryDate: data.estimatedDeliveryDate?.toDate() || new Date(),
          actualDeliveryDate: data.actualDeliveryDate?.toDate(),
          trackingEvents: data.trackingEvents?.map((event: any) => ({
            ...event,
            timestamp: event.timestamp?.toDate() || new Date()
          })) || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as Shipment)
      })

      // Apply text search filter (client-side for now)
      let filteredShipments = shipmentList
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase()
        filteredShipments = shipmentList.filter(shipment =>
          shipment.shipmentNumber.toLowerCase().includes(searchTerm) ||
          shipment.orderNumber.toLowerCase().includes(searchTerm) ||
          shipment.supplierName.toLowerCase().includes(searchTerm) ||
          shipment.trackingNumber?.toLowerCase().includes(searchTerm) ||
          shipment.carrier?.toLowerCase().includes(searchTerm)
        )
      }

      shipments.value = filteredShipments
      lastDoc.value = snapshot.docs[snapshot.docs.length - 1]
      hasMore.value = snapshot.docs.length === pageSize

    } catch (err) {
      console.error('Error fetching shipments:', err)
      error.value = 'Failed to fetch shipments'
    } finally {
      loading.value = false
    }
  }

  async function fetchShipmentById(shipmentId: string): Promise<Shipment | null> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(shipmentsCollection, shipmentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        error.value = 'Shipment not found'
        return null
      }

      const data = docSnap.data()
      const shipment: Shipment = {
        shipmentId: docSnap.id,
        ...data,
        pickupDate: data.pickupDate?.toDate(),
        estimatedDeliveryDate: data.estimatedDeliveryDate?.toDate() || new Date(),
        actualDeliveryDate: data.actualDeliveryDate?.toDate(),
        trackingEvents: data.trackingEvents?.map((event: any) => ({
          ...event,
          timestamp: event.timestamp?.toDate() || new Date()
        })) || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as Shipment

      selectedShipment.value = shipment
      return shipment

    } catch (err) {
      console.error('Error fetching shipment:', err)
      error.value = 'Failed to fetch shipment'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createShipment(shipmentData: CreateShipmentRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      // Generate shipment number
      const shipmentNumber = `SHP-${Date.now()}`

      const docData = {
        shipmentNumber,
        ...shipmentData,
        status: 'pending',
        packageCount: shipmentData.items.length,
        totalWeight: shipmentData.items.reduce((sum, item) => sum + (item.weight || 0), 0),
        currency: 'USD', // Default currency
        trackingEvents: [{
          eventId: `evt-${Date.now()}`,
          timestamp: new Date(),
          status: 'pending',
          location: 'Origin',
          description: 'Shipment created',
          updatedBy: authStore.user?.uid || 'unknown'
        }],
        attachments: [],
        createdBy: authStore.user?.uid || 'unknown',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(shipmentsCollection, docData)

      const newShipment: Shipment = {
        shipmentId: docRef.id,
        ...docData,
        createdAt: new Date(),
        updatedAt: new Date()
      } as unknown as Shipment

      shipments.value.unshift(newShipment)
      return docRef.id

    } catch (err) {
      console.error('Error creating shipment:', err)
      error.value = 'Failed to create shipment'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateShipment(shipmentData: UpdateShipmentRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const { shipmentId, ...updateData } = shipmentData

      const docRef = doc(shipmentsCollection, shipmentId)
      await updateDoc(docRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const shipmentIndex = shipments.value.findIndex(s => s.shipmentId === shipmentId)
      if (shipmentIndex >= 0) {
        shipments.value[shipmentIndex] = {
          ...shipments.value[shipmentIndex],
          ...(updateData as Partial<Shipment>),
          updatedAt: new Date()
        }
      }

      if (selectedShipment.value?.shipmentId === shipmentId) {
        selectedShipment.value = {
          ...selectedShipment.value,
          ...(updateData as Partial<Shipment>),
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating shipment:', err)
      error.value = 'Failed to update shipment'
      return false
    } finally {
      loading.value = false
    }
  }

  async function addTrackingEvent(shipmentId: string, event: Omit<TrackingEvent, 'eventId'>): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const shipment = shipments.value.find(s => s.shipmentId === shipmentId)
      if (!shipment) {
        error.value = 'Shipment not found'
        return false
      }

      const newEvent: TrackingEvent = {
        eventId: `evt-${Date.now()}`,
        ...event,
        timestamp: event.timestamp || new Date(),
        updatedBy: event.updatedBy || authStore.user?.uid || 'unknown'
      }

      const updatedEvents = [...shipment.trackingEvents, newEvent]

      // Persist updates directly (trackingEvents may not exist on UpdateShipmentRequest)
      await updateDoc(doc(shipmentsCollection, shipmentId), {
        status: event.status,
        trackingEvents: updatedEvents,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const idx = shipments.value.findIndex(s => s.shipmentId === shipmentId)
      if (idx >= 0) {
        shipments.value[idx] = {
          ...shipments.value[idx],
          status: event.status,
          trackingEvents: updatedEvents,
          updatedAt: new Date()
        }
      }
      if (selectedShipment.value?.shipmentId === shipmentId) {
        selectedShipment.value = {
          ...selectedShipment.value,
          status: event.status,
          trackingEvents: updatedEvents,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error adding tracking event:', err)
      error.value = 'Failed to add tracking event'
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchShipmentStats(): Promise<void> {
    try {
      loading.value = true
      error.value = null

      // Calculate stats from current shipments
      const totalShipments = shipments.value.length
      const pendingCount = pendingShipments.value.length
      const inTransitCount = inTransitShipments.value.length
      const deliveredCount = deliveredShipments.value.length
      const totalShippingCost = shipments.value.reduce((sum, shipment) => sum + shipment.shippingCost, 0)

      // Calculate on-time delivery rate
      const deliveredWithDates = deliveredShipments.value.filter(s => s.actualDeliveryDate && s.estimatedDeliveryDate)
      const onTimeDeliveries = deliveredWithDates.filter(s => 
        s.actualDeliveryDate! <= s.estimatedDeliveryDate
      ).length
      const onTimeDeliveryRate = deliveredWithDates.length > 0 ? (onTimeDeliveries / deliveredWithDates.length) * 100 : 0

      // Calculate average delivery days
      const totalDeliveryDays = deliveredWithDates.reduce((sum, shipment) => {
        const daysDiff = Math.floor((shipment.actualDeliveryDate!.getTime() - shipment.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        return sum + daysDiff
      }, 0)
      const averageDeliveryDays = deliveredWithDates.length > 0 ? totalDeliveryDays / deliveredWithDates.length : 0

      stats.value = {
        totalShipments,
        pendingShipments: pendingCount,
        inTransitShipments: inTransitCount,
        deliveredShipments: deliveredCount,
        onTimeDeliveryRate,
        averageDeliveryDays,
        totalShippingCost
      }

    } catch (err) {
      console.error('Error fetching shipment stats:', err)
      error.value = 'Failed to fetch shipment stats'
    } finally {
      loading.value = false
    }
  }

  // Upload attachment for a shipment (store download URL)
  async function uploadShipmentAttachment(shipmentId: string, file: File): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      const path = `shipments/${shipmentId}/attachments/${Date.now()}_${file.name}`
      const fileRef = storageRef(storage, path)
      await uploadBytes(fileRef, file)
      const url = await getDownloadURL(fileRef)

      await updateDoc(doc(shipmentsCollection, shipmentId), {
        attachments: arrayUnion(url),
        updatedAt: serverTimestamp()
      })

      const sh = shipments.value.find(s => s.shipmentId === shipmentId)
      if (sh) {
        sh.attachments = [...(sh.attachments || []), url]
        sh.updatedAt = new Date()
      }

      return url
    } catch (err) {
      console.error('Error uploading shipment attachment:', err)
      error.value = 'Failed to upload attachment'
      return null
    } finally {
      loading.value = false
    }
  }

  // Remove an attachment URL from a shipment and attempt to delete the file from Storage
  async function removeShipmentAttachment(shipmentId: string, url: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      await updateDoc(doc(shipmentsCollection, shipmentId), {
        attachments: arrayRemove(url),
        updatedAt: serverTimestamp()
      })

      const sh = shipments.value.find(s => s.shipmentId === shipmentId)
      if (sh && sh.attachments) {
        sh.attachments = sh.attachments.filter(u => u !== url)
        sh.updatedAt = new Date()
      }

      try {
        const fileRef = storageRefFromURL(storage, url)
        await deleteObject(fileRef)
      } catch (e) {
        console.warn('Storage delete skipped:', e)
      }

      return true
    } catch (err) {
      console.error('Error removing shipment attachment:', err)
      error.value = 'Failed to remove attachment'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setSelectedShipment(shipment: Shipment | null) {
    selectedShipment.value = shipment
  }

  return {
    shipments,
    selectedShipment,
    loading,
    error,
    hasMore,
    stats,
    pendingShipments,
    inTransitShipments,
    deliveredShipments,
    delayedShipments,
    fetchShipments,
    fetchShipmentById,
    createShipment,
    updateShipment,
    addTrackingEvent,
    fetchShipmentStats,
    uploadShipmentAttachment,
    removeShipmentAttachment,
    clearError,
    setSelectedShipment
  }
})
