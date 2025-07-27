<template>
  <div class="space-y-4">
    <!-- Search and Filter -->
    <div class="flex items-center space-x-4">
      <div class="flex-1">
        <Input
          v-model="searchQuery"
          placeholder="Search suppliers..."
          class="w-full"
        >
          <template #prefix>
            <Search class="h-4 w-4 text-gray-400" />
          </template>
        </Input>
      </div>
      <Select v-model="statusFilter">
        <SelectTrigger class="w-[140px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Selection Summary -->
    <div v-if="selectedSuppliers.length > 0" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <CheckCircle class="h-4 w-4 text-blue-600 mr-2" />
          <span class="text-sm font-medium text-blue-900">
            {{ selectedSuppliers.length }} supplier{{ selectedSuppliers.length === 1 ? '' : 's' }} selected
          </span>
        </div>
        <button
          @click="clearSelection"
          class="text-blue-600 hover:text-blue-800 text-sm"
        >
          Clear all
        </button>
      </div>
    </div>

    <!-- Suppliers List -->
    <div class="border rounded-lg max-h-96 overflow-y-auto">
      <div class="sticky top-0 bg-gray-50 border-b px-4 py-2">
        <div class="flex items-center">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartiallySelected"
            @change="toggleSelectAll"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span class="ml-3 text-sm font-medium text-gray-900">
            Select All ({{ filteredSuppliers.length }})
          </span>
        </div>
      </div>

      <div class="divide-y divide-gray-200">
        <div
          v-for="supplier in filteredSuppliers"
          :key="supplier.supplierId"
          class="flex items-center px-4 py-3 hover:bg-gray-50"
        >
          <input
            type="checkbox"
            :checked="selectedSuppliers.includes(supplier.supplierId)"
            @change="toggleSupplier(supplier.supplierId)"
            class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <div class="ml-3 flex-1">
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">{{ supplier.name }}</div>
                <div class="text-sm text-gray-600">{{ supplier.code }}</div>
                <div class="text-xs text-gray-500">{{ supplier.contactPerson }}</div>
              </div>
              <div class="text-right">
                <Badge :variant="getStatusVariant(supplier.status)">
                  {{ supplier.status }}
                </Badge>
                <div class="text-xs text-gray-500 mt-1">
                  {{ supplier.totalOrders }} orders
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="filteredSuppliers.length === 0" class="text-center py-8">
        <Building2 class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-semibold text-gray-900">No suppliers found</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Try adjusting your search terms' : 'No suppliers available' }}
        </p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end space-x-4 pt-4 border-t">
      <button
        @click="$emit('cancel')"
        class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        @click="assignSuppliers"
        :disabled="selectedSuppliers.length === 0"
        class="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Assign {{ selectedSuppliers.length }} Supplier{{ selectedSuppliers.length === 1 ? '' : 's' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSupplierStore } from '@/stores/supplier'
import type { SupplierStatus } from '@/types/supplier'

// Icons
import { Search, CheckCircle, Building2 } from 'lucide-vue-next'

// UI Components
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Props
interface Props {
  excludedSupplierIds?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  excludedSupplierIds: () => []
})

// Emits
const emit = defineEmits<{
  assign: [supplierIds: string[]]
  cancel: []
}>()

// Store
const supplierStore = useSupplierStore()
const { suppliers } = storeToRefs(supplierStore)

// Local state
const selectedSuppliers = ref<string[]>([])
const searchQuery = ref('')
const statusFilter = ref('all')

// Computed
const availableSuppliers = computed(() => {
  return suppliers.value.filter(supplier => 
    !props.excludedSupplierIds.includes(supplier.supplierId)
  )
})

const filteredSuppliers = computed(() => {
  let filtered = availableSuppliers.value

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(supplier =>
      supplier.name.toLowerCase().includes(query) ||
      supplier.code.toLowerCase().includes(query) ||
      supplier.contactPerson.toLowerCase().includes(query) ||
      supplier.email.toLowerCase().includes(query)
    )
  }

  // Apply status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(supplier => supplier.status === statusFilter.value)
  }

  return filtered
})

const isAllSelected = computed(() => {
  return filteredSuppliers.value.length > 0 && 
         filteredSuppliers.value.every(supplier => 
           selectedSuppliers.value.includes(supplier.supplierId)
         )
})

const isPartiallySelected = computed(() => {
  return selectedSuppliers.value.length > 0 && !isAllSelected.value
})

// Methods
function toggleSupplier(supplierId: string) {
  const index = selectedSuppliers.value.indexOf(supplierId)
  if (index > -1) {
    selectedSuppliers.value.splice(index, 1)
  } else {
    selectedSuppliers.value.push(supplierId)
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all filtered suppliers
    filteredSuppliers.value.forEach(supplier => {
      const index = selectedSuppliers.value.indexOf(supplier.supplierId)
      if (index > -1) {
        selectedSuppliers.value.splice(index, 1)
      }
    })
  } else {
    // Select all filtered suppliers
    filteredSuppliers.value.forEach(supplier => {
      if (!selectedSuppliers.value.includes(supplier.supplierId)) {
        selectedSuppliers.value.push(supplier.supplierId)
      }
    })
  }
}

function clearSelection() {
  selectedSuppliers.value = []
}

function assignSuppliers() {
  if (selectedSuppliers.value.length > 0) {
    emit('assign', [...selectedSuppliers.value])
  }
}

function getStatusVariant(status: SupplierStatus) {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending':
      return 'secondary'
    case 'inactive':
      return 'outline'
    case 'suspended':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Lifecycle
onMounted(async () => {
  // Fetch suppliers if not already loaded
  if (suppliers.value.length === 0) {
    await supplierStore.fetchSuppliers()
  }
})
</script>
