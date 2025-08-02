import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy } from 'firebase/firestore'
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
    const rootDepartments = departments.value.filter(d => !d.parentDepartmentId)
    return buildHierarchy(rootDepartments)
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

  async function deleteDepartment(departmentId: string) {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'departments', departmentId))
      departments.value = departments.value.filter(d => d.departmentId !== departmentId)
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

  function buildHierarchy(departments: Department[]): DepartmentHierarchy[] {
    return departments.map(dept => ({
      department: dept,
      children: buildHierarchy(
        departments.filter(d => d.parentDepartmentId === dept.departmentId)
      ),
      userCount: departmentAssignments.value.filter(a => a.departmentId === dept.departmentId).length,
      level: 0 // This would need to be calculated based on hierarchy depth
    }))
  }

  return {
    // State
    departments,
    departmentAssignments,
    loading,
    error,
    
    // Getters
    departmentHierarchy,
    getUserDepartments,
    
    // Actions
    fetchDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    assignUserToDepartment
  }
})
