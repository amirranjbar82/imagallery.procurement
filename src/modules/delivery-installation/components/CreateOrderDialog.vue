<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Create New Delivery/Installation Order</DialogTitle>
        <DialogDescription>
          Enter order information to start the delivery and installation process
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Left Column -->
          <div class="space-y-4">
            <div>
              <Label for="invoiceNo">شماره فاکتور *</Label>
              <Input
                id="invoiceNo"
                v-model="form.invoiceNo"
                placeholder="Enter invoice number"
                required
              />
            </div>

            <div>
              <Label for="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                v-model="form.customerName"
                placeholder="Enter customer name"
                required
              />
            </div>

            <div>
              <Label for="customerPhone">Customer Phone *</Label>
              <Input
                id="customerPhone"
                v-model="form.customerPhone"
                placeholder="Enter phone number"
                required
              />
            </div>

            <div>
              <Label for="customerAddress">Customer Address *</Label>
              <Textarea
                id="customerAddress"
                v-model="form.customerAddress"
                placeholder="Enter complete address"
                rows="3"
                required
              />
            </div>

            <div>
              <Label for="locationLink">Location Link</Label>
              <Input
                id="locationLink"
                v-model="form.locationLink"
                placeholder="https://maps.google.com/..."
              />
            </div>
          </div>

          <!-- Right Column -->
          <div class="space-y-4">
            <div>
              <Label for="serviceType">Service Type *</Label>
              <Select v-model="form.serviceType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery_only">Delivery Only</SelectItem>
                  <SelectItem value="installation_delivery">Installation & Delivery</SelectItem>
                  <SelectItem value="uninstallation_delivery">Uninstallation & Delivery</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label for="totalValue">Total Value (Rial) *</Label>
              <Input
                id="totalValue"
                v-model.number="form.totalValue"
                type="number"
                placeholder="5000000"
                required
              />
            </div>

            <div>
              <Label for="paymentMethod">Payment Method</Label>
              <Select v-model="form.paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prepaid">Prepaid</SelectItem>
                  <SelectItem value="on_site_card">On-site Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Order Items</Label>
              <div class="space-y-3">
                <div v-for="(item, index) in form.items" :key="index" 
                     class="p-3 border rounded-lg space-y-2">
                  <div class="flex justify-between items-start">
                    <Input
                      v-model="item.name"
                      placeholder="Item name"
                      class="flex-1 mr-2"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeItem(index)"
                      :disabled="form.items.length === 1"
                    >
                      <X class="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div class="grid grid-cols-2 gap-2">
                    <Select v-model="item.type">
                      <SelectTrigger>
                        <SelectValue placeholder="نوع کالا" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="chandelier">لوستر</SelectItem>
                        <SelectItem value="furniture">مبلمان</SelectItem>
                        <SelectItem value="appliance">لوازم خانگی</SelectItem>
                        <SelectItem value="other">سایر</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      v-model.number="item.quantity"
                      type="number"
                      placeholder="تعداد"
                      min="1"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-2">
                    <Input
                      v-model.number="item.weight"
                      type="number"
                      placeholder="وزن (کیلوگرم)"
                    />
                    <Input
                      v-model="item.dimensions"
                      placeholder="ابعاد (سانتی‌متر)"
                    />
                  </div>

                  <div v-if="item.type === 'chandelier'" class="grid grid-cols-2 gap-2">
                    <Input
                      v-model.number="item.installationHeight"
                      type="number"
                      placeholder="ارتفاع نصب (سانتی‌متر)"
                    />
                    <Input
                      v-model.number="item.layers"
                      type="number"
                      placeholder="تعداد طبقات"
                    />
                  </div>

                  <Select v-model="item.location">
                    <SelectTrigger>
                      <SelectValue placeholder="محل کالا" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warehouse">انبار</SelectItem>
                      <SelectItem value="store">فروشگاه</SelectItem>
                      <SelectItem value="multiple">چند محل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  @click="addItem"
                  class="w-full"
                >
                  <Plus class="w-4 h-4 mr-2" />
                  + Add Item
                </Button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter class="flex gap-2">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Create Order
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useDeliveryInstallationStore } from '../stores/delivery-installation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, X, Loader2 } from 'lucide-vue-next'
import type { DeliveryItem } from '@/shared/types/delivery-installation'

// Props
interface Props {
  open: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'order-created': [orderId: string]
}>()

// Store
const deliveryStore = useDeliveryInstallationStore()

// State
const loading = ref(false)

const form = reactive({
  invoiceNo: '',
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  locationLink: '',
  serviceType: '',
  totalValue: 0,
  paymentMethod: '',
  items: [
    {
      id: '',
      name: '',
      type: 'chandelier',
      quantity: 1,
      weight: 0,
      dimensions: '',
      installationHeight: 0,
      ceilingType: '',
      layers: 1,
      accessories: [],
      specialRequirements: [],
      location: 'warehouse'
    }
  ] as DeliveryItem[]
})

// Methods
function addItem() {
  form.items.push({
    id: '',
    name: '',
    type: 'chandelier',
    quantity: 1,
    weight: 0,
    dimensions: '',
    installationHeight: 0,
    ceilingType: '',
    layers: 1,
    accessories: [],
    specialRequirements: [],
    location: 'warehouse'
  })
}

function removeItem(index: number) {
  if (form.items.length > 1) {
    form.items.splice(index, 1)
  }
}

async function handleSubmit() {
  loading.value = true
  
  try {
    // Generate IDs for items
    const itemsWithIds = form.items.map((item, index) => ({
      ...item,
      id: `item-${Date.now()}-${index}`
    }))

    const orderId = await deliveryStore.createOrder({
      invoiceNo: form.invoiceNo,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerAddress: form.customerAddress,
      locationLink: form.locationLink || undefined,
      serviceType: form.serviceType as any,
      totalValue: form.totalValue,
      paymentMethod: form.paymentMethod as any,
      items: itemsWithIds,
      coordinatorId: 'current-user' // TODO: Get from auth store
    })

    emit('order-created', orderId)
    resetForm()
  } catch (error) {
    console.error('Error creating order:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.invoiceNo = ''
  form.customerName = ''
  form.customerPhone = ''
  form.customerAddress = ''
  form.locationLink = ''
  form.serviceType = ''
  form.totalValue = 0
  form.paymentMethod = ''
  form.items = [{
    id: '',
    name: '',
    type: 'chandelier',
    quantity: 1,
    weight: 0,
    dimensions: '',
    installationHeight: 0,
    ceilingType: '',
    layers: 1,
    accessories: [],
    specialRequirements: [],
    location: 'warehouse'
  }]
}
</script>
