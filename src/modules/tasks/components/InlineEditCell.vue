<template>
  <div class="inline-edit-cell">
    <!-- Display Mode -->
    <div 
      v-if="!isEditing && !isDropdownType" 
      @click="startEdit"
      class="cursor-pointer hover:bg-gray-50 rounded px-1 py-0.5 min-h-[1.5rem] flex items-center"
    >
      <span v-if="type === 'text' || type === 'number'" class="text-sm">
        {{ displayValue || placeholder }}
      </span>
      <span v-else-if="type === 'date'">
        {{ value ? formatDate(value as Date) : 'No date set' }}
      </span>
      <span v-else-if="type === 'department'" class="text-xs text-gray-600">
        {{ getDepartmentLabel(value) || 'No Department' }}
      </span>
      <span v-else-if="type === 'description'" class="text-xs text-gray-600 truncate max-w-[200px] block">
        {{ value || 'No description' }}
      </span>
      <span v-else-if="type === 'assignee'">
        <div class="flex items-center space-x-2" v-if="getAssignedUsers()?.length">
          <div class="flex -space-x-2">
            <Avatar 
              v-for="user in getAssignedUsers().slice(0, 2)" 
              :key="user.id" 
              class="w-6 h-6 border-2 border-background"
            >
              <AvatarImage :src="user.avatar" />
              <AvatarFallback class="text-xs">{{ getInitials(user.name) }}</AvatarFallback>
            </Avatar>
            <div 
              v-if="getAssignedUsers().length > 2"
              class="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
            >
              +{{ getAssignedUsers().length - 2 }}
            </div>
          </div>
        </div>
        <span v-else class="text-sm text-gray-400">Unassigned</span>
      </span>
      <span v-else-if="type === 'assignedTo'" class="text-sm text-gray-700">
        {{ getAssignedToName(value) || 'Unassigned' }}
      </span>
      <span v-else-if="type === 'progress'">
        <div class="flex items-center space-x-2 w-full">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              :style="{ width: `${value || 0}%` }"
            ></div>
          </div>
          <span class="text-sm text-gray-600 min-w-[3rem]">{{ value || 0 }}%</span>
        </div>
      </span>
      <span v-else>
        {{ displayValue || placeholder }}
      </span>
    </div>

    <!-- Direct Dropdown Mode for better UX -->
    <div v-if="isDropdownType" class="inline-edit-dropdown">
      <!-- Status Select -->
      <Select v-if="type === 'status'" :model-value="value" @update:model-value="handleUpdate">
        <SelectTrigger class="w-full h-6 text-xs border-none shadow-none hover:bg-gray-50">
          <Badge :class="getStatusColorClass(value)" variant="outline" class="text-xs px-2 py-0.5">
            {{ value }}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="REVIEW">Review</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <!-- Priority Select -->
      <Select v-else-if="type === 'priority'" :model-value="value" @update:model-value="handleUpdate">
        <SelectTrigger class="w-full h-6 text-xs border-none shadow-none hover:bg-gray-50">
          <Badge :class="getPriorityColorClass(value)" class="text-xs px-2 py-0.5 border-none">
            {{ value }}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
        </SelectContent>
      </Select>

      <!-- Assigned To Select -->
      <Select v-else-if="type === 'assignedTo'" :model-value="value" @update:model-value="handleUpdate">
        <SelectTrigger class="w-full h-6 text-xs border-none shadow-none hover:bg-gray-50">
          <Badge variant="outline" class="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 border-blue-200">
            {{ getAssignedToName(value) || 'Unassigned' }}
          </Badge>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Unassigned</SelectItem>
          <SelectItem v-for="user in availableUsers" :key="user.value" :value="user.value">
            {{ user.label }}
          </SelectItem>
        </SelectContent>
      </Select>

      <!-- Department Select -->
      <Select v-else-if="type === 'department'" :model-value="value" @update:model-value="handleUpdate">
        <SelectTrigger class="w-full h-6 text-xs border-none shadow-none hover:bg-gray-50">
          <span class="text-xs text-gray-600">
            {{ getDepartmentLabel(value) || 'No Department' }}
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="dept in existingDepartments" :key="dept.value" :value="dept.value">
            {{ dept.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Edit Mode -->
    <div v-else-if="isEditing && !isDropdownType" class="inline-edit-form">
      <!-- Text Input -->
      <Input
        v-if="type === 'text'"
        v-model="editValue"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        :placeholder="placeholder"
        class="h-8 text-sm"
        ref="inputRef"
      />
      
      <!-- Number Input -->
      <Input
        v-else-if="type === 'number'"
        v-model.number="editValue"
        type="number"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        :placeholder="placeholder"
        class="h-8 text-sm w-20"
        ref="inputRef"
      />
      
      <!-- Progress Input -->
      <Input
        v-else-if="type === 'progress'"
        v-model.number="editValue"
        type="number"
        min="0"
        max="100"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        placeholder="0-100"
        class="h-8 text-sm w-20"
        ref="inputRef"
      />
      
      <!-- Department Select -->
      <Select v-else-if="type === 'department'" :model-value="value" @update:model-value="handleUpdate">
        <SelectTrigger class="w-full h-6 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="dept in existingDepartments" :key="dept.value" :value="dept.value">
            {{ dept.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <!-- Date Input -->
      <Input
        v-else-if="type === 'date'"
        v-model="editValue"
        type="date"
        @blur="saveEdit"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        class="h-8 text-sm w-36"
        ref="inputRef"
      />
      
      <!-- Department Select -->
      <Select
        v-else-if="type === 'department'"
        :model-value="editValue"
        @update:model-value="(val) => { editValue = val; saveEdit() }"
      >
        <SelectTrigger class="h-8 text-sm w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="option in options" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <!-- Assigned To Select -->
      <Select
        v-else-if="type === 'assignedTo'"
        :model-value="editValue"
        @update:model-value="(val) => { editValue = val; saveEdit() }"
      >
        <SelectTrigger class="h-8 text-sm w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="user in availableUsers" :key="user.value" :value="user.value">
            {{ user.label }}
          </SelectItem>
        </SelectContent>
      </Select>
      
      <!-- Description Textarea -->
      <textarea
        v-else-if="type === 'description'"
        v-model="editValue"
        @blur="saveEdit"
        @keydown.enter.ctrl="saveEdit"
        @keydown.escape="cancelEdit"
        class="w-full min-h-[60px] p-2 text-sm border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        :placeholder="placeholder || 'Enter description...'"
        ref="inputRef"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted } from 'vue'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { TaskStatus, TaskPriority } from '../types'
import { useOrganizationStore } from '@/modules/organization/stores/organization'
import { useAuthStore } from '@/modules/auth/stores/auth'

interface Props {
  value: any
  type: 'text' | 'number' | 'progress' | 'status' | 'priority' | 'date' | 'department' | 'description' | 'assignee' | 'assignedTo'
  placeholder?: string
  class?: string
  options?: Array<{ value: string; label: string }> // For department dropdown
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: any]
}>()

// Store instances
const organizationStore = useOrganizationStore()
const authStore = useAuthStore()

const isEditing = ref(false)
const editValue = ref(props.value)
const inputRef = ref<HTMLInputElement>()

const displayValue = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  if (props.type === 'date' && props.value) {
    return formatDate(props.value as Date)
  }
  return String(props.value)
})

// Check if this is a dropdown type that should be shown directly
const isDropdownType = computed(() => {
  return ['status', 'priority', 'assignedTo'].includes(props.type)
})

// Get departments from organization store
const existingDepartments = computed(() => {
  return organizationStore.departments
    .filter(dept => !dept.isDeleted) // Only active departments
    .map(dept => ({ value: dept.departmentId, label: dept.name }))
})

// Get users from auth store
const availableUsers = computed(() => {
  return authStore.users
    .filter(user => user.isActive) // Only active users
    .map(user => ({ value: user.uid, label: user.name }))
})

// Fetch data on mount
onMounted(async () => {
  try {
    await organizationStore.fetchDepartments()
    if (authStore.isAdmin) {
      await authStore.fetchUsers()
    }
  } catch (error) {
    console.error('Error fetching data:', error)
  }
})

// Watch for prop changes
watch(() => props.value, (newValue) => {
  editValue.value = newValue
})

async function startEdit() {
  isEditing.value = true
  editValue.value = props.value
  
  await nextTick()
  if (inputRef.value) {
    inputRef.value.focus()
    if (props.type === 'text') {
      inputRef.value.select()
    }
  }
}

function handleUpdate(value: any) {
  emit('update:value', value)
}

function saveEdit() {
  let finalValue = editValue.value
  
  // Type conversion and validation
  if (props.type === 'progress') {
    finalValue = Math.max(0, Math.min(100, Number(finalValue) || 0))
  } else if (props.type === 'number') {
    finalValue = Number(finalValue) || 0
  } else if (props.type === 'date') {
    finalValue = finalValue ? new Date(finalValue) : null
  }
  
  emit('update:value', finalValue)
  isEditing.value = false
}

function cancelEdit() {
  editValue.value = props.value
  isEditing.value = false
}

function getAssignedToName(userId: string) {
  if (!userId) return null
  const user = authStore.users.find(u => u.uid === userId)
  return user?.name || 'Unknown User'
}



function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: '2-digit',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function getStatusVariant(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO: return 'secondary'
    case TaskStatus.IN_PROGRESS: return 'default'
    case TaskStatus.REVIEW: return 'outline'
    case TaskStatus.DONE: return 'default'
    case TaskStatus.BLOCKED: return 'destructive'
    case TaskStatus.CANCELLED: return 'secondary'
    default: return 'secondary'
  }
}

function getStatusLabel(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO: return 'To Do'
    case TaskStatus.IN_PROGRESS: return 'In Progress'
    case TaskStatus.REVIEW: return 'Review'
    case TaskStatus.DONE: return 'Done'
    case TaskStatus.BLOCKED: return 'Blocked'
    case TaskStatus.CANCELLED: return 'Cancelled'
    default: return status
  }
}

function getPriorityVariant(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.LOW: return 'secondary'
    case TaskPriority.MEDIUM: return 'outline'
    case TaskPriority.HIGH: return 'default'
    case TaskPriority.CRITICAL: return 'destructive'
    default: return 'secondary'
  }
}

function getPriorityLabel(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.LOW: return 'Low'
    case TaskPriority.MEDIUM: return 'Medium'
    case TaskPriority.HIGH: return 'High'
    case TaskPriority.CRITICAL: return 'Critical'
    default: return priority
  }
}

function getPriorityColorClass(priority: TaskPriority) {
  switch (priority) {
    case TaskPriority.LOW: return 'bg-gray-100 text-gray-800 border-gray-200'
    case TaskPriority.MEDIUM: return 'bg-blue-100 text-blue-800 border-blue-200'
    case TaskPriority.HIGH: return 'bg-orange-100 text-orange-800 border-orange-200'
    case TaskPriority.CRITICAL: return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getStatusColorClass(status: TaskStatus) {
  switch (status) {
    case TaskStatus.TODO: return 'bg-gray-100 text-gray-800 border-gray-200'
    case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200'
    case TaskStatus.REVIEW: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case TaskStatus.DONE: return 'bg-green-100 text-green-800 border-green-200'
    case TaskStatus.BLOCKED: return 'bg-red-100 text-red-800 border-red-200'
    case TaskStatus.CANCELLED: return 'bg-gray-100 text-gray-800 border-gray-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

function getDepartmentLabel(departmentId: string) {
  if (!departmentId) return 'No Department'
  const department = organizationStore.departments.find(dept => dept.departmentId === departmentId)
  return department?.name || departmentId
}

function getAssignedUsers() {
  // For assignee type, the value should be an array of user objects
  if (props.type === 'assignee' && Array.isArray(props.value)) {
    return props.value
  }
  return []
}

function getInitials(name: string) {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
</script>

<style scoped>
@reference "tailwindcss";
.inline-edit-cell {
  @apply w-full;
}

.inline-edit-form {
  @apply flex items-center;
}
</style>
