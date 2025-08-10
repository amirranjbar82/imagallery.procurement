import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { 
  Project, 
  ProjectFilter, 
  ProjectSort, 
  CreateProjectRequest, 
  UpdateProjectRequest,
  ProjectStats,
  ProjectDashboard,
  ProjectActivity
} from '../types'
import { ProjectStatus } from '../types'

export const useProjectsStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentProject = ref<Project | null>(null)
  const filters = ref<ProjectFilter>({})
  const sort = ref<ProjectSort>({ field: 'createdAt', direction: 'desc' })

  // Safely normalize Firestore Timestamp | Date | string | number to Date
  function normalizeDate(input: any): Date | undefined {
    if (!input) return undefined
    if (input instanceof Date) return input
    if (typeof (input as any).toDate === 'function') {
      try { return (input as any).toDate() } catch { return undefined }
    }
    if (typeof input === 'string' || typeof input === 'number') {
      const d = new Date(input)
      return isNaN(d.getTime()) ? undefined : d
    }
    return undefined
  }

  // Getters
  const filteredProjects = computed(() => {
    let filtered = [...projects.value]

    // Apply filters
    if (filters.value.status?.length) {
      filtered = filtered.filter(p => filters.value.status!.includes(p.status))
    }
    if (filters.value.departmentId?.length) {
      filtered = filtered.filter(p => 
        filters.value.departmentId!.includes(p.departmentId) ||
        p.collaboratingDepartments.some(d => filters.value.departmentId!.includes(d))
      )
    }
    if (filters.value.projectManager?.length) {
      filtered = filtered.filter(p => filters.value.projectManager!.includes(p.projectManager))
    }
    if (filters.value.category?.length) {
      filtered = filtered.filter(p => filters.value.category!.includes(p.category))
    }
    if (filters.value.priority?.length) {
      filtered = filtered.filter(p => filters.value.priority!.includes(p.priority))
    }
    if (filters.value.tags?.length) {
      filtered = filtered.filter(p => 
        filters.value.tags!.some(tag => p.tags.includes(tag))
      )
    }
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.description.toLowerCase().includes(searchTerm)
      )
    }
    if (filters.value.myProjects) {
      // Will be implemented with auth context
      // filtered = filtered.filter(p => p.projectManager === currentUserId)
    }
    if (filters.value.overdue) {
      const now = new Date()
      filtered = filtered.filter(p => 
        p.timeline.endDate < now && p.status !== ProjectStatus.COMPLETED
      )
    }
    if (filters.value.budgetMin !== undefined) {
      filtered = filtered.filter(p => p.budget.total >= filters.value.budgetMin!)
    }
    if (filters.value.budgetMax !== undefined) {
      filtered = filtered.filter(p => p.budget.total <= filters.value.budgetMax!)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const field = sort.value.field
      const direction = sort.value.direction === 'asc' ? 1 : -1
      
      let aValue: any = a[field]
      let bValue: any = b[field]
      
      if (field === 'startDate' || field === 'endDate') {
        aValue = field === 'startDate' ? a.timeline.startDate : a.timeline.endDate
        bValue = field === 'startDate' ? b.timeline.startDate : b.timeline.endDate
      }
      
      if (aValue < bValue) return -1 * direction
      if (aValue > bValue) return 1 * direction
      return 0
    })

    return filtered
  })

  const projectsByDepartment = computed(() => (departmentId: string) => {
    return projects.value.filter(p => 
      p.departmentId === departmentId || 
      p.collaboratingDepartments.includes(departmentId)
    )
  })

  const projectsByStatus = computed(() => (status: ProjectStatus) => {
    return projects.value.filter(p => p.status === status)
  })

  const overdueProjects = computed(() => {
    const now = new Date()
    return projects.value.filter(p => 
      p.timeline.endDate < now && p.status !== ProjectStatus.COMPLETED
    )
  })

  const projectStats = computed((): ProjectStats => {
    const stats: ProjectStats = {
      total: projects.value.length,
      byStatus: {
        [ProjectStatus.PLANNING]: 0,
        [ProjectStatus.ACTIVE]: 0,
        [ProjectStatus.ON_HOLD]: 0,
        [ProjectStatus.COMPLETED]: 0,
        [ProjectStatus.CANCELLED]: 0
      },
      byDepartment: {},
      byCategory: {},
      byPriority: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      overdue: overdueProjects.value.length,
      completedThisMonth: 0,
      totalBudget: 0,
      spentBudget: 0,
      averageProgress: 0
    }

    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    let totalProgress = 0

    projects.value.forEach(project => {
      // Status stats
      stats.byStatus[project.status]++

      // Department stats
      if (!stats.byDepartment[project.departmentId]) {
        stats.byDepartment[project.departmentId] = 0
      }
      stats.byDepartment[project.departmentId]++

      // Category stats
      if (!stats.byCategory[project.category]) {
        stats.byCategory[project.category] = 0
      }
      stats.byCategory[project.category]++

      // Priority stats
      stats.byPriority[project.priority]++

      // Budget stats
      stats.totalBudget += project.budget.total
      stats.spentBudget += project.budget.spent

      // Progress stats
      totalProgress += project.progress

      // Completed this month
      if (project.status === ProjectStatus.COMPLETED && 
          project.updatedAt >= thisMonth) {
        stats.completedThisMonth++
      }
    })

    stats.averageProgress = projects.value.length > 0 ? totalProgress / projects.value.length : 0

    return stats
  })

  // Actions
  async function fetchProjects(filter?: Partial<ProjectFilter>) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'))
      
      if (filter?.departmentId) {
        q = query(q, where('departmentId', '==', filter.departmentId))
      }
      if (filter?.status?.length === 1) {
        q = query(q, where('status', '==', filter.status[0]))
      }
      if (filter?.projectManager) {
        q = query(q, where('projectManager', '==', filter.projectManager))
      }
      
      const snapshot = await getDocs(q)
      projects.value = snapshot.docs.map(d => {
        const data = d.data() as any
        return {
          id: d.id,
          ...data,
          createdAt: normalizeDate(data.createdAt) || new Date(),
          updatedAt: normalizeDate(data.updatedAt) || new Date(),
          timeline: {
            ...(data.timeline || {}),
            startDate: normalizeDate(data.timeline?.startDate) || new Date(),
            endDate: normalizeDate(data.timeline?.endDate) || new Date(),
            estimatedHours: data.timeline?.estimatedHours || 0,
            actualHours: data.timeline?.actualHours || 0
          },
          milestones: data.milestones?.map((m: any) => ({
            ...m,
            dueDate: normalizeDate(m.dueDate) || new Date(),
            completedAt: normalizeDate(m.completedAt)
          })) || []
        } as Project
      })
    } catch (err) {
      error.value = 'Failed to fetch projects'
      console.error('Error fetching projects:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      const projectDoc = await getDocs(query(
        collection(db, 'projects'), 
        where('__name__', '==', projectId),
        limit(1)
      ))
      
      if (!projectDoc.empty) {
        const doc = projectDoc.docs[0]
        currentProject.value = {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate() || new Date(),
          timeline: {
            ...doc.data().timeline,
            startDate: doc.data().timeline?.startDate?.toDate() || new Date(),
            endDate: doc.data().timeline?.endDate?.toDate() || new Date(),
            estimatedHours: doc.data().timeline?.estimatedHours || 0,
            actualHours: doc.data().timeline?.actualHours || 0
          }
        } as Project
      }
    } catch (err) {
      error.value = 'Failed to fetch project'
      console.error('Error fetching project:', err)
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
        budget: {
          ...project.budget,
          spent: 0,
          departmentAllocations: project.budget.departmentAllocations?.map(alloc => ({
            ...alloc,
            spent: 0
          })) || []
        },
        timeline: {
          ...project.timeline,
          actualHours: 0
        },
        createdAt: now,
        updatedAt: now,
        createdBy: '' // Will be set by auth context
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
        budget: {
          ...project.budget,
          spent: 0,
          departmentAllocations: project.budget.departmentAllocations?.map(alloc => ({
            ...alloc,
            spent: 0
          })) || []
        },
        timeline: {
          ...project.timeline,
          actualHours: 0
        },
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
      
      const index = projects.value.findIndex(p => p.id === projectId)
      if (index !== -1) {
        projects.value[index] = { ...projects.value[index], ...updates, updatedAt: new Date() }
      }
      
      if (currentProject.value?.id === projectId) {
        currentProject.value = { ...currentProject.value, ...updates, updatedAt: new Date() }
      }
    } catch (err) {
      error.value = 'Failed to update project'
      console.error('Error updating project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(projectId: string) {
    loading.value = true
    error.value = null
    try {
      await deleteDoc(doc(db, 'projects', projectId))
      
      projects.value = projects.value.filter(p => p.id !== projectId)
      if (currentProject.value?.id === projectId) {
        currentProject.value = null
      }
    } catch (err) {
      error.value = 'Failed to delete project'
      console.error('Error deleting project:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  function setFilters(newFilters: Partial<ProjectFilter>) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {}
  }

  function setSort(newSort: ProjectSort) {
    sort.value = newSort
  }

  function setCurrentProject(project: Project | null) {
    currentProject.value = project
  }

  return {
    // State
    projects,
    loading,
    error,
    currentProject,
    filters,
    sort,
    
    // Getters
    filteredProjects,
    projectsByDepartment,
    projectsByStatus,
    overdueProjects,
    projectStats,
    
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    setFilters,
    clearFilters,
    setSort,
    setCurrentProject
  }
})
