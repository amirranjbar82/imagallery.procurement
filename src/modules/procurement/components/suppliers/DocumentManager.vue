<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Document Management</h3>
        <p class="text-sm text-muted-foreground">
          Organize and manage supplier documents with categories
        </p>
      </div>
      <div class="flex items-center space-x-2">
        <Button @click="showCategoryDialog = true" variant="outline" size="sm">
          <FolderPlus class="mr-2 h-4 w-4" />
          Add Category
        </Button>
        <Button @click="showUploadDialog = true" size="sm">
          <Upload class="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>
    </div>

    <!-- Document Categories -->
    <Card>
      <CardHeader>
        <CardTitle>Document Categories</CardTitle>
        <CardDescription>Organize documents by category</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="category in documentCategories" :key="category.categoryId" 
               @click="selectCategory(category)"
               :class="[
                 'p-4 border rounded-lg cursor-pointer transition-colors',
                 selectedCategory?.categoryId === category.categoryId 
                   ? 'border-primary bg-primary/5' 
                   : 'hover:bg-gray-50'
               ]">
            <div class="flex items-center space-x-3">
              <div :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-medium',
                `bg-${category.color}-500`
              ]">
                <component :is="category.icon" class="h-5 w-5" />
              </div>
              <div>
                <p class="font-medium">{{ category.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ getDocumentCount(category.categoryId) }} documents
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Document List -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>
              {{ selectedCategory ? selectedCategory.name : 'All Documents' }}
            </CardTitle>
            <CardDescription>
              {{ filteredDocuments.length }} documents
            </CardDescription>
          </div>
          <div class="flex items-center space-x-2">
            <Input
              v-model="searchQuery"
              placeholder="Search documents..."
              class="w-64"
            />
            <Select v-model="sortBy">
              <SelectTrigger class="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="date">Upload Date</SelectItem>
                <SelectItem value="size">File Size</SelectItem>
                <SelectItem value="type">File Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div v-for="document in sortedDocuments" :key="document.documentId" 
               class="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText class="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p class="font-medium">{{ document.fileName }}</p>
                <div class="flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>{{ formatFileSize(document.fileSize) }}</span>
                  <span>{{ formatDate(document.createdAt) }}</span>
                  <span>{{ document.uploadedBy }}</span>
                  <Badge v-if="document.accessLevel" :variant="getAccessLevelVariant(document.accessLevel)">
                    {{ document.accessLevel }}
                  </Badge>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button @click="openPreviewDocument(document)" variant="ghost" size="sm">
                <Eye class="h-4 w-4" />
              </Button>
              <Button @click="downloadDocument(document)" variant="ghost" size="sm">
                <Download class="h-4 w-4" />
              </Button>
              <Button @click="editDocument(document)" variant="ghost" size="sm">
                <Edit class="h-4 w-4" />
              </Button>
              <Button @click="deleteDocument(document)" variant="ghost" size="sm">
                <Trash class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Upload Document Dialog -->
    <Dialog :open="showUploadDialog" @update:open="showUploadDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to the supplier
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="uploadDocument" class="space-y-4">
          <div class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <input
              ref="fileInput"
              type="file"
              @change="handleFileSelect"
              class="hidden"
              multiple
            />
            <Upload class="mx-auto h-12 w-12 text-gray-400" />
            <div class="mt-4">
              <Button @click="fileInput?.click()" type="button" variant="outline">
                Choose Files
              </Button>
              <p class="mt-2 text-sm text-gray-500">
                or drag and drop files here
              </p>
            </div>
            <div v-if="selectedFiles.length > 0" class="mt-4 space-y-2">
              <div v-for="file in selectedFiles" :key="file.name" 
                   class="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span class="text-sm">{{ file.name }}</span>
                <Button @click="removeFile(file)" type="button" variant="ghost" size="sm">
                  <X class="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="category">Category</Label>
            <Select v-model="uploadForm.categoryId">
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in documentCategories" 
                           :key="category.categoryId" 
                           :value="category.categoryId">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="accessLevel">Access Level</Label>
            <Select v-model="uploadForm.accessLevel">
              <SelectTrigger>
                <SelectValue placeholder="Select access level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="restricted">Restricted</SelectItem>
                <SelectItem value="confidential">Confidential</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-2">
            <Label for="description">Description</Label>
            <Textarea
              id="description"
              v-model="uploadForm.description"
              placeholder="Document description"
              rows="2"
            />
          </div>

          <div class="space-y-2">
            <Label for="tags">Tags</Label>
            <Input
              id="tags"
              v-model="uploadForm.tags"
              placeholder="Enter tags separated by commas"
            />
          </div>

          <DialogFooter>
            <Button @click="showUploadDialog = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="uploading || selectedFiles.length === 0">
              <Loader2 v-if="uploading" class="mr-2 h-4 w-4 animate-spin" />
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Category Dialog -->
    <Dialog :open="showCategoryDialog" @update:open="showCategoryDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Document Category</DialogTitle>
          <DialogDescription>
            Add a new category for organizing documents
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="createCategory" class="space-y-4">
          <div class="space-y-2">
            <Label for="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              v-model="categoryForm.name"
              placeholder="Enter category name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="categoryDesc">Description</Label>
            <Textarea
              id="categoryDesc"
              v-model="categoryForm.description"
              placeholder="Category description"
              rows="2"
            />
          </div>

          <div class="space-y-2">
            <Label>Color</Label>
            <div class="flex space-x-2">
              <div v-for="color in availableColors" :key="color"
                   @click="categoryForm.color = color"
                   :class="[
                     'w-8 h-8 rounded cursor-pointer border-2',
                     `bg-${color}-500`,
                     categoryForm.color === color ? 'border-gray-900' : 'border-gray-300'
                   ]">
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label>Icon</Label>
            <div class="grid grid-cols-6 gap-2">
              <div v-for="icon in availableIcons" :key="icon.name"
                   @click="categoryForm.icon = icon.name"
                   :class="[
                     'p-2 border rounded cursor-pointer flex items-center justify-center',
                     categoryForm.icon === icon.name ? 'border-primary bg-primary/5' : 'border-gray-300'
                   ]">
                <component :is="icon.component" class="h-4 w-4" />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button @click="showCategoryDialog = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Create Category
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Document Preview Dialog -->
    <Dialog :open="showPreviewDialog" @update:open="showPreviewDialog = $event">
      <DialogContent class="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{{ previewDocument?.fileName }}</DialogTitle>
        </DialogHeader>
        <div class="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <p class="text-muted-foreground">Document preview would appear here</p>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { DocumentCategory, EnhancedSupplierDocument } from '@/modules/procurement/types/supplier'

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  Upload, 
  FolderPlus, 
  FileText, 
  Eye, 
  Download, 
  Edit, 
  Trash, 
  X, 
  Loader2,
  Folder,
  Shield,
  Award,
  Settings
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  supplierId: string
}>()
// mark as used to satisfy TS until integrated
void props.supplierId

// Store
const supplierStore = useSupplierStore()

// State
const fileInput = ref<HTMLInputElement | null>(null)
const showUploadDialog = ref(false)
const showCategoryDialog = ref(false)
const showPreviewDialog = ref(false)
const selectedCategory = ref<DocumentCategory | null>(null)
const selectedFiles = ref<File[]>([])
const searchQuery = ref('')
const sortBy = ref('date')
const uploading = ref(false)
const loading = ref(false)
const previewDocument = ref<EnhancedSupplierDocument | null>(null)
const supplierDocuments = ref<EnhancedSupplierDocument[]>([])

const uploadForm = ref({
  categoryId: '',
  accessLevel: 'public' as const,
  description: '',
  tags: ''
})

const categoryForm = ref({
  name: '',
  description: '',
  color: 'blue',
  icon: 'Folder'
})

const availableColors = ['blue', 'green', 'yellow', 'red', 'purple', 'pink', 'indigo', 'gray']
const availableIcons = [
  { name: 'Folder', component: Folder },
  { name: 'FileText', component: FileText },
  { name: 'Shield', component: Shield },
  { name: 'Award', component: Award },
  { name: 'Settings', component: Settings }
]

// Computed
const documentCategories = computed(() => supplierStore.documentCategories)
const documents = computed(() => supplierDocuments.value)

const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (selectedCategory.value) {
    filtered = filtered.filter(doc => doc.categoryId === selectedCategory.value!.categoryId)
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(doc =>
      doc.fileName.toLowerCase().includes(query) ||
      doc.description?.toLowerCase().includes(query) ||
      doc.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  return filtered
})

const sortedDocuments = computed(() => {
  const sorted = [...filteredDocuments.value]
  
  switch (sortBy.value) {
    case 'name':
      return sorted.sort((a, b) => a.fileName.localeCompare(b.fileName))
    case 'date':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    case 'size':
      return sorted.sort((a, b) => b.fileSize - a.fileSize)
    case 'type':
      return sorted.sort((a, b) => a.fileType.localeCompare(b.fileType))
    default:
      return sorted
  }
})

// Methods
function selectCategory(category: DocumentCategory | null) {
  selectedCategory.value = selectedCategory.value?.categoryId === category?.categoryId ? null : category
}

function getDocumentCount(categoryId: string): number {
  return documents.value.filter(doc => doc.categoryId === categoryId).length
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files) {
    selectedFiles.value = Array.from(target.files)
  }
}

function removeFile(file: File) {
  selectedFiles.value = selectedFiles.value.filter(f => f !== file)
}

async function uploadDocument() {
  uploading.value = true
  try {
    for (const file of selectedFiles.value) {
      const created = await supplierStore.uploadSupplierDocument({
        supplierId: props.supplierId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description: uploadForm.value.description,
        file
      })
      if (created) {
        // Map to enhanced shape with defaults
        const enhanced: EnhancedSupplierDocument = {
          ...created,
          categoryId: uploadForm.value.categoryId || undefined,
          tags: uploadForm.value.tags ? uploadForm.value.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          version: 1,
          isLatestVersion: true,
          metadata: {},
          accessLevel: uploadForm.value.accessLevel,
          approvalStatus: 'approved'
        }
        supplierDocuments.value.unshift(enhanced)
      }
    }
    showUploadDialog.value = false
    selectedFiles.value = []
    uploadForm.value = {
      categoryId: '',
      accessLevel: 'public',
      description: '',
      tags: ''
    }
  } catch (error) {
    console.error('Upload failed:', error)
  } finally {
    uploading.value = false
  }
}

async function createCategory() {
  loading.value = true
  try {
    await supplierStore.createDocumentCategory({
      name: categoryForm.value.name,
      description: categoryForm.value.description,
      color: categoryForm.value.color,
      icon: categoryForm.value.icon,
      createdBy: 'current-user'
    })
    showCategoryDialog.value = false
    categoryForm.value = {
      name: '',
      description: '',
      color: 'blue',
      icon: 'Folder'
    }
  } catch (error) {
    console.error('Error creating category:', error)
  } finally {
    loading.value = false
  }
}

function openPreviewDocument(document: EnhancedSupplierDocument) {
  previewDocument.value = document
  showPreviewDialog.value = true
}

function downloadDocument(document: EnhancedSupplierDocument) {
  // Open file in new tab
  supplierStore.getDocumentDownloadURL(document).then(url => {
    if (url) window.open(url, '_blank')
  })
}

function editDocument(document: EnhancedSupplierDocument) {
  // This would open edit dialog
  console.log('Edit:', document.fileName)
}

function deleteDocument(document: EnhancedSupplierDocument) {
  if (confirm(`Are you sure you want to delete ${document.fileName}?`)) {
    // This would delete the document
    console.log('Delete:', document.fileName)
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function getAccessLevelVariant(level: string) {
  switch (level) {
    case 'confidential':
      return 'destructive'
    case 'restricted':
      return 'secondary'
    default:
      return 'outline'
  }
}

// Lifecycle
onMounted(async () => {
  supplierStore.fetchDocumentCategories()
  // Fetch supplier documents for this supplier
  const docs = await supplierStore.fetchSupplierDocuments(props.supplierId)
  // Map plain documents to enhanced with sensible defaults
  supplierDocuments.value = docs.map(d => ({
    ...d,
    tags: [],
    version: 1,
    isLatestVersion: true,
    metadata: {},
    accessLevel: 'public',
    approvalStatus: 'approved'
  }))
})
</script>
