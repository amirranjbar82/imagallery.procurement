<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Organization Management</h1>
        <p class="text-gray-600">Manage departments and organizational structure</p>
      </div>
      <Button @click="showCreateDepartment = true">
        <Plus class="w-4 h-4 mr-2" />
        New Department
      </Button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Department Tree -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <CardTitle>Department Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else class="space-y-2">
            <DepartmentTreeItem 
              v-for="dept in departmentHierarchy" 
              :key="dept.department.departmentId"
              :department="dept"
              @select="selectedDepartment = $event"
            />
          </div>
        </CardContent>
      </Card>

      <!-- Department Details -->
      <Card>
        <CardHeader>
          <CardTitle>Department Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="!selectedDepartment" class="text-center py-8 text-gray-500">
            Select a department to view details
          </div>
          <div v-else class="space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-700">Name</label>
              <p class="text-gray-900">{{ selectedDepartment.name }}</p>
            </div>
            <div v-if="selectedDepartment.description">
              <label class="text-sm font-medium text-gray-700">Description</label>
              <p class="text-gray-900">{{ selectedDepartment.description }}</p>
            </div>
            <div v-if="selectedDepartment.departmentHead">
              <label class="text-sm font-medium text-gray-700">Department Head</label>
              <p class="text-gray-900">{{ selectedDepartment.departmentHead }}</p>
            </div>
            <div class="flex space-x-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="outline" size="sm">Manage Users</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Department Dialog -->
    <Dialog v-model:open="showCreateDepartment">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Department</DialogTitle>
        </DialogHeader>
        <form @submit.prevent="handleCreateDepartment" class="space-y-4">
          <div>
            <Label for="name">Department Name</Label>
            <Input id="name" v-model="newDepartment.name" required />
          </div>
          <div>
            <Label for="description">Description</Label>
            <Textarea id="description" v-model="newDepartment.description" />
          </div>
          <div>
            <Label for="parent">Parent Department</Label>
            <Select v-model="newDepartment.parentDepartmentId">
              <SelectTrigger>
                <SelectValue placeholder="Select parent department (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None (Root Department)</SelectItem>
                <SelectItem 
                  v-for="dept in departments" 
                  :key="dept.departmentId"
                  :value="dept.departmentId"
                >
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateDepartment = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              Create Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useOrganizationStore } from '../stores/organization'
import type { Department } from '../types/organization'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Placeholder component - would need to be implemented
const DepartmentTreeItem = { template: '<div>Department Tree Item - To be implemented</div>' }

const organizationStore = useOrganizationStore()

// State
const selectedDepartment = ref<Department | null>(null)
const showCreateDepartment = ref(false)
const newDepartment = ref({
  name: '',
  description: '',
  parentDepartmentId: '',
  departmentHead: '',
  budget: 0,
  currency: 'USD',
  permissions: {
    canViewOtherDepartments: false,
    canManageSubDepartments: false,
    canApproveBudget: false,
    allowedModules: []
  },
  isActive: true,
  createdBy: '' // Would be set from auth store
})

// Computed
const { departments, departmentHierarchy, loading } = organizationStore

// Methods
async function handleCreateDepartment() {
  try {
    await organizationStore.createDepartment(newDepartment.value)
    showCreateDepartment.value = false
    // Reset form
    newDepartment.value = {
      name: '',
      description: '',
      parentDepartmentId: '',
      departmentHead: '',
      budget: 0,
      currency: 'USD',
      permissions: {
        canViewOtherDepartments: false,
        canManageSubDepartments: false,
        canApproveBudget: false,
        allowedModules: []
      },
      isActive: true,
      createdBy: ''
    }
  } catch (error) {
    console.error('Failed to create department:', error)
  }
}

// Lifecycle
onMounted(() => {
  organizationStore.fetchDepartments()
})
</script>
