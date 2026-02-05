import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  DeliveryOrder, 
  DeliveryOrderStatus, 
  WorkflowStep, 
  TechnicalChecklist, 
  DailyProgram, 
  WeeklyOverview, 
  PaymentConfirmation,
  DeliveryKPIs,
  WorkflowLog
} from '@/shared/types/delivery-installation'

export const useDeliveryInstallationStore = defineStore('deliveryInstallation', () => {
  // State
  const orders = ref<DeliveryOrder[]>([])
  const dailyPrograms = ref<DailyProgram[]>([])
  const weeklyOverviews = ref<WeeklyOverview[]>([])
  const technicalChecklists = ref<TechnicalChecklist[]>([])
  const paymentConfirmations = ref<PaymentConfirmation[]>([])
  const workflowLogs = ref<WorkflowLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const todayOrders = computed(() => {
    const today = new Date().toDateString()
    return orders.value.filter(order => 
      order.scheduledDate && 
      new Date(order.scheduledDate).toDateString() === today
    )
  })

  const pendingOrders = computed(() => 
    orders.value.filter(order => 
      ['created', 'planned', 'technical_check', 'payment_pending'].includes(order.status)
    )
  )

  const scheduledOrders = computed(() => 
    orders.value.filter(order => 
      ['scheduled', 'ready', 'in_progress'].includes(order.status)
    )
  )

  const completedOrders = computed(() => 
    orders.value.filter(order => order.status === 'completed')
  )

  const currentWeekOverview = computed(() => {
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1)) // Monday
    return weeklyOverviews.value.find(overview => 
      new Date(overview.weekStart).toDateString() === startOfWeek.toDateString()
    )
  })

  const todayProgram = computed(() => {
    const today = new Date().toDateString()
    return dailyPrograms.value.find(program => 
      new Date(program.date).toDateString() === today
    )
  })

  // Actions
  async function fetchOrders() {
    loading.value = true
    error.value = null
    
    try {
      // TODO: Replace with actual Firebase call
      // For now, create comprehensive sample data
      const sampleOrders: DeliveryOrder[] = [
        {
          id: '1',
          invoiceNo: 'INV-2024-001',
          customerId: 'cust-1',
          customerName: 'احمد محمدی',
          customerPhone: '09123456789',
          customerAddress: 'تهران، خیابان ولیعصر، پلاک 123',
          locationLink: 'https://maps.google.com/?q=35.7219,51.3347',
          items: [
            {
              id: 'item-1',
              name: 'لوستر کریستالی',
              type: 'chandelier',
              quantity: 1,
              weight: 15,
              dimensions: '80x80x60',
              installationHeight: 280,
              ceilingType: 'concrete',
              layers: 3,
              accessories: ['زنجیر', 'پیچ و مهره', 'کلید'],
              specialRequirements: ['نردبان بلند', 'دو نفر برای نصب'],
              location: 'warehouse'
            }
          ],
          totalValue: 5000000,
          serviceType: 'installation_delivery',
          status: 'scheduled',
          currentStep: 5,
          scheduledDate: new Date(),
          scheduledTimeSlot: '10:00-11:00',
          bufferDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          allowedDays: ['tuesday', 'thursday', 'saturday'],
          paymentStatus: 'confirmed',
          paymentMethod: 'prepaid',
          technicalChecklist: {
            id: 'tech-1',
            orderId: '1',
            itemType: 'chandelier',
            installationHeight: 280,
            ceilingCondition: 'good',
            layers: 3,
            weight: 15,
            dimensions: '80x80x60',
            needsLadder: true,
            needsLift: false,
            specialTools: ['drill', 'screwdriver'],
            accessoriesComplete: true,
            missingAccessories: [],
            buildingRestrictions: {
              entryHours: '8:00-18:00',
              requiresPermit: false,
              elevatorAccess: true,
              parkingAvailable: true,
              specialRules: []
            },
            vehicleType: 'van',
            multipleLocations: false,
            pickupLocations: ['انبار اصلی'],
            isComplete: true,
            checkedBy: 'coordinator-1',
            checkedAt: new Date(),
            notes: 'همه چیز آماده است'
          },
          coordinatorId: 'coord-1',
          teamLeaderId: 'leader-1',
          assignedTeam: ['installer-1', 'installer-2'],
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
          workflowLogs: [],
          isOnTime: true,
          requiresRevisit: false,
          revisitCount: 0
        }
      ]
      
      orders.value = sampleOrders
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'خطا در دریافت سفارش‌ها'
      console.error('Error fetching orders:', err)
    } finally {
      loading.value = false
    }
  }

  async function createOrder(orderData: Partial<DeliveryOrder>): Promise<string> {
    loading.value = true
    error.value = null
    
    try {
      const newOrder: DeliveryOrder = {
        id: `order-${Date.now()}`,
        invoiceNo: orderData.invoiceNo || '',
        customerId: orderData.customerId || '',
        customerName: orderData.customerName || '',
        customerPhone: orderData.customerPhone || '',
        customerAddress: orderData.customerAddress || '',
        locationLink: orderData.locationLink,
        items: orderData.items || [],
        totalValue: orderData.totalValue || 0,
        serviceType: orderData.serviceType || 'delivery_only',
        status: 'created',
        currentStep: 1,
        allowedDays: ['tuesday', 'thursday', 'saturday'],
        paymentStatus: 'pending',
        technicalChecklist: {
          id: `tech-${Date.now()}`,
          orderId: `order-${Date.now()}`,
          itemType: '',
          needsLadder: false,
          needsLift: false,
          specialTools: [],
          accessoriesComplete: false,
          missingAccessories: [],
          buildingRestrictions: {
            requiresPermit: false,
            elevatorAccess: true,
            parkingAvailable: true,
            specialRules: []
          },
          vehicleType: 'van',
          multipleLocations: false,
          pickupLocations: [],
          isComplete: false,
          checkedBy: '',
          notes: ''
        },
        coordinatorId: orderData.coordinatorId || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        workflowLogs: [],
        isOnTime: true,
        requiresRevisit: false,
        revisitCount: 0
      }
      
      // TODO: Save to Firebase
      orders.value.push(newOrder)
      
      // Log the creation
      await logWorkflowStep(newOrder.id, 1, 'سفارش ایجاد شد', 'system', 'سفارش جدید در سیستم ثبت شد')
      
      return newOrder.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'خطا در ایجاد سفارش'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrderStatus(orderId: string, status: DeliveryOrderStatus, step: WorkflowStep) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) throw new Error('سفارش یافت نشد')
    
    const previousStatus = order.status
    order.status = status
    order.currentStep = step
    order.updatedAt = new Date()
    
    // TODO: Update in Firebase
    
    // Log the status change
    await logWorkflowStep(orderId, step, `وضعیت تغییر کرد`, 'coordinator', `از ${previousStatus} به ${status}`)
  }

  async function updateTechnicalChecklist(orderId: string, checklist: Partial<TechnicalChecklist>) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) throw new Error('سفارش یافت نشد')
    
    order.technicalChecklist = { ...order.technicalChecklist, ...checklist }
    order.updatedAt = new Date()
    
    // TODO: Update in Firebase
    
    if (checklist.isComplete) {
      await updateOrderStatus(orderId, 'payment_pending', 4)
    }
  }

  async function confirmPayment(orderId: string, paymentData: Partial<PaymentConfirmation>) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) throw new Error('سفارش یافت نشد')
    
    order.paymentStatus = 'confirmed'
    order.paymentMethod = paymentData.method
    order.updatedAt = new Date()
    
    const confirmation: PaymentConfirmation = {
      id: `payment-${Date.now()}`,
      orderId,
      invoiceNo: order.invoiceNo,
      amount: order.totalValue,
      method: paymentData.method || 'prepaid',
      status: 'confirmed',
      confirmedBy: paymentData.confirmedBy || '',
      confirmedAt: new Date(),
      notes: paymentData.notes
    }
    
    paymentConfirmations.value.push(confirmation)
    
    // TODO: Save to Firebase
    
    await updateOrderStatus(orderId, 'scheduled', 5)
    await logWorkflowStep(orderId, 4, 'پرداخت تأیید شد', confirmation.confirmedBy, `روش پرداخت: ${confirmation.method}`)
  }

  async function scheduleOrder(orderId: string, date: Date, timeSlot: string) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) throw new Error('سفارش یافت نشد')
    
    // Check if date is allowed (Tuesday, Thursday, Saturday)
    const dayOfWeek = date.getDay()
    const allowedDays = [2, 4, 6] // Tuesday, Thursday, Saturday
    if (!allowedDays.includes(dayOfWeek)) {
      throw new Error('روز انتخابی مجاز نیست. فقط سه‌شنبه، پنج‌شنبه و شنبه')
    }
    
    order.scheduledDate = date
    order.scheduledTimeSlot = timeSlot
    order.bufferDate = new Date(date.getTime() + 24 * 60 * 60 * 1000) // Next day
    order.updatedAt = new Date()
    
    // TODO: Update in Firebase
    
    await updateOrderStatus(orderId, 'ready', 6)
    await logWorkflowStep(orderId, 5, 'زمان‌بندی انجام شد', 'coordinator', `تاریخ: ${date.toLocaleDateString('fa-IR')}, ساعت: ${timeSlot}`)
  }

  async function publishDailyProgram(date: Date, orderIds: string[]) {
    const programOrders = orders.value
      .filter(order => orderIds.includes(order.id))
      .map(order => ({
        invoiceNo: order.invoiceNo,
        serviceType: order.serviceType === 'delivery_only' ? 'Delivery' as const :
                    order.serviceType === 'installation_delivery' ? 'Installation' as const :
                    'Uninstallation+Delivery' as const,
        address: order.customerAddress,
        locationLink: order.locationLink,
        contactName: order.customerName,
        phone: order.customerPhone,
        timeSlot: order.scheduledTimeSlot || '',
        specialNotes: order.items.flatMap(item => item.specialRequirements).join(', ')
      }))
    
    const program: DailyProgram = {
      id: `program-${Date.now()}`,
      date,
      day: date.toLocaleDateString('fa-IR', { weekday: 'long' }),
      orders: programOrders,
      publishedBy: 'coordinator', // TODO: Get from auth
      publishedAt: new Date()
    }
    
    dailyPrograms.value.push(program)
    
    // TODO: Save to Firebase
    
    // Update all orders to ready status
    for (const orderId of orderIds) {
      await logWorkflowStep(orderId, 6, 'برنامه روزانه منتشر شد', 'coordinator', 'سفارش در برنامه روزانه قرار گرفت')
    }
  }

  async function createWeeklyOverview(weekStart: Date) {
    const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
    
    const overview: WeeklyOverview = {
      id: `week-${Date.now()}`,
      weekStart,
      weekEnd,
      tuesdayCapacity: 5,
      thursdayCapacity: 5,
      saturdayCapacity: 5,
      scheduledOrders: {
        tuesday: [],
        thursday: [],
        saturday: []
      },
      bufferDays: {
        wednesday: [],
        friday: [],
        sunday: []
      },
      createdBy: 'coordinator', // TODO: Get from auth
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    weeklyOverviews.value.push(overview)
    
    // TODO: Save to Firebase
    
    return overview.id
  }

  async function logWorkflowStep(
    orderId: string, 
    step: WorkflowStep, 
    action: string, 
    performedBy: string, 
    details: string
  ) {
    const order = orders.value.find(o => o.id === orderId)
    if (!order) return
    
    const log: WorkflowLog = {
      id: `log-${Date.now()}`,
      orderId,
      step,
      action,
      performedBy,
      performedAt: new Date(),
      details,
      previousStatus: order.status,
      newStatus: order.status
    }
    
    workflowLogs.value.push(log)
    order.workflowLogs.push(log)
    
    // TODO: Save to Firebase
  }

  async function calculateKPIs(startDate: Date, endDate: Date): Promise<DeliveryKPIs> {
    const periodOrders = orders.value.filter(order => 
      order.createdAt >= startDate && order.createdAt <= endDate
    )
    
    const completedOrders = periodOrders.filter(order => order.status === 'completed')
    const onTimeOrders = completedOrders.filter(order => order.isOnTime)
    const revisitOrders = periodOrders.filter(order => order.requiresRevisit)
    
    return {
      period: 'weekly',
      startDate,
      endDate,
      totalOrders: periodOrders.length,
      successfulDeliveries: completedOrders.length,
      successRate: periodOrders.length > 0 ? (completedOrders.length / periodOrders.length) * 100 : 0,
      onTimeDeliveries: onTimeOrders.length,
      onTimeRate: completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length) * 100 : 0,
      averageDelay: 0, // TODO: Calculate based on actual vs scheduled times
      revisitCount: revisitOrders.reduce((sum, order) => sum + order.revisitCount, 0),
      revisitRate: periodOrders.length > 0 ? (revisitOrders.length / periodOrders.length) * 100 : 0,
      customerComplaints: 0, // TODO: Integrate with customer feedback
      paymentIssues: periodOrders.filter(order => order.paymentStatus === 'failed').length,
      technicalIssues: 0, // TODO: Count from logs
      coordinationIssues: 0, // TODO: Count from logs
      teamUtilization: 0, // TODO: Calculate based on team capacity
      averageOrdersPerDay: periodOrders.length / 7
    }
  }

  // Initialize sample data
  function initializeSampleData() {
    fetchOrders()
  }

  return {
    // State
    orders,
    dailyPrograms,
    weeklyOverviews,
    technicalChecklists,
    paymentConfirmations,
    workflowLogs,
    loading,
    error,
    
    // Computed
    todayOrders,
    pendingOrders,
    scheduledOrders,
    completedOrders,
    currentWeekOverview,
    todayProgram,
    
    // Actions
    fetchOrders,
    createOrder,
    updateOrderStatus,
    updateTechnicalChecklist,
    confirmPayment,
    scheduleOrder,
    publishDailyProgram,
    createWeeklyOverview,
    logWorkflowStep,
    calculateKPIs,
    initializeSampleData
  }
})
