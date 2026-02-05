<template>
  <div class="space-y-6">
    <ProcurementHeader>
      <template #search>
        <Input
          v-model="searchQuery"
          placeholder="Search orders..."
          class="h-8"
        />
      </template>
      <template #filters>
        <Select v-model="statusFilter" @update:modelValue="handleStatusFilterUpdate">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="text-sm text-muted-foreground hidden md:block">{{ filteredOrders.length }} results</div>
          <Button @click="refreshOrders" variant="outline" size="icon">
            <RefreshCw class="h-4 w-4" />
          </Button>
          <Button @click="showCreateDialog = true" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Create Order
          </Button>
        </div>
      </template>
      <template #stats>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ ordersStore.stats.totalOrders }}</div>
                <div class="text-xs text-muted-foreground">Total Orders</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ ordersStore.stats.pendingOrders }}</div>
                <div class="text-xs text-muted-foreground">Pending Approval</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ ordersStore.stats.completedOrders }}</div>
                <div class="text-xs text-muted-foreground">Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">${{ formatCurrency(ordersStore.stats.totalValue) }}</div>
                <div class="text-xs text-muted-foreground">Total Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </ProcurementHeader>

    <!-- Filters and Search -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <CardTitle>Orders</CardTitle>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              placeholder="Search orders..."
              class="w-64"
            />
            <Select v-model="statusFilter" @update:modelValue="handleStatusFilterUpdate">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Button @click="refreshOrders" variant="outline" size="icon">
              <RefreshCw class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div v-if="ordersError" class="mb-3">
          <Alert variant="destructive">
            <AlertTitle>Orders unavailable</AlertTitle>
            <AlertDescription>{{ ordersError }}</AlertDescription>
          </Alert>
        </div>
        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <button class="inline-flex items-center gap-1" @click="toggleSort('orderNumber')">
                    Order #
                    <ArrowUpDown class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button class="inline-flex items-center gap-1" @click="toggleSort('orderDate')">
                    Date
                    <ArrowUpDown class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button class="inline-flex items-center gap-1" @click="toggleSort('status')">
                    Status
                    <ArrowUpDown class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button class="inline-flex items-center gap-1" @click="toggleSort('totalAmount')">
                    Total
                    <ArrowUpDown class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead>
                  <button class="inline-flex items-center gap-1" @click="toggleSort('itemsCount')">
                    Items
                    <ArrowUpDown class="h-4 w-4" />
                  </button>
                </TableHead>
                <TableHead class="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="order in sortedOrders" :key="order.orderId">
                <TableCell class="font-medium">{{ order.orderNumber }}</TableCell>
                <TableCell>{{ formatDate(order.orderDate) }}</TableCell>
                <TableCell>
                  <Badge :variant="getStatusVariant(order.status)">
                    {{ order.status }}
                  </Badge>
                </TableCell>
                <TableCell>${{ formatCurrency(order.totalAmount) }}</TableCell>
                <TableCell>{{ order.items.length }} items</TableCell>
                <TableCell class="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal class="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem @click="viewOrder(order)">
                        <Eye class="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="editOrder(order)" v-if="order.status === 'draft'">
                        <Edit class="mr-2 h-4 w-4" />
                        Edit Order
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="duplicateOrder(order)">
                        <Copy class="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="downloadPO(order)">
                        <Download class="mr-2 h-4 w-4" />
                        Download PO
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>

    <!-- Create Order Dialog -->
    <Dialog :open="showCreateDialog" @update:open="showCreateDialog = $event">
      <DialogContent class="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
          <DialogDescription>
            Create a new purchase order
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6">
          <div class="grid grid-cols-2 gap-4">

            <div class="space-y-2">
              <Label for="orderDate">Order Date</Label>
              <Input
                id="orderDate"
                v-model="orderForm.orderDate"
                type="date"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="deliveryDate">Expected Delivery</Label>
              <Input
                id="deliveryDate"
                v-model="orderForm.expectedDeliveryDate"
                type="date"
              />
            </div>

            <div class="space-y-2">
              <Label for="priority">Priority</Label>
              <Select v-model="orderForm.priority">
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Order Items -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <Label>Order Items</Label>
              <Button @click="addOrderItem" type="button" variant="outline" size="sm">
                <Plus class="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div class="space-y-3">
              <div v-for="(item, index) in orderForm.items" :key="index" 
                   class="grid grid-cols-6 gap-3 items-end p-3 border rounded-lg">
                <div class="space-y-1">
                  <Label class="text-xs">Description</Label>
                  <Input v-model="item.description" placeholder="Item description" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">Quantity</Label>
                  <Input v-model.number="item.quantity" type="number" min="1" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">Unit Price</Label>
                  <Input v-model.number="item.unitPrice" type="number" step="0.01" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">Tax Rate (%)</Label>
                  <Input v-model.number="item.taxRate" type="number" step="0.01" />
                </div>
                <div class="space-y-1">
                  <Label class="text-xs">Total</Label>
                  <Input :value="calculateItemTotal(item)" readonly class="bg-gray-50" />
                </div>
                <Button @click="removeOrderItem(index)" variant="ghost" size="sm">
                  <Trash class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between items-center">
              <span class="font-medium">Order Total:</span>
              <span class="text-xl font-bold">${{ calculateOrderTotal() }}</span>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="notes">Notes</Label>
            <Textarea
              id="notes"
              v-model="orderForm.notes"
              placeholder="Additional notes or special instructions"
              rows="3"
            />
          </div>
        </div>

        <DialogFooter>
          <Button @click="showCreateDialog = false" variant="outline">
            Cancel
          </Button>
          <Button @click="saveAsDraft" variant="outline">
            Save as Draft
          </Button>
          <Button @click="createOrder" :disabled="creating">
            <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
            Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/modules/procurement/stores/orders'
import type { PurchaseOrder, OrderStatus } from '@/modules/procurement/types/orders'

// UI Components
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

// Icons
import { 
  Plus, 
  RefreshCw, 
  MoreHorizontal,
  Eye,
  Edit,
  Copy,
  Download,
  Trash,
  Loader2,
  ArrowUpDown
} from 'lucide-vue-next'

import ProcurementHeader from '@/modules/procurement/components/ProcurementHeader.vue'

// Stores
const ordersStore = useOrdersStore()
const { orders } = storeToRefs(ordersStore)

// Local State
const showCreateDialog = ref(false)
const searchQuery = ref('')
const statusFilter = ref('all')
const ordersError = ref<string | null>(null)
const creating = ref(false)

const orderForm = ref({
  orderDate: new Date().toISOString().split('T')[0],
  expectedDeliveryDate: '',
  priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
  notes: '',
  items: [] as Array<{
    description: string
    quantity: number
    unitPrice: number
    taxRate: number
  }>
})

// Computed
type SortField = 'orderNumber' | 'orderDate' | 'status' | 'totalAmount' | 'itemsCount'
const sortField = ref<SortField>('orderDate')
const sortDirection = ref<'asc' | 'desc'>('desc')

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.notes?.toLowerCase().includes(query)
    )
  }

  if (statusFilter.value && statusFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered
})

const sortedOrders = computed(() => {
  const arr = [...filteredOrders.value]
  const dir = sortDirection.value === 'asc' ? 1 : -1
  switch (sortField.value) {
    case 'orderNumber':
      return arr.sort((a, b) => a.orderNumber.localeCompare(b.orderNumber) * dir)
    case 'orderDate':
      return arr.sort((a, b) => (new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()) * dir)
    case 'status':
      return arr.sort((a, b) => a.status.localeCompare(b.status) * dir)
    case 'totalAmount':
      return arr.sort((a, b) => (a.totalAmount - b.totalAmount) * dir)
    case 'itemsCount':
      return arr.sort((a, b) => (a.items.length - b.items.length) * dir)
    default:
      return arr
  }
})

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

// Methods
function getStatusVariant(status: OrderStatus) {
  switch (status) {
    case 'draft': return 'secondary'
    case 'sent': return 'default'
    case 'acknowledged': return 'default'
    case 'in_progress': return 'default'
    case 'shipped': return 'default'
    case 'delivered': return 'default'
    case 'completed': return 'default'
    case 'cancelled': return 'destructive'
    default: return 'outline'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function addOrderItem() {
  orderForm.value.items.push({
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0
  })
}

function removeOrderItem(index: number) {
  orderForm.value.items.splice(index, 1)
}

function calculateItemTotal(item: { quantity: number; unitPrice: number; taxRate: number }): string {
  const subtotal = item.quantity * item.unitPrice
  const tax = subtotal * (item.taxRate / 100)
  return formatCurrency(subtotal + tax)
}

function calculateOrderTotal(): string {
  const total = orderForm.value.items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice
    const tax = subtotal * (item.taxRate / 100)
    return sum + subtotal + tax
  }, 0)
  return formatCurrency(total)
}

async function refreshOrders() {
  try {
    ordersError.value = null
    await ordersStore.fetchOrders()
  } catch (e: any) {
    console.error('Failed to refresh orders:', e)
    ordersError.value = 'Failed to fetch orders. Please check your Firestore permissions or sign in with the correct role.'
  }
}

function handleStatusFilterUpdate(value: unknown) {
  const v = (value ?? 'all') as string
  statusFilter.value = v && v.length > 0 ? v : 'all'
}

function viewOrder(order: PurchaseOrder) {
  // Navigate to order detail view
  console.log('View order:', order.orderId)
}

function editOrder(order: PurchaseOrder) {
  // Open edit dialog with order data
  console.log('Edit order:', order.orderId)
}

function duplicateOrder(order: PurchaseOrder) {
  // Duplicate order logic
  console.log('Duplicate order:', order.orderId)
}

function downloadPO(order: PurchaseOrder) {
  // Download purchase order PDF
  console.log('Download PO:', order.orderId)
}

async function saveAsDraft() {
  creating.value = true
  try {
    const delivery = orderForm.value.expectedDeliveryDate
      ? new Date(orderForm.value.expectedDeliveryDate)
      : new Date(orderForm.value.orderDate)
    const orderData = {
      priority: orderForm.value.priority,
      items: orderForm.value.items.map(item => ({
        productCode: '',
        productName: item.description,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice * (1 + item.taxRate / 100)
      })),
      deliveryDate: delivery,
      shippingAddress: { street: '', city: '', country: '', postalCode: '' },
      notes: orderForm.value.notes
    }

    await ordersStore.createOrder(orderData)
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to save draft:', error)
  } finally {
    creating.value = false
  }
}

async function createOrder() {
  creating.value = true
  try {
    const delivery = orderForm.value.expectedDeliveryDate
      ? new Date(orderForm.value.expectedDeliveryDate)
      : new Date(orderForm.value.orderDate)
    const orderData = {
      priority: orderForm.value.priority,
      items: orderForm.value.items.map(item => ({
        productCode: '',
        productName: item.description,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice * (1 + item.taxRate / 100)
      })),
      deliveryDate: delivery,
      shippingAddress: { street: '', city: '', country: '', postalCode: '' },
      notes: orderForm.value.notes
    }

    await ordersStore.createOrder(orderData)
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to create order:', error)
  } finally {
    creating.value = false
  }
}

function resetForm() {
  orderForm.value = {
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    priority: 'medium',
    notes: '',
    items: []
  }
}

// Lifecycle
onMounted(async () => {
  try {
    ordersError.value = null
    await ordersStore.fetchOrders()
  } catch (error) {
    console.error('Failed to load orders:', error)
    ordersError.value = 'Failed to load orders. Please try again.'
  }
  // Add initial order item
  addOrderItem()
})
</script>
