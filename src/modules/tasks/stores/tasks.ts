import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Task, Project, TaskStatus, ProjectStatus } from '../types/tasks'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getTasksByProject = computed(() => (projectId: string) => {
    return tasks.value.filter(task => task.projectId === projectId)
  })

  const getTasksByAssignee = computed(() => (userId: string) => {
    return tasks.value.filter(task => task.assignedTo.includes(userId))
  })

  const getTasksByStatus = computed(() => (status: TaskStatus) => {
    return tasks.value.filter(task => task.status === status)
  })

  const getProjectsByDepartment = computed(() => (departmentId: string) => {
    return projects.value.filter(project => project.departmentId === departmentId)
  })

  // Actions
  async function fetchTasks(filters?: { projectId?: string; assigneeId?: string; departmentId?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'))
      
      if (filters?.projectId) {
        q = query(q, where('projectId', '==', filters.projectId))
      }
      if (filters?.departmentId) {
        q = query(q, where('departmentId', '==', filters.departmentId))
      }
      
      const querySnapshot = await getDocs(q)
      tasks.value = querySnapshot.docs.map(doc => ({
        taskId: doc.id,
        ...doc.data()
      })) as Task[]
    } catch (err) {
      error.value = 'Failed to fetch tasks'
      console.error('Error fetching tasks:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchProjects(departmentId?: string) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
      
      if (departmentId) {
        q = query(q, where('departmentId', '==', departmentId))
      }
      
      const querySnapshot = await getDocs(q)
      projects.value = querySnapshot.docs.map(doc => ({
        projectId: doc.id,
        ...doc.data()
      })) as Project[]
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function createTask(task: Omit<Task, 'taskId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'tasks'), {
        ...task,
        createdAt: now,
        updatedAt: now
      })
      
      const newTask: Task = {
        taskId: docRef.id,
        ...task,
        createdAt: now,
        updatedAt: now
      }
      
      tasks.value.unshift(newTask)
      return newTask
    } catch (err) {
      error.value = 'Failed to create task'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    loading.value = true
    error.value = null
    try {
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = tasks.value.findIndex(t => t.taskId === taskId)
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update task'
      console.error('Error updating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTaskStatus(taskId: string, status: TaskStatus) {
    const updates: Partial<Task> = { status }
    if (status === 'completed') {
      updates.completedAt = new Date()
    }
    await updateTask(taskId, updates)
  }

  async function createProject(project: Omit<Project, 'projectId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        createdAt: now,
        updatedAt: now
      })
      
      const newProject: Project = {
        projectId: docRef.id,
        ...project,
        createdAt: now,
        updatedAt: now
      }
      
      projects.value.unshift(newProject)
      return newProject
    } catch (err) {
      error.value = 'Failed to create project'
      console.error('Error creating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateProject(projectId: string, updates: Partial<Project>) {
    loading.value = true
    error.value = null
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      const index = projects.value.findIndex(p => p.projectId === projectId)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update project'
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    tasks,
    projects,
    loading,
    error,
    
    // Getters
    getTasksByProject,
    getTasksByAssignee,
    getTasksByStatus,
    getProjectsByDepartment,
    
    // Actions
    fetchTasks,
    fetchProjects,
    createTask,
    updateTask,
    updateTaskStatus,
    createProject,
    updateProject
  }
})
