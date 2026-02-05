<template>
  <div class="space-y-6">
    <!-- Instructions -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h3 class="font-medium text-blue-900 mb-2">Bulk Import Instructions</h3>
      <ul class="text-sm text-blue-800 space-y-1">
        <li>• Upload a CSV/Excel file with asset metadata</li>
        <li>• Optionally upload a ZIP file containing product images</li>
        <li>• Images should be named to match the SKU column in your spreadsheet</li>
        <li>• Physical dimensions (width_cm, height_cm) are required for true-scale rendering</li>
      </ul>
    </div>

    <!-- Template Download -->
    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div>
        <h4 class="font-medium text-gray-900">Need a template?</h4>
        <p class="text-sm text-gray-600">Download our CSV template with all required columns</p>
      </div>
      <Button @click="downloadTemplate" variant="outline" class="gap-2">
        <Download class="w-4 h-4" />
        Download Template
      </Button>
    </div>

    <!-- File Uploads -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- CSV/Excel Upload -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-gray-700">Metadata File (CSV/Excel) *</label>
        <div 
          @drop="handleMetadataDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': metadataDragOver }"
        >
          <div v-if="!metadataFile">
            <FileSpreadsheet class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600">
              Drop CSV/Excel file here or 
              <button type="button" @click="$refs.metadataInput.click()" class="text-blue-600 hover:text-blue-700">
                browse
              </button>
            </p>
          </div>
          <div v-else class="flex items-center gap-3">
            <FileSpreadsheet class="w-8 h-8 text-green-600" />
            <div class="text-left">
              <p class="font-medium text-gray-900">{{ metadataFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(metadataFile.size) }}</p>
              <Button 
                type="button" 
                @click="clearMetadataFile" 
                size="sm" 
                variant="ghost" 
                class="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
        <input
          ref="metadataInput"
          type="file"
          accept=".csv,.xlsx,.xls"
          @change="handleMetadataSelect"
          class="hidden"
        />
      </div>

      <!-- ZIP Upload -->
      <div class="space-y-3">
        <label class="text-sm font-medium text-gray-700">Images ZIP File (Optional)</label>
        <div 
          @drop="handleZipDrop"
          @dragover.prevent
          @dragenter.prevent
          class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
          :class="{ 'border-blue-500 bg-blue-50': zipDragOver }"
        >
          <div v-if="!zipFile">
            <Archive class="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p class="text-sm text-gray-600">
              Drop ZIP file here or 
              <button type="button" @click="$refs.zipInput.click()" class="text-blue-600 hover:text-blue-700">
                browse
              </button>
            </p>
            <p class="text-xs text-gray-500 mt-1">Images will be matched by filename to SKU</p>
          </div>
          <div v-else class="flex items-center gap-3">
            <Archive class="w-8 h-8 text-green-600" />
            <div class="text-left">
              <p class="font-medium text-gray-900">{{ zipFile.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(zipFile.size) }}</p>
              <Button 
                type="button" 
                @click="clearZipFile" 
                size="sm" 
                variant="ghost" 
                class="text-red-600 hover:text-red-700 p-0 h-auto"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
        <input
          ref="zipInput"
          type="file"
          accept=".zip"
          @change="handleZipSelect"
          class="hidden"
        />
      </div>
    </div>

    <!-- Preview Table -->
    <div v-if="parsedData.length > 0" class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-gray-900">Preview ({{ parsedData.length }} items)</h3>
        <Badge :variant="validationErrors.length > 0 ? 'destructive' : 'default'">
          {{ validationErrors.length > 0 ? `${validationErrors.length} errors` : 'Valid' }}
        </Badge>
      </div>

      <!-- Validation Errors -->
      <div v-if="validationErrors.length > 0" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-medium text-red-900 mb-2">Validation Errors</h4>
        <ul class="text-sm text-red-800 space-y-1">
          <li v-for="error in validationErrors.slice(0, 5)" :key="`${error.row}-${error.field}`">
            Row {{ error.row }}: {{ error.message }}
          </li>
          <li v-if="validationErrors.length > 5" class="font-medium">
            ... and {{ validationErrors.length - 5 }} more errors
          </li>
        </ul>
      </div>

      <!-- Data Table -->
      <div class="border rounded-lg overflow-hidden">
        <div class="overflow-x-auto max-h-64">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Width (cm)</TableHead>
                <TableHead>Height (cm)</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="(item, index) in parsedData.slice(0, 10)" :key="index">
                <TableCell class="font-mono text-sm">{{ item.sku }}</TableCell>
                <TableCell>{{ item.title }}</TableCell>
                <TableCell>{{ item.category }}</TableCell>
                <TableCell>{{ item.physicalSize.widthCm }}</TableCell>
                <TableCell>{{ item.physicalSize.heightCm }}</TableCell>
                <TableCell>
                  <Badge 
                    :variant="getRowErrors(index + 1).length > 0 ? 'destructive' : 'default'"
                    class="text-xs"
                  >
                    {{ getRowErrors(index + 1).length > 0 ? 'Error' : 'Valid' }}
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div v-if="parsedData.length > 10" class="p-3 bg-gray-50 text-sm text-gray-600 text-center">
          Showing first 10 of {{ parsedData.length }} items
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Cancel
      </Button>
      <Button 
        @click="handleSubmit" 
        :disabled="!canSubmit || loading"
      >
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        Start Import ({{ parsedData.length }} items)
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { AssetUploadMeta } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { FileSpreadsheet, Archive, Download, Loader2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { csvData: AssetUploadMeta[]; zipFile?: File }): void
  (e: 'cancel'): void
}

interface ValidationError {
  row: number
  field?: string
  message: string
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// File handling
const metadataFile = ref<File | null>(null)
const zipFile = ref<File | null>(null)
const metadataDragOver = ref(false)
const zipDragOver = ref(false)

// Parsed data
const parsedData = ref<AssetUploadMeta[]>([])
const validationErrors = ref<ValidationError[]>([])

// Computed
const canSubmit = computed(() => {
  return metadataFile.value && 
         parsedData.value.length > 0 && 
         validationErrors.value.length === 0
})

// File handling methods
const handleMetadataSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setMetadataFile(target.files[0])
  }
}

const handleMetadataDrop = (event: DragEvent) => {
  event.preventDefault()
  metadataDragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setMetadataFile(event.dataTransfer.files[0])
  }
}

const handleZipSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setZipFile(target.files[0])
  }
}

const handleZipDrop = (event: DragEvent) => {
  event.preventDefault()
  zipDragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setZipFile(event.dataTransfer.files[0])
  }
}

const setMetadataFile = async (file: File) => {
  metadataFile.value = file
  await parseMetadataFile(file)
}

const setZipFile = (file: File) => {
  zipFile.value = file
}

const clearMetadataFile = () => {
  metadataFile.value = null
  parsedData.value = []
  validationErrors.value = []
}

const clearZipFile = () => {
  zipFile.value = null
}

const parseMetadataFile = async (file: File) => {
  try {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length < 2) {
      throw new Error('File must contain at least a header row and one data row')
    }

    // Parse CSV (simplified - in production use proper CSV parser)
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const data: AssetUploadMeta[] = []
    const errors: ValidationError[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
      const rowData: any = {}
      
      headers.forEach((header, index) => {
        rowData[header] = values[index] || ''
      })

      // Map to AssetUploadMeta structure
      try {
        const asset: AssetUploadMeta = {
          sku: rowData.sku || '',
          title: rowData.title || '',
          category: rowData.category || '',
          tags: rowData.tags ? rowData.tags.split(';').map((t: string) => t.trim()) : [],
          description: rowData.description || '',
          physicalSize: {
            widthCm: parseFloat(rowData.width_cm) || 0,
            heightCm: parseFloat(rowData.height_cm) || 0,
            depthCm: parseFloat(rowData.depth_cm) || undefined,
            unit: rowData.unit || 'cm'
          },
          lockInitialScale: rowData.lock_initial_scale === 'true',
          anchorX: parseFloat(rowData.anchor_ax) || 0.5,
          anchorY: parseFloat(rowData.anchor_ay) || 1.0,
          shadowBlur: parseFloat(rowData.shadow_blur) || 20,
          shadowDx: parseFloat(rowData.shadow_dx) || 0,
          shadowDy: parseFloat(rowData.shadow_dy) || 8,
          shadowAlpha: parseFloat(rowData.shadow_alpha) || 0.4
        }

        // Validate required fields
        if (!asset.sku) {
          errors.push({ row: i + 1, field: 'sku', message: 'SKU is required' })
        }
        if (!asset.title) {
          errors.push({ row: i + 1, field: 'title', message: 'Title is required' })
        }
        if (!asset.category) {
          errors.push({ row: i + 1, field: 'category', message: 'Category is required' })
        }
        if (!asset.physicalSize.widthCm || asset.physicalSize.widthCm <= 0) {
          errors.push({ row: i + 1, field: 'width_cm', message: 'Valid width in cm is required' })
        }
        if (!asset.physicalSize.heightCm || asset.physicalSize.heightCm <= 0) {
          errors.push({ row: i + 1, field: 'height_cm', message: 'Valid height in cm is required' })
        }

        data.push(asset)
      } catch (error) {
        errors.push({ 
          row: i + 1, 
          message: `Failed to parse row: ${error instanceof Error ? error.message : 'Unknown error'}` 
        })
      }
    }

    parsedData.value = data
    validationErrors.value = errors

    if (errors.length > 0) {
      toast.error(`Found ${errors.length} validation errors`)
    } else {
      toast.success(`Successfully parsed ${data.length} items`)
    }
  } catch (error) {
    toast.error('Failed to parse metadata file')
    console.error('Parse error:', error)
  }
}

const getRowErrors = (rowNumber: number): ValidationError[] => {
  return validationErrors.value.filter(error => error.row === rowNumber)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = () => {
  const csvContent = `sku,title,category,tags,description,width_cm,height_cm,depth_cm,unit,lock_initial_scale,anchor_ax,anchor_ay,shadow_blur,shadow_dx,shadow_dy,shadow_alpha
SOF-A123,Lucca 3-Seat Sofa,sofas,"fabric;beige","Comfortable 3-seat sofa with fabric upholstery",210,85,95,cm,true,0.5,1,20,0,8,0.4
CHR-B456,Modern Office Chair,chairs,"leather;black","Ergonomic office chair with leather finish",60,120,60,cm,false,0.5,1,15,2,5,0.3`

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'gallery_assets_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const handleSubmit = () => {
  if (!canSubmit.value) return
  
  emit('submit', {
    csvData: parsedData.value,
    zipFile: zipFile.value || undefined
  })
}
</script>
