<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <History class="h-5 w-5" />
          Change Log - {{ taskTitle }}
        </DialogTitle>
        <DialogDescription>
          View all changes made to this task
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex-1 overflow-y-auto">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
        
        <div v-else-if="changeLogs.length === 0" class="text-center py-8 text-muted-foreground">
          <History class="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No changes recorded for this task yet.</p>
        </div>
        
        <div v-else class="space-y-4">
          <div
            v-for="log in changeLogs"
            :key="log.id"
            class="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
          >
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <component :is="getChangeIcon(log.changeType)" class="h-4 w-4 text-primary" />
                </div>
              </div>
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <Badge :variant="getChangeVariant(log.changeType)">
                    {{ getChangeTypeLabel(log.changeType) }}
                  </Badge>
                  <span class="text-sm text-muted-foreground">
                    {{ formatDate(log.changedAt) }}
                  </span>
                </div>
                
                <p class="text-sm mb-2">{{ log.description }}</p>
                
                <div v-if="log.fieldName && log.oldValue !== undefined && log.newValue !== undefined" 
                     class="bg-muted/30 rounded p-2 text-xs">
                  <div class="grid grid-cols-2 gap-2">
                    <div>
                      <span class="font-medium text-red-600">Before:</span>
                      <div class="mt-1 p-1 bg-red-50 rounded">{{ formatValue(log.oldValue) }}</div>
                    </div>
                    <div>
                      <span class="font-medium text-green-600">After:</span>
                      <div class="mt-1 p-1 bg-green-50 rounded">{{ formatValue(log.newValue) }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <div class="flex items-center gap-1">
                    <img 
                      v-if="log.changedBy.avatar" 
                      :src="log.changedBy.avatar" 
                      :alt="log.changedBy.name"
                      class="w-4 h-4 rounded-full"
                    />
                    <User v-else class="w-4 h-4" />
                    <span>{{ log.changedBy.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Close
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  History, 
  Plus, 
  Edit, 
  Archive, 
  RotateCcw, 
  User,
  UserCheck,
  CheckCircle
} from 'lucide-vue-next'
import { useTasksStore } from '../stores/tasks'
import type { TaskChangeLog } from '../types/task'

interface Props {
  open: boolean
  taskId: string
  taskTitle: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const tasksStore = useTasksStore()

const changeLogs = computed(() => {
  return tasksStore.getTaskChangeLogs(props.taskId).value
})

const loading = computed(() => tasksStore.loading)

// Watch for dialog opening to fetch logs
watch(() => props.open, (isOpen) => {
  if (isOpen && props.taskId) {
    tasksStore.fetchTaskChangeLogs(props.taskId)
  }
})

function getChangeIcon(changeType: TaskChangeLog['changeType']) {
  switch (changeType) {
    case 'created': return Plus
    case 'updated': return Edit
    case 'status_changed': return CheckCircle
    case 'assigned': return UserCheck
    case 'archived': return Archive
    case 'restored': return RotateCcw
    default: return Edit
  }
}

function getChangeVariant(changeType: TaskChangeLog['changeType']) {
  switch (changeType) {
    case 'created': return 'default'
    case 'updated': return 'secondary'
    case 'status_changed': return 'default'
    case 'assigned': return 'outline'
    case 'archived': return 'destructive'
    case 'restored': return 'default'
    default: return 'secondary'
  }
}

function getChangeTypeLabel(changeType: TaskChangeLog['changeType']) {
  switch (changeType) {
    case 'created': return 'Created'
    case 'updated': return 'Updated'
    case 'status_changed': return 'Status Changed'
    case 'assigned': return 'Assigned'
    case 'archived': return 'Archived'
    case 'restored': return 'Restored'
    default: return 'Changed'
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatValue(value: any) {
  if (value === null || value === undefined) return 'None'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}
</script>
