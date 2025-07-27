<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogDescription>
          Upload a new document for this supplier
        </DialogDescription>
      </DialogHeader>
      
      <div class="space-y-4">
        <!-- File Upload Area -->
        <div 
          @drop="handleDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': isDragging }"
        >
          <input
            ref="fileInput"
            type="file"
            @change="handleFileSelect"
            class="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
            multiple
          />
          
          <div v-if="!selectedFiles.length">
            <Upload class="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600">
              <button @click="(fileInput as HTMLInputElement)?.click()" class="text-blue-600 hover:text-blue-500">
                Click to upload
              </button>
              or drag and drop
            </p>
            <p class="text-xs text-gray-500 mt-1">
              PDF, DOC, XLS, or image files up to 10MB
            </p>
          </div>
          
          <div v-else class="space-y-2">
            <div v-for="(file, index) in selectedFiles" :key="index" class="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div class="flex items-center space-x-2">
                <FileText class="h-4 w-4 text-gray-600" />
                <span class="text-sm text-gray-900">{{ file.name }}</span>
                <span class="text-xs text-gray-500">({{ formatFileSize(file.size) }})</span>
              </div>
              <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
                <X class="h-4 w-4" />
              </button>
            </div>
            <button @click="(fileInput as HTMLInputElement)?.click()" class="text-sm text-blue-600 hover:text-blue-500">
              Add more files
            </button>
          </div>
        </div>
        
        <!-- Description -->
        <div>
          <Label for="description">Description (Optional)</Label>
          <textarea
            id="description"
            v-model="description"
            placeholder="Add a description for this document..."
            class="mt-1 flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            rows="3"
          ></textarea>
        </div>
        
        <!-- Upload Progress -->
        <div v-if="uploading" class="space-y-2">
          <div class="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div 
              class="bg-blue-600 h-2 rounded-full transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
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
        <Button variant="outline" @click="$emit('update:open', false)" :disabled="uploading">
          Cancel
        </Button>
        <Button @click="uploadFiles" :disabled="!selectedFiles.length || uploading">
          <Upload class="h-4 w-4 mr-2" />
          {{ uploading ? 'Uploading...' : 'Upload' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SupplierDocument } from '@/types/supplier'

// Icons
import { Upload, FileText, X, AlertCircle } from 'lucide-vue-next'

// UI Components
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
// Using native textarea instead of missing Textarea component

// Props & Emits
interface Props {
  open: boolean
  supplierId: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  uploaded: [document: SupplierDocument]
}>()

// Note: Store integration will be implemented when Firebase Storage is set up

// Refs
const fileInput = ref<HTMLInputElement>()

// State
const selectedFiles = ref<File[]>([])
const description = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const error = ref('')
const isDragging = ref(false)

// Methods
function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  const files = Array.from(event.dataTransfer?.files || [])
  addFiles(files)
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  addFiles(files)
}

function addFiles(files: File[]) {
  const validFiles = files.filter(file => {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      error.value = `File "${file.name}" is too large. Maximum size is 10MB.`
      return false
    }
    
    // Check file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif'
    ]
    
    if (!allowedTypes.includes(file.type)) {
      error.value = `File type "${file.type}" is not supported.`
      return false
    }
    
    return true
  })
  
  selectedFiles.value.push(...validFiles)
  error.value = ''
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

async function uploadFiles() {
  if (!selectedFiles.value.length) return
  
  try {
    uploading.value = true
    error.value = ''
    uploadProgress.value = 0
    
    // TODO: Implement actual file upload to Firebase Storage
    // For now, simulate upload progress
    const interval = setInterval(() => {
      uploadProgress.value += 10
      if (uploadProgress.value >= 100) {
        clearInterval(interval)
      }
    }, 200)
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // TODO: Replace with actual upload logic
    // const uploadedDocuments = await supplierStore.uploadSupplierDocuments({
    //   supplierId: props.supplierId,
    //   files: selectedFiles.value,
    //   description: description.value
    // })
    
    // For now, create mock documents
    const mockDocuments = selectedFiles.value.map(file => ({
      documentId: Math.random().toString(36).substr(2, 9),
      supplierId: props.supplierId,
      fileName: file.name,
      storagePath: `suppliers/${props.supplierId}/documents/${file.name}`,
      fileType: file.type,
      fileSize: file.size,
      description: description.value,
      uploadedBy: 'Current User', // TODO: Get from auth store
      createdAt: new Date()
    }))
    
    // Emit uploaded documents
    mockDocuments.forEach(doc => {
      emit('uploaded', doc)
    })
    
    // Reset form
    selectedFiles.value = []
    description.value = ''
    uploadProgress.value = 0
    
  } catch (err) {
    console.error('Upload error:', err)
    error.value = 'Failed to upload files. Please try again.'
  } finally {
    uploading.value = false
  }
}
</script>
