<template>
  <div>
    <!-- Supplier Details -->
    <div v-if="supplier" class="space-y-4">
      <!-- Header -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <button 
              @click="$emit('back')"
              class="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeft class="h-4 w-4 mr-2" />
              Back
            </button>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">{{ supplier.name }}</h1>
              <p class="text-gray-600 mt-1">{{ supplier.code }}</p>
            </div>
            <Badge :variant="getStatusVariant(supplier.status)">
              {{ supplier.status }}
            </Badge>
          </div>
          
          <div class="flex items-center space-x-2">
            <button 
              @click="navigateToDocuments"
              class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
            >
              <FileText class="h-4 w-4 mr-2" />
              Documents
            </button>
            <button 
              @click="$emit('edit', supplier)"
              class="bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-800 flex items-center"
            >
              <Edit class="h-4 w-4 mr-2" />
              Edit
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @click="toggleStatus">
                  <Power class="mr-2 h-4 w-4" />
                  {{ supplier.status === 'active' ? 'Deactivate' : 'Activate' }}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="exportSupplier">
                  <Download class="mr-2 h-4 w-4" />
                  Export Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <ShoppingCart class="h-5 w-5 text-blue-600" />
            <span class="ml-2 text-sm font-medium text-gray-600">Total Orders</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 mt-2">{{ supplier.totalOrders }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <DollarSign class="h-5 w-5 text-green-600" />
            <span class="ml-2 text-sm font-medium text-gray-600">Total Spend</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 mt-2">${{ formatCurrency(supplier.totalSpend) }}</div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <Star class="h-5 w-5 text-yellow-600" />
            <span class="ml-2 text-sm font-medium text-gray-600">Rating</span>
          </div>
          <div class="flex items-center mt-2">
            <div class="text-2xl font-bold text-gray-900 mr-2">{{ supplier.rating || 0 }}</div>
            <div class="flex">
              <Star 
                v-for="i in 5" 
                :key="i"
                class="h-4 w-4"
                :class="i <= (supplier.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'"
              />
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div class="flex items-center">
            <Calendar class="h-5 w-5 text-purple-600" />
            <span class="ml-2 text-sm font-medium text-gray-600">Member Since</span>
          </div>
          <div class="text-2xl font-bold text-gray-900 mt-2">{{ formatDate(supplier.createdAt) }}</div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="grid gap-4 lg:grid-cols-2">
        <!-- Contact Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
          <div class="space-y-4">
            <div class="flex items-center">
              <User class="h-4 w-4 text-gray-600 mr-3" />
              <div>
                <div class="font-medium">{{ supplier.contactPerson }}</div>
                <div class="text-sm text-gray-600">Primary Contact</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <Mail class="h-4 w-4 text-gray-600 mr-3" />
              <div>
                <a 
                  :href="`mailto:${supplier.email}`"
                  class="font-medium text-blue-600 hover:text-blue-800"
                >
                  {{ supplier.email }}
                </a>
                <div class="text-sm text-gray-600">Email</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <Phone class="h-4 w-4 text-gray-600 mr-3" />
              <div>
                <a 
                  :href="`tel:${supplier.phone}`"
                  class="font-medium text-blue-600 hover:text-blue-800"
                >
                  {{ supplier.phone }}
                </a>
                <div class="text-sm text-gray-600">Phone</div>
              </div>
            </div>
            
            <div class="flex items-center">
              <MessageSquare class="h-4 w-4 text-gray-600 mr-3" />
              <div>
                <div class="font-medium capitalize">{{ supplier.communicationPlatform }}</div>
                <div class="text-sm text-gray-600">Preferred Platform</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Address Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Address</h2>
          <div class="flex items-start">
            <MapPin class="h-4 w-4 text-gray-600 mr-3 mt-1" />
            <div>
              <div class="font-medium">{{ supplier.address.street }}</div>
              <div class="text-gray-600">
                {{ supplier.address.city }}, {{ supplier.address.state }}
              </div>
              <div class="text-gray-600">
                {{ supplier.address.country }} {{ supplier.address.postalCode }}
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Payment Terms</span>
              <span class="font-medium">{{ supplier.paymentTerms }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Currency</span>
              <span class="font-medium">{{ supplier.currency }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Tax ID</span>
              <span class="font-medium">{{ supplier.taxId }}</span>
            </div>
          </div>
        </div>

        <!-- Bank Details -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Bank Details</h2>
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Bank Name</span>
              <span class="font-medium">{{ supplier.bankDetails?.bankName }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Account Number</span>
              <span class="font-medium font-mono">{{ supplier.bankDetails?.accountNumber }}</span>
            </div>  
            <div class="flex items-center justify-between">
              <span class="text-gray-600">Routing Number</span>
              <span class="font-medium font-mono">{{ supplier.bankDetails?.routingNumber }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-gray-600">SWIFT Code</span>
              <span class="font-medium font-mono">{{ supplier.bankDetails?.swiftCode }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h2>
        <div class="space-y-4">
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            <div class="flex-1">
              <div class="font-medium">Supplier Created</div>
              <div class="text-sm text-gray-600">
                {{ formatDateTime(supplier.createdAt) }} by Admin
              </div>
            </div>
          </div>
          
          <div v-if="supplier.updatedAt.getTime() !== supplier.createdAt.getTime()" class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div class="flex-1">
              <div class="font-medium">Last Updated</div>
              <div class="text-sm text-gray-600">
                {{ formatDateTime(supplier.updatedAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier, SupplierStatus } from '@/modules/procurement/types/supplier'

// Icons
import { 
  ArrowLeft, Edit, MoreHorizontal, Power, Download, ShoppingCart,
  DollarSign, Star, Calendar, User, Mail, Phone, MessageSquare,
  MapPin, AlertCircle, FileText
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
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
  back: []
  edit: [supplier: Supplier]
}>()

// Router and Store
const router = useRouter()
const supplierStore = useSupplierStore()
const { selectedSupplier: supplier, loading, error } = storeToRefs(supplierStore)

// Methods
function navigateToDocuments() {
  if (supplier.value) {
    router.push(`/suppliers/${supplier.value.supplierId}/documents`)
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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short'
  }).format(date)
}

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

async function toggleStatus() {
  if (!supplier.value) return
  
  const newStatus: SupplierStatus = supplier.value.status === 'active' ? 'inactive' : 'active'
  await supplierStore.updateSupplier({
    supplierId: supplier.value.supplierId,
    status: newStatus
  })
}

function exportSupplier() {
  if (!supplier.value) return
  
  // Create a simple JSON export for now
  const dataStr = JSON.stringify(supplier.value, null, 2)
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
  
  const exportFileDefaultName = `supplier-${supplier.value.code}.json`
  
  const linkElement = document.createElement('a')
  linkElement.setAttribute('href', dataUri)
  linkElement.setAttribute('download', exportFileDefaultName)
  linkElement.click()
}
</script>
