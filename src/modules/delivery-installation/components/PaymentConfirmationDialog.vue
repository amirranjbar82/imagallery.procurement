<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Payment Confirmation - {{ order?.invoiceNo }}</DialogTitle>
        <DialogDescription>
          Payment confirmation before delivery/installation (Step 4 of 9)
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Order Summary -->
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <p class="font-medium">{{ order?.invoiceNo }}</p>
              </div>
              <div>
                <Label>Customer</Label>
                <p class="font-medium">{{ order?.customerName }}</p>
              </div>
              <div>
                <Label>Total Amount</Label>
                <p class="text-lg font-bold text-green-600">
                  {{ order?.totalValue.toLocaleString() }} Rial
                </p>
              </div>
              <div>
                <Label>Service Type</Label>
                <Badge :variant="getServiceTypeBadgeVariant(order?.serviceType || '')" size="sm">
                  {{ getServiceTypeLabel(order?.serviceType || '') }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Payment Method Selection -->
        <Card>
          <CardHeader>
            <CardTitle>Payment Method *</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 gap-3">
              <div class="flex items-center space-x-2">
                <input
                  type="radio"
                  id="prepaid"
                  v-model="form.method"
                  value="prepaid"
                  class="w-4 h-4 text-blue-600"
                />
                <Label for="prepaid" class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Prepaid (Recommended)
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <input
                  type="radio"
                  id="on_site_card"
                  v-model="form.method"
                  value="on_site_card"
                  class="w-4 h-4 text-blue-600"
                />
                <Label for="on_site_card" class="flex items-center gap-2">
                  <CreditCard class="w-4 h-4 text-blue-500" />
                  On-site Card Payment
                </Label>
              </div>
              
              <div class="flex items-center space-x-2">
                <input
                  type="radio"
                  id="cash"
                  v-model="form.method"
                  value="cash"
                  class="w-4 h-4 text-blue-600"
                />
                <Label for="cash" class="flex items-center gap-2">
                  <Banknote class="w-4 h-4 text-yellow-500" />
                  Cash on Site
                </Label>
              </div>
            </div>

            <!-- Payment Status -->
            <div class="mt-4 p-4 rounded-lg" :class="getPaymentStatusClass()">
              <div class="flex items-center gap-2">
                <component :is="getPaymentStatusIcon()" class="w-5 h-5" />
                <span class="font-medium">{{ getPaymentStatusText() }}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Payment Verification -->
        <Card v-if="form.method">
          <CardHeader>
            <CardTitle>Payment Verification</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div v-if="form.method === 'prepaid'">
              <Label for="transactionId">Transaction/Receipt Number</Label>
              <Input
                id="transactionId"
                v-model="form.transactionId"
                placeholder="Bank transaction number"
                required
              />
            </div>

            <div v-if="form.method === 'on_site_card'">
              <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm text-blue-800">
                  <Info class="w-4 h-4 inline mr-1" />
                  Card reader device should be ready on site
                </p>
              </div>
            </div>

            <div v-if="form.method === 'cash'">
              <div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p class="text-sm text-yellow-800">
                  <AlertTriangle class="w-4 h-4 inline mr-1" />
                  Exact cash amount should be collected on site
                </p>
              </div>
            </div>

            <div>
              <Label for="confirmedBy">Confirmed By *</Label>
              <Input
                id="confirmedBy"
                v-model="form.confirmedBy"
                placeholder="Name of payment confirmation officer"
                required
              />
            </div>

            <div>
              <Label for="notes">Notes</Label>
              <Textarea
                id="notes"
                v-model="form.notes"
                placeholder="Additional notes about payment"
                rows="3"
              />
            </div>

            <!-- Confirmation Checkbox -->
            <div class="flex items-center space-x-2">
              <Checkbox
                id="confirmed"
                v-model:checked="form.confirmed"
                required
              />
              <Label for="confirmed" class="text-sm">
                I confirm that payment has been verified according to the selected method
              </Label>
            </div>
          </CardContent>
        </Card>

        <!-- SOP Warning -->
        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div class="flex items-start gap-2">
            <AlertTriangle class="w-5 h-5 text-red-500 mt-0.5" />
            <div class="text-sm text-red-800">
              <p class="font-medium">SOP Policy:</p>
              <p>No delivery/installation operations are performed without payment confirmation</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button 
            type="submit" 
            :disabled="!form.method || !form.confirmedBy || !form.confirmed || loading"
            class="bg-green-600 hover:bg-green-700"
          >
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Confirm Payment
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useDeliveryInstallationStore } from '../stores/delivery-installation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  CheckCircle, 
  CreditCard, 
  Banknote, 
  Info, 
  AlertTriangle, 
  Loader2,
  Clock
} from 'lucide-vue-next'
import type { DeliveryOrder } from '@/shared/types/delivery-installation'

// Props
interface Props {
  open: boolean
  order?: DeliveryOrder | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'payment-confirmed': [orderId: string]
}>()

// Store
const deliveryStore = useDeliveryInstallationStore()

// State
const loading = ref(false)

const form = reactive({
  method: '',
  transactionId: '',
  confirmedBy: '',
  notes: '',
  confirmed: false
})

// Computed
const isFormValid = computed(() => {
  return form.method && form.confirmedBy && form.confirmed
})

// Methods
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

function getPaymentStatusClass() {
  if (!form.method) return 'bg-gray-50 border-gray-200'
  
  const classes = {
    'prepaid': 'bg-green-50 border-green-200',
    'on_site_card': 'bg-blue-50 border-blue-200',
    'cash': 'bg-yellow-50 border-yellow-200'
  }
  return classes[form.method as keyof typeof classes] || 'bg-gray-50 border-gray-200'
}

function getPaymentStatusIcon() {
  if (!form.method) return Clock
  
  const icons = {
    'prepaid': CheckCircle,
    'on_site_card': CreditCard,
    'cash': Banknote
  }
  return icons[form.method as keyof typeof icons] || Clock
}

function getPaymentStatusText() {
  if (!form.method) return 'Select a payment method'
  
  const texts = {
    'prepaid': 'Prepaid - Most secure method',
    'on_site_card': 'On-site card payment',
    'cash': 'Cash payment on site'
  }
  return texts[form.method as keyof typeof texts] || ''
}

async function handleSubmit() {
  if (!props.order || !isFormValid.value) return
  
  loading.value = true
  
  try {
    await deliveryStore.confirmPayment(props.order.id, {
      method: form.method as any,
      confirmedBy: form.confirmedBy,
      notes: form.notes
    })
    
    emit('payment-confirmed', props.order.id)
    emit('update:open', false)
    resetForm()
  } catch (error) {
    console.error('Error confirming payment:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.method = ''
  form.transactionId = ''
  form.confirmedBy = ''
  form.notes = ''
  form.confirmed = false
}
</script>
