import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, getDocs, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { 
  Notification, 
  NotificationSettings, 
  NotificationFilter,
  NotificationStats,
  CreateNotificationRequest,
  NotificationType,
  NotificationPriority,
  NotificationCategory
} from '../types/notification'

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref<Notification[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const settings = ref<NotificationSettings>({
    email: true,
    browser: true,
    mobile: false,
    frequency: 'immediate',
    categories: {
      task: { enabled: true, email: true, browser: true, mobile: false },
      project: { enabled: true, email: true, browser: true, mobile: false },
      comment: { enabled: true, email: false, browser: true, mobile: false },
      deadline: { enabled: true, email: true, browser: true, mobile: true },
      assignment: { enabled: true, email: true, browser: true, mobile: false },
      system: { enabled: true, email: false, browser: true, mobile: false },
      social: { enabled: true, email: false, browser: true, mobile: false }
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    },
    autoDismiss: {
      enabled: true,
      afterDays: 30
    }
  })

  // Getters
  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.read)
  })

  const unreadCount = computed(() => {
    return unreadNotifications.value.length
  })

  const notificationsByType = computed(() => (type: Notification['type']) => {
    return notifications.value.filter(n => n.type === type)
  })

  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 10)
  })

  // Actions
  async function fetchNotifications(userId: string, limitCount: number = 50) {
    loading.value = true
    error.value = null
    try {
      const q = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      notifications.value = querySnapshot.docs.map(d => {
        const data = d.data() as any
        return {
          id: d.id,
          ...data,
          createdAt: normalizeDate(data.createdAt) || new Date(),
          readAt: normalizeDate(data.readAt)
        } as Notification
      })
    } catch (err) {
      error.value = 'Failed to fetch notifications'
      console.error('Error fetching notifications:', err)
    } finally {
      loading.value = false
    }
  }

  async function createNotification(notification: Omit<Notification, 'id' | 'createdAt'>) {
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notification,
        createdAt: serverTimestamp()
      })
      
      const newNotification: Notification = {
        id: docRef.id,
        ...notification,
        createdAt: now
      }
      
      notifications.value.unshift(newNotification)
      return newNotification
    } catch (err) {
      console.error('Error creating notification:', err)
      throw err
    }
  }

  async function markAsRead(notificationId: string) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const notificationRef = doc(db, 'notifications', notificationId)
      await updateDoc(notificationRef, {
        read: true,
        readAt: now
      })
      
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        notifications.value[index] = { 
          ...notifications.value[index], 
          read: true, 
          readAt: now 
        }
      }
    } catch (err) {
      error.value = 'Failed to mark notification as read'
      console.error('Error marking notification as read:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function markAllAsRead(userId: string) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const unread = notifications.value.filter(n => !n.read && n.userId === userId)
      
      // Update in Firebase
      const updatePromises = unread.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), {
          read: true,
          readAt: now
        })
      )
      
      await Promise.all(updatePromises)
      
      // Update local state
      notifications.value = notifications.value.map(n => 
        n.userId === userId && !n.read 
          ? { ...n, read: true, readAt: now }
          : n
      )
    } catch (err) {
      error.value = 'Failed to mark all notifications as read'
      console.error('Error marking all notifications as read:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Helper functions for creating specific notification types
  async function notifyTaskAssigned(taskId: string, taskTitle: string, assignedUserId: string, assignedByUserId: string) {
    return createNotification({
      userId: assignedUserId,
      title: 'New Task Assigned',
      message: `You have been assigned to task: ${taskTitle}`,
      type: 'task_assigned',
      entityId: taskId,
      entityType: 'task',
      read: false,
      actionUrl: `/tasks/${taskId}`,
      metadata: {
        assignedBy: assignedByUserId,
        taskTitle
      }
    })
  }

  async function notifyTaskCompleted(taskId: string, taskTitle: string, completedByUserId: string, notifyUserIds: string[]) {
    const promises = notifyUserIds.map(userId => 
      createNotification({
        userId,
        title: 'Task Completed',
        message: `Task "${taskTitle}" has been completed`,
        type: 'task_completed',
        entityId: taskId,
        entityType: 'task',
        read: false,
        actionUrl: `/tasks/${taskId}`,
        metadata: {
          completedBy: completedByUserId,
          taskTitle
        }
      })
    )
    
    return Promise.all(promises)
  }

  async function notifyProjectUpdated(projectId: string, projectName: string, updatedByUserId: string, notifyUserIds: string[]) {
    const promises = notifyUserIds.map(userId => 
      createNotification({
        userId,
        title: 'Project Updated',
        message: `Project "${projectName}" has been updated`,
        type: 'project_updated',
        entityId: projectId,
        entityType: 'project',
        read: false,
        actionUrl: `/projects/${projectId}`,
        metadata: {
          updatedBy: updatedByUserId,
          projectName
        }
      })
    )
    
    return Promise.all(promises)
  }

  async function notifyDeadlineReminder(entityId: string, entityType: 'task' | 'project', entityTitle: string, userId: string, dueDate: Date) {
    return createNotification({
      userId,
      title: 'Deadline Reminder',
      message: `${entityType === 'task' ? 'Task' : 'Project'} "${entityTitle}" is due soon`,
      type: 'deadline_reminder',
      entityId,
      entityType,
      read: false,
      actionUrl: `/${entityType}s/${entityId}`,
      metadata: {
        dueDate: dueDate.toISOString(),
        entityTitle
      }
    })
  }

  async function notifyMention(entityId: string, entityType: 'task' | 'project', mentionedUserId: string, mentionedByUserId: string, context: string) {
    return createNotification({
      userId: mentionedUserId,
      title: 'You were mentioned',
      message: `You were mentioned in a ${entityType}: ${context}`,
      type: 'mention',
      entityId,
      entityType,
      read: false,
      actionUrl: `/${entityType}s/${entityId}`,
      metadata: {
        mentionedBy: mentionedByUserId,
        context
      }
    })
  }

  function clearNotifications() {
    notifications.value = []
  }

  // Settings management
  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    settings.value = { ...settings.value, ...newSettings }
  }

  const saveSettings = async () => {
    try {
      // Save to localStorage or Firebase
      localStorage.setItem('notification-settings', JSON.stringify(settings.value))
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    }
  }

  const dismissNotification = async (id: string) => {
    try {
      const notificationRef = doc(db, 'notifications', id)
      await updateDoc(notificationRef, {
        dismissed: true,
        dismissedAt: new Date()
      })
      
      // Update local state
      const index = notifications.value.findIndex(n => n.id === id)
      if (index !== -1) {
        notifications.value[index].dismissed = true
        notifications.value[index].dismissedAt = new Date()
      }
    } catch (err) {
      error.value = 'Failed to dismiss notification'
      console.error('Error dismissing notification:', err)
    }
  }

  return {
    // State
    notifications,
    loading,
    error,
    settings,
    
    // Getters
    unreadNotifications,
    unreadCount,
    notificationsByType,
    recentNotifications,
    
    // Actions
    fetchNotifications,
    createNotification,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    updateSettings,
    saveSettings,
    clearNotifications,
    
    // Helper functions
    notifyTaskAssigned,
    notifyTaskCompleted,
    notifyProjectUpdated,
    notifyDeadlineReminder,
    notifyMention
  }
})
