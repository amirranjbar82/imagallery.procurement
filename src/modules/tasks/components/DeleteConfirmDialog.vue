<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle class="flex items-center space-x-2">
          <AlertTriangle class="h-5 w-5 text-red-500" />
          <span>Confirm Deletion</span>
        </DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete the {{ itemType }}.
        </DialogDescription>
      </DialogHeader>
      
      <div class="py-4">
        <div class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <AlertTriangle class="h-5 w-5 text-red-400" />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Are you sure you want to delete this {{ itemType }}?
              </h3>
              <div class="mt-2 text-sm text-red-700">
                <p><strong>{{ itemType === 'task' ? 'Task' : 'Project' }}:</strong> {{ itemName }}</p>
                <p v-if="itemDescription" class="mt-1 text-xs text-red-600">{{ itemDescription }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button 
          type="button" 
          variant="outline" 
          @click="$emit('update:open', false)"
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="destructive"
          :disabled="loading"
          @click="handleConfirm"
        >
          <span v-if="loading" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          <Trash2 class="h-4 w-4 mr-2" />
          Delete {{ itemType === 'task' ? 'Task' : 'Project' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, Trash2 } from 'lucide-vue-next'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

// Props & Emits
interface Props {
  open: boolean
  itemType: 'task' | 'project'
  itemName: string
  itemDescription?: string
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const loading = ref(false)

const handleConfirm = async () => {
  loading.value = true
  try {
    emit('confirm')
    emit('update:open', false)
  } catch (error) {
    console.error('Error during deletion:', error)
  } finally {
    loading.value = false
  }
}
</script>
