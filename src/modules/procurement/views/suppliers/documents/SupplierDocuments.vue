<template>
  <div class="h-screen flex flex-col">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200 p-4 flex-shrink-0">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button 
            @click="goBack"
            class="text-gray-600 hover:text-gray-900 flex items-center"
          >
            <ArrowLeft class="h-4 w-4 mr-2" />
            Back to Supplier
          </button>
          <div v-if="supplier">
            <h1 class="text-xl font-bold text-gray-900">{{ supplier.name }} - Documents</h1>
            <p class="text-gray-500 text-sm">{{ documents.length }} documents</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content: 2-Column Layout -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Left Column: Document List (25%) -->
      <div class="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <!-- Upload Button -->
        <div class="p-4 border-b border-gray-200">
          <Button @click="showUploadDialog = true" class="w-full bg-slate-900 hover:bg-slate-800">
            <Upload class="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <!-- Search and Filters -->
        <div class="p-4 border-b border-gray-200 space-y-3">
          <Input
            v-model="searchQuery"
            placeholder="Search documents..."
            class="w-full"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-gray-400" />
            </template>
          </Input>
          
          <Select v-model="selectedFileType">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="All file types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All file types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="doc">Word Documents</SelectItem>
              <SelectItem value="xls">Excel Files</SelectItem>
              <SelectItem value="img">Images</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Documents List -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-900 mx-auto"></div>
            <p class="mt-2 text-sm text-gray-600">Loading...</p>
          </div>
          
          <div v-else-if="filteredDocuments.length === 0" class="p-8 text-center">
            <FileText class="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600">No documents</p>
          </div>
          
          <div v-else class="divide-y divide-gray-200">
            <div 
              v-for="document in filteredDocuments" 
              :key="document.documentId"
              class="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
              :class="{ 'bg-blue-50 border-r-2 border-blue-500': selectedDocument?.documentId === document.documentId }"
              @click="selectDocument(document)"
            >
              <div class="flex items-start space-x-3">
                <div class="flex-shrink-0">
                  <component :is="getFileIcon(document.fileType)" class="h-5 w-5 text-gray-600" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-gray-900 truncate">{{ document.fileName }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(document.fileSize) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(document.createdAt) }}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" @click.stop>
                      <MoreHorizontal class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="downloadDocument(document)">
                      <Download class="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="editDocument(document)">
                      <Edit class="mr-2 h-4 w-4" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deleteDocument(document)" class="text-red-600">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Right Column: File Preview (75%) -->
      <div class="flex-1 bg-gray-50 flex flex-col">
        <div v-if="!selectedDocument" class="flex-1 flex items-center justify-center">
          <div class="text-center">
            <FileText class="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">Select a document to preview</h3>
            <p class="text-gray-500">Choose a document from the list to view its contents</p>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col">
          <!-- Preview Header -->
          <div class="bg-white border-b border-gray-200 p-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <component :is="getFileIcon(selectedDocument.fileType)" class="h-6 w-6 text-gray-600" />
                <div>
                  <h3 class="font-medium text-gray-900">{{ selectedDocument.fileName }}</h3>
                  <p class="text-sm text-gray-500">
                    {{ formatFileSize(selectedDocument.fileSize) }} • 
                    {{ formatDate(selectedDocument.createdAt) }} • 
                    by {{ selectedDocument.uploadedBy }}
                  </p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <Button @click="downloadDocument(selectedDocument)" variant="outline" size="sm">
                  <Download class="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button @click="editDocument(selectedDocument)" variant="outline" size="sm">
                  <Edit class="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
            <p v-if="selectedDocument.description" class="text-sm text-gray-600 mt-2">
              {{ selectedDocument.description }}
            </p>
          </div>
          
          <!-- Preview Content -->
          <div class="flex-1 p-4">
            <DocumentPreview :document="selectedDocument" />
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Dialog -->
    <DocumentUploadDialog 
      v-model:open="showUploadDialog"
      :supplier-id="supplierId"
      @uploaded="onDocumentUploaded"
    />

    <!-- Edit Dialog -->
    <DocumentEditDialog 
      v-model:open="showEditDialog"
      :document="selectedDocument"
      @updated="onDocumentUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { SupplierDocument } from '@/types/supplier'

// Icons
import { 
  ArrowLeft, Upload, FileText, Search,
  Download, Edit, MoreHorizontal, Trash2
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Custom Components
import DocumentUploadDialog from './components/DocumentUploadDialog.vue'
import DocumentEditDialog from './components/DocumentEditDialog.vue'
import DocumentPreview from './components/DocumentPreview.vue'

// Router and Store
const route = useRoute()
const router = useRouter()
const supplierStore = useSupplierStore()
const { selectedSupplier: supplier, loading } = storeToRefs(supplierStore)

// State
const documents = ref<SupplierDocument[]>([])
const searchQuery = ref('')
const selectedFileType = ref('all')
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const selectedDocument = ref<SupplierDocument | null>(null)

// Computed
const supplierId = computed(() => route.params.id as string)

const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc => 
      doc.fileName.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query)
    )
  }

  if (selectedFileType.value && selectedFileType.value !== 'all') {
    filtered = filtered.filter(doc => getFileCategory(doc.fileType) === selectedFileType.value)
  }

  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

// Removed unused computed properties for stats since we removed the stats section

// Methods
function goBack() {
  router.push('/suppliers')
}

function selectDocument(document: SupplierDocument) {
  selectedDocument.value = document
}

function getFileIcon(fileType: string) {
  // This would return different icons based on file type
  return FileText
}

function getFileCategory(fileType: string): string {
  if (fileType.includes('pdf')) return 'pdf'
  if (fileType.includes('doc') || fileType.includes('word')) return 'doc'
  if (fileType.includes('xls') || fileType.includes('excel') || fileType.includes('sheet')) return 'xls'
  if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) return 'img'
  return 'other'
}

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

async function downloadDocument(doc: SupplierDocument) {
  try {
    const url = await supplierStore.getDocumentDownloadURL(doc)
    if (url) {
      // Create a temporary link to download the file
      const link = window.document.createElement('a')
      link.href = url
      link.download = doc.fileName
      link.target = '_blank'
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    } else {
      console.error('Failed to get download URL')
    }
  } catch (error) {
    console.error('Error downloading document:', error)
  }
}

function editDocument(document: SupplierDocument) {
  selectedDocument.value = document
  showEditDialog.value = true
}

async function deleteDocument(document: SupplierDocument) {
  if (confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
    try {
      const success = await supplierStore.deleteSupplierDocument(document)
      if (success) {
        // Remove from local documents array
        const index = documents.value.findIndex(d => d.documentId === document.documentId)
        if (index !== -1) {
          documents.value.splice(index, 1)
        }
        // Clear selection if deleted document was selected
        if (selectedDocument.value?.documentId === document.documentId) {
          selectedDocument.value = null
        }
      } else {
        console.error('Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }
}

function onDocumentUploaded(document: SupplierDocument) {
  documents.value.unshift(document)
  showUploadDialog.value = false
}

function onDocumentUpdated(document: SupplierDocument) {
  const index = documents.value.findIndex(d => d.documentId === document.documentId)
  if (index !== -1) {
    documents.value[index] = document
  }
  showEditDialog.value = false
}

// Lifecycle
onMounted(async () => {
  // Load supplier data if not already loaded
  if (!supplier.value || supplier.value.supplierId !== supplierId.value) {
    await supplierStore.fetchSupplierById(supplierId.value)
  }
  
  // Load documents for this supplier
  try {
    const loadedDocuments = await supplierStore.fetchSupplierDocuments(supplierId.value)
    documents.value = loadedDocuments
  } catch (error) {
    console.error('Error loading documents:', error)
  }
})
</script>
