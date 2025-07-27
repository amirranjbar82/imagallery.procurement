<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">User Access Control</h1>
          <p class="text-gray-600 mt-1">Manage user permissions for suppliers and field visibility</p>
        </div>
        <div class="flex items-center space-x-2">
          <button 
            @click="refreshData"
            :disabled="isLoading"
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center disabled:opacity-50"
          >
            <RefreshCw :class="['h-4 w-4 mr-2', isLoading && 'animate-spin']" />
            Refresh
          </button>
        </div>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <AlertCircle class="h-5 w-5 text-red-500 mr-2" />
        <span class="text-red-700">{{ error }}</span>
      </div>
    </div>

    <!-- 3-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Column 1: Users List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <Users class="h-5 w-5 mr-2" />
            Users
          </h2>
          <span class="text-sm text-gray-500">{{ users.length }} total</span>
        </div>

        <!-- Search Users -->
        <div class="relative mb-4">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            v-model="userSearchQuery"
            placeholder="Search users..."
            class="pl-10"
          />
        </div>

        <!-- Users List -->
        <div class="space-y-2 max-h-96 overflow-y-auto">
          <div
            v-for="user in filteredUsers"
            :key="user.uid"
            @click="selectUser(user)"
            :class="[
              'p-3 rounded-lg border cursor-pointer transition-colors',
              selectedUser?.uid === user.uid
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">{{ user.name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </div>
              <div class="flex flex-col items-end">
                <Badge :variant="getRoleBadgeVariant(user.role)">
                  {{ user.role }}
                </Badge>
                <div class="text-xs text-gray-400 mt-1">
                  {{ getUserSupplierCount(user.uid) }} suppliers
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-8">
          <User class="h-12 w-12 mx-auto text-gray-300 mb-3" />
          <p class="text-gray-500">No users found</p>
        </div>
      </div>

      <!-- Column 2: User's Assigned Suppliers -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <Building2 class="h-5 w-5 mr-2" />
            Assigned Suppliers
          </h2>
          <button
            v-if="selectedUser"
            @click="openSupplierSelection"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus class="h-4 w-4 mr-1" />
            Add
          </button>
        </div>

        <div v-if="!selectedUser" class="text-center py-12">
          <UserCheck class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500">Select a user to view their assigned suppliers</p>
        </div>

        <div v-else>
          <!-- User Info -->
          <div class="bg-gray-50 rounded-lg p-3 mb-4">
            <div class="font-medium text-gray-900">{{ selectedUser.name }}</div>
            <div class="text-sm text-gray-500">{{ selectedUser.email }}</div>
            <Badge :variant="getRoleBadgeVariant(selectedUser.role)" class="mt-1">
              {{ selectedUser.role }}
            </Badge>
          </div>

          <!-- Assigned Suppliers List -->
          <div class="space-y-2 max-h-80 overflow-y-auto">
            <div
              v-for="supplierAccess in selectedUserSuppliers"
              :key="supplierAccess.supplierId"
              @click="selectSupplier(supplierAccess.supplierId)"
              :class="[
                'p-3 rounded-lg border cursor-pointer transition-colors',
                selectedSupplierId === supplierAccess.supplierId
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              ]"
            >
              <div class="flex items-center justify-between">
                <div>
                  <div class="font-medium text-gray-900">
                    {{ getSupplierName(supplierAccess.supplierId) }}
                  </div>
                  <div class="text-sm text-gray-500">
                    {{ supplierAccess.permissions.join(', ') }}
                  </div>
                </div>
                <button
                  @click.stop="removeSupplierAccess(supplierAccess.supplierId)"
                  class="text-red-500 hover:text-red-700 p-1"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="selectedUserSuppliers.length === 0" class="text-center py-8">
            <Building2 class="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p class="text-gray-500">No suppliers assigned</p>
            <button
              @click="openSupplierSelection"
              class="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add suppliers
            </button>
          </div>
        </div>
      </div>

      <!-- Column 3: Field Permissions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center">
            <Shield class="h-5 w-5 mr-2" />
            Field Permissions
          </h2>
          <DropdownMenu v-if="selectedUser && selectedSupplierId">
            <DropdownMenuTrigger as-child>
              <button class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center">
                <Settings class="h-4 w-4 mr-1" />
                Presets
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                v-for="preset in PERMISSION_PRESETS"
                :key="preset.name"
                @click="applyPreset(preset.name)"
              >
                {{ preset.label }}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div v-if="!selectedUser || !selectedSupplierId" class="text-center py-12">
          <Shield class="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <p class="text-gray-500">
            {{ !selectedUser ? 'Select a user and supplier' : 'Select a supplier' }}
            to configure field permissions
          </p>
        </div>

        <div v-else class="space-y-4">
          <!-- Selected Context -->
          <div class="bg-gray-50 rounded-lg p-3 text-sm">
            <div class="font-medium text-gray-900">{{ selectedUser.name }}</div>
            <div class="text-gray-600">{{ getSupplierName(selectedSupplierId) }}</div>
          </div>

          <!-- Field Categories -->
          <div
            v-for="category in FIELD_CATEGORIES"
            :key="category.name"
            class="border border-gray-200 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-900">{{ category.label }}</h3>
              <div class="text-xs text-gray-500">
                {{ getVisibleFieldsCount(category.fields) }}/{{ category.fields.length }} visible
              </div>
            </div>
            
            <div class="space-y-2">
              <div
                v-for="field in category.fields"
                :key="field.name"
                class="flex items-center justify-between py-1"
              >
                <label class="text-sm text-gray-700 cursor-pointer" :for="`field-${field.name}`">
                  {{ field.label }}
                </label>
                <Switch
                  :id="`field-${field.name}`"
                  :checked="isFieldVisible(field.name)"
                  @update:checked="toggleFieldVisibility(field.name, $event)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Supplier Selection Dialog -->
    <Dialog :open="showSupplierDialog" @update:open="showSupplierDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Suppliers</DialogTitle>
          <DialogDescription>
            Select suppliers to assign to {{ selectedUser?.name }}
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <!-- Search -->
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              v-model="supplierSearchQuery"
              placeholder="Search suppliers..."
              class="pl-10"
            />
          </div>

          <!-- Suppliers List -->
          <div class="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div
              v-for="supplier in filteredAvailableSuppliers"
              :key="supplier.supplierId"
              @click="toggleSupplierSelection(supplier.supplierId)"
              :class="[
                'p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 flex items-center justify-between',
                selectedSupplierIds.includes(supplier.supplierId) && 'bg-blue-50'
              ]"
            >
              <div>
                <div class="font-medium text-gray-900">{{ supplier.name }}</div>
                <div class="text-sm text-gray-500">{{ supplier.code }}</div>
              </div>
              <CheckCircle
                v-if="selectedSupplierIds.includes(supplier.supplierId)"
                class="h-5 w-5 text-blue-600"
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-2">
            <button
              @click="showSupplierDialog = false"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              @click="assignSelectedSuppliers"
              :disabled="selectedSupplierIds.length === 0"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Assign {{ selectedSupplierIds.length }} Suppliers
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSupplierStore } from '@/stores/supplier'
import { useAccessControlStore } from '@/stores/access-control'
import type { UserProfile } from '@/stores/auth'
import { FIELD_CATEGORIES, PERMISSION_PRESETS } from '@/types/access-control'

// Icons
import { 
  RefreshCw, AlertCircle, Search, Users, Plus, User, Building2, 
  UserCheck, Settings, Shield, X, CheckCircle
} from 'lucide-vue-next'

// UI Components
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Switch from '@/components/ui/switch.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Stores
const authStore = useAuthStore()
const supplierStore = useSupplierStore()
const accessControlStore = useAccessControlStore()

const { users, isLoading, error } = storeToRefs(authStore)
const { suppliers } = storeToRefs(supplierStore)
const { userSupplierAccess, userFieldPermissions } = storeToRefs(accessControlStore)

// Local state
const selectedUser = ref<UserProfile | null>(null)
const selectedSupplierId = ref<string | null>(null)
const userSearchQuery = ref('')
const supplierSearchQuery = ref('')
const showSupplierDialog = ref(false)
const selectedSupplierIds = ref<string[]>([])

// Computed
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const selectedUserSuppliers = computed(() => {
  if (!selectedUser.value) return []
  return userSupplierAccess.value.filter(access => access.userId === selectedUser.value!.uid)
})

const filteredAvailableSuppliers = computed(() => {
  const assignedSupplierIds = selectedUserSuppliers.value.map(access => access.supplierId)
  const available = suppliers.value.filter(supplier => !assignedSupplierIds.includes(supplier.supplierId))
  
  if (!supplierSearchQuery.value) return available
  const query = supplierSearchQuery.value.toLowerCase()
  return available.filter(supplier => 
    supplier.name.toLowerCase().includes(query) ||
    supplier.code.toLowerCase().includes(query)
  )
})

// Methods
function selectUser(user: UserProfile) {
  selectedUser.value = user
  selectedSupplierId.value = null
}

function selectSupplier(supplierId: string) {
  selectedSupplierId.value = supplierId
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case 'admin': return 'destructive'
    case 'manager': return 'default'
    case 'user': return 'secondary'
    case 'viewer': return 'outline'
    default: return 'secondary'
  }
}

function getUserSupplierCount(userId: string): number {
  return userSupplierAccess.value.filter(access => access.userId === userId).length
}

function getSupplierName(supplierId: string): string {
  const supplier = suppliers.value.find(s => s.supplierId === supplierId)
  return supplier?.name || 'Unknown Supplier'
}

function getVisibleFieldsCount(fields: any[]): number {
  if (!selectedUser.value || !selectedSupplierId.value) return 0
  return fields.filter(field => isFieldVisible(field.name)).length
}

function isFieldVisible(fieldName: string): boolean {
  if (!selectedUser.value || !selectedSupplierId.value) return false
  
  const permission = userFieldPermissions.value.find(
    p => p.userId === selectedUser.value!.uid && 
        p.supplierId === selectedSupplierId.value &&
        p.fieldName === fieldName
  )
  
  return permission?.visible || false
}

async function toggleFieldVisibility(fieldName: string, isVisible: boolean) {
  if (!selectedUser.value || !selectedSupplierId.value) return
  
  // Find existing permission or create new one
  const existingPermission = userFieldPermissions.value.find(
    p => p.userId === selectedUser.value!.uid && 
        p.supplierId === selectedSupplierId.value &&
        p.fieldName === fieldName
  )
  
  try {
    if (existingPermission) {
      // Update existing permission
      await accessControlStore.updateUserFieldPermission({
        id: existingPermission.id,
        visible: isVisible
      })
    } else {
      // Create new permission
      await accessControlStore.createUserFieldPermission({
        userId: selectedUser.value.uid,
        supplierId: selectedSupplierId.value,
        fieldName,
        visible: isVisible
      })
    }
  } catch (error) {
    console.error('Failed to toggle field visibility:', error)
  }
}

function openSupplierSelection() {
  selectedSupplierIds.value = []
  supplierSearchQuery.value = ''
  showSupplierDialog.value = true
}

function toggleSupplierSelection(supplierId: string) {
  const index = selectedSupplierIds.value.indexOf(supplierId)
  if (index > -1) {
    selectedSupplierIds.value.splice(index, 1)
  } else {
    selectedSupplierIds.value.push(supplierId)
  }
}

async function assignSelectedSuppliers() {
  if (!selectedUser.value || selectedSupplierIds.value.length === 0) return
  
  try {
    // Create individual supplier access records
    for (const supplierId of selectedSupplierIds.value) {
      await accessControlStore.createUserSupplierAccess({
        userId: selectedUser.value.uid,
        supplierId,
        permissions: ['read', 'write']
      })
    }
    showSupplierDialog.value = false
    selectedSupplierIds.value = []
  } catch (error) {
    console.error('Failed to assign suppliers:', error)
  }
}

async function removeSupplierAccess(supplierId: string) {
  if (!selectedUser.value) return
  
  try {
    const accessRecord = userSupplierAccess.value.find(
      access => access.userId === selectedUser.value!.uid && access.supplierId === supplierId
    )
    if (accessRecord) {
      await accessControlStore.deleteUserSupplierAccess(accessRecord.id)
      if (selectedSupplierId.value === supplierId) {
        selectedSupplierId.value = null
      }
    }
  } catch (error) {
    console.error('Failed to remove supplier access:', error)
  }
}

async function applyPreset(presetName: string) {
  if (!selectedUser.value || !selectedSupplierId.value) return
  
  try {
    const preset = PERMISSION_PRESETS.find(p => p.name === presetName)
    if (preset) {
      await accessControlStore.applyPermissionPreset(
        selectedUser.value.uid,
        selectedSupplierId.value,
        preset
      )
    }
  } catch (error) {
    console.error('Failed to apply preset:', error)
  }
}

async function refreshData() {
  try {
    await Promise.all([
      authStore.fetchUsers(),
      supplierStore.fetchSuppliers(),
      accessControlStore.fetchUserSupplierAccess(),
      accessControlStore.fetchUserFieldPermissions()
    ])
  } catch (error) {
    console.error('Failed to refresh data:', error)
  }
}

// Initialize
onMounted(() => {
  refreshData()
})
</script>
