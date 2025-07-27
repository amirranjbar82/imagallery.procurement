<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <Button @click="$router.push('/settings')" variant="outline" size="sm">
          <ArrowLeft class="h-4 w-4 mr-2" />
          Back to Settings
        </Button>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">User Management</h2>
          <p class="text-gray-600 mt-1">Manage user accounts, roles, and permissions</p>
        </div>
      </div>
      <Button @click="showCreateModal = true" v-if="authStore.isAdmin">
        <UserPlus class="mr-2 h-4 w-4" />
        Create User
      </Button>
    </div>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <CardTitle>System Users</CardTitle>
        <CardDescription>Manage user accounts and roles</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.uid">
              <TableCell class="font-medium">{{ user.name }}</TableCell>
              <TableCell>{{ user.email }}</TableCell>
              <TableCell>
                <Badge :variant="getRoleVariant(user.role)">
                  {{ user.role.toUpperCase() }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :variant="user.isActive ? 'default' : 'secondary'">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </Badge>
              </TableCell>
              <TableCell>
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
              </TableCell>
              <TableCell class="text-right">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  @click="editUser(user)"
                  v-if="authStore.isAdmin && user.uid !== authStore.user?.uid"
                >
                  <Edit class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Create User Dialog -->
    <Dialog v-model:open="showCreateModal">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Add a new user to the system with specified role and permissions.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="createUser" class="space-y-4">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="name" class="text-right">Name</Label>
            <Input
              id="name"
              v-model="newUser.name"
              class="col-span-3"
              required
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="email" class="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="newUser.email"
              class="col-span-3"
              required
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="password" class="text-right">Password</Label>
            <Input
              id="password"
              type="password"
              v-model="newUser.password"
              class="col-span-3"
              required
              minlength="6"
            />
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="role" class="text-right">Role</Label>
            <Select v-model="newUser.role">
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
          <DialogFooter>
            <Button type="button" variant="outline" @click="showCreateModal = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="authStore.isLoading">
              <Loader2 v-if="authStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Edit User Dialog -->
    <Dialog v-model:open="showEditModal">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Update user role and permissions.
          </DialogDescription>
        </DialogHeader>
        <form @submit.prevent="updateUserRole" class="space-y-4" v-if="editingUser">
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Name</Label>
            <div class="col-span-3 text-sm text-muted-foreground">
              {{ editingUser.name }}
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label class="text-right">Email</Label>
            <div class="col-span-3 text-sm text-muted-foreground">
              {{ editingUser.email }}
            </div>
          </div>
          <div class="grid grid-cols-4 items-center gap-4">
            <Label for="editRole" class="text-right">Role</Label>
            <Select v-model="editingUser.role">
              <SelectTrigger class="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" @click="showEditModal = false">
              Cancel
            </Button>
            <Button type="submit" :disabled="authStore.isLoading">
              <Loader2 v-if="authStore.isLoading" class="mr-2 h-4 w-4 animate-spin" />
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { useAuthStore } from '@/stores/auth'
import { db } from '@/lib/firebase'
import type { UserProfile } from '@/stores/auth'

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
import { UserPlus, Edit, Loader2, ArrowLeft } from 'lucide-vue-next'

const authStore = useAuthStore()

// State
const users = ref<UserProfile[]>([])
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingUser = ref<UserProfile | null>(null)

const newUser = ref({
  name: '',
  email: '',
  password: '',
  role: 'user' as const
})

// Methods
const loadUsers = async () => {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    users.value = querySnapshot.docs.map(doc => doc.data() as UserProfile)
  } catch (error) {
    console.error('Error loading users:', error)
  }
}

const createUser = async () => {
  try {
    const userRole = newUser.value.role as 'admin' | 'manager' | 'user' | 'viewer'
    
    switch (userRole) {
      case 'admin':
        await authStore.createAdminUser(newUser.value.email, newUser.value.password, newUser.value.name)
        break
      
      case 'user':
        // Default role - just create the user
        await authStore.signUp(newUser.value.email, newUser.value.password, newUser.value.name)
        break
      
      case 'manager':
      case 'viewer':
        // Create user with default role, then update role
        await authStore.signUp(newUser.value.email, newUser.value.password, newUser.value.name)
        // TODO: Implement role update functionality
        // You'd need to get the UID and update the role in Firestore
        console.warn(`Role update for ${userRole} users not yet implemented`)
        break
      
      default:
        throw new Error(`Unsupported role: ${userRole}`)
    }
    
    showCreateModal.value = false
    newUser.value = { name: '', email: '', password: '', role: 'user' }
    await loadUsers()
  } catch (error) {
    console.error('Error creating user:', error)
  }
}

const editUser = (user: UserProfile) => {
  editingUser.value = { ...user }
  showEditModal.value = true
}

const updateUserRole = async () => {
  if (!editingUser.value) return

  try {
    await authStore.updateUserRole(editingUser.value.uid, editingUser.value.role)
    showEditModal.value = false
    editingUser.value = null
    await loadUsers()
  } catch (error) {
    console.error('Error updating user role:', error)
  }
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
  if (!date) return 'Never'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString()
}

onMounted(() => {
  if (authStore.isAdmin) {
    loadUsers()
  }
})
</script>
