<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
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
            <h1 class="text-2xl font-bold text-gray-900">{{ supplier.name }} - Documents</h1>
            <p class="text-gray-600 mt-1">Manage supplier documents and files</p>
          </div>
        </div>
        
        <Button @click="showUploadDialog = true" class="bg-slate-900 hover:bg-slate-800">
          <Upload class="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <FileText class="h-5 w-5 text-blue-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Total Documents</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ documents.length }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <HardDrive class="h-5 w-5 text-green-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Total Size</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ formatFileSize(totalSize) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <Calendar class="h-5 w-5 text-purple-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Last Upload</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ lastUploadDate }}</div>
      </div>
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center">
          <User class="h-5 w-5 text-orange-600" />
          <span class="ml-2 text-sm font-medium text-gray-600">Contributors</span>
        </div>
        <div class="text-2xl font-bold text-gray-900 mt-2">{{ uniqueUploaders }}</div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <Input
            v-model="searchQuery"
            placeholder="Search documents..."
            class="w-full"
          >
            <template #prefix>
              <Search class="h-4 w-4 text-gray-400" />
            </template>
          </Input>
        </div>
        <Select v-model="selectedFileType">
          <SelectTrigger class="w-48">
            <SelectValue placeholder="All file types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All file types</SelectItem>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="doc">Word Documents</SelectItem>
            <SelectItem value="xls">Excel Files</SelectItem>
            <SelectItem value="img">Images</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Documents List -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="p-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Documents</h2>
      </div>
      
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
        <p class="mt-2 text-gray-600">Loading documents...</p>
      </div>
      
      <div v-else-if="filteredDocuments.length === 0" class="p-8 text-center">
        <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p class="text-gray-600">No documents found</p>
        <p class="text-sm text-gray-500 mt-1">Upload your first document to get started</p>
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div 
          v-for="document in filteredDocuments" 
          :key="document.documentId"
          class="p-4 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="flex-shrink-0">
                <component :is="getFileIcon(document.fileType)" class="h-8 w-8 text-gray-600" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ document.fileName }}</p>
                <div class="flex items-center space-x-4 mt-1">
                  <p class="text-xs text-gray-500">{{ formatFileSize(document.fileSize) }}</p>
                  <p class="text-xs text-gray-500">{{ formatDate(document.createdAt) }}</p>
                  <p class="text-xs text-gray-500">by {{ document.uploadedBy }}</p>
                </div>
                <p v-if="document.description" class="text-xs text-gray-600 mt-1">{{ document.description }}</p>
              </div>
            </div>
            
            <div class="flex items-center space-x-2">
              <Button @click="downloadDocument(document)" variant="outline" size="sm">
                <Download class="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
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
import { useSupplierStore } from '@/stores/supplier'
import type { SupplierDocument } from '@/types/supplier'

// Icons
import { 
  ArrowLeft, Upload, FileText, HardDrive, Calendar, User, Search,
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

// Router and Store
const route = useRoute()
const router = useRouter()
const supplierStore = useSupplierStore()
const { selectedSupplier: supplier, loading } = storeToRefs(supplierStore)

// State
const documents = ref<SupplierDocument[]>([])
const searchQuery = ref('')
const selectedFileType = ref('')
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

  if (selectedFileType.value) {
    filtered = filtered.filter(doc => getFileCategory(doc.fileType) === selectedFileType.value)
  }

  return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
})

const totalSize = computed(() => 
  documents.value.reduce((sum, doc) => sum + doc.fileSize, 0)
)

const lastUploadDate = computed(() => {
  if (documents.value.length === 0) return 'Never'
  const latest = Math.max(...documents.value.map(doc => doc.createdAt.getTime()))
  return formatDate(new Date(latest))
})

const uniqueUploaders = computed(() => 
  new Set(documents.value.map(doc => doc.uploadedBy)).size
)

// Methods
function goBack() {
  router.push('/suppliers')
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

async function downloadDocument(document: SupplierDocument) {
  // TODO: Implement download from Firebase Storage
  console.log('Download document:', document)
}

function editDocument(document: SupplierDocument) {
  selectedDocument.value = document
  showEditDialog.value = true
}

async function deleteDocument(document: SupplierDocument) {
  if (confirm(`Are you sure you want to delete "${document.fileName}"?`)) {
    // TODO: Implement delete functionality
    console.log('Delete document:', document)
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
  
  // TODO: Load documents for this supplier
  // documents.value = await supplierStore.fetchSupplierDocuments(supplierId.value)
})
</script>
