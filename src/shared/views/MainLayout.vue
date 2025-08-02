<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <div :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out',
      sidebarOpen ? 'translate-x-0' : '-translate-x-full',
      'lg:translate-x-0'
    ]">
      <div class="flex flex-col h-screen">
        <!-- Logo -->
        <div class="flex items-center justify-between h-20 px-6 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center">
            <img src="/logo.webp" alt="ImaGallery" class="h-16 w-auto" />
          </div>
          <button @click="sidebarOpen = false" class="lg:hidden p-1 rounded-md hover:bg-gray-100">
            <X class="h-5 w-5" />
          </button>
        </div>

        <!-- Navigation -->
        <AccordionNavigation 
          :current-route="$route.name" 
          :user-role="authStore.userProfile?.role"
          @item-click="sidebarOpen = false" 
        />

        <!-- User Menu -->
        <div class="border-t border-gray-200 p-4 relative flex-shrink-0">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <div class="h-8 w-8 bg-slate-900 rounded-full flex items-center justify-center">
                <span class="text-sm font-medium text-white">
                  {{ userInitials }}
                </span>
              </div>
            </div>
            <div class="ml-3 flex-1">
              <p class="text-sm font-medium text-gray-900">
                {{ authStore.userProfile?.name }}
              </p>
              <p class="text-xs text-gray-500 capitalize">
                {{ authStore.userProfile?.role }}
              </p>
            </div>
            <button @click="showUserMenu = !showUserMenu" class="ml-3 p-1 rounded-md hover:bg-gray-100">
              <MoreHorizontal class="h-4 w-4" />
            </button>
          </div>
          
          <!-- User Dropdown - positioned within sidebar -->
          <div v-if="showUserMenu" class="absolute bottom-full left-4 right-4 mb-2 py-2 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            <button @click="handleSignOut"
              class="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
              <LogOut class="h-4 w-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile overlay -->
    <div v-if="sidebarOpen" @click="sidebarOpen = false" class="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden">
    </div>

    <!-- User menu backdrop -->
    <div v-if="showUserMenu" @click="showUserMenu = false" class="fixed inset-0 z-30"></div>

    <!-- Main content -->
    <div class="flex-1 flex flex-col lg:ml-64">
      <!-- Top bar -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="flex items-center justify-between h-16 px-4 sm:px-6">
          <div class="flex items-center">
            <button @click="sidebarOpen = true" class="lg:hidden p-2 rounded-md hover:bg-gray-100">
              <Menu class="h-5 w-5" />
            </button>
            <h2 class="ml-2 text-lg font-semibold text-gray-900">
              {{ currentPageTitle }}
            </h2>
          </div>

          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <Bell class="h-5 w-5" />
            </button>

            <!-- Search -->
            <button class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md">
              <Search class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main class="flex-1 p-6">
        <RouterView :key="$route.fullPath" />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import {
  Menu,
  X,
  MoreHorizontal,
  LogOut,
  Bell,
  Search
} from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { auth } from '@/lib/firebase'
import AccordionNavigation from '../components/AccordionNavigation.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarOpen = ref(false)
const showUserMenu = ref(false)



const currentPageTitle = computed(() => {
  return route.meta.title as string || 'Dashboard'
})

const userInitials = computed(() => {
  if (!authStore.userProfile?.name) return 'U'
  return authStore.userProfile.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

const handleSignOut = async () => {
  try {
    await authStore.signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error('Sign out error:', error)
  }
}

// Set up auth state listener
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    authStore.setUser(user)
  })
})
</script>
