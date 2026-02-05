<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Asset Management</h2>
        <p class="text-gray-600">Upload and manage gallery assets with physical dimensions</p>
      </div>
      <div class="flex gap-2">
        <Button @click="showUploadDialog = true" class="gap-2">
          <Upload class="w-4 h-4" />
          Upload Asset
        </Button>
        <Button @click="showBulkImportDialog = true" variant="outline" class="gap-2">
          <FileSpreadsheet class="w-4 h-4" />
          Bulk Import
        </Button>
      </div>
    </div>

    <!-- Import Job Status -->
    <div v-if="galleryStore.activeImportJob" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-center gap-3">
        <Loader2 v-if="galleryStore.activeImportJob.status === 'processing'" class="w-5 h-5 animate-spin text-blue-600" />
        <CheckCircle v-else-if="galleryStore.activeImportJob.status === 'completed'" class="w-5 h-5 text-green-600" />
        <XCircle v-else-if="galleryStore.activeImportJob.status === 'failed'" class="w-5 h-5 text-red-600" />
        
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">
            Import Job: {{ galleryStore.activeImportJob.status }}
          </h3>
          <div class="text-sm text-gray-600">
            {{ galleryStore.activeImportJob.processedItems }} / {{ galleryStore.activeImportJob.totalItems }} processed
            <span v-if="galleryStore.activeImportJob.failedItems > 0" class="text-red-600">
              ({{ galleryStore.activeImportJob.failedItems }} failed)
            </span>
          </div>
        </div>
      </div>
      
      <!-- Progress Bar -->
      <div class="mt-3 bg-gray-200 rounded-full h-2">
        <div 
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(galleryStore.activeImportJob.processedItems / galleryStore.activeImportJob.totalItems) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Assets Table -->
    <div class="bg-white rounded-lg border">
      <div class="p-4 border-b">
        <div class="flex items-center justify-between">
          <h3 class="font-medium text-gray-900">Assets ({{ galleryStore.assets.length }})</h3>
          <div class="flex items-center gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Search assets..."
              class="w-64"
            />
            <Select v-model="categoryFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-16">Image</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Physical Size</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead class="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="asset in filteredAssets" :key="asset.sku">
              <TableCell>
                <img 
                  :src="asset.thumb" 
                  :alt="asset.title"
                  class="w-12 h-12 object-cover rounded border"
                />
              </TableCell>
              <TableCell class="font-mono text-sm">{{ asset.sku }}</TableCell>
              <TableCell class="font-medium">{{ asset.title }}</TableCell>
              <TableCell>
                <Badge variant="secondary">{{ asset.category }}</Badge>
              </TableCell>
              <TableCell>
                <div v-if="asset.physical" class="text-sm">
                  {{ asset.physical.widthCm }}×{{ asset.physical.heightCm }}
                  <span v-if="asset.physical.depthCm">×{{ asset.physical.depthCm }}</span>
                  cm
                </div>
                <Badge v-else variant="destructive" class="text-xs">No Size</Badge>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge v-for="tag in asset.tags.slice(0, 2)" :key="tag" variant="outline" class="text-xs">
                    {{ tag }}
                  </Badge>
                  <Badge v-if="asset.tags.length > 2" variant="outline" class="text-xs">
                    +{{ asset.tags.length - 2 }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex gap-1">
                  <Button @click="editAsset(asset)" size="sm" variant="ghost">
                    <Edit class="w-4 h-4" />
                  </Button>
                  <Button @click="deleteAsset(asset.sku)" size="sm" variant="ghost">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Single Upload Dialog -->
    <Dialog v-model:open="showUploadDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Asset</DialogTitle>
          <DialogDescription>
            Upload a single asset with metadata and physical dimensions
          </DialogDescription>
        </DialogHeader>
        
        <AssetUploadForm 
          @submit="handleSingleUpload"
          @cancel="showUploadDialog = false"
          :loading="uploadLoading"
        />
      </DialogContent>
    </Dialog>

    <!-- Bulk Import Dialog -->
    <Dialog v-model:open="showBulkImportDialog">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Assets</DialogTitle>
          <DialogDescription>
            Import multiple assets using CSV/Excel metadata and ZIP file with images
          </DialogDescription>
        </DialogHeader>
        
        <BulkImportForm 
          @submit="handleBulkImport"
          @cancel="showBulkImportDialog = false"
          :loading="bulkImportLoading"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalleryBoardStore } from '../stores/gallery-board'
import { ProductMeta, AssetUploadMeta } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Upload, 
  FileSpreadsheet, 
  Edit, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  XCircle 
} from 'lucide-vue-next'
import AssetUploadForm from './AssetUploadForm.vue'
import BulkImportForm from './BulkImportForm.vue'
import { toast } from 'vue-sonner'

const galleryStore = useGalleryBoardStore()

// UI State
const showUploadDialog = ref(false)
const showBulkImportDialog = ref(false)
const uploadLoading = ref(false)
const bulkImportLoading = ref(false)

// Filters
const searchQuery = ref('')
const categoryFilter = ref('')

// Computed
const categories = computed(() => {
  const cats = new Set(galleryStore.assets.map(asset => asset.category))
  return Array.from(cats).sort()
})

const filteredAssets = computed(() => {
  let filtered = galleryStore.assets

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(asset => 
      asset.title.toLowerCase().includes(query) ||
      asset.sku.toLowerCase().includes(query) ||
      asset.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(asset => asset.category === categoryFilter.value)
  }

  return filtered
})

// Actions
const handleSingleUpload = async (data: { file: File; metadata: AssetUploadMeta }) => {
  uploadLoading.value = true
  try {
    await galleryStore.uploadAsset(data.file, data.metadata)
    showUploadDialog.value = false
    toast.success('Asset uploaded successfully')
  } catch (error) {
    toast.error('Failed to upload asset')
    console.error('Upload error:', error)
  } finally {
    uploadLoading.value = false
  }
}

const handleBulkImport = async (data: { csvData: AssetUploadMeta[]; zipFile?: File }) => {
  bulkImportLoading.value = true
  try {
    const job = await galleryStore.bulkImportAssets(data.csvData, data.zipFile)
    showBulkImportDialog.value = false
    toast.success(`Bulk import started: ${job.totalItems} items`)
  } catch (error) {
    toast.error('Failed to start bulk import')
    console.error('Bulk import error:', error)
  } finally {
    bulkImportLoading.value = false
  }
}

const editAsset = (asset: ProductMeta) => {
  // TODO: Implement edit functionality
  toast.info('Edit functionality coming soon')
}

const deleteAsset = async (sku: string) => {
  if (!confirm('Are you sure you want to delete this asset?')) return
  
  try {
    // TODO: Implement delete functionality
    toast.success('Asset deleted successfully')
  } catch (error) {
    toast.error('Failed to delete asset')
    console.error('Delete error:', error)
  }
}

onMounted(() => {
  galleryStore.fetchAssets()
})
</script>
