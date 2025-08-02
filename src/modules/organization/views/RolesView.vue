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
          <h2 class="text-2xl font-bold text-gray-900">Roles & Permissions</h2>
          <p class="text-gray-600 mt-1">Manage system roles and their associated permissions</p>
        </div>
      </div>
      <Button @click="showCreateModal = true" v-if="authStore.isAdmin">
        <Plus class="mr-2 h-4 w-4" />
        Create Role
      </Button>
    </div>

    <!-- Role Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="role in roleStats" :key="role.name">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ role.displayName }}</CardTitle>
          <Badge :variant="getRoleVariant(role.name)">
            {{ role.count }}
          </Badge>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ role.percentage }}%</div>
          <p class="text-xs text-muted-foreground">
            of total users
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Roles Table -->
    <Card>
      <CardHeader>
        <CardTitle>System Roles</CardTitle>
        <CardDescription>Predefined roles with specific permissions and access levels</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="role in systemRoles" :key="role.id">
              <TableCell class="font-medium">
                <div class="flex items-center space-x-2">
                  <Badge :variant="getRoleVariant(role.id)">
                    {{ role.name }}
                  </Badge>
                  <Shield class="h-4 w-4 text-gray-400" v-if="role.id === 'admin'" />
                </div>
              </TableCell>
              <TableCell class="max-w-md">
                <p class="text-sm text-gray-600">{{ role.description }}</p>
              </TableCell>
              <TableCell>
                <span class="text-sm font-medium">{{ getUserCountForRole(role.id) }}</span>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge 
                    v-for="permission in role.permissions.slice(0, 3)" 
                    :key="permission" 
                    variant="outline" 
                    class="text-xs"
                  >
                    {{ permission }}
                  </Badge>
                  <Badge 
                    v-if="role.permissions.length > 3" 
                    variant="outline" 
                    class="text-xs"
                  >
                    +{{ role.permissions.length - 3 }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge :variant="role.isActive ? 'default' : 'secondary'">
                  {{ role.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  @click="editRole(role)"
                  v-if="authStore.isAdmin && role.id !== 'admin'"
                >
                  <Edit class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Permission Matrix -->
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>Overview of permissions across all roles</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-left py-2 px-3 font-medium">Permission</th>
                <th v-for="role in systemRoles" :key="role.id" class="text-center py-2 px-3 font-medium">
                  <Badge :variant="getRoleVariant(role.id)" class="text-xs">
                    {{ role.name }}
                  </Badge>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="permission in allPermissions" :key="permission" class="border-b">
                <td class="py-2 px-3 font-medium">{{ permission }}</td>
                <td v-for="role in systemRoles" :key="role.id" class="text-center py-2 px-3">
                  <Check 
                    v-if="role.permissions.includes(permission)" 
                    class="h-4 w-4 text-green-600 mx-auto" 
                  />
                  <X 
                    v-else 
                    class="h-4 w-4 text-red-400 mx-auto opacity-50" 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Role Dialog -->
    <Dialog v-model:open="showCreateModal">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{{ editingRole ? 'Edit Role' : 'Create New Role' }}</DialogTitle>
          <DialogDescription>
            {{ editingRole ? 'Modify role permissions and settings.' : 'Create a new role with specific permissions.' }}
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="saveRole" class="space-y-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="roleName" class="text-right">Role Name</Label>
            <Input
              id="roleName"
              v-model="roleForm.name"
              class="col-span-3"
              required
              :disabled="editingRole?.id === 'admin'"
            />
          </div>
          
          <div class="grid grid-cols-4 items-start gap-4">
            <Label for="roleDescription" class="text-right pt-2">Description</Label>
            <textarea
              id="roleDescription"
              v-model="roleForm.description"
              class="col-span-3 min-h-[80px] px-3 py-2 border border-input rounded-md text-sm"
              placeholder="Describe the role's purpose and responsibilities..."
              required
            />
          </div>

          <div class="grid grid-cols-4 items-start gap-4">
            <Label class="text-right pt-2">Permissions</Label>
            <div class="col-span-3 space-y-2 max-h-48 overflow-y-auto">
              <div v-for="permission in allPermissions" :key="permission" class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  :id="`perm-${permission}`"
                  v-model="roleForm.permissions"
                  :value="permission"
                  class="rounded border-gray-300"
                />
                <Label :for="`perm-${permission}`" class="text-sm">{{ permission }}</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" @click="cancelEdit">
              Cancel
            </Button>
            <Button type="submit" :disabled="isLoading">
              <Loader2 v-if="isLoading" class="mr-2 h-4 w-4 animate-spin" />
              {{ editingRole ? 'Update Role' : 'Create Role' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, query } from 'firebase/firestore'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { db } from '@/lib/firebase'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

// Icons
import { Plus, Edit, Loader2, ArrowLeft, Shield, Check, X } from 'lucide-vue-next'

interface SystemRole {
  id: string
  name: string
  description: string
  permissions: string[]
  isActive: boolean
  isSystem: boolean
}

const authStore = useAuthStore()

// State
const users = ref<any[]>([])
const showCreateModal = ref(false)
const editingRole = ref<SystemRole | null>(null)
const isLoading = ref(false)

const roleForm = ref({
  name: '',
  description: '',
  permissions: [] as string[]
})

// Predefined system roles
const systemRoles = ref<SystemRole[]>([
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access with all permissions. Can manage users, settings, and system configuration.',
    permissions: [
      'user.create', 'user.read', 'user.update', 'user.delete',
      'role.create', 'role.read', 'role.update', 'role.delete',
      'supplier.create', 'supplier.read', 'supplier.update', 'supplier.delete',
      'product.create', 'product.read', 'product.update', 'product.delete',
      'order.create', 'order.read', 'order.update', 'order.delete',
      'document.create', 'document.read', 'document.update', 'document.delete',
      'report.create', 'report.read', 'report.update', 'report.delete',
      'settings.read', 'settings.update'
    ],
    isActive: true,
    isSystem: true
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Management access with permissions to oversee operations and manage team members.',
    permissions: [
      'user.read', 'user.update',
      'supplier.create', 'supplier.read', 'supplier.update',
      'product.create', 'product.read', 'product.update',
      'order.create', 'order.read', 'order.update',
      'document.create', 'document.read', 'document.update',
      'report.read', 'report.create'
    ],
    isActive: true,
    isSystem: true
  },
  {
    id: 'user',
    name: 'User',
    description: 'Standard user access with permissions to perform daily operational tasks.',
    permissions: [
      'supplier.read', 'supplier.update',
      'product.read', 'product.update',
      'order.create', 'order.read', 'order.update',
      'document.read', 'document.create',
      'report.read'
    ],
    isActive: true,
    isSystem: true
  },
  {
    id: 'viewer',
    name: 'Viewer',
    description: 'Read-only access to view information without modification capabilities.',
    permissions: [
      'supplier.read',
      'product.read',
      'order.read',
      'document.read',
      'report.read'
    ],
    isActive: true,
    isSystem: true
  }
])

// All available permissions
const allPermissions = computed(() => {
  const permissions = new Set<string>()
  systemRoles.value.forEach(role => {
    role.permissions.forEach(perm => permissions.add(perm))
  })
  return Array.from(permissions).sort()
})

const roleStats = computed(() => {
  const totalUsers = users.value.length
  return [
    {
      name: 'admin',
      displayName: 'Administrators',
      count: users.value.filter(u => u.role === 'admin').length,
      percentage: totalUsers ? Math.round((users.value.filter(u => u.role === 'admin').length / totalUsers) * 100) : 0
    },
    {
      name: 'manager',
      displayName: 'Managers',
      count: users.value.filter(u => u.role === 'manager').length,
      percentage: totalUsers ? Math.round((users.value.filter(u => u.role === 'manager').length / totalUsers) * 100) : 0
    },
    {
      name: 'user',
      displayName: 'Users',
      count: users.value.filter(u => u.role === 'user').length,
      percentage: totalUsers ? Math.round((users.value.filter(u => u.role === 'user').length / totalUsers) * 100) : 0
    },
    {
      name: 'viewer',
      displayName: 'Viewers',
      count: users.value.filter(u => u.role === 'viewer').length,
      percentage: totalUsers ? Math.round((users.value.filter(u => u.role === 'viewer').length / totalUsers) * 100) : 0
    }
  ]
})

// Methods
const loadUsers = async () => {
  try {
    const q = query(collection(db, 'users'))
    const querySnapshot = await getDocs(q)
    users.value = querySnapshot.docs.map(doc => doc.data())
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const getUserCountForRole = (roleId: string) => {
  return users.value.filter(user => user.role === roleId).length
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

const editRole = (role: SystemRole) => {
  if (role.isSystem) {
    // For system roles, just show their permissions (read-only)
    editingRole.value = { ...role }
    roleForm.value = {
      name: role.name,
      description: role.description,
      permissions: [...role.permissions]
    }
    showCreateModal.value = true
  }
}

const saveRole = async () => {
  try {
    isLoading.value = true
    
    // TODO: Implement role saving to Firestore
    // This would involve creating/updating role documents
    console.log('Saving role:', roleForm.value)
    
    showCreateModal.value = false
    cancelEdit()
  } catch (error) {
    console.error('Error saving role:', error)
  } finally {
    isLoading.value = false
  }
}

const cancelEdit = () => {
  editingRole.value = null
  roleForm.value = {
    name: '',
    description: '',
    permissions: []
  }
  showCreateModal.value = false
}

onMounted(() => {
  if (authStore.isAdmin) {
    loadUsers()
  }
})
</script>
