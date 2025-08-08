<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div class="flex space-x-2">
        <Button @click="showCreateDepartment = true">
          <Plus class="w-4 h-4 mr-2" />
          New Department
        </Button>
        <Button variant="outline" @click="cleanupOrphans" :disabled="loading">
          🧹 Cleanup Orphans
        </Button>
      </div>
    </div>

    <!-- Tabs for Active and Deleted Departments -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'active'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Active Departments
          </button>
          <button
            @click="activeTab = 'deleted'"
            :class="[
              'py-2 px-1 border-b-2 font-medium text-sm',
              activeTab === 'deleted'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            🗑️ Recycle Bin ({{ deletedDepartments.length }})
          </button>
        </nav>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Department Tree / Deleted Departments -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle>
              {{ activeTab === 'active' ? 'Department Hierarchy' : 'Deleted Departments (Recycle Bin)' }}
            </CardTitle>
            
            <!-- View Mode Selector (only for active departments) -->
            <div v-if="activeTab === 'active'" class="flex items-center space-x-2">
              <label class="text-sm font-medium text-gray-700">View:</label>
              <select 
                v-model="viewMode" 
                class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="classic">🌳 Classic Tree</option>
                <option value="compact">📋 Compact List</option>
                <option value="chart">📊 Org Chart</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div v-if="loading" class="flex items-center justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <div v-else>
            <!-- Active Departments Tab -->
            <div v-if="activeTab === 'active'" class="space-y-2">
              <!-- Empty State -->
              <div v-if="departmentHierarchy.length === 0" class="text-center py-8 text-gray-500">
                <Building2 class="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p class="text-lg font-medium">No departments found</p>
                <p class="text-xs">Create your first department to get started</p>
              </div>
              
              <!-- Different View Modes -->
              <div v-else>
                <!-- 1. Classic Tree View -->
                <div v-if="viewMode === 'classic'" class="space-y-2">
                  <DepartmentTreeItem 
                    v-for="department in departmentHierarchy" 
                    :key="department.department.departmentId"
                    :department="department"
                    :selectedDepartment="selectedDepartment"
                    @select="selectedDepartment = $event"
                    @delete="handleDeleteDepartment"
                  />
                </div>
                
                <!-- 2. Compact List View -->
                <div v-else-if="viewMode === 'compact'" class="space-y-1">
                  <div 
                    v-for="dept in flatDepartmentList" 
                    :key="dept.departmentId"
                    :class="[
                      'flex items-center p-2 rounded hover:bg-gray-50 cursor-pointer border-l-4',
                      selectedDepartment?.departmentId === dept.departmentId 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-transparent'
                    ]"
                    :style="{ paddingLeft: `${dept.level * 20 + 8}px` }"
                    @click="selectedDepartment = dept"
                  >
                    <Building2 class="h-4 w-4 mr-2 text-gray-500" />
                    <span class="font-medium">{{ dept.name }}</span>
                    <span class="text-xs text-gray-500 ml-2">({{ dept.level === 0 ? 'Root' : 'Level ' + dept.level }})</span>
                    <div class="ml-auto flex space-x-1">
                      <button @click.stop="handleDeleteDepartment(dept)" class="p-1 text-red-500 hover:bg-red-100 rounded">
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- 3. Organizational Chart View -->
                <div v-else-if="viewMode === 'chart'" class="overflow-x-auto">
                  <div class="min-w-max p-4">
                    <div v-for="dept in departmentHierarchy" :key="dept.department.departmentId" class="mb-8">
                      <OrgChartNode 
                        :node="dept" 
                        :level="0" 
                        @select="selectedDepartment = $event" 
                        @delete="showDeleteDialog($event)"
                        :selected="selectedDepartment" 
                      />
                    </div>
                  </div>
                </div>
                

              </div>
            </div>
            <!-- Deleted Departments Tab (Recycle Bin) -->
            <div v-else-if="activeTab === 'deleted'" class="space-y-2">
              <div v-if="deletedDepartments.length === 0" class="text-center py-8 text-gray-500">
                <div class="text-6xl mb-4">🗑️</div>
                <p class="text-lg font-medium">Recycle Bin is Empty</p>
                <p class="text-xs">Deleted departments will appear here</p>
              </div>
              <div v-else class="space-y-3">
                <div 
                  v-for="dept in deletedDepartments" 
                  :key="dept.departmentId"
                  class="border rounded-lg p-4 bg-red-50 border-red-200"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <h4 class="font-medium text-gray-900 flex items-center">
                        <span class="text-red-500 mr-2">🗑️</span>
                        {{ dept.name }}
                      </h4>
                      <p class="text-sm text-gray-600 mt-1">{{ dept.description || 'No description' }}</p>
                      <div class="text-xs text-gray-500 mt-2 space-y-1">
                        <p>Deleted: {{ formatDateRecycleBin(dept.deletedAt) }}</p>
                        <p>By: {{ dept.deletedBy || 'Unknown' }}</p>
                        <p>Original Parent: {{ getOriginalParentName(dept) || 'Root level' }}</p>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        @click="showRestoreDialog(dept)"
                        class="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        ♻️ Restore
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        @click="showPermanentDeleteDialog(dept)"
                      >
                        🗑️ Delete Forever
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Department Details -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle class="flex items-center justify-between">
            Department Details
            <div v-if="selectedDepartment" class="flex space-x-2">
              <Button variant="outline" size="sm" @click="editDepartment">
                <Edit class="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button variant="outline" size="sm" @click="manageDepartmentUsers">
                <Users class="h-4 w-4 mr-1" />
                Users
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="!selectedDepartment" class="text-center text-gray-500 py-8">
            <Building2 class="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a department to view details</p>
          </div>
          <div v-else class="space-y-6">
            <!-- Basic Info -->
            <div>
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-xl text-gray-900">{{ selectedDepartment.name }}</h3>
                <div class="flex items-center space-x-2">
                  <span 
                    class="px-3 py-1 rounded-full text-sm font-medium"
                    :class="selectedDepartment.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  >
                    {{ selectedDepartment.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </div>
              
              <p v-if="selectedDepartment.description" class="text-gray-600 mb-4">
                {{ selectedDepartment.description }}
              </p>
              <p v-else class="text-gray-400 italic mb-4">
                No description provided
              </p>
            </div>

            <!-- Department Head -->
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                <UserCheck class="h-4 w-4 mr-2" />
                Department Head
              </h4>
              <p class="text-gray-600">
                {{ getDepartmentHeadName(selectedDepartment.departmentHead) }}
              </p>
            </div>

            <!-- Information -->
            <div class="border-t pt-4">
              <h4 class="font-medium text-gray-900 mb-2 flex items-center">
                <InfoIcon class="h-4 w-4 mr-2" />
                Information
              </h4>
              <div class="space-y-1 text-sm text-gray-600">
                <p><span class="font-medium">Created:</span> {{ formatDate(selectedDepartment.createdAt) }}</p>
                <p><span class="font-medium">Updated:</span> {{ formatDate(selectedDepartment.updatedAt) }}</p>
                <p><span class="font-medium">Created by:</span> {{ getCreatorName(selectedDepartment.createdBy) }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Department Dialog -->
    <Dialog v-model:open="showCreateDepartment">
      <DialogContent class="sm:max-w-md">
        <DialogHeader class="pb-8">
          <DialogTitle>Create New Department</DialogTitle>
          <DialogDescription>
            Create a new department in your organizational structure.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="handleCreateDepartment" class="space-y-6 pt-2">
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
                <SelectItem value="none">None (Root Department)</SelectItem>
                <SelectItem 
                  v-for="dept in selectableDepartments" 
                  :key="dept.departmentId"
                  :value="dept.departmentId"
                >
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label for="departmentHead">Department Head</Label>
            <Select v-model="newDepartment.departmentHead">
              <SelectTrigger>
                <SelectValue placeholder="Select department head (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem 
                  v-for="user in users" 
                  :key="user.uid"
                  :value="user.uid"
                >
                  {{ user.name }} ({{ user.email }})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="cancelCreateDepartment">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              Create Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Department Dialog -->
    <Dialog v-model:open="isEditDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update department information and settings.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateDepartment" class="space-y-4">
          <div class="space-y-2">
            <Label for="edit-name">Department Name</Label>
            <Input
              id="edit-name"
              v-model="editForm.name"
              placeholder="Enter department name"
              required
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              v-model="editForm.description"
              placeholder="Enter department description"
              rows="3"
            />
          </div>
          <div class="space-y-2">
            <Label for="edit-parent">Parent Department</Label>
            <Select v-model="editForm.parentDepartmentId">
              <SelectTrigger>
                <SelectValue placeholder="Select parent department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (Root Department)</SelectItem>
                <SelectItem 
                  v-for="dept in selectableDepartments.filter((d: Department) => d.departmentId !== selectedDepartment?.departmentId)" 
                  :key="dept.departmentId"
                  :value="dept.departmentId"
                >
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="edit-head">Department Head</Label>
              <Select v-model="editForm.departmentHead">
                <SelectTrigger>
                  <SelectValue placeholder="Select department head (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem 
                    v-for="user in users" 
                    :key="user.uid"
                    :value="user.uid"
                  >
                    {{ user.name }} ({{ user.email }})
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <input
              id="edit-active"
              type="checkbox"
              v-model="editForm.isActive"
              class="rounded border-gray-300"
            />
            <Label for="edit-active">Active Department</Label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="isEditDialogOpen = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              Update Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Manage Users Dialog -->
    <Dialog v-model:open="isUsersDialogOpen">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Manage Department Users</DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="text-sm text-gray-600">
            Managing users for: <strong>{{ selectedDepartment?.name }}</strong>
          </div>
          <div class="border rounded-lg p-4 text-center text-gray-500">
            <Users class="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>User management functionality will be implemented soon.</p>
            <p class="text-xs mt-1">This will allow you to assign/unassign users to this department.</p>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" @click="isUsersDialogOpen = false">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteDialogOpen">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle class="flex items-center space-x-2 text-red-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>Confirm Delete</span>
          </DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="text-sm text-gray-700">
            <p class="mb-2">Are you sure you want to delete the department:</p>
            <p class="font-semibold text-lg text-red-600">{{ departmentToDelete?.name }}</p>
          </div>
          
          <!-- Show child departments warning if any exist -->
          <div v-if="getChildDepartments(departmentToDelete?.departmentId).length > 0" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div class="flex items-start space-x-2">
              <svg class="h-5 w-5 text-yellow-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="text-sm text-yellow-700">
                <p class="font-medium">Child Departments Found:</p>
                <p class="mb-2">This department has {{ getChildDepartments(departmentToDelete?.departmentId).length }} child department(s):</p>
                <ul class="list-disc list-inside space-y-1">
                  <li v-for="child in getChildDepartments(departmentToDelete?.departmentId)" :key="child.departmentId" class="font-medium">
                    {{ child.name }}
                  </li>
                </ul>
                <p class="mt-2 font-medium">
                  These child departments will be moved to: 
                  <span class="text-blue-600">
                    {{ getGrandparentName(departmentToDelete) || 'Root level (no parent)' }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex items-start space-x-2">
              <svg class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="text-sm text-red-700">
                <p class="font-medium">Warning:</p>
                <p>This action cannot be undone. All data associated with this department will be permanently deleted.</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter class="space-x-2">
          <Button type="button" variant="outline" @click="cancelDeleteDepartment">
            Cancel
          </Button>
          <Button type="button" variant="destructive" @click="confirmDeleteDepartment" :disabled="loading">
            <svg class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Department
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Permanent Delete Confirmation Dialog -->
    <Dialog v-model:open="showPermanentDeleteConfirmDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle class="flex items-center space-x-2 text-red-600">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span>⚠️ Permanent Delete Warning</span>
          </DialogTitle>
        </DialogHeader>
        <div class="space-y-4">
          <div class="text-sm text-gray-700">
            <p class="mb-2">Are you sure you want to <strong class="text-red-600">permanently delete</strong> the department:</p>
            <p class="font-semibold text-lg text-red-600">{{ departmentToDeletePermanently?.name }}</p>
          </div>
          
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-start space-x-2">
              <svg class="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div class="text-sm text-red-700">
                <p class="font-bold mb-2">⚠️ THIS ACTION CANNOT BE UNDONE!</p>
                <ul class="list-disc list-inside space-y-1">
                  <li>The department will be <strong>completely removed</strong> from the database</li>
                  <li>All department data will be <strong>permanently lost</strong></li>
                  <li>This action is <strong>irreversible</strong></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter class="space-x-2">
          <Button variant="outline" @click="cancelPermanentDelete()">
            Cancel
          </Button>
          <Button variant="destructive" @click="confirmPermanentDelete()">
            🗑️ Yes, Delete Forever
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { Plus, Edit, Users, Building2, UserCheck, InfoIcon } from 'lucide-vue-next'
import { useOrganizationStore } from '../stores/organization'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { Department } from '../types/organization'
import type { UserProfile } from '@/modules/auth/stores/auth'
import DepartmentTreeItem from '../components/DepartmentTreeItem.vue'
import OrgChartNode from '../components/OrgChartNode.vue'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'



// Reactive state
const selectedDepartment = ref<Department | null>(null)
const activeTab = ref<'active' | 'deleted'>('active')
const viewMode = ref<'classic' | 'compact' | 'chart'>('classic')
const showPermanentDeleteConfirmDialog = ref(false)
const departmentToDeletePermanently = ref<Department | null>(null)

// Form state
const showCreateDepartment = ref(false)
const newDepartment = ref({
  name: '',
  description: '',
  parentDepartmentId: 'none',
  departmentHead: '',
  permissions: {
    canViewOtherDepartments: false,
    canManageSubDepartments: false,
    canApproveBudget: false,
    allowedModules: []
  },
  isActive: true,
  createdBy: '' // Would be set from auth store
})

// Store
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()
const { departments, departmentHierarchy, deletedDepartments, loading } = storeToRefs(organizationStore)
const { users } = storeToRefs(authStore)

// Computed property for selectable departments (only active departments)
const selectableDepartments = computed(() => {
  return departments.value.filter(d => !d.isDeleted && d.isActive)
})

// Computed property for flat department list (for non-tree views)
const flatDepartmentList = computed(() => {
  const result: (Department & { level: number })[] = []
  
  function flattenDepartments(deptHierarchy: any[], level = 0) {
    for (const item of deptHierarchy) {
      result.push({ ...item.department, level })
      if (item.children && item.children.length > 0) {
        flattenDepartments(item.children, level + 1)
      }
    }
  }
  
  flattenDepartments(departmentHierarchy.value)
  return result
})

// Methods
function cancelCreateDepartment() {
  // Reset form
  newDepartment.value = {
    name: '',
    description: '',
    parentDepartmentId: 'none',
    departmentHead: '',
    permissions: {
      canViewOtherDepartments: false,
      canManageSubDepartments: false,
      canApproveBudget: false,
      allowedModules: []
    },
    isActive: true,
    createdBy: ''
  }
  
  // Close dialog
  showCreateDepartment.value = false
}

async function handleCreateDepartment() {
  try {
    // Check for duplicate department names
    const existingDepartment = organizationStore.departments.find(
      dept => dept.name.toLowerCase() === newDepartment.value.name.toLowerCase()
    )
    
    if (existingDepartment) {
      alert('A department with this name already exists. Please choose a different name.')
      return
    }
    
    // Transform the data before sending to store
    const departmentData = {
      ...newDepartment.value,
      // Convert 'none' to null for root departments (Firebase accepts null but not undefined)
      parentDepartmentId: newDepartment.value.parentDepartmentId === 'none' ? null : newDepartment.value.parentDepartmentId
    }
    
    await organizationStore.createDepartment(departmentData)
    
    // Close dialog first
    showCreateDepartment.value = false
    
    // Reset form
    newDepartment.value = {
      name: '',
      description: '',
      parentDepartmentId: 'none',
      departmentHead: '',
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

function handleDeleteDepartment(department: Department) {
  showDeleteConfirmation(department)
}

// Edit department functionality
const isEditDialogOpen = ref(false)
const editForm = ref({
  name: '',
  description: '',
  departmentHead: '',
  isActive: true,
  parentDepartmentId: 'none' as string
})

function editDepartment() {
  if (!selectedDepartment.value) return
  
  // Populate form with current department data
  editForm.value = {
    name: selectedDepartment.value.name,
    description: selectedDepartment.value.description || '',
    departmentHead: selectedDepartment.value.departmentHead || 'none',
    isActive: selectedDepartment.value.isActive,
    parentDepartmentId: selectedDepartment.value.parentDepartmentId || 'none'
  }
  
  isEditDialogOpen.value = true
}

async function updateDepartment() {
  if (!selectedDepartment.value) return
  
  try {
    const updateData = {
      ...editForm.value,
      parentDepartmentId: editForm.value.parentDepartmentId === 'none' ? null : editForm.value.parentDepartmentId,
      departmentHead: editForm.value.departmentHead === 'none' ? null : editForm.value.departmentHead
    }
    
    await organizationStore.updateDepartment(selectedDepartment.value.departmentId, updateData)
    
    // Show success message
    alert('Department updated successfully!')
    
    // Close dialog
    isEditDialogOpen.value = false
    
    // Refresh the selected department data
    const updatedDept = organizationStore.departments.find(d => d.departmentId === selectedDepartment.value?.departmentId)
    if (updatedDept) {
      selectedDepartment.value = updatedDept
    }
  } catch (error) {
    console.error('Failed to update department:', error)
    alert('Failed to update department. Please try again.')
  }
}

// Manage users functionality
const isUsersDialogOpen = ref(false)

function manageDepartmentUsers() {
  if (!selectedDepartment.value) return
  isUsersDialogOpen.value = true
}

// Delete confirmation functionality
const isDeleteDialogOpen = ref(false)
const departmentToDelete = ref<Department | null>(null)
const departmentToRestore = ref<Department | null>(null)

function showDeleteConfirmation(department: Department) {
  departmentToDelete.value = department
  isDeleteDialogOpen.value = true
}

async function confirmDeleteDepartment() {
  if (!departmentToDelete.value) return
  
  try {
    await organizationStore.deleteDepartment(departmentToDelete.value.departmentId)
    
    // Clear selected department if it was deleted
    if (selectedDepartment.value?.departmentId === departmentToDelete.value.departmentId) {
      selectedDepartment.value = null
    }
    
    // Close dialog and clear state
    isDeleteDialogOpen.value = false
    departmentToDelete.value = null
    
    // Show success message
    alert('Department deleted successfully!')
  } catch (error) {
    console.error('Failed to delete department:', error)
    alert('Failed to delete department. Please try again.')
  }
}

function cancelDeleteDepartment() {
  isDeleteDialogOpen.value = false
  departmentToDelete.value = null
}

function formatDate(date: any): string {
  if (!date) return 'N/A'
  
  try {
    let dateObj: Date
    
    // Handle Firestore Timestamp
    if (date && typeof date === 'object' && date.toDate) {
      dateObj = date.toDate()
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Handle string
    else if (typeof date === 'string') {
      dateObj = new Date(date)
    }
    // Handle number (timestamp)
    else if (typeof date === 'number') {
      dateObj = new Date(date)
    }
    else {
      return 'Invalid date'
    }
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date'
    }
    
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting date:', error, 'Date value:', date)
    return 'Invalid date'
  }
}

// Get child departments of a given department
function getChildDepartments(departmentId: string | undefined): Department[] {
  if (!departmentId) return []
  return departments.value.filter(dept => dept.parentDepartmentId === departmentId)
}

// Get the name of the grandparent department (where children will be moved)
function getGrandparentName(department: Department | null): string | null {
  if (!department || !department.parentDepartmentId) return null
  const grandparent = departments.value.find(d => d.departmentId === department.parentDepartmentId)
  return grandparent?.name || null
}

// Cleanup orphan departments
async function cleanupOrphans() {
  try {
    const deletedCount = await organizationStore.cleanupOrphanDepartments()
    alert(`Successfully cleaned up ${deletedCount} orphan departments!`)
  } catch (error) {
    console.error('Failed to cleanup orphan departments:', error)
    alert('Failed to cleanup orphan departments. Please try again.')
  }
}

// Recycle Bin Functions
function getOriginalParentName(dept: Department): string {
  if (!dept.originalParentId) return 'Root level'
  const parent = departments.value.find(d => d.departmentId === dept.originalParentId)
  return parent ? parent.name : 'Unknown parent'
}

function formatDateRecycleBin(date: Date | undefined): string {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleDateString()
}

function showRestoreDialog(dept: Department) {
  departmentToRestore.value = dept
  // For now, restore to original parent - later we can add a dialog to choose parent
  restoreDepartment(dept)
}

async function restoreDepartment(dept: Department) {
  try {
    await organizationStore.restoreDepartment(dept.departmentId)
    alert(`Department "${dept.name}" restored successfully!`)
  } catch (error) {
    console.error('Failed to restore department:', error)
    alert('Failed to restore department. Please try again.')
  }
}

function showPermanentDeleteDialog(dept: Department) {
  console.log('Opening permanent delete dialog for:', dept.name, dept.departmentId)
  departmentToDeletePermanently.value = dept
  showPermanentDeleteConfirmDialog.value = true
}

async function confirmPermanentDelete() {
  if (!departmentToDeletePermanently.value) return
  
  const dept = departmentToDeletePermanently.value
  console.log('Attempting to permanently delete department:', dept.name, dept.departmentId)
  
  try {
    console.log('User confirmed deletion, calling store function...')
    await organizationStore.permanentlyDeleteDepartment(dept.departmentId)
    console.log('Store function completed successfully')
    alert(`Department "${dept.name}" permanently deleted.`)
    
    // Close dialog and reset state
    showPermanentDeleteConfirmDialog.value = false
    departmentToDeletePermanently.value = null
  } catch (error) {
    console.error('Failed to permanently delete department:', error)
    console.error('Error details:', error)
    alert(`Failed to permanently delete department: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
  }
}

function cancelPermanentDelete() {
  console.log('User cancelled permanent deletion')
  showPermanentDeleteConfirmDialog.value = false
  departmentToDeletePermanently.value = null
}

// Get creator name from user ID
function getCreatorName(createdBy: string): string {
  if (!createdBy) return 'System'
  
  // TODO: Implement user lookup from users store
  // For now, return the ID or a placeholder
  if (createdBy === 'admin') return 'Administrator'
  if (createdBy === 'system') return 'System'
  
  // Return first part of email if it looks like an email
  if (createdBy.includes('@')) {
    return createdBy.split('@')[0]
  }
  
  return createdBy
}

// Show delete dialog for org chart view
function showDeleteDialog(dept: Department) {
  console.log('Opening delete dialog for department:', dept.name)
  showDeleteConfirmation(dept)
}

// Get department head name from user ID
function getDepartmentHeadName(departmentHeadId: string | null | undefined): string {
  if (!departmentHeadId) return 'Not assigned'
  
  const user = users.value.find(u => u.uid === departmentHeadId)
  if (user) {
    return `${user.name} (${user.email})`
  }
  
  // If user not found, return the ID or a placeholder
  return departmentHeadId || 'Not assigned'
}

// Helper functions for different view modes
function getDepartmentUserCount(departmentId: string): number {
  // For now return a mock count - this would be calculated from user assignments
  // TODO: Implement actual user count calculation based on departmentId
  console.log('Getting user count for department:', departmentId)
  return Math.floor(Math.random() * 10) + 1
}



// Lifecycle
onMounted(async () => {
  await organizationStore.fetchDepartments()
  // Fetch users for Department Head selection
  try {
    await authStore.fetchUsers()
    console.log('Users fetched:', authStore.users.length)
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
  
  // Debug logging
  console.log('All departments:', organizationStore.departments)
  console.log('Department hierarchy:', organizationStore.departmentHierarchy)
  console.log('Hierarchy length:', organizationStore.departmentHierarchy.length)
  
  // Check parent-child relationships
  organizationStore.departments.forEach(dept => {
    console.log(`Department: ${dept.name}, Parent: ${dept.parentDepartmentId}, ID: ${dept.departmentId}`)
  })
  
  // Check root departments specifically
  const rootDepts = organizationStore.departments.filter(d => !d.parentDepartmentId || d.parentDepartmentId === null || d.parentDepartmentId === undefined || d.parentDepartmentId === 'none')
  console.log('Root departments:', rootDepts)
  
  // Check if any departments have children
  organizationStore.departments.forEach(parent => {
    const children = organizationStore.departments.filter(child => child.parentDepartmentId === parent.departmentId)
    if (children.length > 0) {
      console.log(`Parent: ${parent.name} (${parent.departmentId}) has children:`, children.map(c => c.name))
    }
  })
})
</script>
