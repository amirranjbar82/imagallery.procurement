<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle v-if="order">Order Details - {{ order.invoiceNo }}</DialogTitle>
      </DialogHeader>

      <div v-if="order" class="space-y-6">
        <!-- Order Status & Progress -->
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>Status & Progress</span>
              <Badge :variant="getStatusBadgeVariant(order.status)">
                {{ getStatusLabel(order.status) }}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Current Step</Label>
                <p class="text-lg font-medium">{{ order.currentStep }} of 9</p>
              </div>
              <div>
                <Label>Created Date</Label>
                <p>{{ formatDate(order.createdAt) }}</p>
              </div>
              <div>
                <Label>Last Updated</Label>
                <p>{{ formatDate(order.updatedAt) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Customer Information -->
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Customer Name</Label>
                <p class="font-medium">{{ order.customerName }}</p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <p>{{ order.customerPhone }}</p>
              </div>
              <div class="md:col-span-2">
                <Label>Address</Label>
                <p class="whitespace-pre-line">{{ order.customerAddress }}</p>
              </div>
              <div v-if="order.locationLink" class="md:col-span-2">
                <Label>Location</Label>
                <a :href="order.locationLink" target="_blank" 
                   class="text-blue-600 hover:underline">
                  View on Map
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Service Details -->
        <Card>
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Service Type</Label>
                <Badge :variant="getServiceTypeBadgeVariant(order.serviceType)">
                  {{ getServiceTypeLabel(order.serviceType) }}
                </Badge>
              </div>
              <div>
                <Label>Total Value</Label>
                <p class="font-medium">{{ order.totalValue.toLocaleString() }} Rial</p>
              </div>
              <div>
                <Label>Payment Status</Label>
                <Badge :variant="getPaymentBadgeVariant(order.paymentStatus)">
                  {{ getPaymentLabel(order.paymentStatus) }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Order Items -->
        <Card>
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" 
                   class="p-4 border rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label>Item Name</Label>
                    <p class="font-medium">{{ item.name }}</p>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <p>{{ item.quantity }}</p>
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <p>{{ item.unit }}</p>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <p class="text-sm text-gray-600">{{ item.description || 'N/A' }}</p>
                  </div>
                  <div v-if="item.weight">
                    <Label>Weight</Label>
                    <p>{{ item.weight }} kg</p>
                  </div>
                  <div v-if="item.dimensions">
                    <Label>Dimensions</Label>
                    <p>{{ item.dimensions }}</p>
                  </div>
                  <div v-if="item.installationHeight">
                    <Label>Installation Height</Label>
                    <p>{{ item.installationHeight }} cm</p>
                  </div>
                  <div v-if="item.layers">
                    <Label>Layers</Label>
                    <p>{{ item.layers }}</p>
                  </div>
                </div>
                
                <div v-if="item.specialRequirements.length > 0" class="mt-3">
                  <Label>Special Requirements</Label>
                  <div class="flex flex-wrap gap-1 mt-1">
                    <Badge v-for="req in item.specialRequirements" :key="req" variant="outline" size="sm">
                      {{ req }}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Scheduling Information -->
        <Card v-if="order.scheduledDate">
          <CardHeader>
            <CardTitle>اطلاعات زمان‌بندی</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>تاریخ برنامه‌ریزی شده</Label>
                <p class="font-medium">{{ formatDate(order.scheduledDate) }}</p>
              </div>
              <div>
                <Label>بازه زمانی</Label>
                <p>{{ order.scheduledTimeSlot }}</p>
              </div>
              <div v-if="order.bufferDate">
                <Label>روز پشتیبان</Label>
                <p>{{ formatDate(order.bufferDate) }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Technical Checklist -->
        <Card v-if="order.technicalChecklist">
          <CardHeader>
            <CardTitle class="flex items-center justify-between">
              <span>چک‌لیست فنی</span>
              <Badge :variant="order.technicalChecklist.isComplete ? 'success' : 'outline'">
                {{ order.technicalChecklist.isComplete ? 'تکمیل شده' : 'در انتظار' }}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>نیاز به نردبان</Label>
                <p>{{ order.technicalChecklist.needsLadder ? 'بله' : 'خیر' }}</p>
              </div>
              <div>
                <Label>نیاز به بالابر</Label>
                <p>{{ order.technicalChecklist.needsLift ? 'بله' : 'خیر' }}</p>
              </div>
              <div>
                <Label>نوع وسیله نقلیه</Label>
                <p>{{ getVehicleTypeLabel(order.technicalChecklist.vehicleType) }}</p>
              </div>
              <div>
                <Label>متعلقات کامل</Label>
                <p>{{ order.technicalChecklist.accessoriesComplete ? 'بله' : 'خیر' }}</p>
              </div>
            </div>
            
            <div v-if="order.technicalChecklist.notes" class="mt-4">
              <Label>یادداشت‌ها</Label>
              <p class="text-sm bg-gray-50 p-3 rounded">{{ order.technicalChecklist.notes }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Workflow Logs -->
        <Card v-if="order.workflowLogs.length > 0">
          <CardHeader>
            <CardTitle>تاریخچه فعالیت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="space-y-3">
              <div v-for="log in order.workflowLogs" :key="log.id" 
                   class="flex items-start gap-3 p-3 border rounded-lg">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                  {{ log.step }}
                </div>
                <div class="flex-1">
                  <p class="font-medium">{{ log.action }}</p>
                  <p class="text-sm text-gray-600">{{ log.details }}</p>
                  <p class="text-xs text-gray-500">
                    {{ log.performedBy }} - {{ formatDateTime(log.performedAt) }}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          بستن
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import type { DeliveryOrder } from '@/shared/types/delivery-installation'

// Props
interface Props {
  open: boolean
  order?: DeliveryOrder | null
}

defineProps<Props>()

// Emits
defineEmits<{
  'update:open': [value: boolean]
}>()

// Methods
function getStatusLabel(status: string) {
  const labels = {
    'created': 'ایجاد شده',
    'planned': 'برنامه‌ریزی شده',
    'technical_check': 'بررسی فنی',
    'payment_pending': 'انتظار پرداخت',
    'scheduled': 'زمان‌بندی شده',
    'ready': 'آماده',
    'in_progress': 'در حال اجرا',
    'completed': 'تکمیل شده',
    'failed': 'ناموفق',
    'rescheduled': 'تغییر برنامه'
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
    'completed': 'success' as const,
    'failed': 'destructive' as const,
    'rescheduled': 'outline' as const
  }
  return variants[status as keyof typeof variants] || 'default'
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

function getPaymentLabel(status: string) {
  const labels = {
    'pending': 'در انتظار',
    'confirmed': 'تأیید شده',
    'failed': 'ناموفق',
    'on_site': 'در محل'
  }
  return labels[status as keyof typeof labels] || status
}

function getPaymentBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'pending': 'outline' as const,
    'confirmed': 'success' as const,
    'failed': 'destructive' as const,
    'on_site': 'warning' as const
  }
  return variants[status as keyof typeof variants] || 'default'
}

function getItemTypeLabel(type: string) {
  const labels = {
    'chandelier': 'لوستر',
    'furniture': 'مبلمان',
    'appliance': 'لوازم خانگی',
    'other': 'سایر'
  }
  return labels[type as keyof typeof labels] || type
}

function getLocationLabel(location: string) {
  const labels = {
    'warehouse': 'انبار',
    'store': 'فروشگاه',
    'multiple': 'چند محل'
  }
  return labels[location as keyof typeof labels] || location
}

function getVehicleTypeLabel(type: string) {
  const labels = {
    'van': 'ون',
    'truck': 'کامیون',
    'small_car': 'خودروی کوچک'
  }
  return labels[type as keyof typeof labels] || type
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('fa-IR')
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
</script>
