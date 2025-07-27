import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from './auth'
import type { 
  UserSupplierAccess,
  UserFieldPermission,
  CreateUserSupplierAccessRequest,
  CreateUserFieldPermissionRequest,
  UpdateUserSupplierAccessRequest,
  UpdateUserFieldPermissionRequest,
  UserAccessSummary,
  PermissionPreset
} from '@/types/access-control'

export const useAccessControlStore = defineStore('accessControl', () => {
  // State
  const userSupplierAccess = ref<UserSupplierAccess[]>([])
  const userFieldPermissions = ref<UserFieldPermission[]>([])
  const userAccessSummaries = ref<UserAccessSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Auth store
  const authStore = useAuthStore()

  // Collection references
  const userSupplierAccessCollection = collection(db, 'userSupplierAccess')
  const userFieldPermissionsCollection = collection(db, 'userFieldPermissions')

  // Computed
  const getUserSupplierAccess = computed(() => (userId: string) => {
    return userSupplierAccess.value.filter(access => access.userId === userId)
  })

  const getUserFieldPermissions = computed(() => (userId: string, supplierId?: string) => {
    return userFieldPermissions.value.filter(permission => 
      permission.userId === userId && 
      (supplierId ? permission.supplierId === supplierId : !permission.supplierId)
    )
  })

  const hasSupplierAccess = computed(() => (userId: string, supplierId: string, permissionType: string) => {
    const access = userSupplierAccess.value.find(
      a => a.userId === userId && a.supplierId === supplierId
    )
    return access?.permissions.includes(permissionType as any) || false
  })

  const isFieldVisible = computed(() => (userId: string, fieldName: string, supplierId?: string) => {
    const permission = userFieldPermissions.value.find(
      p => p.userId === userId && 
           p.fieldName === fieldName && 
           (supplierId ? p.supplierId === supplierId : !p.supplierId)
    )
    return permission?.visible || false
  })

  // Actions
  async function fetchUserSupplierAccess() {
    try {
      loading.value = true
      error.value = null

      const snapshot = await getDocs(query(userSupplierAccessCollection, orderBy('createdAt', 'desc')))
      
      userSupplierAccess.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as UserSupplierAccess[]

    } catch (err) {
      console.error('Error fetching user supplier access:', err)
      error.value = 'Failed to fetch user supplier access'
    } finally {
      loading.value = false
    }
  }

  async function fetchUserFieldPermissions() {
    try {
      loading.value = true
      error.value = null

      const snapshot = await getDocs(query(userFieldPermissionsCollection, orderBy('createdAt', 'desc')))
      
      userFieldPermissions.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as UserFieldPermission[]

    } catch (err) {
      console.error('Error fetching user field permissions:', err)
      error.value = 'Failed to fetch user field permissions'
    } finally {
      loading.value = false
    }
  }

  async function createUserSupplierAccess(accessData: CreateUserSupplierAccessRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      // Check if access already exists
      const existingQuery = query(
        userSupplierAccessCollection,
        where('userId', '==', accessData.userId),
        where('supplierId', '==', accessData.supplierId)
      )
      const existingSnapshot = await getDocs(existingQuery)

      if (!existingSnapshot.empty) {
        error.value = 'User already has access to this supplier'
        return null
      }

      const newAccess = {
        ...accessData,
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(userSupplierAccessCollection, newAccess)
      
      // Add to local state
      const createdAccess: UserSupplierAccess = {
        id: docRef.id,
        ...accessData,
        createdBy: authStore.user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      userSupplierAccess.value.unshift(createdAccess)
      
      return docRef.id

    } catch (err) {
      console.error('Error creating user supplier access:', err)
      error.value = 'Failed to create user supplier access'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUserSupplierAccess(updateData: UpdateUserSupplierAccessRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(userSupplierAccessCollection, updateData.id)
      await updateDoc(docRef, {
        permissions: updateData.permissions,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = userSupplierAccess.value.findIndex(a => a.id === updateData.id)
      if (index !== -1) {
        userSupplierAccess.value[index] = {
          ...userSupplierAccess.value[index],
          permissions: updateData.permissions,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating user supplier access:', err)
      error.value = 'Failed to update user supplier access'
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteUserSupplierAccess(accessId: string): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(userSupplierAccessCollection, accessId)
      await deleteDoc(docRef)

      // Remove from local state
      userSupplierAccess.value = userSupplierAccess.value.filter(a => a.id !== accessId)

      return true

    } catch (err) {
      console.error('Error deleting user supplier access:', err)
      error.value = 'Failed to delete user supplier access'
      return false
    } finally {
      loading.value = false
    }
  }

  async function createUserFieldPermission(permissionData: CreateUserFieldPermissionRequest): Promise<string | null> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const newPermission = {
        ...permissionData,
        createdBy: authStore.user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      const docRef = await addDoc(userFieldPermissionsCollection, newPermission)
      
      // Add to local state
      const createdPermission: UserFieldPermission = {
        id: docRef.id,
        ...permissionData,
        createdBy: authStore.user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      userFieldPermissions.value.unshift(createdPermission)
      
      return docRef.id

    } catch (err) {
      console.error('Error creating user field permission:', err)
      error.value = 'Failed to create user field permission'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateUserFieldPermission(updateData: UpdateUserFieldPermissionRequest): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      const docRef = doc(userFieldPermissionsCollection, updateData.id)
      await updateDoc(docRef, {
        visible: updateData.visible,
        updatedAt: serverTimestamp()
      })

      // Update local state
      const index = userFieldPermissions.value.findIndex(p => p.id === updateData.id)
      if (index !== -1) {
        userFieldPermissions.value[index] = {
          ...userFieldPermissions.value[index],
          visible: updateData.visible,
          updatedAt: new Date()
        }
      }

      return true

    } catch (err) {
      console.error('Error updating user field permission:', err)
      error.value = 'Failed to update user field permission'
      return false
    } finally {
      loading.value = false
    }
  }

  async function applyPermissionPreset(userId: string, supplierId: string, preset: PermissionPreset): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const batch = writeBatch(db)

      // Delete existing field permissions for this user and supplier
      const existingQuery = query(
        userFieldPermissionsCollection,
        where('userId', '==', userId),
        where('supplierId', '==', supplierId)
      )
      const existingSnapshot = await getDocs(existingQuery)
      
      existingSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      // Create new permissions based on preset
      Object.entries(preset.fieldPermissions).forEach(([fieldName, visible]) => {
        const newPermissionRef = doc(userFieldPermissionsCollection)
        batch.set(newPermissionRef, {
          userId,
          supplierId,
          fieldName,
          visible,
          createdBy: authStore.user!.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()

      // Refresh local state
      await fetchUserFieldPermissions()

      return true

    } catch (err) {
      console.error('Error applying permission preset:', err)
      error.value = 'Failed to apply permission preset'
      return false
    } finally {
      loading.value = false
    }
  }

  async function bulkAssignSuppliers(userId: string, supplierIds: string[]): Promise<boolean> {
    try {
      loading.value = true
      error.value = null

      if (!authStore.user) {
        throw new Error('User not authenticated')
      }

      const batch = writeBatch(db)

      supplierIds.forEach(supplierId => {
        const newAccessRef = doc(userSupplierAccessCollection)
        batch.set(newAccessRef, {
          userId,
          supplierId,
          permissions: ['read'], // Default to read permission
          createdBy: authStore.user!.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      })

      await batch.commit()

      // Refresh local state
      await fetchUserSupplierAccess()

      return true

    } catch (err) {
      console.error('Error bulk assigning suppliers:', err)
      error.value = 'Failed to assign suppliers'
      return false
    } finally {
      loading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    // State
    userSupplierAccess,
    userFieldPermissions,
    userAccessSummaries,
    loading,
    error,
    
    // Computed
    getUserSupplierAccess,
    getUserFieldPermissions,
    hasSupplierAccess,
    isFieldVisible,
    
    // Actions
    fetchUserSupplierAccess,
    fetchUserFieldPermissions,
    createUserSupplierAccess,
    updateUserSupplierAccess,
    deleteUserSupplierAccess,
    createUserFieldPermission,
    updateUserFieldPermission,
    applyPermissionPreset,
    bulkAssignSuppliers,
    clearError
  }
})
