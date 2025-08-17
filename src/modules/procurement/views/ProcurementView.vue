<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Procurement</h1>
        <p class="text-muted-foreground">
          Manage suppliers, orders, invoices, and shipments
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="refreshData" :disabled="loading" variant="outline" size="sm">
          <RefreshCw :class="{ 'animate-spin': loading }" class="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total Suppliers</CardTitle>
          <Users class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ supplierStats.totalSuppliers }}</div>
          <p class="text-xs text-muted-foreground">
            {{ supplierStats.activeSuppliers }} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pending Orders</CardTitle>
          <ShoppingCart class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ orderStats.pendingOrders }}</div>
          <p class="text-xs text-muted-foreground">
            ${{ formatCurrency(orderStats.totalValue) }} total value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Outstanding Invoices</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ invoiceStats.pendingInvoices }}</div>
          <p class="text-xs text-muted-foreground">
            ${{ formatCurrency(invoiceStats.totalOutstanding) }} outstanding
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">In Transit</CardTitle>
          <Truck class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ shipmentStats.inTransitShipments }}</div>
          <p class="text-xs text-muted-foreground">
            {{ shipmentStats.onTimeDeliveryRate.toFixed(1) }}% on-time rate
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Quick Actions -->
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common procurement tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button @click="navigateToSuppliers" class="h-20 flex-col">
            <Users class="h-6 w-6 mb-2" />
            Manage Suppliers
          </Button>
          <Button @click="navigateToOrders" class="h-20 flex-col" variant="outline">
            <ShoppingCart class="h-6 w-6 mb-2" />
            Create Order
          </Button>
          <Button @click="navigateToInvoices" class="h-20 flex-col" variant="outline">
            <FileText class="h-6 w-6 mb-2" />
            Process Invoice
          </Button>
          <Button @click="navigateToShipments" class="h-20 flex-col" variant="outline">
            <Truck class="h-6 w-6 mb-2" />
            Track Shipment
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Activity -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Recent Orders -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest purchase orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="order in recentOrders" :key="order.orderId" class="flex items-center">
              <div class="ml-4 space-y-1">
                <p class="text-sm font-medium leading-none">{{ order.orderNumber }}</p>
                <p class="text-sm text-muted-foreground">{{ order.supplierName }}</p>
              </div>
              <div class="ml-auto font-medium">
                <Badge :variant="getOrderStatusVariant(order.status)">
                  {{ order.status }}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Recent Suppliers -->
      <Card>
        <CardHeader>
          <CardTitle>Recent Suppliers</CardTitle>
          <CardDescription>Recently added suppliers</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="supplier in recentSuppliers" :key="supplier.supplierId" class="flex items-center">
              <div class="ml-4 space-y-1">
                <p class="text-sm font-medium leading-none">{{ supplier.name }}</p>
                <p class="text-sm text-muted-foreground">{{ supplier.contactPerson }}</p>
              </div>
              <div class="ml-auto font-medium">
                <div class="flex items-center">
                  <Star v-for="n in 5" :key="n" 
                       :class="n <= (supplier.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'" 
                       class="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Performance Charts -->
    <div class="grid gap-4 md:grid-cols-2">
      <!-- Spending Trend -->
      <Card>
        <CardHeader>
          <CardTitle>Monthly Spending</CardTitle>
          <CardDescription>Procurement spending over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="h-[200px] flex items-center justify-center text-muted-foreground">
            Chart placeholder - Monthly spending trend
          </div>
        </CardContent>
      </Card>

      <!-- Supplier Performance -->
      <Card>
        <CardHeader>
          <CardTitle>Top Suppliers</CardTitle>
          <CardDescription>By order volume and rating</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-for="supplier in topSuppliers" :key="supplier.supplierId" class="flex items-center">
              <div class="ml-4 space-y-1">
                <p class="text-sm font-medium leading-none">{{ supplier.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ supplier.totalOrders }} orders • ${{ formatCurrency(supplier.totalSpend) }}
                </p>
              </div>
              <div class="ml-auto font-medium">
                <div class="flex items-center">
                  <Star v-for="n in 5" :key="n" 
                       :class="n <= (supplier.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'" 
                       class="h-4 w-4" />
                  <span class="ml-2 text-sm">{{ supplier.rating?.toFixed(1) || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import { useOrdersStore } from '@/modules/procurement/stores/orders'
import { useInvoicesStore } from '@/modules/procurement/stores/invoices'
import { useShipmentsStore } from '@/modules/procurement/stores/shipments'

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  Truck, 
  RefreshCw,
  Star
} from 'lucide-vue-next'

// Stores
const supplierStore = useSupplierStore()
const ordersStore = useOrdersStore()
const invoicesStore = useInvoicesStore()
const shipmentsStore = useShipmentsStore()
const router = useRouter()

// State
const loading = ref(false)

// Computed
const supplierStats = computed(() => supplierStore.stats)
const orderStats = computed(() => ordersStore.stats)
const invoiceStats = computed(() => invoicesStore.invoiceStats)
const shipmentStats = computed(() => shipmentsStore.stats)

const recentOrders = computed(() => 
  ordersStore.orders.slice(0, 5)
)

const recentSuppliers = computed(() => 
  supplierStore.suppliers
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
)

const topSuppliers = computed(() => 
  supplierStore.suppliers
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5)
)

// Methods
async function refreshData() {
  loading.value = true
  try {
    await Promise.all([
      supplierStore.fetchSuppliers(),
      supplierStore.fetchSupplierStats(),
      ordersStore.fetchOrders(),
      ordersStore.fetchOrderStats(),
      invoicesStore.fetchInvoices(),
      invoicesStore.fetchInvoiceStats(),
      shipmentsStore.fetchShipments(),
      shipmentsStore.fetchShipmentStats()
    ])
  } catch (error) {
    console.error('Error refreshing data:', error)
  } finally {
    loading.value = false
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function getOrderStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default'
    case 'cancelled':
      return 'destructive'
    case 'urgent':
      return 'destructive'
    default:
      return 'secondary'
  }
}

// Navigation methods
function navigateToSuppliers() {
  router.push('/procurement/suppliers')
}

function navigateToOrders() {
  router.push('/procurement/orders')
}

function navigateToInvoices() {
  router.push('/procurement/invoices')
}

function navigateToShipments() {
  router.push('/procurement/shipments')
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>
