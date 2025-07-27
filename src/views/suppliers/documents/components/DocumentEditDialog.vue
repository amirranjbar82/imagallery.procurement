<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Edit Document Details</DialogTitle>
        <DialogDescription>
          Update the description and metadata for this document
        </DialogDescription>
      </DialogHeader>
      
      <div v-if="document" class="space-y-4">
        <!-- File Info (Read-only) -->
        <div class="p-3 bg-gray-50 rounded-md">
          <div class="flex items-center space-x-3">
            <FileText class="h-8 w-8 text-gray-600" />
            <div>
              <p class="font-medium text-gray-900">{{ document.fileName }}</p>
              <p class="text-sm text-gray-500">
                {{ formatFileSize(document.fileSize) }} • 
                Uploaded {{ formatDate(document.createdAt) }}
              </p>
            </div>
          </div>
        </div>
        
        <!-- Description -->
        <div>
          <Label for="edit-description">Description</Label>
          <textarea
            id="edit-description"
            v-model="editDescription"
            placeholder="Add a description for this document..."
            class="mt-1 flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows="4"
          ></textarea>
        </div>
        
        <!-- Error Message -->
        <div v-if="error" class="p-3 bg-red-50 border border-red-200 rounded-md">
          <div class="flex">
            <AlertCircle class="h-4 w-4 text-red-600" />
            <span class="ml-2 text-sm text-red-600">{{ error }}</span>
          </div>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="updating">
          Cancel
        </Button>
        <Button @click="updateDocument" :disabled="updating">
          <Save class="h-4 w-4 mr-2" />
          {{ updating ? 'Saving...' : 'Save Changes' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { SupplierDocument } from '@/types/supplier'

// Icons
import { FileText, AlertCircle, Save } from 'lucide-vue-next'

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
// Using native textarea instead of missing Textarea component

// Props & Emits
interface Props {
  open: boolean
  document: SupplierDocument | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  updated: [document: SupplierDocument]
}>()

// Note: Store integration will be implemented when Firebase Storage is set up

// State
const editDescription = ref('')
const updating = ref(false)
const error = ref('')

// Watch for document changes
watch(() => props.document, (newDoc) => {
  if (newDoc) {
    editDescription.value = newDoc.description || ''
  }
}, { immediate: true })

// Methods
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

async function updateDocument() {
  if (!props.document) return
  
  try {
    updating.value = true
    error.value = ''
    
    // TODO: Implement actual document update
    // await supplierStore.updateSupplierDocument({
    //   documentId: props.document.documentId,
    //   description: editDescription.value
    // })
    
    // For now, simulate update
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Create updated document object
    const updatedDocument: SupplierDocument = {
      ...props.document,
      description: editDescription.value
    }
    
    emit('updated', updatedDocument)
    
  } catch (err) {
    console.error('Update error:', err)
    error.value = 'Failed to update document. Please try again.'
  } finally {
    updating.value = false
  }
}
</script>
