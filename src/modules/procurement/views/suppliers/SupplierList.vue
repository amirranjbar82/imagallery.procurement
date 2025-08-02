<template>
  <div class="space-y-6">
    <!-- Header with actions -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p class="text-gray-600 mt-1">Manage your supplier relationships and vendor information</p>
        </div>
        <button 
          @click="$emit('create')"
          class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center"
        >
          <Plus class="mr-2 h-4 w-4" />
          Add Supplier
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Building2 class="h-5 w-5 text-blue-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Total</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.totalSuppliers }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <CheckCircle class="h-5 w-5 text-green-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Active</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.activeSuppliers }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <Clock class="h-5 w-5 text-yellow-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Pending</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ stats.pendingSuppliers }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <DollarSign class="h-5 w-5 text-purple-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Total Spend</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">${{ formatCurrency(stats.totalSpend) }}</div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center space-x-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search suppliers by name, code, or contact..."
            class="max-w-sm"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-muted-foreground" />
            </template>
          </Input>
        </div>
        
        <Select v-model="statusFilter">
          <SelectTrigger class="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" @click="clearFilters">
          <X class="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-white rounded-lg shadow-sm border border-red-200 p-6">
      <div class="flex items-center">
        <AlertCircle class="h-4 w-4 text-red-600" />
        <span class="ml-2 text-sm font-medium text-red-600">Error</span>
      </div>
      <p class="mt-2 text-sm text-red-600">{{ error }}</p>
      <button 
        class="mt-4 bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800" 
        @click="refreshSuppliers"
      >
        Try Again
      </button>
    </div>

    <!-- Suppliers Table -->
    <div v-else class="bg-white rounded-lg shadow-sm border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Supplier</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Terms</TableHead>
            <TableHead>Total Orders</TableHead>
            <TableHead>Total Spend</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="supplier in filteredSuppliers"
            :key="supplier.supplierId"
            class="cursor-pointer hover:bg-muted/50"
            @click="$emit('view', supplier)"
          >
            <TableCell>
              <div>
                <div class="font-medium">{{ supplier.name }}</div>
                <div class="text-sm text-muted-foreground">{{ supplier.code }}</div>
              </div>
            </TableCell>
            <TableCell>
              <div>
                <div class="font-medium">{{ supplier.contactPerson }}</div>
                <div class="text-sm text-muted-foreground">{{ supplier.email }}</div>
              </div>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(supplier.status)">
                {{ supplier.status }}
              </Badge>
            </TableCell>
            <TableCell>{{ supplier.paymentTerms }}</TableCell>
            <TableCell>{{ supplier.totalOrders }}</TableCell>
            <TableCell>${{ formatCurrency(supplier.totalSpend) }}</TableCell>
            <TableCell>
              <div class="flex items-center">
                <Star 
                  v-for="i in 5" 
                  :key="i"
                  class="h-4 w-4"
                  :class="i <= (supplier.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
                />
                <span class="ml-2 text-sm text-muted-foreground">
                  {{ supplier.rating || 0 }}
                </span>
              </div>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" class="h-8 w-8 p-0">
                    <MoreHorizontal class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click.stop="$emit('view', supplier)">
                    <Eye class="mr-2 h-4 w-4" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem @click.stop="$emit('edit', supplier)">
                    <Edit class="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    @click.stop="toggleStatus(supplier)"
                    :class="supplier.status === 'active' ? 'text-yellow-600' : 'text-green-600'"
                  >
                    <Power class="mr-2 h-4 w-4" />
                    {{ supplier.status === 'active' ? 'Deactivate' : 'Activate' }}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Empty State -->
      <div v-if="filteredSuppliers.length === 0" class="text-center py-8">
        <Building2 class="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 class="mt-2 text-sm font-semibold">No suppliers found</h3>
        <p class="mt-1 text-sm text-muted-foreground">
          {{ searchQuery || statusFilter !== 'all' 
            ? 'Try adjusting your search or filters' 
            : 'Get started by creating your first supplier' 
          }}
        </p>
        <Button v-if="!searchQuery && statusFilter === 'all'" class="mt-4" @click="$emit('create')">
          <Plus class="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier, SupplierStatus } from '@/modules/procurement/types/supplier'

// Icons
import { 
  Plus, Search, X, Building2, CheckCircle, Clock, DollarSign,
  AlertCircle, Star, MoreHorizontal, Eye, Edit, Power
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Emits
defineEmits<{
  create: []
  view: [supplier: Supplier]
  edit: [supplier: Supplier]
}>()

// Store
const supplierStore = useSupplierStore()
const { suppliers, loading, error, stats } = storeToRefs(supplierStore)

// Local state
const searchQuery = ref('')
const statusFilter = ref<string>('all')

// Computed
const filteredSuppliers = computed(() => {
  let filtered = suppliers.value

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(supplier => supplier.status === statusFilter.value)
  }

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.code.toLowerCase().includes(query) ||
      supplier.contactPerson.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query)
    )
  }

  return filtered
})

// Methods
function getStatusVariant(status: SupplierStatus) {
  switch (status) {
    case 'active': return 'default'
    case 'pending': return 'secondary'
    case 'inactive': return 'outline'
    case 'suspended': return 'destructive'
    default: return 'outline'
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function clearFilters() {
  searchQuery.value = ''
  statusFilter.value = 'all'
}

async function toggleStatus(supplier: Supplier) {
  const newStatus: SupplierStatus = supplier.status === 'active' ? 'inactive' : 'active'
  await supplierStore.updateSupplier({
    supplierId: supplier.supplierId,
    status: newStatus
  })
}

async function refreshSuppliers() {
  await supplierStore.fetchSuppliers()
  await supplierStore.fetchSupplierStats()
}

// Lifecycle
onMounted(() => {
  refreshSuppliers()
})

// Watch for filter changes
watch([searchQuery, statusFilter], () => {
  // Filters are applied via computed property
}, { immediate: true })
</script>
