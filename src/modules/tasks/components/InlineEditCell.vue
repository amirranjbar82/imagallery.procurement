<template>
  <div class="inline-edit-cell">
    <!-- Display Mode -->
    <div 
      v-if="!isEditing" 
      @click="startEdit"
      class="cursor-pointer hover:bg-gray-50 rounded px-2 py-1 min-h-[2rem] flex items-center group"
      :class="{ 'text-gray-400': !displayValue }"
    >
      <span v-if="type === 'status'">
        <Badge :variant="getStatusVariant(value as TaskStatus)">
          {{ getStatusLabel(value as TaskStatus) }}
        </Badge>
      </span>
      <span v-else-if="type === 'priority'">
        <Badge :variant="getPriorityVariant(value as TaskPriority)">
          {{ getPriorityLabel(value as TaskPriority) }}
        </Badge>
      </span>
      <span v-else-if="type === 'date'">
        {{ value ? formatDate(value as Date) : 'No date set' }}
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
      <Edit class="w-3 h-3 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>

    <!-- Edit Mode -->
    <div v-else class="inline-edit-form">
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
      
      <!-- Status Select -->
      <Select v-else-if="type === 'status'" v-model="editValue" @update:model-value="saveEdit">
        <SelectTrigger class="h-8 text-sm w-32">
          <SelectValue />
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
      <Select v-else-if="type === 'priority'" v-model="editValue" @update:model-value="saveEdit">
        <SelectTrigger class="h-8 text-sm w-24">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="LOW">Low</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Edit } from 'lucide-vue-next'
import { TaskStatus, TaskPriority } from '../types'

interface Props {
  value: any
  type: 'text' | 'number' | 'progress' | 'status' | 'priority' | 'date'
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:value': [value: any]
}>()

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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
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
</script>

<style scoped>
.inline-edit-cell {
  @apply w-full;
}

.inline-edit-form {
  @apply flex items-center;
}
</style>
