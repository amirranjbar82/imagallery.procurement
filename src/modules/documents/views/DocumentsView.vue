<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Document Management</h1>
        <p class="text-gray-600">Manage and organize documents across all modules</p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="showCreateTemplate = true">
          <FileText class="w-4 h-4 mr-2" />
          New Template
        </Button>
        <Button @click="showUploadDialog = true">
          <Upload class="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <FileText class="h-8 w-8 text-blue-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Documents</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalDocuments }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <Clock class="h-8 w-8 text-orange-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Review</p>
              <p class="text-2xl font-bold text-gray-900">{{ pendingReviewCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <CheckCircle class="h-8 w-8 text-green-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Approved</p>
              <p class="text-2xl font-bold text-gray-900">{{ approvedCount }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <HardDrive class="h-8 w-8 text-purple-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Storage Used</p>
              <p class="text-2xl font-bold text-gray-900">{{ formatFileSize(totalStorageUsed) }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filter and Search Bar -->
    <Card class="mb-6">
      <CardContent class="pt-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <Input 
              placeholder="Search documents..." 
              v-model="searchQuery"
              class="w-full"
            />
          </div>
          <Select v-model="typeFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="report">Report</SelectItem>
              <SelectItem value="specification">Specification</SelectItem>
              <SelectItem value="certificate">Certificate</SelectItem>
              <SelectItem value="policy">Policy</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="categoryFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="procurement">Procurement</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="hr">HR</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Documents Grid/List View -->
    <Card>
      <CardContent class="pt-4">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else>
          <!-- Toggle View Mode -->
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600">{{ filteredDocuments.length }} documents found</p>
            <div class="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                @click="viewMode = 'grid'"
                :class="{ 'bg-gray-100': viewMode === 'grid' }"
              >
                <Grid class="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                @click="viewMode = 'list'"
                :class="{ 'bg-gray-100': viewMode === 'list' }"
              >
                <List class="w-4 h-4" />
              </Button>
            </div>
          </div>

          <!-- Grid View -->
          <div v-if="viewMode === 'grid'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <DocumentCard 
              v-for="document in filteredDocuments" 
              :key="document.documentId"
              :document="document"
              @view="handleDocumentView"
              @edit="handleDocumentEdit"
              @download="handleDocumentDownload"
            />
          </div>

          <!-- List View -->
          <div v-else class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modified
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="document in filteredDocuments" :key="document.documentId">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <FileText class="h-6 w-6 text-gray-400 mr-3" />
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ document.name }}</div>
                        <div class="text-sm text-gray-500">{{ formatFileSize(document.fileSize) }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ document.type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ document.category }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="getStatusVariant(document.status)">
                      {{ document.status }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(document.updatedAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" class="mr-2" @click="handleDocumentView(document)">
                      View
                    </Button>
                    <Button variant="outline" size="sm" @click="handleDocumentDownload(document)">
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="filteredDocuments.length === 0" class="text-center py-8">
            <FileText class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by uploading a document.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Upload, FileText, Clock, CheckCircle, HardDrive, Grid, List } from 'lucide-vue-next'
import type { Document } from '../types/documents'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// Placeholder component
const DocumentCard = { 
  props: ['document'],
  emits: ['view', 'edit', 'download'],
  template: '<div class="border rounded-lg p-4 hover:shadow-md transition-shadow">Document: {{ document.name }}</div>' 
}

// State
const searchQuery = ref('')
const typeFilter = ref('')
const statusFilter = ref('')
const categoryFilter = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const showUploadDialog = ref(false)
const showCreateTemplate = ref(false)
const loading = ref(false)

// Mock data for now - will be replaced with store
const documents = ref<Document[]>([])

// Computed
const filteredDocuments = computed(() => {
  let filtered = documents.value

  if (searchQuery.value) {
    filtered = filtered.filter(doc => 
      doc.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (typeFilter.value) {
    filtered = filtered.filter(doc => doc.type === typeFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(doc => doc.status === statusFilter.value)
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(doc => doc.category === categoryFilter.value)
  }

  return filtered
})

const totalDocuments = computed(() => documents.value.length)
const pendingReviewCount = computed(() => documents.value.filter(d => d.status === 'review').length)
const approvedCount = computed(() => documents.value.filter(d => d.status === 'approved').length)
const totalStorageUsed = computed(() => documents.value.reduce((total, doc) => total + doc.fileSize, 0))

// Methods
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'draft': return 'secondary'
    case 'review': return 'default'
    case 'approved': return 'default'
    case 'published': return 'default'
    case 'archived': return 'secondary'
    case 'expired': return 'destructive'
    default: return 'secondary'
  }
}

function handleDocumentView(document: Document) {
  console.log('View document:', document)
}

function handleDocumentEdit(document: Document) {
  console.log('Edit document:', document)
}

function handleDocumentDownload(document: Document) {
  console.log('Download document:', document)
}

// Lifecycle
onMounted(() => {
  // Load documents from store when implemented
  console.log('DocumentsView mounted')
})
</script>
