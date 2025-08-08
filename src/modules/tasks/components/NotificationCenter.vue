<template>
  <div class="notification-center">
    <!-- Notification Bell Icon -->
    <div class="relative">
      <Button
        variant="ghost"
        size="sm"
        @click="toggleNotifications"
        class="relative p-2"
      >
        <Bell class="h-5 w-5" />
        <span
          v-if="unreadCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
        >
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </Button>

      <!-- Notifications Dropdown -->
      <div
        v-if="showNotifications"
        class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50"
        @click.stop
      >
        <!-- Header -->
        <div class="p-4 border-b">
          <div class="flex items-center justify-between">
            <h3 class="font-semibold text-gray-900">Notifications</h3>
            <div class="flex items-center space-x-2">
              <Button
                v-if="unreadCount > 0"
                variant="ghost"
                size="sm"
                @click="markAllAsRead"
                class="text-xs"
              >
                Mark all read
              </Button>
              <Button variant="ghost" size="sm" @click="showSettings = true">
                <Settings class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <!-- Notifications List -->
        <div class="max-h-96 overflow-y-auto">
          <div v-if="notifications.length === 0" class="p-8 text-center text-gray-500">
            <Bell class="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p class="text-sm">No notifications</p>
          </div>
          
          <div v-else class="divide-y">
            <div
              v-for="notification in notifications"
              :key="notification.id"
              :class="[
                'p-4 hover:bg-gray-50 cursor-pointer transition-colors',
                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              ]"
              @click="handleNotificationClick(notification)"
            >
              <div class="flex items-start space-x-3">
                <!-- Icon -->
                <div :class="[
                  'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                  getNotificationIconClass(notification.type)
                ]">
                  <component :is="getNotificationIcon(notification.type)" class="h-4 w-4" />
                </div>

                <!-- Content -->
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900">
                    {{ notification.title }}
                  </p>
                  <p class="text-sm text-gray-600 mt-1">
                    {{ notification.message }}
                  </p>
                  <div class="flex items-center justify-between mt-2">
                    <span class="text-xs text-gray-500">
                      {{ formatTime(notification.createdAt) }}
                    </span>
                    <div class="flex items-center space-x-2">
                      <Badge
                        :variant="getNotificationBadgeVariant(notification.type)"
                        class="text-xs"
                      >
                        {{ getNotificationTypeLabel(notification.type) }}
                      </Badge>
                      <Badge
                        :variant="getPriorityVariant(notification.priority)"
                        class="text-xs"
                      >
                        {{ notification.priority }}
                      </Badge>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click.stop="dismissNotification(notification.id)"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t bg-gray-50">
          <Button variant="ghost" size="sm" class="w-full text-center">
            View all notifications
          </Button>
        </div>
      </div>
    </div>

    <!-- Settings Modal -->
    <Dialog :open="showSettings" @update:open="showSettings = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Notification Settings</DialogTitle>
          <DialogDescription>
            Configure how you want to receive notifications
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <!-- Email Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-sm font-medium">Email Notifications</Label>
              <p class="text-xs text-gray-500">Receive notifications via email</p>
            </div>
            <Switch
              :checked="settings.email"
              @update:checked="updateSetting('email', $event)"
            />
          </div>

          <!-- Browser Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-sm font-medium">Browser Notifications</Label>
              <p class="text-xs text-gray-500">Show desktop notifications</p>
            </div>
            <Switch
              :checked="settings.browser"
              @update:checked="updateSetting('browser', $event)"
            />
          </div>

          <!-- Mobile Notifications -->
          <div class="flex items-center justify-between">
            <div>
              <Label class="text-sm font-medium">Mobile Push</Label>
              <p class="text-xs text-gray-500">Push notifications on mobile</p>
            </div>
            <Switch
              :checked="settings.mobile"
              @update:checked="updateSetting('mobile', $event)"
            />
          </div>

          <!-- Frequency -->
          <div>
            <Label class="text-sm font-medium mb-2 block">Notification Frequency</Label>
            <Select
              :value="settings.frequency"
              @update:value="updateSetting('frequency', $event)"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showSettings = false">
            Cancel
          </Button>
          <Button @click="saveSettings">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { 
  Bell, 
  Settings, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  MessageSquare,
  Calendar,
  UserPlus,
  FileText
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useNotificationsStore } from '../stores/notifications'
// Temporary types until notification types are properly set up
interface Notification {
  id: string
  title: string
  message: string
  type: string
  priority: string
  read: boolean
  userId?: string
  createdAt: Date
  readAt?: Date
  actionUrl?: string
  dismissed?: boolean
  category?: string
}

interface NotificationSettings {
  email: boolean
  browser: boolean
  mobile: boolean
  tasks: boolean
  projects: boolean
  mentions: boolean
  deadlines: boolean
}

// Store
const notificationsStore = useNotificationsStore()

// State
const showNotifications = ref(false)
const showSettings = ref(false)

// Computed
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const settings = computed(() => notificationsStore.settings)

// Methods
const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
}

const markAllAsRead = async () => {
  // TODO: Get current user ID from auth store
  const userId = 'current-user-id' // Placeholder
  await notificationsStore.markAllAsRead(userId)
}

const handleNotificationClick = async (notification: Notification) => {
  if (!notification.read) {
    await notificationsStore.markAsRead(notification.id)
  }
  
  // Handle navigation based on notification type
  if (notification.actionUrl) {
    // Navigate to the relevant page/task/project
    console.log('Navigate to:', notification.actionUrl)
  }
}

const dismissNotification = async (id: string) => {
  await notificationsStore.dismissNotification(id)
}

const updateSetting = (key: string, value: any) => {
  notificationsStore.updateSettings({ [key]: value })
}

const saveSettings = async () => {
  await notificationsStore.saveSettings()
  showSettings.value = false
}

// Notification type helpers
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'task_assigned': return UserPlus
    case 'task_completed': return CheckCircle
    case 'task_overdue': return AlertTriangle
    case 'comment_added': return MessageSquare
    case 'deadline_reminder': return Calendar
    case 'project_update': return FileText
    default: return Info
  }
}

const getNotificationIconClass = (type: string) => {
  switch (type) {
    case 'task_assigned': return 'bg-blue-100 text-blue-600'
    case 'task_completed': return 'bg-green-100 text-green-600'
    case 'task_overdue': return 'bg-red-100 text-red-600'
    case 'comment_added': return 'bg-purple-100 text-purple-600'
    case 'deadline_reminder': return 'bg-yellow-100 text-yellow-600'
    case 'project_update': return 'bg-indigo-100 text-indigo-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

const getNotificationBadgeVariant = (type: string) => {
  switch (type) {
    case 'task_overdue': return 'destructive'
    case 'task_completed': return 'default'
    case 'deadline_reminder': return 'secondary'
    default: return 'outline'
  }
}

const getNotificationTypeLabel = (type: string) => {
  switch (type) {
    case 'task_assigned': return 'Assignment'
    case 'task_completed': return 'Completed'
    case 'task_overdue': return 'Overdue'
    case 'comment_added': return 'Comment'
    case 'deadline_reminder': return 'Reminder'
    case 'project_update': return 'Project'
    default: return 'Info'
  }
}

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive'
    case 'medium': return 'default'
    case 'low': return 'secondary'
    default: return 'outline'
  }
}

const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Element
  if (!target.closest('.notification-center')) {
    showNotifications.value = false
  }
}

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // TODO: Get current user ID from auth store
  const userId = 'current-user-id' // Placeholder
  notificationsStore.fetchNotifications(userId)
  
  // Request browser notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.notification-center {
  position: relative;
}
</style>
