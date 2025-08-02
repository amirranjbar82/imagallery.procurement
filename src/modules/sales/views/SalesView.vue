<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Sales Management</h1>
        <p class="text-gray-600">Manage customers and sales orders</p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="showCreateCustomer = true">
          <UserPlus class="w-4 h-4 mr-2" />
          New Customer
        </Button>
        <Button @click="showCreateOrder = true">
          <Plus class="w-4 h-4 mr-2" />
          New Order
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <Users class="h-8 w-8 text-blue-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Customers</p>
              <p class="text-2xl font-bold text-gray-900">{{ customers.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <ShoppingCart class="h-8 w-8 text-green-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Orders</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ getOrdersByStatus('confirmed').length + getOrdersByStatus('in-production').length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <DollarSign class="h-8 w-8 text-purple-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Sales</p>
              <p class="text-2xl font-bold text-gray-900">${{ totalSalesValue.toLocaleString() }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <TrendingUp class="h-8 w-8 text-orange-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">
                ${{ getMonthlyTotal().toLocaleString() }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Sales/Customers Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'orders'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'orders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Sales Orders ({{ salesOrders.length }})
          </button>
          <button
            @click="activeTab = 'customers'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'customers'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Customers ({{ customers.length }})
          </button>
        </nav>
      </div>
    </div>

    <!-- Filter Bar -->
    <Card class="mb-6">
      <CardContent class="pt-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <Input 
              :placeholder="activeTab === 'orders' ? 'Search orders...' : 'Search customers...'"
              v-model="searchQuery"
              class="w-full"
            />
          </div>
          <Select v-model="statusFilter" v-if="activeTab === 'orders'">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="in-production">In Production</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="customerStatusFilter" v-if="activeTab === 'customers'">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Orders View -->
    <Card v-if="activeTab === 'orders'">
      <CardContent class="pt-4">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="order in filteredOrders" :key="order.salesOrderId">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ order.orderNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ getCustomerName(order.customerId) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(order.orderDate).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${{ order.totalAmount.toLocaleString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="getStatusVariant(order.status)">
                      {{ order.status }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" class="mr-2">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Customers View -->
    <Card v-if="activeTab === 'customers'">
      <CardContent class="pt-4">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CustomerCard 
              v-for="customer in filteredCustomers" 
              :key="customer.customerId"
              :customer="customer"
              @edit="handleCustomerEdit"
              @view="handleCustomerView"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, UserPlus, Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-vue-next'
import { useSalesStore } from '../stores/sales'
import type { Customer, SalesOrder } from '../types/sales'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Placeholder component
const CustomerCard = { 
  props: ['customer'],
  emits: ['edit', 'view'],
  template: '<div class="border rounded p-4">Customer: {{ customer.name }}</div>' 
}

const salesStore = useSalesStore()

// State
const activeTab = ref<'orders' | 'customers'>('orders')
const searchQuery = ref('')
const statusFilter = ref('')
const customerStatusFilter = ref('')
const showCreateOrder = ref(false)
const showCreateCustomer = ref(false)

// Computed
const { customers, salesOrders, loading, getOrdersByStatus, totalSalesValue } = salesStore

const filteredOrders = computed(() => {
  let filtered = salesOrders.value

  if (searchQuery.value) {
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      getCustomerName(order.customerId).toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(order => order.status === statusFilter.value)
  }

  return filtered
})

const filteredCustomers = computed(() => {
  let filtered = customers.value

  if (searchQuery.value) {
    filtered = filtered.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      customer.customerNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (customerStatusFilter.value) {
    filtered = filtered.filter(customer => customer.status === customerStatusFilter.value)
  }

  return filtered
})

// Methods
function getCustomerName(customerId: string): string {
  const customer = customers.value.find(c => c.customerId === customerId)
  return customer?.name || 'Unknown Customer'
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'draft': return 'secondary'
    case 'confirmed': return 'default'
    case 'in-production': return 'default'
    case 'shipped': return 'default'
    case 'delivered': return 'default'
    case 'cancelled': return 'destructive'
    default: return 'secondary'
  }
}

function getMonthlyTotal(): number {
  const now = new Date()
  const thisMonth = salesOrders.value.filter(order => {
    const orderDate = new Date(order.orderDate)
    return orderDate.getMonth() === now.getMonth() && 
           orderDate.getFullYear() === now.getFullYear()
  })
  return thisMonth.reduce((total, order) => total + order.totalAmount, 0)
}

function handleCustomerEdit(customer: Customer) {
  console.log('Edit customer:', customer)
}

function handleCustomerView(customer: Customer) {
  console.log('View customer:', customer)
}

// Lifecycle
onMounted(() => {
  salesStore.fetchCustomers()
  salesStore.fetchSalesOrders()
})
</script>
