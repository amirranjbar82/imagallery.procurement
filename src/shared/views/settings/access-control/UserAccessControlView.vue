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
            class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <RefreshCw class="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
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
        @click="refreshData"
      >
        Try Again
      </button>
    </div>

    <!-- 3-Column Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Column 1: Users List -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Users</h2>
          <span class="text-sm text-gray-600">{{ users.length }} users</span>
        </div>
        
        <!-- Search Users -->
        <div class="mb-4">
          <Input
            v-model="userSearchQuery"
            placeholder="Search users..."
            class="w-full"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-gray-400" />
            </template>
          </Input>
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
                <div class="text-sm text-gray-600">{{ user.email }}</div>
                <div class="text-xs text-gray-500 capitalize">{{ user.role }}</div>
              </div>
              <div class="text-right">
                <div class="text-sm font-medium text-gray-900">
                  {{ getUserSupplierCount(user.uid) }}
                </div>
                <div class="text-xs text-gray-500">suppliers</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredUsers.length === 0" class="text-center py-8">
          <Users class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No users found</h3>
          <p class="mt-1 text-sm text-gray-500">
            {{ userSearchQuery ? 'Try adjusting your search' : 'No users available' }}
          </p>
        </div>
      </div>

      <!-- Column 2: User's Assigned Suppliers -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">
            {{ selectedUser ? `${selectedUser.name}'s Suppliers` : 'Assigned Suppliers' }}
          </h2>
          <button
            v-if="selectedUser"
            @click="showSupplierDialog = true"
            class="bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center text-sm"
          >
            <Plus class="h-4 w-4 mr-1" />
            Add
          </button>
        </div>

        <!-- Selected User Info -->
        <div v-if="selectedUser" class="mb-4 p-3 bg-gray-50 rounded-lg">
          <div class="flex items-center">
            <User class="h-4 w-4 text-gray-600 mr-2" />
            <div>
              <div class="font-medium text-gray-900">{{ selectedUser.name }}</div>
              <div class="text-sm text-gray-600">{{ selectedUser.email }}</div>
            </div>
          </div>
        </div>

        <!-- User's Suppliers -->
        <div v-if="selectedUser" class="space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="access in selectedUserSupplierAccess"
            :key="access.id"
            @click="selectSupplier(access.supplierId)"
            :class="[
              'p-3 rounded-lg border cursor-pointer transition-colors',
              selectedSupplierId === access.supplierId
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            ]"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-gray-900">
                  {{ getSupplierName(access.supplierId) }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ getSupplierCode(access.supplierId) }}
                </div>
                <div class="flex items-center mt-1">
                  <div class="flex space-x-1">
                    <Badge
                      v-for="permission in access.permissions"
                      :key="permission"
                      variant="secondary"
                      class="text-xs"
                    >
                      {{ permission }}
                    </Badge>
                  </div>
                </div>
              </div>
              <button
                @click.stop="removeSupplierAccess(access.id)"
                class="text-red-600 hover:text-red-800"
              >
                <X class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="selectedUser && selectedUserSupplierAccess.length === 0" class="text-center py-8">
          <Building2 class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No suppliers assigned</h3>
          <p class="mt-1 text-sm text-gray-500">
            Click "Add" to assign suppliers to this user
          </p>
        </div>

        <!-- No User Selected -->
        <div v-if="!selectedUser" class="text-center py-8">
          <UserCheck class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">Select a user</h3>
          <p class="mt-1 text-sm text-gray-500">
            Choose a user from the left to manage their supplier access
          </p>
        </div>
      </div>

      <!-- Column 3: Field Permissions -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Field Permissions</h2>
          <DropdownMenu v-if="selectedUser && selectedSupplierId">
            <DropdownMenuTrigger asChild>
              <button class="bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 flex items-center text-sm">
                <Settings class="h-4 w-4 mr-1" />
                Presets
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                v-for="preset in PERMISSION_PRESETS"
                :key="preset.name"
                @click="applyPreset(preset)"
              >
                <div>
                  <div class="font-medium">{{ preset.label }}</div>
                  <div class="text-xs text-gray-500">{{ preset.description }}</div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Field Categories -->
        <div v-if="selectedUser && selectedSupplierId" class="space-y-4 max-h-80 overflow-y-auto">
          <div
            v-for="category in FIELD_CATEGORIES"
            :key="category.name"
            class="border rounded-lg p-3"
          >
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-medium text-gray-900">{{ category.label }}</h3>
              <button
                @click="toggleCategoryFields(category, !isCategoryAllVisible(category))"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                {{ isCategoryAllVisible(category) ? 'Hide All' : 'Show All' }}
              </button>
            </div>
            <div class="space-y-2">
              <div
                v-for="field in category.fields"
                :key="field.name"
                class="flex items-center justify-between"
              >
                <div class="flex-1">
                  <div class="text-sm font-medium text-gray-900">{{ field.label }}</div>
                  <div v-if="field.description" class="text-xs text-gray-500">
                    {{ field.description }}
                  </div>
                </div>
                <Switch
                  :checked="isFieldVisible(field.name)"
                  @update:checked="updateFieldPermission(field.name, $event)"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- No Selection State -->
        <div v-if="!selectedUser || !selectedSupplierId" class="text-center py-8">
          <Shield class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">Select user and supplier</h3>
          <p class="mt-1 text-sm text-gray-500">
            Choose a user and supplier to configure field permissions
          </p>
        </div>
      </div>
    </div>

    <!-- Add Suppliers Dialog -->
    <Dialog :open="showSupplierDialog" @update:open="showSupplierDialog = $event">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Suppliers</DialogTitle>
          <DialogDescription>
            Select suppliers to assign to {{ selectedUser?.name }}
          </DialogDescription>
        </DialogHeader>
        
        <SupplierSelectionDialog
          v-if="showSupplierDialog"
          :excluded-supplier-ids="selectedUserSupplierAccess.map(a => a.supplierId)"
          @assign="handleSupplierAssignment"
          @cancel="showSupplierDialog = false"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccessControlStore } from '@/stores/access-control'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useSupplierStore } from '@/modules/suppliers/stores/suppliers'
import { FIELD_CATEGORIES, PERMISSION_PRESETS } from '@/types/access-control'
import type { UserProfile } from '@/modules/auth/stores/auth'
import type { PermissionPreset } from '@/types/access-control'

// Icons
import { 
  RefreshCw, AlertCircle, Search, Users, Plus, User, Building2, 
  UserCheck, Settings, Shield, X
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

// Components
import SupplierSelectionDialog from '@/views/settings/access-control/SupplierSelectionDialog.vue'

// Stores
const accessControlStore = useAccessControlStore()
const authStore = useAuthStore()
const supplierStore = useSupplierStore()

const { 
  userSupplierAccess, 
  userFieldPermissions, 
  loading, 
  error 
} = storeToRefs(accessControlStore)

const { users } = storeToRefs(authStore)
const { suppliers } = storeToRefs(supplierStore)

// Local state
const selectedUser = ref<UserProfile | null>(null)
const selectedSupplierId = ref<string>('')
const userSearchQuery = ref('')
const showSupplierDialog = ref(false)

// Computed
const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  
  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const selectedUserSupplierAccess = computed(() => {
  if (!selectedUser.value) return []
  return accessControlStore.getUserSupplierAccess(selectedUser.value.uid)
})

// Methods
function selectUser(user: UserProfile) {
  selectedUser.value = user
  selectedSupplierId.value = ''
}

function selectSupplier(supplierId: string) {
  selectedSupplierId.value = supplierId
}

function getUserSupplierCount(userId: string): number {
  return accessControlStore.getUserSupplierAccess(userId).length
}

function getSupplierName(supplierId: string): string {
  const supplier = suppliers.value.find(s => s.supplierId === supplierId)
  return supplier?.name || 'Unknown Supplier'
}

function getSupplierCode(supplierId: string): string {
  const supplier = suppliers.value.find(s => s.supplierId === supplierId)
  return supplier?.code || 'N/A'
}

function isFieldVisible(fieldName: string): boolean {
  if (!selectedUser.value || !selectedSupplierId.value) return false
  return accessControlStore.isFieldVisible(selectedUser.value.uid, fieldName, selectedSupplierId.value)
}

function isCategoryAllVisible(category: any): boolean {
  return category.fields.every((field: any) => isFieldVisible(field.name))
}

async function updateFieldPermission(fieldName: string, visible: boolean) {
  if (!selectedUser.value || !selectedSupplierId.value) return
  
  // Find existing permission
  const existing = userFieldPermissions.value.find(
    p => p.userId === selectedUser.value!.uid && 
         p.fieldName === fieldName && 
         p.supplierId === selectedSupplierId.value
  )

  if (existing) {
    await accessControlStore.updateUserFieldPermission({
      id: existing.id,
      visible
    })
  } else {
    await accessControlStore.createUserFieldPermission({
      userId: selectedUser.value.uid,
      supplierId: selectedSupplierId.value,
      fieldName,
      visible
    })
  }
}

async function toggleCategoryFields(category: any, visible: boolean) {
  if (!selectedUser.value || !selectedSupplierId.value) return
  
  for (const field of category.fields) {
    await updateFieldPermission(field.name, visible)
  }
}

async function applyPreset(preset: PermissionPreset) {
  if (!selectedUser.value || !selectedSupplierId.value) return
  
  await accessControlStore.applyPermissionPreset(
    selectedUser.value.uid,
    selectedSupplierId.value,
    preset
  )
}

async function handleSupplierAssignment(supplierIds: string[]) {
  if (!selectedUser.value) return
  
  await accessControlStore.bulkAssignSuppliers(selectedUser.value.uid, supplierIds)
  showSupplierDialog.value = false
}

async function removeSupplierAccess(accessId: string) {
  await accessControlStore.deleteUserSupplierAccess(accessId)
  
  // Clear selected supplier if it was removed
  const removedAccess = userSupplierAccess.value.find(a => a.id === accessId)
  if (removedAccess && selectedSupplierId.value === removedAccess.supplierId) {
    selectedSupplierId.value = ''
  }
}

async function refreshData() {
  await Promise.all([
    accessControlStore.fetchUserSupplierAccess(),
    accessControlStore.fetchUserFieldPermissions(),
    authStore.fetchUsers(),
    supplierStore.fetchSuppliers()
  ])
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>
