<template>
  <div class="space-y-6">
    <ProcurementHeader>
      <template #search>
        <Input
          v-model="searchQuery"
          placeholder="Search suppliers by name, code, or contact..."
          class="h-8 max-w-sm"
        >
          <template #prefix>
            <Search class="h-4 w-4 text-muted-foreground" />
          </template>
        </Input>
      </template>
      <template #filters>
        <Select v-model="statusFilter">
          <SelectTrigger class="w-44 h-8">
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
        <Button variant="outline" size="sm" @click="clearFilters">
          <X class="mr-2 h-4 w-4" />
          Clear
        </Button>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="text-sm text-muted-foreground hidden md:block">{{ filteredSuppliers.length }} results</div>
          <Button @click="$emit('quickAdd')" variant="outline" size="sm">
            <Camera class="mr-2 h-4 w-4" />
            Quick Add
          </Button>
          <Button @click="$emit('create')" size="sm">
            <Plus class="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>
      </template>
      <template #stats>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div>
              <div class="text-xl font-bold">{{ stats.totalSuppliers }}</div>
              <div class="text-xs text-muted-foreground">Total</div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div>
              <div class="text-xl font-bold">{{ stats.activeSuppliers }}</div>
              <div class="text-xs text-muted-foreground">Active</div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div>
              <div class="text-xl font-bold">{{ stats.pendingSuppliers }}</div>
              <div class="text-xs text-muted-foreground">Pending</div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div>
              <div class="text-xl font-bold">${{ formatCurrency(stats.totalSpend) }}</div>
              <div class="text-xs text-muted-foreground">Total Spend</div>
            </div>
          </CardContent>
        </Card>
      </template>
    </ProcurementHeader>

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
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('name')">
              <div class="flex items-center gap-2">
                Company Name
                <ChevronUp v-if="sortField === 'name' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'name' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('contactPerson')">
              <div class="flex items-center gap-2">
                Contact
                <ChevronUp v-if="sortField === 'contactPerson' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'contactPerson' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('status')">
              <div class="flex items-center gap-2">
                Status
                <ChevronUp v-if="sortField === 'status' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'status' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('paymentTerms')">
              <div class="flex items-center gap-2">
                Payment Terms
                <ChevronUp v-if="sortField === 'paymentTerms' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'paymentTerms' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('totalOrders')">
              <div class="flex items-center gap-2">
                Total Orders
                <ChevronUp v-if="sortField === 'totalOrders' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'totalOrders' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('totalSpend')">
              <div class="flex items-center gap-2">
                Total Spend
                <ChevronUp v-if="sortField === 'totalSpend' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'totalSpend' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead class="cursor-pointer hover:bg-muted/50" @click="sortBy('rating')">
              <div class="flex items-center gap-2">
                Rating
                <ChevronUp v-if="sortField === 'rating' && sortOrder === 'asc'" class="h-4 w-4" />
                <ChevronDown v-else-if="sortField === 'rating' && sortOrder === 'desc'" class="h-4 w-4" />
                <ChevronsUpDown v-else class="h-4 w-4 opacity-50" />
              </div>
            </TableHead>
            <TableHead v-for="column in customColumns" :key="column.id" class="cursor-pointer hover:bg-muted/50">
              <div class="flex items-center gap-2">
                {{ column.name }}
                <Button variant="ghost" size="sm" class="h-4 w-4 p-0" @click.stop="removeCustomColumn(column.id)">
                  <X class="h-3 w-3" />
                </Button>
              </div>
            </TableHead>
            <TableHead>
              <Button variant="ghost" size="sm" @click="showAddColumnDialog = true">
                <Plus class="h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="(supplier, index) in sortedSuppliers"
            :key="supplier.supplierId"
            :class="[
              'cursor-pointer hover:bg-muted/50',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
              index === sortedSuppliers.length - 1 ? 'bg-gray-100 border-b-2 border-gray-300' : ''
            ]"
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
            <TableCell v-for="column in customColumns" :key="column.id">
              <!-- Custom column data placeholder -->
              <span class="text-muted-foreground text-sm">-</span>
            </TableCell>
            <TableCell></TableCell>
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

    <!-- Add Column Dialog -->
    <div v-if="showAddColumnDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-96">
        <h3 class="text-lg font-semibold mb-4">Add Custom Column</h3>
        <div class="space-y-4">
          <div>
            <label class="text-sm font-medium">Column Name</label>
            <Input
              v-model="newColumnName"
              placeholder="Enter column name"
              @keyup.enter="addCustomColumn"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showAddColumnDialog = false">
              Cancel
            </Button>
            <Button @click="addCustomColumn">
              Add Column
            </Button>
          </div>
        </div>
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
  Plus, Search, X, Building2,
  AlertCircle, Star, MoreHorizontal, Eye, Edit, Power, Camera,
  ChevronUp, ChevronDown, ChevronsUpDown
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import ProcurementHeader from '@/modules/procurement/components/ProcurementHeader.vue'

// Emits
defineEmits<{
  create: []
  quickAdd: []
  view: [supplier: Supplier]
  edit: [supplier: Supplier]
}>()

// Store
const supplierStore = useSupplierStore()
const { suppliers, loading, error, stats } = storeToRefs(supplierStore)

// Local state
const searchQuery = ref('')
const statusFilter = ref<string>('all')

// Sorting state
const sortField = ref<string>('name')
const sortOrder = ref<'asc' | 'desc'>('asc')

// Custom columns
interface CustomColumn {
  id: string
  name: string
}

const customColumns = ref<CustomColumn[]>([])
const showAddColumnDialog = ref(false)
const newColumnName = ref('')

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

const sortedSuppliers = computed(() => {
  const sorted = [...filteredSuppliers.value]
  
  sorted.sort((a, b) => {
    let aValue = a[sortField.value as keyof Supplier]
    let bValue = b[sortField.value as keyof Supplier]
    
    // Handle undefined values
    if (aValue === undefined) aValue = ''
    if (bValue === undefined) bValue = ''
    
    // Handle different data types
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase()
      bValue = bValue.toLowerCase()
    }
    
    if (aValue < bValue) {
      return sortOrder.value === 'asc' ? -1 : 1
    }
    if (aValue > bValue) {
      return sortOrder.value === 'asc' ? 1 : -1
    }
    return 0
  })
  
  return sorted
})

// Methods
function sortBy(field: string) {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

function addCustomColumn() {
  if (newColumnName.value.trim()) {
    const newColumn: CustomColumn = {
      id: Date.now().toString(),
      name: newColumnName.value.trim()
    }
    customColumns.value.push(newColumn)
    newColumnName.value = ''
    showAddColumnDialog.value = false
  }
}

function removeCustomColumn(columnId: string) {
  const index = customColumns.value.findIndex(col => col.id === columnId)
  if (index > -1) {
    customColumns.value.splice(index, 1)
  }
}

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
