<template>
  <div class="space-y-6">
    <ProcurementHeader>
      <template #search>
        <Input 
          v-model="search" 
          placeholder="Search shipments..." 
          class="h-8"
        />
      </template>
      <template #filters>
        <Select v-model="statusFilter" @update:modelValue="handleStatusFilterUpdate">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="picked_up">Picked up</SelectItem>
            <SelectItem value="in_transit">In transit</SelectItem>
            <SelectItem value="out_for_delivery">Out for delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="failed_delivery">Failed</SelectItem>
            <SelectItem value="returned">Returned</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="methodFilter" @update:modelValue="handleMethodFilterUpdate">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="air">Air</SelectItem>
            <SelectItem value="sea">Sea</SelectItem>
            <SelectItem value="land">Land</SelectItem>
            <SelectItem value="rail">Rail</SelectItem>
            <SelectItem value="courier">Courier</SelectItem>
            <SelectItem value="pickup">Pickup</SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="text-sm text-muted-foreground hidden md:block">{{ filteredShipments.length }} results</div>
          <Button @click="showCreateDialog = true" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Create Shipment
          </Button>
        </div>
      </template>
      <template #stats>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ shipmentsStore.stats.totalShipments }}</div>
                <div class="text-xs text-muted-foreground">Total Shipments</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ shipmentsStore.inTransitShipments.length }}</div>
                <div class="text-xs text-muted-foreground">In Transit</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ shipmentsStore.deliveredShipments.length }}</div>
                <div class="text-xs text-muted-foreground">Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ currency(shipmentsStore.stats.totalShippingCost) }}</div>
                <div class="text-xs text-muted-foreground">Total Shipping Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </ProcurementHeader>

    <!-- Errors -->
    <div v-if="shipmentsError" class="mb-3">
      <Alert variant="destructive">
        <AlertTitle>Shipments unavailable</AlertTitle>
        <AlertDescription>{{ shipmentsError }}</AlertDescription>
      </Alert>
    </div>
    <div v-if="ordersError" class="mb-3">
      <Alert variant="destructive">
        <AlertTitle>Orders unavailable</AlertTitle>
        <AlertDescription>{{ ordersError }}</AlertDescription>
      </Alert>
    </div>

    <!-- Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[160px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('shipmentNumber')">
                  Shipment #
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button class="inline-flex items-center gap-1" @click="toggleSort('supplierName')">
                  Supplier
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button class="inline-flex items-center gap-1" @click="toggleSort('method')">
                  Method
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button class="inline-flex items-center gap-1" @click="toggleSort('carrier')">
                  Carrier
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button class="inline-flex items-center gap-1" @click="toggleSort('trackingNumber')">
                  Tracking
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[140px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('status')">
                  Status
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[160px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('estimatedDeliveryDate')">
                  ETA
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[120px] text-right">
                <button class="inline-flex items-center gap-1" @click="toggleSort('shippingCost')">
                  Cost
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[90px] text-center">Files</TableHead>
              <TableHead class="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="s in sortedShipments" :key="s.shipmentId">
              <TableCell>
                <div class="font-medium">{{ s.shipmentNumber }}</div>
                <div class="text-xs text-muted-foreground">{{ s.orderNumber }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ s.supplierName }}</div>
              </TableCell>
              <TableCell class="capitalize">{{ s.method }}</TableCell>
              <TableCell>{{ s.carrier || '-' }}</TableCell>
              <TableCell>{{ s.trackingNumber || '-' }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(s.status)">{{ s.status }}</Badge>
              </TableCell>
              <TableCell>{{ formatDate(s.estimatedDeliveryDate) }}</TableCell>
              <TableCell class="text-right">{{ currency(s.shippingCost) }}</TableCell>
              <TableCell class="text-center">
                <button class="underline text-sm" @click="openAttachments(s)">
                  {{ s.attachments?.length || 0 }}
                </button>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon"><MoreVertical class="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="triggerUpload(s)">Upload File</DropdownMenuItem>
                    <DropdownMenuItem @click="viewShipment(s)">View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Hidden file input for attachments -->
    <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />

    <!-- Create Shipment Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Shipment</DialogTitle>
          <DialogDescription>Record a new shipment.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Order</Label>
              <Select v-model="shipmentForm.orderId">
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="o in orders" :key="o.orderId" :value="o.orderId">{{ o.orderNumber }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Method</Label>
              <Select v-model="shipmentForm.method">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="air">Air</SelectItem>
                  <SelectItem value="sea">Sea</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                  <SelectItem value="rail">Rail</SelectItem>
                  <SelectItem value="courier">Courier</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Estimated Delivery</Label>
              <Input type="date" v-model="shipmentForm.estimatedDeliveryStr" />
            </div>
            <div>
              <Label>Shipping Cost</Label>
              <Input type="number" min="0" step="0.01" v-model.number="shipmentForm.shippingCost" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea v-model="shipmentForm.notes" placeholder="Optional notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showCreateDialog = false">Cancel</Button>
          <Button :disabled="creating" @click="createShipment">
            <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Attachments Dialog -->
    <Dialog v-model:open="showAttachmentsDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Shipment Attachments</DialogTitle>
          <DialogDescription v-if="attachmentsTitle">{{ attachmentsTitle }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-2 max-h-80 overflow-auto">
          <div v-if="currentAttachments.length === 0" class="text-sm text-muted-foreground">No attachments</div>
          <div v-for="(url, idx) in currentAttachments" :key="idx" class="flex items-center justify-between gap-3 p-2 border rounded">
            <div class="truncate text-sm">{{ url }}</div>
            <div class="flex items-center gap-2">
              <a :href="url" target="_blank" class="text-sm underline">Open</a>
              <Button variant="ghost" size="icon" class="h-7 w-7" @click="deleteShipmentAttachment(url)">
                <Trash class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showAttachmentsDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useShipmentsStore } from '@/modules/procurement/stores/shipments'
import { useOrdersStore } from '@/modules/procurement/stores/orders'
import type { Shipment, ShipmentMethod, CreateShipmentRequest } from '@/modules/procurement/types/shipments'
// UI components (shadcn-vue)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { MoreVertical, Plus, Loader2, ArrowUpDown, Trash } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ProcurementHeader from '@/modules/procurement/components/ProcurementHeader.vue'

const shipmentsStore = useShipmentsStore()
const ordersStore = useOrdersStore()

const search = ref('')
const statusFilter = ref('all')
const methodFilter = ref('all')
const shipmentsError = ref<string | null>(null)
const ordersError = ref<string | null>(null)
const showCreateDialog = ref(false)
const creating = ref(false)

const orders = computed(() => ordersStore.orders)

const filteredShipments = computed(() => {
  const q = search.value.toLowerCase()
  const status = statusFilter.value
  const method = methodFilter.value
  return shipmentsStore.shipments.filter((s: Shipment) => {
    const m = !q || s.shipmentNumber.toLowerCase().includes(q) || s.supplierName.toLowerCase().includes(q) || s.orderNumber.toLowerCase().includes(q) || s.trackingNumber?.toLowerCase().includes(q)
    const sOk = !status || status === 'all' || s.status === status
    const mOk = !method || method === 'all' || s.method === method
    return m && sOk && mOk
  })
})

type SortField = 'shipmentNumber' | 'supplierName' | 'method' | 'carrier' | 'trackingNumber' | 'status' | 'estimatedDeliveryDate' | 'shippingCost'
const sortField = ref<SortField>('estimatedDeliveryDate')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedShipments = computed(() => {
  const arr = [...filteredShipments.value]
  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return arr.sort((a, b) => {
    let av: any
    let bv: any
    switch (field) {
      case 'shipmentNumber': av = a.shipmentNumber || ''; bv = b.shipmentNumber || ''; return av.localeCompare(bv) * dir
      case 'supplierName': av = a.supplierName || ''; bv = b.supplierName || ''; return av.localeCompare(bv) * dir
      case 'method': av = a.method || ''; bv = b.method || ''; return av.localeCompare(bv) * dir
      case 'carrier': av = a.carrier || ''; bv = b.carrier || ''; return av.localeCompare(bv) * dir
      case 'trackingNumber': av = a.trackingNumber || ''; bv = b.trackingNumber || ''; return av.localeCompare(bv) * dir
      case 'status': av = a.status || ''; bv = b.status || ''; return av.localeCompare(bv) * dir
      case 'estimatedDeliveryDate': av = a.estimatedDeliveryDate ? new Date(a.estimatedDeliveryDate).getTime() : 0; bv = b.estimatedDeliveryDate ? new Date(b.estimatedDeliveryDate).getTime() : 0; return (av - bv) * dir
      case 'shippingCost': av = a.shippingCost || 0; bv = b.shippingCost || 0; return (av - bv) * dir
      default: return 0
    }
  })
})

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0)
}

function formatDate(d?: Date) {
  if (!d) return '-'
  const iso = (typeof d === 'string' ? d : d.toISOString()).slice(0, 10)
  return iso
}

function statusVariant(s: Shipment['status']) {
  switch (s) {
    case 'delivered': return 'success'
    case 'in_transit': return 'secondary'
    case 'failed_delivery': return 'destructive'
    default: return 'default'
  }
}

function viewShipment(_s: Shipment) {
  // placeholder for future detail view
}

// Attachments dialog state
const showAttachmentsDialog = ref(false)
const currentAttachments = ref<string[]>([])
const attachmentsTitle = ref<string>('')
const currentShipmentId = ref<string | null>(null)

function openAttachments(s: Shipment) {
  currentAttachments.value = s.attachments || []
  attachmentsTitle.value = s.shipmentNumber
  currentShipmentId.value = s.shipmentId
  showAttachmentsDialog.value = true
}

async function deleteShipmentAttachment(url: string) {
  if (!currentShipmentId.value) return
  try {
    const ok = confirm('Delete this attachment? This cannot be undone.')
    if (!ok) return
    const res = await shipmentsStore.removeShipmentAttachment(currentShipmentId.value, url)
    if (res) {
      currentAttachments.value = currentAttachments.value.filter((u) => u !== url)
      toast.success('Attachment deleted')
    } else {
      toast.error('Failed to delete attachment')
    }
  } catch (e) {
    console.error('Failed to delete attachment', e)
    toast.error('Failed to delete attachment')
  }
}

// Upload attachment handling
const fileInput = ref<HTMLInputElement | null>(null)
const targetShipmentId = ref<string | null>(null)

function triggerUpload(s: Shipment) {
  targetShipmentId.value = s.shipmentId
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && targetShipmentId.value) {
    await shipmentsStore.uploadShipmentAttachment(targetShipmentId.value, file)
  }
  if (input) input.value = ''
  targetShipmentId.value = null
}

// Create Shipment
const shipmentForm = ref<{ orderId: string; method: ShipmentMethod | ''; estimatedDeliveryStr: string; shippingCost: number; notes?: string }>({
  orderId: '',
  method: '',
  estimatedDeliveryStr: '',
  shippingCost: 0,
})

async function createShipment() {
  if (!shipmentForm.value.orderId || !shipmentForm.value.method || !shipmentForm.value.estimatedDeliveryStr) return
  creating.value = true
  try {
    const payload: CreateShipmentRequest = {
      orderId: shipmentForm.value.orderId,
      method: shipmentForm.value.method as ShipmentMethod,
      estimatedDeliveryDate: new Date(shipmentForm.value.estimatedDeliveryStr),
      shippingCost: shipmentForm.value.shippingCost,
      notes: shipmentForm.value.notes,
      items: []
    }
    const id = await shipmentsStore.createShipment(payload)
    if (id) {
      showCreateDialog.value = false
    }
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  // Ensure filters never start empty
  if (!statusFilter.value) statusFilter.value = 'all'
  if (!methodFilter.value) methodFilter.value = 'all'
  try {
    ordersError.value = null
    await ordersStore.fetchOrders()
  } catch (e: any) {
    console.error('Failed to fetch orders for shipments:', e)
    ordersError.value = 'Failed to fetch related orders. Check Firestore permissions or role.'
  }
  try {
    shipmentsError.value = null
    await shipmentsStore.fetchShipments()
    await shipmentsStore.fetchShipmentStats()
  } catch (e: any) {
    console.error('Failed to fetch shipments:', e)
    shipmentsError.value = 'Failed to fetch shipments. Please check your Firestore permissions.'
  }
})

function handleStatusFilterUpdate(value: unknown) {
  const v = (value ?? 'all') as string
  statusFilter.value = v && v.length > 0 ? v : 'all'
}

function handleMethodFilterUpdate(value: unknown) {
  const v = (value ?? 'all') as string
  methodFilter.value = v && v.length > 0 ? v : 'all'
}
</script>
