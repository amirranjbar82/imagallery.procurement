<template>
  <div class="h-full flex flex-col">
    <!-- PDF Preview -->
    <div v-if="isPDF" class="flex-1 bg-white rounded-lg border border-gray-200">
      <div v-if="documentUrl && !error" class="h-full flex flex-col">
        <!-- PDF Controls -->
        <div class="flex items-center justify-between p-4 border-b border-gray-200">
          <div class="flex items-center space-x-2">
            <button 
              @click="previousPage" 
              :disabled="currentPage <= 1"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Previous
            </button>
            <span class="text-sm text-gray-600">
              Page {{ currentPage }} of {{ totalPages }}
            </span>
            <button 
              @click="nextPage" 
              :disabled="currentPage >= totalPages"
              class="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              Next
            </button>
          </div>
          <a 
            :href="documentUrl" 
            target="_blank" 
            class="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded"
          >
            Open in New Tab
          </a>
        </div>
        
        <!-- PDF Viewer -->
        <div class="flex-1 overflow-auto">
          <VuePdfEmbed
            :source="documentUrl"
            crossorigin="anonymous"
            :page="currentPage"
            class="w-full"
            @loaded="onPdfLoaded"
            @loading-failed="onPdfError"
          />
        </div>
      </div>
      <div v-else-if="error" class="h-full flex items-center justify-center">
        <div class="text-center">
          <FileText class="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p class="text-gray-600 mb-4">{{ error }}</p>
          <a 
            v-if="documentUrl"
            :href="documentUrl" 
            target="_blank" 
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md"
          >
            <ExternalLink class="h-4 w-4 mr-2" />
            Open PDF in New Tab
          </a>
        </div>
      </div>
      <div v-else class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading PDF...</p>
        </div>
      </div>
    </div>
    
    <!-- Image Preview -->
    <div v-else-if="isImage" class="flex-1 bg-white rounded-lg border border-gray-200 p-4">
      <div class="h-full flex items-center justify-center">
        <div v-if="documentUrl" class="max-w-full max-h-full">
          <img 
            :src="documentUrl" 
            :alt="document.fileName"
            class="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            @load="onImageLoaded"
            @error="onImageError"
          />
        </div>
        <div v-else class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading image...</p>
        </div>
      </div>
    </div>
    
    <!-- Excel/Spreadsheet Preview -->
    <div v-else-if="isSpreadsheet" class="flex-1 bg-white rounded-lg border border-gray-200">
      <div v-if="documentUrl" class="h-full">
        <VueOfficeExcel
          :src="documentUrl"
          class="w-full h-full"
          @rendered="onExcelLoaded"
          @error="onExcelError"
        />
      </div>
      <div v-else class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading spreadsheet...</p>
        </div>
      </div>
    </div>
    
    <!-- Word Document Preview -->
    <div v-else-if="isDocument" class="flex-1 bg-white rounded-lg border border-gray-200">
      <div v-if="documentUrl" class="h-full">
        <VueOfficeDocx
          :src="documentUrl"
          class="w-full h-full"
          @rendered="onDocxLoaded"
          @error="onDocxError"
        />
      </div>
      <div v-else class="h-full flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-500">Loading document...</p>
        </div>
      </div>
    </div>
    
    <!-- PowerPoint Preview -->
    <div v-else-if="isPowerPoint" class="flex-1 bg-white rounded-lg border border-gray-200">
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <Presentation class="h-16 w-16 text-orange-500 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">PowerPoint Preview</h3>
          <p class="text-gray-500 mb-4">PowerPoint preview functionality requires additional setup</p>
          <p class="text-sm text-gray-400">
            Install: <code class="bg-gray-100 px-2 py-1 rounded">npm install @microsoft/office-js</code>
          </p>
        </div>
      </div>
    </div>
    
    <!-- Generic File Preview -->
    <div v-else class="flex-1 bg-white rounded-lg border border-gray-200">
      <div class="h-full flex items-center justify-center">
        <div class="text-center">
          <FileText class="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-gray-900 mb-2">File Preview</h3>
          <p class="text-gray-500 mb-4">{{ document.fileName }}</p>
          <div class="bg-gray-50 rounded-lg p-6 max-w-md">
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex justify-between">
                <span>File Type:</span>
                <span class="font-medium">{{ document.fileType }}</span>
              </div>
              <div class="flex justify-between">
                <span>Size:</span>
                <span class="font-medium">{{ formatFileSize(document.fileSize) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Uploaded:</span>
                <span class="font-medium">{{ formatDate(document.createdAt) }}</span>
              </div>
              <div class="flex justify-between">
                <span>Uploaded by:</span>
                <span class="font-medium">{{ document.uploadedBy }}</span>
              </div>
            </div>
            <div v-if="document.description" class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                <span class="font-medium">Description:</span><br>
                {{ document.description }}
              </p>
            </div>
          </div>
          <p class="text-sm text-gray-400 mt-4">
            Preview not available for this file type
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSupplierStore } from '@/stores/supplier'
import type { SupplierDocument } from '@/types/supplier'

// Preview Components
import VuePdfEmbed from 'vue-pdf-embed'
import VueOfficeDocx from '@vue-office/docx'
import VueOfficeExcel from '@vue-office/excel'

// Icons
import { FileText, Download, Edit, ExternalLink } from 'lucide-vue-next'

// Props
interface Props {
  document: SupplierDocument
}

const props = defineProps<Props>()

// Store
const supplierStore = useSupplierStore()

// State
const documentUrl = ref<string | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// PDF specific state
const currentPage = ref(1)
const totalPages = ref(0)

// Computed
const isPDF = computed(() => 
  props.document.fileType.includes('pdf')
)

const isImage = computed(() => 
  props.document.fileType.includes('image') || 
  ['png', 'jpg', 'jpeg', 'gif', 'webp'].some(ext => 
    props.document.fileType.includes(ext)
  )
)

const isSpreadsheet = computed(() => 
  props.document.fileType.includes('sheet') ||
  props.document.fileType.includes('excel') ||
  ['xls', 'xlsx', 'csv'].some(ext => 
    props.document.fileType.includes(ext)
  )
)

const isDocument = computed(() => 
  props.document.fileType.includes('word') ||
  props.document.fileType.includes('doc') ||
  ['doc', 'docx'].some(ext => 
    props.document.fileType.includes(ext)
  )
)

const isPowerPoint = computed(() => 
  props.document.fileType.includes('presentation') ||
  ['ppt', 'pptx'].some(ext => 
    props.document.fileType.includes(ext)
  )
)

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

// Document loading
async function loadDocument() {
  if (!props.document) return
  
  try {
    loading.value = true
    error.value = null
    
    const url = await supplierStore.getDocumentDownloadURL(props.document)
    if (url) {
      documentUrl.value = url
    } else {
      error.value = 'Failed to load document'
    }
  } catch (err) {
    console.error('Error loading document:', err)
    error.value = 'Failed to load document'
  } finally {
    loading.value = false
  }
}

// PDF Controls
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// Event handlers
function onPdfLoaded(pdf: any) {
  totalPages.value = pdf.numPages
  currentPage.value = 1
}

function onPdfError(error: any) {
  console.error('PDF loading error:', error)
  error.value = 'Failed to load PDF'
}

function onImageLoaded() {
  console.log('Image loaded successfully')
}

function onImageError() {
  error.value = 'Failed to load image'
}

function onExcelLoaded() {
  console.log('Excel loaded successfully')
}

function onExcelError(error: any) {
  console.error('Excel loading error:', error)
  error.value = 'Failed to load spreadsheet'
}

function onDocxLoaded() {
  console.log('Word document loaded successfully')
}

function onDocxError(error: any) {
  console.error('Word document loading error:', error)
  error.value = 'Failed to load document'
}

// Watchers
watch(() => props.document, () => {
  if (props.document) {
    loadDocument()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  if (props.document) {
    loadDocument()
  }
})
</script>
