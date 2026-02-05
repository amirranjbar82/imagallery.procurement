<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Calendar class="w-5 h-5" />
          Daily Program Management
        </span>
        <Button @click="showCreateProgramDialog = true">
          <Plus class="w-4 h-4 mr-2" />
          New Program
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Date Selection -->
      <div class="flex gap-4 items-center">
        <div>
          <Label>Select Date</Label>
          <Input
            type="date"
            v-model="selectedDate"
            class="w-40"
          />
        </div>
        <div>
          <Label>Day of Week</Label>
          <p class="text-lg font-medium">{{ getDayName(selectedDate) }}</p>
        </div>
      </div>

      <!-- Available Orders for Selected Date -->
      <div v-if="availableOrdersForDate.length > 0">
        <h3 class="text-lg font-medium mb-3">Available Orders for Scheduling</h3>
        <div class="space-y-2">
          <div v-for="order in availableOrdersForDate" :key="order.id" 
               class="flex items-center justify-between p-3 border rounded-lg">
            <div class="flex items-center gap-3">
              <Checkbox 
                :id="order.id"
                :checked="selectedOrderIds.includes(order.id)"
                @update:checked="toggleOrderSelection(order.id)"
              />
              <div>
                <p class="font-medium">{{ order.invoiceNo }}</p>
                <p class="text-sm text-gray-600">{{ order.customerName }}</p>
                <p class="text-xs text-gray-500">{{ order.customerAddress }}</p>
              </div>
            </div>
            <div class="text-right">
              <Badge :variant="getServiceTypeBadgeVariant(order.serviceType)">
                {{ getServiceTypeLabel(order.serviceType) }}
              </Badge>
              <p class="text-sm text-gray-500 mt-1">{{ order.scheduledTimeSlot }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Existing Program for Selected Date -->
      <div v-if="existingProgram">
        <h3 class="text-lg font-medium mb-3">Existing Program</h3>
        <Card>
          <CardContent class="p-4">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="font-medium">{{ formatDate(existingProgram.date) }}</p>
                <p class="text-sm text-gray-600">
                  Published by {{ existingProgram.publishedBy }} at {{ formatDateTime(existingProgram.publishedAt) }}
                </p>
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="copyProgramToClipboard">
                  <Copy class="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button variant="outline" size="sm" @click="printProgram">
                  <Printer class="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>
            </div>
            
            <div class="space-y-3">
              <div v-for="order in existingProgram.orders" :key="order.invoiceNo" 
                   class="p-3 bg-gray-50 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div><strong>INV:</strong> {{ order.invoiceNo }}</div>
                  <div><strong>Type:</strong> {{ order.serviceType }}</div>
                  <div><strong>Contact:</strong> {{ order.contactName }}</div>
                  <div><strong>Phone:</strong> {{ order.phone }}</div>
                  <div class="md:col-span-2"><strong>Address:</strong> {{ order.address }}</div>
                  <div v-if="order.locationLink" class="md:col-span-2">
                    <strong>Location:</strong> 
                    <a :href="order.locationLink" target="_blank" class="text-blue-600 hover:underline">
                      View on Map
                    </a>
                  </div>
                  <div><strong>Time:</strong> {{ order.timeSlot }}</div>
                  <div v-if="order.specialNotes"><strong>Notes:</strong> {{ order.specialNotes }}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3">
        <Button 
          @click="publishProgram"
          :disabled="selectedOrderIds.length === 0 || !isValidDay"
          class="bg-green-600 hover:bg-green-700"
        >
          <Send class="w-4 h-4 mr-2" />
          Publish Daily Program
        </Button>
        <Button 
          v-if="selectedOrderIds.length > 0"
          variant="outline"
          @click="previewProgram"
        >
          <Eye class="w-4 h-4 mr-2" />
          Preview
        </Button>
      </div>

      <!-- Validation Messages -->
      <div v-if="!isValidDay && selectedDate" class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p class="text-yellow-800 text-sm">
          ⚠️ Selected day is not allowed. Only Tuesday, Thursday, and Saturday can be scheduled.
        </p>
      </div>
    </CardContent>
  </Card>

  <!-- Program Preview Dialog -->
  <Dialog :open="showPreviewDialog" @update:open="$emit('update:showPreviewDialog', $event)">
    <DialogContent class="max-w-4xl">
      <DialogHeader>
        <DialogTitle>پیش‌نمایش برنامه روزانه</DialogTitle>
      </DialogHeader>
      <div class="space-y-4">
        <div class="text-center border-b pb-4">
          <h2 class="text-xl font-bold">برنامه روزانه تحویل و نصب</h2>
          <p class="text-lg">{{ formatDate(selectedDate) }} - {{ getDayName(selectedDate) }}</p>
        </div>
        
        <div class="space-y-4">
          <div v-for="(order, index) in previewOrders" :key="order.id" 
               class="p-4 border rounded-lg">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div><strong>{{ index + 1 }}. INV:</strong> {{ order.invoiceNo }}</div>
              <div><strong>Type:</strong> {{ getServiceTypeLabel(order.serviceType) }}</div>
              <div><strong>Contact Name:</strong> {{ order.customerName }}</div>
              <div><strong>Phone:</strong> {{ order.customerPhone }}</div>
              <div class="md:col-span-2"><strong>Address:</strong> {{ order.customerAddress }}</div>
              <div v-if="order.locationLink" class="md:col-span-2">
                <strong>Location Link:</strong> {{ order.locationLink }}
              </div>
              <div><strong>Time Slot:</strong> {{ order.scheduledTimeSlot || 'تعیین نشده' }}</div>
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showPreviewDialog = false">بستن</Button>
        <Button @click="confirmPublish" class="bg-green-600 hover:bg-green-700">
          تأیید و انتشار
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Calendar, 
  Plus, 
  Send, 
  Eye, 
  Copy, 
  Printer 
} from 'lucide-vue-next'
import type { DeliveryOrder, DailyProgram } from '@/shared/types/delivery-installation'

// Props
interface Props {
  programs: DailyProgram[]
  orders: DeliveryOrder[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'publish-program': [date: Date, orderIds: string[]]
}>()

// State
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedOrderIds = ref<string[]>([])
const showPreviewDialog = ref(false)
const showCreateProgramDialog = ref(false)

// Computed
const availableOrdersForDate = computed(() => {
  if (!selectedDate.value) return []
  
  const date = new Date(selectedDate.value)
  return props.orders.filter(order => {
    // Only show orders that are scheduled for this date
    return order.scheduledDate && 
           new Date(order.scheduledDate).toDateString() === date.toDateString() &&
           order.status === 'scheduled'
  })
})

const existingProgram = computed(() => {
  if (!selectedDate.value) return null
  
  const date = new Date(selectedDate.value)
  return props.programs.find(program => 
    new Date(program.date).toDateString() === date.toDateString()
  )
})

const isValidDay = computed(() => {
  if (!selectedDate.value) return false
  
  const date = new Date(selectedDate.value)
  const dayOfWeek = date.getDay()
  // Tuesday = 2, Thursday = 4, Saturday = 6
  return [2, 4, 6].includes(dayOfWeek)
})

const previewOrders = computed(() => {
  return props.orders.filter(order => selectedOrderIds.value.includes(order.id))
})

// Methods
function getDayName(dateString: string) {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  return date.toLocaleDateString('fa-IR', { weekday: 'long' })
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('fa-IR')
}

function formatDateTime(date: Date) {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getServiceTypeLabel(type: string) {
  const labels = {
    'delivery_only': 'تحویل',
    'installation_delivery': 'نصب و تحویل',
    'uninstallation_delivery': 'جمع‌آوری و تحویل'
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

function previewProgram() {
  showPreviewDialog.value = true
}

function publishProgram() {
  if (selectedOrderIds.value.length === 0 || !isValidDay.value) return
  
  const date = new Date(selectedDate.value)
  emit('publish-program', date, selectedOrderIds.value)
  selectedOrderIds.value = []
}

function confirmPublish() {
  publishProgram()
  showPreviewDialog.value = false
}

function toggleOrderSelection(orderId: string) {
  const index = selectedOrderIds.value.indexOf(orderId)
  if (index > -1) {
    selectedOrderIds.value.splice(index, 1)
  } else {
    selectedOrderIds.value.push(orderId)
  }
}

function copyProgramToClipboard() {
  if (!existingProgram.value) return
  
  let text = `📅 DAILY DELIVERY & INSTALLATION PROGRAM\n`
  text += `Date: ${formatDate(existingProgram.value.date)}\n`
  text += `Published by: ${existingProgram.value.publishedBy}\n`
  text += `═══════════════════════════════════════\n\n`
  
  existingProgram.value.orders.forEach((order, index) => {
    text += `${index + 1}. 📦 ${order.invoiceNo}\n`
    text += `   Type: ${order.serviceType}\n`
    text += `   Contact: ${order.contactName}\n`
    text += `   Phone: ${order.phone}\n`
    text += `   Time: ${order.timeSlot}\n`
    text += `   Address: ${order.address}\n`
    if (order.locationLink) {
      text += `   📍 Map: ${order.locationLink}\n`
    }
    if (order.specialNotes) {
      text += `   ⚠️ Notes: ${order.specialNotes}\n`
    }
    text += `\n`
  })
  
  text += `═══════════════════════════════════════\n`
  text += `Total Orders: ${existingProgram.value.orders.length}\n`
  
  navigator.clipboard.writeText(text).then(() => {
    alert('✅ Program copied to clipboard! You can now paste it in WhatsApp, Telegram, or any messaging app.')
  })
}

function printProgram() {
  if (!existingProgram.value) return
  
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  let html = `
    <html>
      <head>
        <title>برنامه روزانه - ${formatDate(existingProgram.value.date)}</title>
        <style>
          body { font-family: Arial, sans-serif; direction: rtl; }
          .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .order { border: 1px solid #ccc; padding: 10px; margin-bottom: 10px; }
          .order-title { font-weight: bold; margin-bottom: 5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>برنامه روزانه تحویل و نصب</h1>
          <h2>${formatDate(existingProgram.value.date)} - ${getDayName(selectedDate.value)}</h2>
        </div>
  `
  
  existingProgram.value.orders.forEach((order, index) => {
    html += `
      <div class="order">
        <div class="order-title">${index + 1}. ${order.invoiceNo}</div>
        <div>نوع: ${order.serviceType}</div>
        <div>مشتری: ${order.contactName}</div>
        <div>تلفن: ${order.phone}</div>
        <div>آدرس: ${order.address}</div>
        ${order.locationLink ? `<div>موقعیت: ${order.locationLink}</div>` : ''}
        <div>زمان: ${order.timeSlot}</div>
        ${order.specialNotes ? `<div>یادداشت: ${order.specialNotes}</div>` : ''}
      </div>
    `
  })
  
  html += '</body></html>'
  
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.print()
}

// Watch for date changes to clear selections
watch(selectedDate, () => {
  selectedOrderIds.value = []
})
</script>
