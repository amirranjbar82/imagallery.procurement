<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Package class="w-5 h-5" />
          Order Management
        </span>
        <div class="flex gap-2">
          <Select v-model="statusFilter">
            <SelectTrigger class="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="created">Created</SelectItem>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="technical_check">Technical Check</SelectItem>
              <SelectItem value="payment_pending">Payment Pending</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="ready">Ready</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Service Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Scheduled Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="order in filteredOrders" :key="order.id">
              <TableCell class="font-medium">{{ order.invoiceNo }}</TableCell>
              <TableCell>
                <div>
                  <p class="font-medium">{{ order.customerName }}</p>
                  <p class="text-sm text-gray-500">{{ order.customerPhone }}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="getServiceTypeBadgeVariant(order.serviceType)">
                  {{ getServiceTypeLabel(order.serviceType) }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="getStatusBadgeVariant(order.status)">
                  {{ getStatusLabel(order.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                    {{ order.currentStep }}
                  </div>
                  <span class="text-sm">of 9</span>
                </div>
              </TableCell>
              <TableCell>
                <div v-if="order.scheduledDate">
                  <p class="text-sm">{{ formatDate(order.scheduledDate) }}</p>
                  <p class="text-xs text-gray-500">{{ order.scheduledTimeSlot }}</p>
                </div>
                <span v-else class="text-gray-400">Not scheduled</span>
              </TableCell>
              <TableCell>
                <Badge :variant="getPaymentBadgeVariant(order.paymentStatus)">
                  {{ getPaymentLabel(order.paymentStatus) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button variant="ghost" size="sm" @click="$emit('view-details', order)">
                    <Eye class="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" @click="$emit('edit-order', order)">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    @click="showWorkflowDialog(order)"
                    :disabled="order.status === 'completed'"
                  >
                    <ArrowRight class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>

  <!-- Workflow Progress Dialog -->
  <Dialog v-model:open="showWorkflowProgressDialog">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Advance Workflow - {{ selectedOrder?.invoiceNo }}</DialogTitle>
      </DialogHeader>
      <div v-if="selectedOrder" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Current Status</Label>
            <p class="text-lg font-medium">{{ getStatusLabel(selectedOrder.status) }}</p>
          </div>
          <div>
            <Label>Current Step</Label>
            <p class="text-lg font-medium">{{ selectedOrder.currentStep }} of 9</p>
          </div>
        </div>
        
        <div class="space-y-3">
          <h4 class="font-medium">Available Actions:</h4>
          <div class="grid grid-cols-1 gap-2">
            <Button 
              v-if="selectedOrder.status === 'created'"
              @click="updateStatus('planned', 2)"
              class="justify-start"
            >
              Weekly Planning
            </Button>
            <Button 
              v-if="selectedOrder.status === 'planned'"
              @click="updateStatus('technical_check', 3)"
              class="justify-start"
            >
              Start Technical Check
            </Button>
            <Button 
              v-if="selectedOrder.status === 'technical_check'"
              @click="updateStatus('payment_pending', 4)"
              class="justify-start"
            >
              Complete Technical Check
            </Button>
            <Button 
              v-if="selectedOrder.status === 'payment_pending'"
              @click="updateStatus('scheduled', 5)"
              class="justify-start"
            >
              Confirm Payment
            </Button>
            <Button 
              v-if="selectedOrder.status === 'scheduled'"
              @click="updateStatus('ready', 6)"
              class="justify-start"
            >
              Publish Daily Program
            </Button>
            <Button 
              v-if="selectedOrder.status === 'ready'"
              @click="updateStatus('in_progress', 7)"
              class="justify-start"
            >
              Start Execution
            </Button>
            <Button 
              v-if="selectedOrder.status === 'in_progress'"
              @click="updateStatus('completed', 9)"
              class="justify-start"
            >
              Complete Order
            </Button>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showWorkflowProgressDialog = false">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Package, Eye, Edit, ArrowRight } from 'lucide-vue-next'
import type { DeliveryOrder, DeliveryOrderStatus, WorkflowStep } from '@/shared/types/delivery-installation'

// Props
interface Props {
  orders: DeliveryOrder[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'edit-order': [order: DeliveryOrder]
  'view-details': [order: DeliveryOrder]
  'update-status': [orderId: string, status: DeliveryOrderStatus, step: WorkflowStep]
}>()

// State
const statusFilter = ref('all')
const showWorkflowProgressDialog = ref(false)
const selectedOrder = ref<DeliveryOrder | null>(null)

// Computed
const filteredOrders = computed(() => {
  if (statusFilter.value === 'all') {
    return props.orders
  }
  return props.orders.filter(order => order.status === statusFilter.value)
})

// Methods
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

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('fa-IR')
}

function showWorkflowDialog(order: DeliveryOrder) {
  selectedOrder.value = order
  showWorkflowProgressDialog.value = true
}

function updateStatus(status: DeliveryOrderStatus, step: WorkflowStep) {
  if (selectedOrder.value) {
    emit('update-status', selectedOrder.value.id, status, step)
    showWorkflowProgressDialog.value = false
  }
}
</script>
