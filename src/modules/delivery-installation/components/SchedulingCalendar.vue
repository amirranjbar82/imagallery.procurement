<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <Calendar class="w-5 h-5" />
            Weekly Scheduling - {{ getWeekRange() }}
          </span>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" @click="goToPreviousWeek">
              <ChevronLeft class="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" @click="goToCurrentWeek">
              Today
            </Button>
            <Button variant="outline" size="sm" @click="goToNextWeek">
              <ChevronRight class="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-medium">{{ getWeekRange() }}</h3>
            <p class="text-sm text-gray-600">Allowed days: Tuesday, Thursday, Saturday</p>
          </div>
          <div v-if="!weeklyOverview">
            <Button @click="$emit('create-weekly-overview')">
              <Plus class="w-4 h-4 mr-2" />
              Create Weekly Overview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Unscheduled Orders -->
    <Card v-if="unscheduledOrders.length > 0">
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Clock class="w-5 h-5" />
          Unscheduled Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <p class="text-sm text-gray-600">Drag orders to schedule them on available days:</p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            <div 
              v-for="order in unscheduledOrders" 
              :key="order.id"
              class="p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow"
              @click="selectOrderForScheduling(order)"
            >
              <div class="font-medium text-sm">{{ order.invoiceNo }}</div>
              <div class="text-xs text-gray-600">{{ order.customerName }}</div>
              <Badge :variant="getServiceTypeBadgeVariant(order.serviceType)" size="sm" class="mt-1">
                {{ getServiceTypeLabel(order.serviceType) }}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tuesday -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-base flex items-center justify-between">
            <span class="flex items-center gap-2">
              <div class="w-3 h-3 bg-blue-500 rounded-full"></div>
              Tuesday
            </span>
            <Badge variant="outline">{{ getTuesdayDate() }}</Badge>
          </CardTitle>
          <div class="text-sm text-gray-600">
            Capacity: {{ getTuesdayScheduled() }}/{{ getTuesdayCapacity() }}
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 min-h-[200px]">
            <div 
              v-for="orderId in getTuesdayOrders()" 
              :key="orderId"
              class="p-2 bg-blue-50 border border-blue-200 rounded text-sm"
            >
              {{ getOrderDisplay(orderId) }}
            </div>
            
            <!-- Drop Zone -->
            <div 
              v-if="getTuesdayScheduled() < getTuesdayCapacity()"
              class="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-colors"
              @click="openTimeSlotDialog('tuesday')"
            >
              <Plus class="w-4 h-4 mx-auto mb-1" />
              <p class="text-xs">Add Order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Thursday -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-base flex items-center justify-between">
            <span class="flex items-center gap-2">
              <div class="w-3 h-3 bg-green-500 rounded-full"></div>
              Thursday
            </span>
            <Badge variant="outline">{{ getThursdayDate() }}</Badge>
          </CardTitle>
          <div class="text-sm text-gray-600">
            Capacity: {{ getThursdayScheduled() }}/{{ getThursdayCapacity() }}
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 min-h-[200px]">
            <div 
              v-for="orderId in getThursdayOrders()" 
              :key="orderId"
              class="p-2 bg-green-50 border border-green-200 rounded text-sm"
            >
              {{ getOrderDisplay(orderId) }}
            </div>
            
            <!-- Drop Zone -->
            <div 
              v-if="getThursdayScheduled() < getThursdayCapacity()"
              class="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-green-400 hover:bg-green-50 cursor-pointer transition-colors"
              @click="openTimeSlotDialog('thursday')"
            >
              <Plus class="w-4 h-4 mx-auto mb-1" />
              <p class="text-xs">Add Order</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Saturday -->
      <Card>
        <CardHeader class="pb-3">
          <CardTitle class="text-base flex items-center justify-between">
            <span class="flex items-center gap-2">
              <div class="w-3 h-3 bg-purple-500 rounded-full"></div>
              Saturday
            </span>
            <Badge variant="outline">{{ getSaturdayDate() }}</Badge>
          </CardTitle>
          <div class="text-sm text-gray-600">
            Capacity: {{ getSaturdayScheduled() }}/{{ getSaturdayCapacity() }}
          </div>
        </CardHeader>
        <CardContent>
          <div class="space-y-2 min-h-[200px]">
            <div 
              v-for="orderId in getSaturdayOrders()" 
              :key="orderId"
              class="p-2 bg-purple-50 border border-purple-200 rounded text-sm"
            >
              {{ getOrderDisplay(orderId) }}
            </div>
            
            <!-- Drop Zone -->
            <div 
              v-if="getSaturdayScheduled() < getSaturdayCapacity()"
              class="p-3 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-colors"
              @click="openTimeSlotDialog('saturday')"
            >
              <Plus class="w-4 h-4 mx-auto mb-1" />
              <p class="text-xs">Add Order</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Time Slot Selection Dialog -->
    <Dialog v-model:open="showTimeSlotDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Delivery Time</DialogTitle>
          <DialogDescription>
            {{ selectedOrder?.invoiceNo }} - {{ getDayLabel(selectedDay) }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4">
          <div>
            <Label>Select Time Slot</Label>
            <div class="grid grid-cols-2 gap-2 mt-2">
              <Button
                v-for="slot in timeSlots"
                :key="slot"
                variant="outline"
                :class="{ 'bg-blue-50 border-blue-300': selectedTimeSlot === slot }"
                @click="selectedTimeSlot = slot"
              >
                {{ slot }}
              </Button>
            </div>
          </div>

          <div v-if="selectedOrder">
            <Label>Order Details</Label>
            <div class="p-3 bg-gray-50 rounded-lg text-sm">
              <p><strong>Customer:</strong> {{ selectedOrder.customerName }}</p>
              <p><strong>Address:</strong> {{ selectedOrder.customerAddress }}</p>
              <p><strong>Service Type:</strong> {{ getServiceTypeLabel(selectedOrder.serviceType) }}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showTimeSlotDialog = false">
            Cancel
          </Button>
          <Button 
            @click="confirmScheduling" 
            :disabled="!selectedTimeSlot"
            class="bg-green-600 hover:bg-green-700"
          >
            Confirm Scheduling
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  Plus, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-vue-next'
import type { DeliveryOrder, WeeklyOverview } from '@/shared/types/delivery-installation'

// Props
interface Props {
  orders: DeliveryOrder[]
  weeklyOverview?: WeeklyOverview | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'schedule-order': [orderId: string, date: Date, timeSlot: string]
  'create-weekly-overview': []
}>()

// State
const currentWeekStart = ref(getCurrentWeekStart())
const showTimeSlotDialog = ref(false)
const selectedOrder = ref<DeliveryOrder | null>(null)
const selectedDay = ref<'tuesday' | 'thursday' | 'saturday'>('tuesday')
const selectedTimeSlot = ref('')

const timeSlots = [
  '8:00-9:00',
  '9:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00'
]

// Computed
const unscheduledOrders = computed(() => {
  return props.orders.filter(order => 
    order.status === 'payment_pending' || 
    (order.status === 'scheduled' && !order.scheduledDate)
  )
})

// Methods
function getCurrentWeekStart(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  return new Date(now.setDate(diff))
}

function getWeekRange(): string {
  const weekEnd = new Date(currentWeekStart.value)
  weekEnd.setDate(currentWeekStart.value.getDate() + 6)
  
  return `${currentWeekStart.value.toLocaleDateString('fa-IR')} - ${weekEnd.toLocaleDateString('fa-IR')}`
}

function getTuesdayDate(): string {
  const tuesday = new Date(currentWeekStart.value)
  tuesday.setDate(currentWeekStart.value.getDate() + 1)
  return tuesday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getThursdayDate(): string {
  const thursday = new Date(currentWeekStart.value)
  thursday.setDate(currentWeekStart.value.getDate() + 3)
  return thursday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getSaturdayDate(): string {
  const saturday = new Date(currentWeekStart.value)
  saturday.setDate(currentWeekStart.value.getDate() + 5)
  return saturday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getTuesdayCapacity(): number {
  return props.weeklyOverview?.tuesdayCapacity || 5
}

function getThursdayCapacity(): number {
  return props.weeklyOverview?.thursdayCapacity || 5
}

function getSaturdayCapacity(): number {
  return props.weeklyOverview?.saturdayCapacity || 5
}

function getTuesdayOrders(): string[] {
  return props.weeklyOverview?.scheduledOrders.tuesday || []
}

function getThursdayOrders(): string[] {
  return props.weeklyOverview?.scheduledOrders.thursday || []
}

function getSaturdayOrders(): string[] {
  return props.weeklyOverview?.scheduledOrders.saturday || []
}

function getTuesdayScheduled(): number {
  return getTuesdayOrders().length
}

function getThursdayScheduled(): number {
  return getThursdayOrders().length
}

function getSaturdayScheduled(): number {
  return getSaturdayOrders().length
}

function getOrderDisplay(orderId: string): string {
  const order = props.orders.find(o => o.id === orderId)
  if (!order) return orderId
  
  return `${order.invoiceNo} - ${order.customerName}`
}

function selectOrderForScheduling(order: DeliveryOrder) {
  selectedOrder.value = order
}

function openTimeSlotDialog(day: 'tuesday' | 'thursday' | 'saturday') {
  if (!selectedOrder.value) return
  
  selectedDay.value = day
  selectedTimeSlot.value = ''
  showTimeSlotDialog.value = true
}

function confirmScheduling() {
  if (!selectedOrder.value || !selectedTimeSlot.value) return
  
  const dayMap = {
    'tuesday': 1,
    'thursday': 3,
    'saturday': 5
  }
  
  const scheduledDate = new Date(currentWeekStart.value)
  scheduledDate.setDate(currentWeekStart.value.getDate() + dayMap[selectedDay.value])
  
  emit('schedule-order', selectedOrder.value.id, scheduledDate, selectedTimeSlot.value)
  
  showTimeSlotDialog.value = false
  selectedOrder.value = null
  selectedTimeSlot.value = ''
}

function getDayLabel(day: string): string {
  const labels = {
    'tuesday': 'Tuesday',
    'thursday': 'Thursday',
    'saturday': 'Saturday'
  }
  return labels[day as keyof typeof labels] || day
}

function goToPreviousWeek() {
  currentWeekStart.value = new Date(currentWeekStart.value.getTime() - 7 * 24 * 60 * 60 * 1000)
}

function goToNextWeek() {
  currentWeekStart.value = new Date(currentWeekStart.value.getTime() + 7 * 24 * 60 * 60 * 1000)
}

function goToCurrentWeek() {
  currentWeekStart.value = getCurrentWeekStart()
}

function getServiceTypeLabel(type: string) {
  const labels = {
    'delivery_only': 'Delivery Only',
    'installation_delivery': 'Installation & Delivery',
    'uninstallation_delivery': 'Uninstallation & Delivery'
  }
  return labels[type as keyof typeof labels] || type
}

function getServiceTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'delivery_only': 'info' as const,
    'installation_delivery': 'success' as const,
    'uninstallation_delivery': 'warning' as const
  }
  return variants[type as keyof typeof variants] || 'default'
}

function getStatusLabel(status: string) {
  const labels = {
    'created': 'ایجاد شده',
    'planned': 'برنامه‌ریزی شده',
    'technical_check': 'بررسی فنی',
    'payment_pending': 'انتظار پرداخت',
    'scheduled': 'زمان‌بندی شده',
    'ready': 'آماده',
    'in_progress': 'در حال اجرا',
    'completed': 'تکمیل شده'
  }
  return labels[status as keyof typeof labels] || status
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'created': 'secondary' as const,
    'planned': 'default' as const,
    'technical_check': 'outline' as const,
    'payment_pending': 'destructive' as const,
    'scheduled': 'default' as const,
    'ready': 'success' as const,
    'in_progress': 'warning' as const,
    'completed': 'success' as const
  }
  return variants[status as keyof typeof variants] || 'default'
}
</script>
