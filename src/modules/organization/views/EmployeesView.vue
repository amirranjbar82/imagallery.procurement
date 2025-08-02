<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button @click="$router.push('/organization')" variant="outline" size="sm">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Organization
        </Button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Employees</h2>
          <p class="text-gray-600 mt-1">Manage employee information and organizational structure</p>
        </div>
      </div>
      <Button @click="openAddModal" v-if="authStore.isAdmin || authStore.isManager">
        <UserPlus class="mr-2 h-4 w-4" />
        Add Employee
      </Button>
    </div>

    <!-- Search and Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <Input
              v-model="searchQuery"
              placeholder="Search employees..."
              class="max-w-sm"
            >
              <template #prefix>
                <Search class="h-4 w-4 text-gray-400" />
              </template>
            </Input>
          </div>
          <Select v-model="departmentFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem v-for="dept in departments" :key="dept.departmentId" :value="dept.departmentId">
                {{ dept.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="roleFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Employees Table -->
    <Card>
      <CardHeader>
        <CardTitle>Employee Directory</CardTitle>
        <CardDescription>{{ filteredEmployees.length }} employees in the organization</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hire Date</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="employee in filteredEmployees" :key="employee.uid">
              <TableCell class="font-medium">{{ employee.name }}</TableCell>
              <TableCell>{{ employee.email }}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {{ getDepartmentName(employee.departmentId) }}
                </Badge>
              </TableCell>
              <TableCell>{{ employee.position || 'Not specified' }}</TableCell>
              <TableCell>
                <Badge :variant="getRoleVariant(employee.role)">
                  {{ employee.role.toUpperCase() }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="employee.isActive ? 'default' : 'secondary'">
                  {{ employee.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </TableCell>
              <TableCell>
                {{ employee.hireDate ? formatDate(employee.hireDate) : 'N/A' }}
              </TableCell>
              <TableCell class="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  @click="editEmployee(employee)"
                  v-if="authStore.isAdmin || authStore.isManager"
                >
                  <Edit class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Add Employee Dialog -->
    <Dialog v-model:open="showAddModal">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Employee</DialogTitle>
          <DialogDescription>
            Add a new employee to the organization with department and role assignments.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="addEmployee" class="space-y-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input
              id="name"
              v-model="newEmployee.name"
              class="col-span-3"
              required
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="email" class="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="newEmployee.email"
              class="col-span-3"
              required
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="position" class="text-right">Position</Label>
            <Input
              id="position"
              v-model="newEmployee.position"
              class="col-span-3"
              placeholder="e.g., Senior Developer, Marketing Manager"
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="department" class="text-right">Department</Label>
            <Select v-model="newEmployee.departmentId" :disabled="departmentsLoading">
              <SelectTrigger class="col-span-3">
                <SelectValue :placeholder="departmentsLoading ? 'Loading departments...' : 'Select department'" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-if="departmentsLoading" value="loading" disabled>
                  Loading departments...
                </SelectItem>
                <SelectItem v-else-if="departments.length === 0" value="empty" disabled>
                  No departments available
                </SelectItem>
                <SelectItem v-else v-for="dept in departments" :key="dept.departmentId" :value="dept.departmentId">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="role" class="text-right">System Role</Label>
            <Select v-model="newEmployee.role">
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="hireDate" class="text-right">Hire Date</Label>
            <Input
              id="hireDate"
              type="date"
              v-model="newEmployee.hireDate"
              class="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showAddModal = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Add Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit Employee Dialog -->
    <Dialog v-model:open="showEditModal">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee information and assignments.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateEmployee" class="space-y-4" v-if="editingEmployee">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <Input
              v-model="editingEmployee.name"
              class="col-span-3"
              required
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Email</Label>
            <Input
              type="email"
              v-model="editingEmployee.email"
              class="col-span-3"
              required
              disabled
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Position</Label>
            <Input
              v-model="editingEmployee.position"
              class="col-span-3"
              placeholder="e.g., Senior Developer, Marketing Manager"
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Department</Label>
            <Select v-model="editingEmployee.departmentId">
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in departments" :key="dept.departmentId" :value="dept.departmentId">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">System Role</Label>
            <Select v-model="editingEmployee.role">
              <SelectTrigger class="col-span-3">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Hire Date</Label>
            <Input
              type="date"
              v-model="editingEmployee.hireDate"
              class="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditModal = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Update Employee
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { useOrganizationStore } from '../stores/organization'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/modules/auth/stores/auth'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Icons
import { UserPlus, Edit, Loader2, ArrowLeft, Search } from 'lucide-vue-next'

// Enhanced Employee interface with organizational data
interface Employee extends UserProfile {
  departmentId?: string
  position?: string
  hireDate?: string
}

const authStore = useAuthStore()
const organizationStore = useOrganizationStore()

// State
const employees = ref<Employee[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingEmployee = ref<Employee | null>(null)
const isLoading = ref(false)
const searchQuery = ref('')
const departmentFilter = ref('all')
const roleFilter = ref('all')

const newEmployee = ref({
  name: '',
  email: '',
  position: '',
  departmentId: '',
  role: 'user' as const,
  hireDate: ''
})

// Computed
const departments = computed(() => organizationStore.departments)
const departmentsLoading = computed(() => organizationStore.loading)

const filteredEmployees = computed(() => {
  let filtered = employees.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(emp => 
      emp.name?.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.position?.toLowerCase().includes(query)
    )
  }

  // Department filter
  if (departmentFilter.value && departmentFilter.value !== 'all') {
    filtered = filtered.filter(emp => emp.departmentId === departmentFilter.value)
  }

  // Role filter
  if (roleFilter.value && roleFilter.value !== 'all') {
    filtered = filtered.filter(emp => emp.role === roleFilter.value)
  }

  return filtered
})

// Methods
const loadEmployees = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    employees.value = querySnapshot.docs.map(doc => doc.data() as Employee)
  } catch (error) {
    console.error('Error loading employees:', error)
  }
}

const openAddModal = async () => {
  // Ensure departments are loaded before opening modal
  if (departments.value.length === 0 && !departmentsLoading.value) {
    await organizationStore.fetchDepartments()
  }
  showAddModal.value = true
}

const addEmployee = async () => {
  try {
    isLoading.value = true
    
    // Create user account
    await authStore.signUp(newEmployee.value.email, 'TempPassword123!', newEmployee.value.name)
    
    // TODO: Update the user profile with additional organizational data
    // This would involve updating the user document in Firestore with
    // departmentId, position, hireDate, etc.
    
    showAddModal.value = false
    newEmployee.value = {
      name: '',
      email: '',
      position: '',
      departmentId: '',
      role: 'user',
      hireDate: ''
    }
    
    await loadEmployees()
  } catch (error) {
    console.error('Error adding employee:', error)
  } finally {
    isLoading.value = false
  }
}

const editEmployee = (employee: Employee) => {
  editingEmployee.value = { ...employee }
  showEditModal.value = true
}

const updateEmployee = async () => {
  if (!editingEmployee.value) return

  try {
    isLoading.value = true
    
    // Update user role
    await authStore.updateUserRole(editingEmployee.value.uid, editingEmployee.value.role)
    
    // TODO: Update additional organizational data in Firestore
    // This would involve updating the user document with
    // departmentId, position, hireDate, etc.
    
    showEditModal.value = false
    editingEmployee.value = null
    await loadEmployees()
  } catch (error) {
    console.error('Error updating employee:', error)
  } finally {
    isLoading.value = false
  }
}

const getDepartmentName = (departmentId?: string) => {
  if (!departmentId) return 'Unassigned'
  const dept = departments.value.find(d => d.id === departmentId)
  return dept?.name || 'Unknown Department'
}

const getRoleVariant = (role: string) => {
  switch (role) {
    case 'admin': return 'destructive'
    case 'manager': return 'default'
    case 'user': return 'secondary'
    case 'viewer': return 'outline'
    default: return 'secondary'
  }
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  const d = typeof date === 'string' ? new Date(date) : (date.toDate ? date.toDate() : new Date(date))
  return d.toLocaleDateString()
}

onMounted(async () => {
  await loadEmployees()
  await organizationStore.fetchDepartments()
})
</script>
