import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  writeBatch,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuthStore } from '@/modules/auth/stores/auth'
import type { 
  Task, 
  DeletedTask, 
  TaskChangeLog, 
  Project, 
  TaskFilter, 
  TaskSort, 
  CreateTaskRequest, 
  UpdateTaskRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  TaskStats,
  TaskActivity
} from '../types'
import { TaskStatus, TaskPriority, ProjectStatus } from '../types'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])
  const projects = ref<Project[]>([])
  const archivedTasks = ref<DeletedTask[]>([])
  const taskChangeLogs = ref<TaskChangeLog[]>([])
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
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        dueDate: doc.data().dueDate?.toDate(),
        startDate: doc.data().startDate?.toDate(),
        completedAt: doc.data().completedAt?.toDate()
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
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        timeline: {
          ...doc.data().timeline,
          startDate: doc.data().timeline?.startDate?.toDate() || new Date(),
          endDate: doc.data().timeline?.endDate?.toDate() || new Date()
        }
      })) as Project[]
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function createTask(task: CreateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const taskData: any = {
        title: task.title,
        priority: task.priority,
        departmentId: task.departmentId,
        assignedTo: task.assignedTo || [],
        status: task.status || TaskStatus.TODO,
        progress: 0,
        actualHours: 0,
        completionPercentage: 0,
        tags: task.tags || [],
        labels: task.labels || [],
        dependencies: [],
        blockedBy: [],
        subtasks: [],
        attachments: [],
        comments: [],
        watchers: [],
        timeTracking: [],
        customFields: task.customFields || {},
        createdAt: now,
        updatedAt: now,
        createdBy: '', // Will be set by auth context
        lastModifiedBy: ''
      }
      
      if (task.description !== undefined) {
        taskData.description = task.description
      }
      if (task.projectId !== undefined) {
        taskData.projectId = task.projectId
      }
      if (task.dueDate !== undefined) {
        taskData.dueDate = task.dueDate
      }
      if (task.startDate !== undefined) {
        taskData.startDate = task.startDate
      }
      if (task.estimatedHours !== undefined) {
        taskData.estimatedHours = task.estimatedHours
      }
      if (task.parentTaskId !== undefined) {
        taskData.parentTaskId = task.parentTaskId
      }
      
      const docRef = await addDoc(collection(db, 'tasks'), taskData)
      
      const newTask: any = {
        id: docRef.id,
        title: task.title,
        description: task.description || '',
        status: TaskStatus.TODO,
        priority: task.priority,
        assignedTo: task.assignedTo || [],
        departmentId: task.departmentId,
        tags: task.tags || [],
        labels: task.labels || [],
        dependencies: [],
        blockedBy: [],
        subtasks: [],
        attachments: [],
        comments: [],
        watchers: [],
        timeTracking: [],
        actualHours: 0,
        progress: 0,
        completionPercentage: 0,
        customFields: task.customFields || {},
        createdAt: now,
        updatedAt: now,
        createdBy: '',
        lastModifiedBy: ''
      }
      
      // Add optional fields if they exist
      if (task.projectId !== undefined) {
        newTask.projectId = task.projectId
      }
      if (task.dueDate !== undefined) {
        newTask.dueDate = task.dueDate
      }
      if (task.startDate !== undefined) {
        newTask.startDate = task.startDate
      }
      if (task.estimatedHours !== undefined) {
        newTask.estimatedHours = task.estimatedHours
      }
      
      tasks.value.unshift(newTask)
      
      // Log task creation
      await logTaskChange(
        docRef.id,
        'created',
        `Task "${task.title}" was created`
      )
      
      return newTask
    } catch (err) {
      error.value = 'Failed to create task'
      console.error('Error creating task:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateTask(taskId: string, updates: UpdateTaskRequest) {
    loading.value = true
    error.value = null
    try {
      const index = tasks.value.findIndex(t => t.id === taskId)
      const oldTask = index !== -1 ? { ...tasks.value[index] } : null
      
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      if (index !== -1) {
        tasks.value[index] = { ...tasks.value[index], ...updates, updatedAt: new Date() }
      }
      
      // Log changes for each updated field
      if (oldTask) {
        for (const [fieldName, newValue] of Object.entries(updates)) {
          if (fieldName !== 'updatedAt' && oldTask[fieldName as keyof Task] !== newValue) {
            await logTaskChange(
              taskId,
              'updated',
              `Updated ${fieldName} from "${oldTask[fieldName as keyof Task]}" to "${newValue}"`,
              fieldName,
              oldTask[fieldName as keyof Task],
              newValue
            )
          }
        }
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
    const updates: UpdateTaskRequest = { status }
    if (status === TaskStatus.DONE) {
      updates.progress = 100
    }
    await updateTask(taskId, updates)
  }

  async function deleteTask(taskId: string) {
    loading.value = true
    error.value = null
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex > -1) {
        const task = tasks.value[taskIndex]
        // Move to deleted tasks instead of permanent deletion
        const deletedTask = {
          ...task,
          deletedAt: new Date(),
          deletedBy: {
            id: 'current-user-id', // TODO: Get from auth store
            name: 'Current User', // TODO: Get from auth store
            avatar: undefined
          }
        }
        
        // Add to archived tasks collection in Firebase
        await addDoc(collection(db, 'archivedTasks'), deletedTask)
        
        // Remove from active tasks
        await deleteDoc(doc(db, 'tasks', taskId))
        tasks.value.splice(taskIndex, 1)
        
        // Add to local archived tasks
        archivedTasks.value.unshift(deletedTask)
        
        // Log task archiving
        await logTaskChange(
          taskId,
          'archived',
          `Task "${task.title}" was archived`
        )
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createProject(project: CreateProjectRequest) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'projects'), {
        ...project,
        status: ProjectStatus.PLANNING,
        progress: 0,
        collaboratingDepartments: project.collaboratingDepartments || [],
        team: project.team?.map(userId => ({ 
          userId, 
          userName: '', 
          role: 'member', 
          departmentId: project.departmentId,
          departmentName: '',
          joinedAt: now 
        })) || [],
        milestones: project.milestones?.map((m, i) => ({
          id: `milestone_${i}`,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          completed: false
        })) || [],
        attachments: [],
        comments: [],
        isPublic: project.isPublic || false,
        allowExternalCollaboration: project.allowExternalCollaboration || false,
        customFields: project.customFields || {},
        createdAt: now,
        updatedAt: now,
        createdBy: ''
      })
      
      const newProject: Project = {
        id: docRef.id,
        name: project.name,
        description: project.description,
        status: ProjectStatus.PLANNING,
        departmentId: project.departmentId,
        collaboratingDepartments: project.collaboratingDepartments || [],
        team: project.team?.map(userId => ({ 
          userId, 
          userName: '', 
          role: 'member', 
          departmentId: project.departmentId,
          departmentName: '',
          joinedAt: now 
        })) || [],
        projectManager: project.projectManager,
        budget: project.budget,
        timeline: project.timeline,
        progress: 0,
        milestones: project.milestones?.map((m, i) => ({
          id: `milestone_${i}`,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate,
          completed: false
        })) || [],
        createdAt: now,
        updatedAt: now,
        createdBy: '',
        tags: project.tags || [],
        category: project.category,
        priority: project.priority,
        attachments: [],
        comments: [],
        isPublic: project.isPublic || false,
        allowExternalCollaboration: project.allowExternalCollaboration || false,
        customFields: project.customFields || {}
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

  async function updateProject(projectId: string, updates: UpdateProjectRequest) {
    loading.value = true
    error.value = null
    try {
      const projectRef = doc(db, 'projects', projectId)
      await updateDoc(projectRef, {
        ...updates,
        updatedAt: new Date()
      })
      
      // Update local state
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update project'
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Subtask operations
  async function addSubtask(taskId: string, subtask: any) {
    loading.value = true
    error.value = null
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) throw new Error('Task not found')
      
      const task = tasks.value[taskIndex]
      const updatedSubtasks = [...(task.subtasks || []), subtask]
      
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      })
      
      // Update local state
      tasks.value[taskIndex] = {
        ...task,
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to add subtask'
      console.error('Error adding subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateSubtask(taskId: string, subtaskId: string, updates: any) {
    loading.value = true
    error.value = null
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) throw new Error('Task not found')
      
      const task = tasks.value[taskIndex]
      const updatedSubtasks = updateSubtaskRecursive(task.subtasks || [], subtaskId, updates)
      
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      })
      
      // Update local state
      tasks.value[taskIndex] = {
        ...task,
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update subtask'
      console.error('Error updating subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteSubtask(taskId: string, subtaskId: string) {
    loading.value = true
    error.value = null
    try {
      const taskIndex = tasks.value.findIndex(t => t.id === taskId)
      if (taskIndex === -1) throw new Error('Task not found')
      
      const task = tasks.value[taskIndex]
      const updatedSubtasks = removeSubtaskRecursive(task.subtasks || [], subtaskId)
      
      const taskRef = doc(db, 'tasks', taskId)
      await updateDoc(taskRef, {
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      })
      
      // Update local state
      tasks.value[taskIndex] = {
        ...task,
        subtasks: updatedSubtasks,
        updatedAt: new Date()
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete subtask'
      console.error('Error deleting subtask:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper functions for recursive subtask operations
  function updateSubtaskRecursive(subtasks: any[], subtaskId: string, updates: any): any[] {
    return subtasks.map(subtask => {
      if (subtask.id === subtaskId) {
        return { ...subtask, ...updates, updatedAt: new Date() }
      }
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        return {
          ...subtask,
          subtasks: updateSubtaskRecursive(subtask.subtasks, subtaskId, updates)
        }
      }
      return subtask
    })
  }

  function removeSubtaskRecursive(subtasks: any[], subtaskId: string): any[] {
    return subtasks.filter(subtask => {
      if (subtask.id === subtaskId) {
        return false
      }
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        subtask.subtasks = removeSubtaskRecursive(subtask.subtasks, subtaskId)
      }
      return true
    })
  }

  function addNestedSubtask(subtasks: any[], parentSubtaskId: string, newSubtask: any): any[] {
    return subtasks.map(subtask => {
      if (subtask.id === parentSubtaskId) {
        return {
          ...subtask,
          subtasks: [...(subtask.subtasks || []), newSubtask]
        }
      }
      if (subtask.subtasks && subtask.subtasks.length > 0) {
        return {
          ...subtask,
          subtasks: addNestedSubtask(subtask.subtasks, parentSubtaskId, newSubtask)
        }
      }
      return subtask
    })
  }

  // Archived Tasks Functions
  async function fetchArchivedTasks() {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'archivedTasks'), orderBy('deletedAt', 'desc'))
      const querySnapshot = await getDocs(q)
      archivedTasks.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as DeletedTask[]
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function restoreTask(taskId: string) {
    loading.value = true
    error.value = null
    try {
      const archivedTaskIndex = archivedTasks.value.findIndex(t => t.id === taskId)
      if (archivedTaskIndex > -1) {
        const archivedTask = archivedTasks.value[archivedTaskIndex]
        
        // Remove archived task specific fields
        const { deletedAt, deletedBy, ...restoredTask } = archivedTask as any
        
        // Add back to active tasks
        await addDoc(collection(db, 'tasks'), restoredTask)
        
        // Remove from archived tasks collection
        await deleteDoc(doc(db, 'archivedTasks', taskId))
        
        // Update local state
        archivedTasks.value.splice(archivedTaskIndex, 1)
        tasks.value.unshift(restoredTask as Task)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function permanentDeleteTask(taskId: string) {
    loading.value = true
    error.value = null
    try {
      // Remove from archived tasks collection
      await deleteDoc(doc(db, 'archivedTasks', taskId))
      
      // Remove from local state
      const index = archivedTasks.value.findIndex(t => t.id === taskId)
      if (index > -1) {
        archivedTasks.value.splice(index, 1)
      }
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function clearAllArchivedTasks() {
    loading.value = true
    error.value = null
    try {
      // Delete all documents in archivedTasks collection
      const batch = await import('firebase/firestore').then(m => m.writeBatch(db))
      const q = query(collection(db, 'archivedTasks'))
      const querySnapshot = await getDocs(q)
      
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })
      
      await batch.commit()
      
      // Clear local state
      archivedTasks.value = []
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    tasks,
    projects,
    archivedTasks,
    taskChangeLogs,
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
    deleteTask,
    createProject,
    updateProject,
    addSubtask,
    updateSubtask,
    deleteSubtask,
    
    // Archived Tasks Actions
    fetchArchivedTasks,
    restoreTask,
    permanentDeleteTask,
    clearAllArchivedTasks,
    
    // Change Log Actions
    logTaskChange,
    fetchTaskChangeLogs,
    getTaskChangeLogs
  }

  // Change Log Functions
  async function logTaskChange(
    taskId: string,
    changeType: TaskChangeLog['changeType'],
    description: string,
    fieldName?: string,
    oldValue?: any,
    newValue?: any
  ) {
    try {
      const user = useAuthStore().user
      if (!user) throw new Error('User not authenticated')

      const changeLog: Omit<TaskChangeLog, 'id'> = {
        taskId,
        changeType,
        fieldName,
        oldValue,
        newValue,
        changedBy: {
          id: user.uid,
          name: user.displayName || user.email || 'Unknown User',
          ...(user.photoURL && { avatar: user.photoURL })
        },
        changedAt: new Date(),
        description
      }

      // Remove undefined fields before sending to Firebase
      const firebaseData: any = {
        ...changeLog,
        changedAt: Timestamp.fromDate(changeLog.changedAt)
      }
      
      // Remove undefined fields
      Object.keys(firebaseData).forEach(key => {
        if (firebaseData[key] === undefined) {
          delete firebaseData[key]
        }
      })

      const docRef = await addDoc(collection(db, 'taskChangeLogs'), firebaseData)

      const newChangeLog: TaskChangeLog = {
        id: docRef.id,
        ...changeLog
      }

      taskChangeLogs.value.unshift(newChangeLog)
    } catch (err: any) {
      console.error('Error logging task change:', err)
      error.value = err.message
    }
  }

  async function fetchTaskChangeLogs(taskId: string) {
    try {
      loading.value = true
      const q = query(
        collection(db, 'taskChangeLogs'),
        where('taskId', '==', taskId),
        orderBy('changedAt', 'desc')
      )
      
      const querySnapshot = await getDocs(q)
      const logs: TaskChangeLog[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        logs.push({
          id: doc.id,
          ...data,
          changedAt: data.changedAt.toDate()
        } as TaskChangeLog)
      })
      
      taskChangeLogs.value = logs
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  function getTaskChangeLogs(taskId: string) {
    return computed(() => 
      taskChangeLogs.value.filter(log => log.taskId === taskId)
    )
  }
})
