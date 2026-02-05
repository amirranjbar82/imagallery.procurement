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

    <!-- 2-Column Layout -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div class="text-xs text-gray-500 capitalize">{{ user.role || 'user' }}</div>
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

      <!-- Column 2: User Details -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div v-if="!selectedUser" class="text-center py-12">
          <Users class="mx-auto h-12 w-12 text-gray-400" />
          <h3 class="mt-2 text-sm font-semibold text-gray-900">No user selected</h3>
          <p class="mt-1 text-sm text-gray-500">
            Select a user to view details
          </p>
        </div>

        <div v-else>
          <div class="mb-6">
            <h2 class="text-lg font-semibold text-gray-900">{{ selectedUser.name }}</h2>
            <p class="text-sm text-gray-600">{{ selectedUser.email }}</p>
            <div class="mt-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {{ selectedUser.role }}
              </span>
            </div>
          </div>

          <div class="space-y-4">
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-2">User Information</h3>
              <div class="bg-gray-50 p-4 rounded-lg">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-xs text-gray-500">Email</p>
                    <p class="text-sm font-medium text-gray-900">{{ selectedUser.email }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Role</p>
                    <p class="text-sm font-medium text-gray-900 capitalize">{{ selectedUser.role }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Status</p>
                    <p class="text-sm font-medium text-gray-900">Active</p>
                  </div>
                  <div>
                    <p class="text-xs text-gray-500">Last Active</p>
                    <p class="text-sm font-medium text-gray-900">
                      {{ selectedUser.lastSignInTime ? new Date(selectedUser.lastSignInTime).toLocaleString() : 'Never' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { Search, Users, AlertCircle, RefreshCw } from 'lucide-vue-next'

// UI Components
import { Input } from '@/components/ui/input'

// Stores
const authStore = useAuthStore()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const selectedUser = ref<any>(null)
const userSearchQuery = ref('')

// Computed
const users = computed(() => {
  const profile = authStore.userProfile
  return profile ? [{
    uid: profile.uid,
    name: profile.name || 'User',
    email: profile.email || '',
    role: profile.role || 'user',
    lastSignInTime: profile.updatedAt
  }] : []
})

const filteredUsers = computed(() => {
  if (!userSearchQuery.value) return users.value
  const query = userSearchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query) ||
    user.role.toLowerCase().includes(query)
  )
})

// Methods
const selectUser = (user: any) => {
  selectedUser.value = user
}

const refreshData = async () => {
  try {
    loading.value = true
    error.value = null
    // No need to fetch users as we're just using the current user
  } catch (err) {
    console.error('Failed to load user data:', err)
    error.value = 'Failed to load user data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  refreshData()
})
</script>
