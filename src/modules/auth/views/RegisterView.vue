<template>
  <div class="space-y-6">
    <!-- Success Message -->
    <div v-if="showSuccessMessage" class="text-center space-y-4">
      <div class="flex justify-center">
        <div class="p-3 bg-green-100 rounded-full">
          <CheckCircle class="h-8 w-8 text-green-600" />
        </div>
      </div>
      <h2 class="text-2xl font-bold text-slate-900">Registration Successful!</h2>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <p class="text-blue-800 font-medium mb-2">Account Created Successfully</p>
        <p class="text-blue-700">
          Your registration was successful. To get access, please contact the system administrator.
        </p>
      </div>
      <div class="text-center">
        <p class="text-sm text-slate-600">
          Already have access?
          <RouterLink to="/auth/login" class="font-medium text-slate-900 hover:underline">
            Sign in
          </RouterLink>
        </p>
      </div>
    </div>

    <!-- Registration Form -->
    <div v-else>
      <div class="text-center">
        <h2 class="text-2xl font-bold text-slate-900">Create Account</h2>
        <p class="text-slate-600 mt-2">Join our procurement platform</p>
      </div>
    
    <form @submit.prevent="handleRegister" class="space-y-4">
      <!-- Error Alert -->
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {{ authStore.error }}
      </div>
      
      <!-- Name Field -->
      <div class="space-y-2">
        <label for="name" class="block text-sm font-medium text-slate-700">
          Full Name
        </label>
        <input
          id="name"
          v-model="name"
          type="text"
          required
          class="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
          placeholder="Enter your full name"
        />
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
            minlength="6"
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
        <p class="text-xs text-slate-500">Password must be at least 6 characters long</p>
      </div>
      
      <!-- Confirm Password Field -->
      <div class="space-y-2">
        <label for="confirmPassword" class="block text-sm font-medium text-slate-700">
          Confirm Password
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            class="w-full px-3 py-2 pr-10 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-600 focus:border-slate-600"
            :class="{ 'border-red-300': confirmPassword && password !== confirmPassword }"
            placeholder="Confirm your password"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
          >
            <Eye v-if="!showConfirmPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
        <p v-if="confirmPassword && password !== confirmPassword" class="text-xs text-red-600">
          Passwords do not match
        </p>
      </div>
      
      <!-- Terms and Conditions -->
      <div class="flex items-start">
        <input
          id="terms"
          v-model="acceptTerms"
          type="checkbox"
          required
          class="h-4 w-4 text-slate-600 focus:ring-slate-500 border-slate-300 rounded mt-0.5"
        />
        <label for="terms" class="ml-2 text-sm text-slate-600">
          I agree to the
          <a href="#" class="text-slate-900 hover:underline">Terms of Service</a>
          and
          <a href="#" class="text-slate-900 hover:underline">Privacy Policy</a>
        </label>
      </div>
      
      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="authStore.isLoading || password !== confirmPassword || !acceptTerms"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <LoaderCircle v-if="authStore.isLoading" class="animate-spin h-4 w-4 mr-2" />
        {{ authStore.isLoading ? 'Creating Account...' : 'Create Account' }}
      </button>
    </form>
    
    <!-- Sign In Link -->
    <div class="text-center">
      <p class="text-sm text-slate-600">
        Already have an account?
        <RouterLink to="/auth/login" class="font-medium text-slate-900 hover:underline">
          Sign in
        </RouterLink>
      </p>
    </div>
    </div> <!-- Close registration form div -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Eye, EyeOff, LoaderCircle, CheckCircle } from 'lucide-vue-next'
import { useAuthStore } from '@/modules/auth/stores/auth'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const acceptTerms = ref(false)

const showSuccessMessage = ref(false)

const handleRegister = async () => {
  if (password.value !== confirmPassword.value) {
    return
  }
  
  authStore.clearError()
  
  try {
    await authStore.signUp(email.value, password.value, name.value)
    // Show success message instead of redirecting
    showSuccessMessage.value = true
  } catch (error) {
    // Error is handled in the store
    console.error('Registration error:', error)
  }
}
</script>
