<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-gray-600 mt-1">Manage system configuration and user preferences</p>
    </div>

    <!-- Settings Categories -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- User Management -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <Users class="h-6 w-6 text-blue-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">User Management</h3>
        </div>
        <p class="text-gray-600 mb-4">Manage user accounts, roles, and permissions</p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• User registration and profiles</p>
          <p>• Role-based access control</p>
          <p>• Permission management</p>
          <p>• User activity monitoring</p>
        </div>
      </div>

      <!-- System Configuration -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <Settings class="h-6 w-6 text-green-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">System Configuration</h3>
        </div>
        <p class="text-gray-600 mb-4">Configure system-wide settings and preferences</p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• Currency and localization</p>
          <p>• Email notifications</p>
          <p>• Approval workflows</p>
          <p>• Data backup settings</p>
        </div>
      </div>

      <!-- Integration Settings -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <Plug class="h-6 w-6 text-purple-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">Integrations</h3>
        </div>
        <p class="text-gray-600 mb-4">Manage external API connections and integrations</p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• Google Gemini AI configuration</p>
          <p>• Third-party API keys</p>
          <p>• Webhook endpoints</p>
          <p>• Data sync settings</p>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center mb-4">
          <Shield class="h-6 w-6 text-red-500 mr-3" />
          <h3 class="text-lg font-semibold text-gray-900">Security</h3>
        </div>
        <p class="text-gray-600 mb-4">Configure security policies and access controls</p>
        <div class="space-y-2 text-sm text-gray-500">
          <p>• Password policies</p>
          <p>• Two-factor authentication</p>
          <p>• Session management</p>
          <p>• Audit logging</p>
        </div>
      </div>
    </div>

    <!-- Admin Only Notice -->
    <div v-if="authStore.userProfile?.role !== 'admin'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div class="flex items-center">
        <AlertTriangle class="h-5 w-5 text-yellow-600 mr-3" />
        <div>
          <h4 class="font-medium text-yellow-800">Limited Access</h4>
          <p class="text-sm text-yellow-700 mt-1">
            Some settings require administrator privileges. Contact your system administrator for full access.
          </p>
        </div>
      </div>
    </div>

    <!-- Coming Soon Card -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
      <div class="text-center">
        <Settings class="h-24 w-24 mx-auto text-gray-300 mb-6" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Settings & Configuration</h2>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          This section will provide comprehensive system configuration and 
          administrative controls for the procurement platform.
        </p>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-lg mx-auto">
          <h3 class="font-medium text-gray-900 mb-2">Coming Features:</h3>
          <ul class="text-sm text-gray-700 space-y-1 text-left">
            <li>• Complete user management system</li>
            <li>• Role and permission configuration</li>
            <li>• System-wide preferences</li>
            <li>• API integration management</li>
            <li>• Security policy configuration</li>
            <li>• Audit trails and logging</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings, Users, Plug, Shield, AlertTriangle } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
