<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Module Access Control</h1>
      <Button variant="outline" @click="saveChanges" :disabled="!hasChanges">
        Save Changes
      </Button>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Module Permissions</CardTitle>
        <CardDescription>
          Configure which roles have access to which modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="module in modules" :key="module.id" class="p-4 border rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="font-medium">{{ module.name }}</h3>
                <p class="text-sm text-muted-foreground">{{ module.description }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <Select 
                  v-model="module.accessLevel"
                  @update:modelValue="onModuleChange(module)"
                >
                  <SelectTrigger class="w-[180px]">
                    <SelectValue placeholder="Select access level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Access</SelectItem>
                    <SelectItem value="view">View Only</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div v-if="module.roles" class="mt-4 space-y-2">
              <div 
                v-for="role in module.roles" 
                :key="role.id"
                class="flex items-center justify-between p-2 bg-muted/50 rounded"
              >
                <span class="text-sm">{{ role.name }}</span>
                <div class="flex items-center space-x-2">
                  <Checkbox 
                    v-model="role.hasAccess" 
                    @update:modelValue="onRoleChange(module, role)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

interface ModuleRole {
  id: string
  name: string
  hasAccess: boolean
}

interface Module {
  id: string
  name: string
  description: string
  accessLevel: 'none' | 'view' | 'edit' | 'admin'
  roles?: ModuleRole[]
}

const modules = ref<Module[]>([
  {
    id: 'gallery-board',
    name: 'Gallery Board',
    description: 'Visual asset management and presentation tool',
    accessLevel: 'view',
    roles: [
      { id: 'admin', name: 'Administrator', hasAccess: true },
      { id: 'manager', name: 'Manager', hasAccess: true },
      { id: 'user', name: 'Standard User', hasAccess: true },
      { id: 'guest', name: 'Guest', hasAccess: false }
    ]
  },
  {
    id: 'procurement',
    name: 'Procurement',
    description: 'Manage purchases, suppliers, and orders',
    accessLevel: 'view',
    roles: [
      { id: 'admin', name: 'Administrator', hasAccess: true },
      { id: 'manager', name: 'Manager', hasAccess: true },
      { id: 'user', name: 'Standard User', hasAccess: true },
      { id: 'guest', name: 'Guest', hasAccess: false }
    ]
  },
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Track and manage stock levels',
    accessLevel: 'view',
    roles: [
      { id: 'admin', name: 'Administrator', hasAccess: true },
      { id: 'manager', name: 'Manager', hasAccess: true },
      { id: 'user', name: 'Standard User', hasAccess: true },
      { id: 'guest', name: 'Guest', hasAccess: false }
    ]
  }
])

const hasChanges = ref(false)

const onModuleChange = (module: Module) => {
  console.log(`Module ${module.name} access level changed to ${module.accessLevel}`)
  hasChanges.value = true
}

const onRoleChange = (module: Module, role: ModuleRole) => {
  console.log(`Role ${role.name} access to ${module.name} changed to ${role.hasAccess}`)
  hasChanges.value = true
}

const saveChanges = () => {
  // TODO: Implement save to backend
  console.log('Saving module access changes', modules.value)
  hasChanges.value = false
  // Show success message
}
</script>
