<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-slate-900">Sign In</h2>
      <p class="text-slate-600 mt-2">Enter your credentials to access your account</p>
    </div>
    
    <form @submit.prevent="handleLogin" class="space-y-4">
      <!-- Error Alert -->
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {{ authStore.error }}
      </div>
      
      <!-- Email Field -->
      <div class="space-y-2">
        <label for="email" class="block text-sm font-medium text-slate-700">
          Email Address
        </label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
          placeholder="Enter your email"
        />
      </div>
      
      <!-- Password Field -->
      <div class="space-y-2">
        <label for="password" class="block text-sm font-medium text-slate-700">
          Password
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
            placeholder="Enter your password"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
          >
            <Eye v-if="!showPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <!-- Remember Me & Forgot Password -->
      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            v-model="rememberMe"
            type="checkbox"
            class="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded"
          />
          <span class="ml-2 text-sm text-slate-600">Remember me</span>
        </label>
        <RouterLink
          to="/auth/forgot-password"
          class="text-sm text-slate-600 hover:text-slate-900 hover:underline"
        >
          Forgot password?
        </RouterLink>
      </div>
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoaderCircle v-if="authStore.isLoading" class="animate-spin h-4 w-4 mr-2" />
        {{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}
      </button>
    </form>
    
    <!-- Sign Up Link -->
    <div class="text-center">
      <p class="text-sm text-slate-600">
        Don't have an account?
        <RouterLink to="/auth/register" class="font-medium text-slate-900 hover:underline">
          Sign up
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, LoaderCircle } from 'lucide-vue-next'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)

const handleLogin = async () => {
  authStore.clearError()
  
  try {
    await authStore.signIn(email.value, password.value)
    router.push('/dashboard')
  } catch (error) {
    // Error is handled in the store
    console.error('Login error:', error)
  }
}
</script>
