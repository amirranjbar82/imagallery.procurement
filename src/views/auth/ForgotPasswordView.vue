<template>
  <div class="space-y-6">
    <div class="text-center">
      <h2 class="text-2xl font-bold text-slate-900">Reset Password</h2>
      <p class="text-slate-600 mt-2">Enter your email to receive a password reset link</p>
    </div>
    
    <form v-if="!emailSent" @submit.prevent="handleResetPassword" class="space-y-4">
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
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.isLoading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoaderCircle v-if="authStore.isLoading" class="animate-spin h-4 w-4 mr-2" />
        {{ authStore.isLoading ? 'Sending...' : 'Send Reset Link' }}
      </button>
    </form>
    
    <!-- Success Message -->
    <div v-else class="text-center space-y-4">
      <div class="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle class="h-8 w-8 text-emerald-600" />
      </div>
      <div>
        <h3 class="text-lg font-medium text-slate-900">Check your email</h3>
        <p class="text-slate-600 mt-2">
          We've sent a password reset link to
          <span class="font-medium">{{ email }}</span>
        </p>
      </div>
      <button
        @click="emailSent = false"
        class="text-sm text-slate-600 hover:text-slate-900 hover:underline"
      >
        Didn't receive the email? Try again
      </button>
    </div>
    
    <!-- Back to Login -->
    <div class="text-center">
      <RouterLink to="/auth/login" class="text-sm text-slate-600 hover:text-slate-900 hover:underline flex items-center justify-center">
        <ArrowLeft class="h-4 w-4 mr-2" />
        Back to Sign In
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CheckCircle, LoaderCircle, ArrowLeft } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const emailSent = ref(false)

const handleResetPassword = async () => {
  authStore.clearError()
  
  try {
    await authStore.resetPassword(email.value)
    emailSent.value = true
  } catch (error) {
    // Error is handled in the store
    console.error('Password reset error:', error)
  }
}
</script>
