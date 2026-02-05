<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Hierarchical Access Control</h1>
        <p class="text-sm text-muted-foreground">
          Configure access levels based on organizational hierarchy
        </p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="addNewRule">
          <PlusCircle class="w-4 h-4 mr-2" />
          Add Rule
        </Button>
        <Button @click="saveChanges" :disabled="!hasChanges">
          Save Changes
        </Button>
      </div>
    </div>
    
    <Card>
      <CardHeader>
        <CardTitle>Access Rules</CardTitle>
        <CardDescription>
          Define who can access what based on organizational structure
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-4">
          <div v-for="(rule, index) in accessRules" :key="index" class="p-4 border rounded-lg">
            <div class="flex items-start justify-between">
              <div class="space-y-4 flex-1">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Role</Label>
                    <Select v-model="rule.roleId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="role in roles" :key="role.id" :value="role.id">
                          {{ role.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Can Access</Label>
                    <Select v-model="rule.accessType">
                      <SelectTrigger>
                        <SelectValue placeholder="Select access type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="own">Own Records</SelectItem>
                        <SelectItem value="department">Department</SelectItem>
                        <SelectItem value="subordinates">Subordinates</SelectItem>
                        <SelectItem value="all">All Records</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Module</Label>
                    <Select v-model="rule.moduleId">
                      <SelectTrigger>
                        <SelectValue placeholder="Select module" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="module in modules" :key="module.id" :value="module.id">
                          {{ module.name }}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div v-if="rule.accessType === 'department'" class="mt-2">
                  <Label>Department</Label>
                  <Select v-model="rule.departmentId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                        {{ dept.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                variant="ghost" 
                size="icon" 
                class="ml-2 text-destructive"
                @click="removeRule(index)"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div v-if="accessRules.length === 0" class="text-center py-8 text-muted-foreground">
            <p>No access rules defined. Click "Add Rule" to get started.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { PlusCircle, Trash2 } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

interface Role {
  id: string
  name: string
}

interface Department {
  id: string
  name: string
}

interface Module {
  id: string
  name: string
}

interface AccessRule {
  roleId: string
  moduleId: string
  accessType: 'own' | 'department' | 'subordinates' | 'all'
  departmentId?: string
}

const roles = ref<Role[]>([
  { id: 'admin', name: 'Administrator' },
  { id: 'manager', name: 'Manager' },
  { id: 'user', name: 'Standard User' },
  { id: 'guest', name: 'Guest' }
])

const departments = ref<Department[]>([
  { id: 'sales', name: 'Sales' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'finance', name: 'Finance' },
  { id: 'operations', name: 'Operations' }
])

const modules = ref<Module[]>([
  { id: 'gallery-board', name: 'Gallery Board' },
  { id: 'procurement', name: 'Procurement' },
  { id: 'inventory', name: 'Inventory' },
  { id: 'sales', name: 'Sales' },
  { id: 'crm', name: 'CRM' }
])

const accessRules = ref<AccessRule[]>([])
const hasChanges = ref(false)

const addNewRule = () => {
  accessRules.value.push({
    roleId: '',
    moduleId: '',
    accessType: 'own'
  })
  hasChanges.value = true
}

const removeRule = (index: number) => {
  accessRules.value.splice(index, 1)
  hasChanges.value = true
}

const saveChanges = () => {
  // TODO: Implement save to backend
  console.log('Saving access rules', accessRules.value)
  hasChanges.value = false
  // Show success message
}
</script>
