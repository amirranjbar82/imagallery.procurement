import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Department, DepartmentAssignment, DepartmentHierarchy } from '../types/organization'

export const useOrganizationStore = defineStore('organization', () => {
  // State
  const departments = ref<Department[]>([])
  const departmentAssignments = ref<DepartmentAssignment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const departmentHierarchy = computed(() => {
    // Only show active (non-deleted) departments
    const activeDepartments = departments.value.filter(d => !d.isDeleted)
    const rootDepartments = activeDepartments.filter(d => 
      !d.parentDepartmentId || 
      d.parentDepartmentId === undefined || 
      d.parentDepartmentId === null || 
      d.parentDepartmentId === '' || 
      d.parentDepartmentId === 'none'
    )
    console.log('Filtered root departments:', rootDepartments.map(d => ({ name: d.name, id: d.departmentId, parent: d.parentDepartmentId })))
    return buildHierarchy(rootDepartments, activeDepartments)
  })

  const deletedDepartments = computed(() => {
    return departments.value.filter(d => d.isDeleted === true)
  })

  const getUserDepartments = computed(() => (userId: string) => {
    return departmentAssignments.value
      .filter(assignment => assignment.userId === userId)
      .map(assignment => departments.value.find(d => d.departmentId === assignment.departmentId))
      .filter(Boolean) as Department[]
  })

  // Actions
  async function fetchDepartments() {
    loading.value = true
    error.value = null
    try {
      const querySnapshot = await getDocs(
        query(collection(db, 'departments'), orderBy('name'))
      )
      departments.value = querySnapshot.docs.map(doc => ({
        departmentId: doc.id,
        ...doc.data()
      })) as Department[]
    } catch (err) {
      error.value = 'Failed to fetch departments'
      console.error('Error fetching departments:', err)
    } finally {
      loading.value = false
    }
  }

  async function createDepartment(department: Omit<Department, 'departmentId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'departments'), {
        ...department,
        createdAt: now,
        updatedAt: now
      })
      
      const newDepartment: Department = {
        departmentId: docRef.id,
        ...department,
        createdAt: now,
        updatedAt: now
      }
      
      departments.value.push(newDepartment)
      return newDepartment
    } catch (err) {
      error.value = 'Failed to create department'
      console.error('Error creating department:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateDepartment(departmentId: string, updates: Partial<Department>) {
    loading.value = true
    error.value = null
    try {
      const departmentRef = doc(db, 'departments', departmentId)
      await updateDoc(departmentRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = departments.value.findIndex(d => d.departmentId === departmentId)
      if (index !== -1) {
        departments.value[index] = { ...departments.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update department'
      console.error('Error updating department:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteDepartment(departmentId: string, deletedBy: string = 'admin') {
    loading.value = true
    error.value = null
    try {
      // Find the department to be deleted
      const departmentToDelete = departments.value.find(d => d.departmentId === departmentId)
      if (!departmentToDelete) {
        throw new Error('Department not found')
      }
      
      // Check if department has children (only active children)
      const childDepartments = departments.value.filter(d => 
        d.parentDepartmentId === departmentId && !d.isDeleted
      )
      
      if (childDepartments.length > 0) {
        // Move children to the grandparent (one level up)
        const newParentId = departmentToDelete.parentDepartmentId || null
        console.log(`Moving ${childDepartments.length} child departments to parent: ${newParentId || 'root level'}`)
        
        // Update all child departments to have the grandparent as their new parent
        for (const child of childDepartments) {
          const childRef = doc(db, 'departments', child.departmentId)
          await updateDoc(childRef, {
            parentDepartmentId: newParentId,
            updatedAt: new Date()
          })
          
          // Update local state
          const index = departments.value.findIndex(d => d.departmentId === child.departmentId)
          if (index !== -1) {
            departments.value[index].parentDepartmentId = newParentId
            departments.value[index].updatedAt = new Date()
          }
        }
      }
      
      // Soft delete: mark as deleted instead of removing
      const departmentRef = doc(db, 'departments', departmentId)
      await updateDoc(departmentRef, {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: deletedBy,
        originalParentId: departmentToDelete.parentDepartmentId,
        updatedAt: new Date()
      })
      
      // Update local state
      const index = departments.value.findIndex(d => d.departmentId === departmentId)
      if (index !== -1) {
        departments.value[index].isDeleted = true
        departments.value[index].deletedAt = new Date()
        departments.value[index].deletedBy = deletedBy
        departments.value[index].originalParentId = departmentToDelete.parentDepartmentId
        departments.value[index].updatedAt = new Date()
      }
      
    } catch (err) {
      error.value = 'Failed to delete department'
      console.error('Error deleting department:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function assignUserToDepartment(assignment: Omit<DepartmentAssignment, 'assignedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      await addDoc(collection(db, 'departmentAssignments'), {
        ...assignment,
        assignedAt: now
      })
      
      departmentAssignments.value.push({
        ...assignment,
        assignedAt: now
      })
    } catch (err) {
      error.value = 'Failed to assign user to department'
      console.error('Error assigning user:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function buildHierarchy(rootDepartments: Department[], allDepartments = departments.value, level = 0): DepartmentHierarchy[] {
    return rootDepartments.map(dept => {
      const children = allDepartments.filter(d => d.parentDepartmentId === dept.departmentId)
      return {
        department: dept,
        children: children.length > 0 ? buildHierarchy(children, allDepartments, level + 1) : [],
        userCount: departmentAssignments.value.filter(a => a.departmentId === dept.departmentId).length,
        level
      }
    })
  }

  async function restoreDepartment(departmentId: string, newParentId: string | null = null) {
    loading.value = true
    error.value = null
    try {
      const departmentToRestore = departments.value.find(d => d.departmentId === departmentId)
      if (!departmentToRestore || !departmentToRestore.isDeleted) {
        throw new Error('Department not found or not deleted')
      }
      
      // Use provided parent or restore to original parent
      const restoreParentId = newParentId !== undefined ? newParentId : departmentToRestore.originalParentId
      
      // Restore department
      const departmentRef = doc(db, 'departments', departmentId)
      await updateDoc(departmentRef, {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        parentDepartmentId: restoreParentId,
        updatedAt: new Date()
      })
      
      // Update local state
      const index = departments.value.findIndex(d => d.departmentId === departmentId)
      if (index !== -1) {
        departments.value[index].isDeleted = false
        departments.value[index].deletedAt = undefined
        departments.value[index].deletedBy = undefined
        departments.value[index].parentDepartmentId = restoreParentId
        departments.value[index].updatedAt = new Date()
      }
      
      console.log(`Department ${departmentToRestore.name} restored to parent: ${restoreParentId || 'root'}`)
    } catch (err) {
      error.value = 'Failed to restore department'
      console.error('Error restoring department:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cleanupOrphanDepartments() {
    loading.value = true
    error.value = null
    try {
      // Find orphan departments (only check active departments)
      const activeDepartments = departments.value.filter(d => !d.isDeleted)
      const orphans = activeDepartments.filter(dept => {
        if (!dept.parentDepartmentId || dept.parentDepartmentId === '' || dept.parentDepartmentId === 'none') {
          return false // This is a root department
        }
        
        // Check if parent exists among active departments
        const parentExists = activeDepartments.some(parent => parent.departmentId === dept.parentDepartmentId)
        return !parentExists
      })
      
      console.log('Found orphan departments:', orphans.map(d => ({ name: d.name, id: d.departmentId, parent: d.parentDepartmentId })))
      
      // Delete orphan departments
      for (const orphan of orphans) {
        console.log(`Deleting orphan department: ${orphan.name} (ID: ${orphan.departmentId})`)
        await deleteDoc(doc(db, 'departments', orphan.departmentId))
        
        // Remove from local state
        departments.value = departments.value.filter(d => d.departmentId !== orphan.departmentId)
      }
      
      console.log(`Successfully deleted ${orphans.length} orphan departments`)
      return orphans.length
    } catch (err) {
      error.value = 'Failed to cleanup orphan departments'
      console.error('Error cleaning orphan departments:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function permanentlyDeleteDepartment(departmentId: string) {
    console.log('Store: Starting permanent deletion for department:', departmentId)
    loading.value = true
    error.value = null
    
    try {
      // Check if department exists in local state
      const deptToDelete = departments.value.find(d => d.departmentId === departmentId)
      if (!deptToDelete) {
        throw new Error(`Department with ID ${departmentId} not found in local state`)
      }
      
      console.log('Store: Found department to delete:', deptToDelete.name)
      
      // Hard delete from Firestore
      console.log('Store: Deleting from Firestore...')
      await deleteDoc(doc(db, 'departments', departmentId))
      console.log('Store: Successfully deleted from Firestore')
      
      // Remove from local state
      const originalCount = departments.value.length
      departments.value = departments.value.filter(d => d.departmentId !== departmentId)
      const newCount = departments.value.length
      
      console.log(`Store: Removed from local state. Count changed from ${originalCount} to ${newCount}`)
      console.log(`Store: Department ${departmentId} permanently deleted successfully`)
      
    } catch (err) {
      error.value = 'Failed to permanently delete department'
      console.error('Store: Error permanently deleting department:', err)
      console.error('Store: Error type:', typeof err)
      console.error('Store: Error message:', err instanceof Error ? err.message : 'Unknown error')
      throw err
    } finally {
      loading.value = false
      console.log('Store: Permanent deletion process completed')
    }
  }

  return {
    // State
    departments,
    departmentAssignments,
    loading,
    error,
    
    // Getters
    departmentHierarchy,
    deletedDepartments,
    getUserDepartments,
    
    // Actions
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    restoreDepartment,
    permanentlyDeleteDepartment,
    assignUserToDepartment,
    cleanupOrphanDepartments
  }
})
