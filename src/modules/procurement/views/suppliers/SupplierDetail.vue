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

      <!-- Tabbed Content -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <Tabs :default-value="activeTab" @update:value="activeTab = $event" class="w-full">
          <TabsList class="grid w-full grid-cols-7 rounded-none border-b">
            <TabsTrigger value="overview" class="rounded-none">Overview</TabsTrigger>
            <TabsTrigger value="documents" class="rounded-none">Documents</TabsTrigger>
            <TabsTrigger value="communication" class="rounded-none">Communication</TabsTrigger>
            <TabsTrigger value="custom-fields" class="rounded-none">Custom Fields</TabsTrigger>
            <TabsTrigger value="excel-import" class="rounded-none">Excel Import</TabsTrigger>
            <TabsTrigger value="box-labels" class="rounded-none">Box Labels</TabsTrigger>
            <TabsTrigger value="activity" class="rounded-none">Activity</TabsTrigger>
          </TabsList>

          <!-- Overview Tab -->
          <TabsContent value="overview" class="p-6">
            <div class="grid gap-6 lg:grid-cols-2">
              <!-- Contact Information -->
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center">
                    <User class="mr-2 h-5 w-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex items-center">
                    <User class="h-4 w-4 text-gray-600 mr-3" />
                    <div>
                      <div class="font-medium">{{ supplier.contactPerson }}</div>
                      <div class="text-sm text-muted-foreground">Contact Person</div>
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
                      <div class="text-sm text-muted-foreground">Email</div>
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
                      <div class="text-sm text-muted-foreground">Phone</div>
                    </div>
                  </div>
                  
                  <div class="flex items-center">
                    <MessageSquare class="h-4 w-4 text-gray-600 mr-3" />
                    <div>
                      <div class="font-medium capitalize">{{ supplier.communicationPlatform }}</div>
                      <div class="text-sm text-muted-foreground">Preferred Platform</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Address Information -->
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center">
                    <MapPin class="mr-2 h-5 w-5" />
                    Address
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div class="flex items-start">
                    <MapPin class="h-4 w-4 text-gray-600 mr-3 mt-1" />
                    <div>
                      <div class="font-medium">{{ supplier.address.street }}</div>
                      <div class="text-muted-foreground">
                        {{ supplier.address.city }}, {{ supplier.address.state }}
                      </div>
                      <div class="text-muted-foreground">
                        {{ supplier.address.country }} {{ supplier.address.postalCode }}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <!-- Financial Information -->
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center">
                    <DollarSign class="mr-2 h-5 w-5" />
                    Financial Information
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Payment Terms</span>
                    <span class="font-medium">{{ supplier.paymentTerms }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Currency</span>
                    <span class="font-medium">{{ supplier.currency }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Tax ID</span>
                    <span class="font-medium">{{ supplier.taxId }}</span>
                  </div>
                </CardContent>
              </Card>

              <!-- Bank Details -->
              <Card>
                <CardHeader>
                  <CardTitle class="flex items-center">
                    <FileText class="mr-2 h-5 w-5" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Bank Name</span>
                    <span class="font-medium">{{ supplier.bankDetails?.bankName || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Account Number</span>
                    <span class="font-medium font-mono">{{ supplier.bankDetails?.accountNumber || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Routing Number</span>
                    <span class="font-medium font-mono">{{ supplier.bankDetails?.routingNumber || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">SWIFT Code</span>
                    <span class="font-medium font-mono">{{ supplier.bankDetails?.swiftCode || 'N/A' }}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <!-- Documents Tab -->
          <TabsContent value="documents" class="p-0">
            <DocumentManager :supplier-id="supplier.supplierId" />
          </TabsContent>

          <!-- Communication Tab -->
          <TabsContent value="communication" class="p-0">
            <CommunicationCenter :supplier-id="supplier.supplierId" />
          </TabsContent>

          <!-- Custom Fields Tab -->
          <TabsContent value="custom-fields" class="p-0">
            <CustomFieldsManager :supplier-id="supplier.supplierId" />
          </TabsContent>

          <!-- Excel Import Tab -->
          <TabsContent value="excel-import" class="p-0">
            <ExcelImportManager :supplier-id="supplier.supplierId" />
          </TabsContent>

          <!-- Box Labels Tab -->
          <TabsContent value="box-labels" class="p-0">
            <BoxLabelGenerator :supplier-id="supplier.supplierId" />
          </TabsContent>

          <!-- Activity Tab -->
          <TabsContent value="activity" class="p-6">
            <div class="space-y-4">
              <h3 class="text-lg font-medium">Recent Activity</h3>
              <div class="space-y-4">
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="font-medium">Order #ORD-2024-001 Completed</div>
                    <div class="text-sm text-muted-foreground">2 hours ago</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="font-medium">Payment Received</div>
                    <div class="text-sm text-muted-foreground">1 day ago</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="font-medium">Document Updated</div>
                    <div class="text-sm text-muted-foreground">3 days ago</div>
                  </div>
                </div>
                
                <div class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="font-medium">Supplier Created</div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatDateTime(supplier.createdAt) }} by Admin
                    </div>
                  </div>
                </div>
                
                <div v-if="supplier.updatedAt.getTime() !== supplier.createdAt.getTime()" class="flex items-center space-x-3">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div class="flex-1">
                    <div class="font-medium">Last Updated</div>
                    <div class="text-sm text-muted-foreground">
                      {{ formatDateTime(supplier.updatedAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier, SupplierStatus } from '@/modules/procurement/types/supplier'

// Advanced Components
import DocumentManager from '@/modules/procurement/components/suppliers/DocumentManager.vue'
import CommunicationCenter from '@/modules/procurement/components/suppliers/CommunicationCenter.vue'
import CustomFieldsManager from '@/modules/procurement/components/suppliers/CustomFieldsManager.vue'
import ExcelImportManager from '@/modules/procurement/components/suppliers/ExcelImportManager.vue'
import BoxLabelGenerator from '@/modules/procurement/components/suppliers/BoxLabelGenerator.vue'

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/index'
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

// Local State
const activeTab = ref('overview')

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
