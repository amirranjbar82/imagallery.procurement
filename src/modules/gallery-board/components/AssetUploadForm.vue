<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- File Upload -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Image File</label>
      <div 
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
        :class="{ 'border-blue-500 bg-blue-50': dragOver }"
      >
        <div v-if="!selectedFile">
          <Upload class="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p class="text-sm text-gray-600">
            Drop your image here or 
            <button type="button" @click="$refs.fileInput.click()" class="text-blue-600 hover:text-blue-700">
              browse files
            </button>
          </p>
          <p class="text-xs text-gray-500 mt-1">PNG preferred, WebP allowed for previews</p>
        </div>
        <div v-else class="flex items-center gap-3">
          <img 
            :src="previewUrl" 
            alt="Preview" 
            class="w-16 h-16 object-cover rounded border"
          />
          <div class="text-left">
            <p class="font-medium text-gray-900">{{ selectedFile.name }}</p>
            <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
            <Button 
              type="button" 
              @click="clearFile" 
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
        ref="fileInput"
        type="file"
        accept="image/png,image/webp,image/jpeg"
        @change="handleFileSelect"
        class="hidden"
      />
    </div>

    <!-- Basic Information -->
    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">SKU *</label>
        <Input
          v-model="form.sku"
          placeholder="e.g., SOF-A123"
          required
        />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Title *</label>
        <Input
          v-model="form.title"
          placeholder="e.g., Lucca 3-Seat Sofa"
          required
        />
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Category *</label>
        <Select v-model="form.category">
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sofas">Sofas</SelectItem>
            <SelectItem value="chairs">Chairs</SelectItem>
            <SelectItem value="tables">Tables</SelectItem>
            <SelectItem value="beds">Beds</SelectItem>
            <SelectItem value="storage">Storage</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="decor">Decor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Tags</label>
        <Input
          v-model="tagsInput"
          placeholder="fabric, beige, modern (comma separated)"
        />
      </div>
    </div>

    <!-- Physical Dimensions -->
    <div class="space-y-4">
      <h3 class="font-medium text-gray-900">Physical Dimensions *</h3>
      <div class="grid grid-cols-4 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Width</label>
          <Input
            v-model.number="form.physicalSize.widthCm"
            type="number"
            step="0.1"
            placeholder="210"
            required
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Height</label>
          <Input
            v-model.number="form.physicalSize.heightCm"
            type="number"
            step="0.1"
            placeholder="85"
            required
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Depth</label>
          <Input
            v-model.number="form.physicalSize.depthCm"
            type="number"
            step="0.1"
            placeholder="95"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Unit</label>
          <Select v-model="form.physicalSize.unit">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cm">Centimeters</SelectItem>
              <SelectItem value="in">Inches</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Advanced Settings -->
    <div class="space-y-4">
      <h3 class="font-medium text-gray-900">Display Settings</h3>
      
      <div class="flex items-center space-x-2">
        <Checkbox 
          id="lockScale"
          v-model:checked="form.lockInitialScale"
        />
        <label for="lockScale" class="text-sm text-gray-700">
          Lock initial scale (prevent resizing until unlocked)
        </label>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Anchor X (0-1)</label>
          <Input
            v-model.number="form.anchorX"
            type="number"
            step="0.1"
            min="0"
            max="1"
            placeholder="0.5"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Anchor Y (0-1)</label>
          <Input
            v-model.number="form.anchorY"
            type="number"
            step="0.1"
            min="0"
            max="1"
            placeholder="1.0"
          />
        </div>
      </div>

      <div class="grid grid-cols-4 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Shadow Blur</label>
          <Input
            v-model.number="form.shadowBlur"
            type="number"
            min="0"
            placeholder="20"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Shadow X</label>
          <Input
            v-model.number="form.shadowDx"
            type="number"
            placeholder="0"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Shadow Y</label>
          <Input
            v-model.number="form.shadowDy"
            type="number"
            placeholder="8"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Shadow Alpha</label>
          <Input
            v-model.number="form.shadowAlpha"
            type="number"
            step="0.1"
            min="0"
            max="1"
            placeholder="0.4"
          />
        </div>
      </div>
    </div>

    <!-- Description -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Description</label>
      <Textarea
        v-model="form.description"
        placeholder="Detailed product description..."
        rows="3"
      />
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Cancel
      </Button>
      <Button type="submit" :disabled="!isValid || loading">
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        Upload Asset
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { AssetUploadMeta } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, Loader2 } from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { file: File; metadata: AssetUploadMeta }): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// File handling
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string>('')
const dragOver = ref(false)

// Form data
const form = ref<AssetUploadMeta>({
  sku: '',
  title: '',
  category: '',
  tags: [],
  description: '',
  physicalSize: {
    widthCm: 0,
    heightCm: 0,
    depthCm: 0,
    unit: 'cm'
  },
  lockInitialScale: false,
  anchorX: 0.5,
  anchorY: 1.0,
  shadowBlur: 20,
  shadowDx: 0,
  shadowDy: 8,
  shadowAlpha: 0.4
})

const tagsInput = ref('')

// Computed
const isValid = computed(() => {
  return selectedFile.value &&
         form.value.sku &&
         form.value.title &&
         form.value.category &&
         form.value.physicalSize.widthCm > 0 &&
         form.value.physicalSize.heightCm > 0
})

// Watchers
watch(tagsInput, (value) => {
  form.value.tags = value.split(',').map(tag => tag.trim()).filter(Boolean)
})

// File handling methods
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    setSelectedFile(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  event.preventDefault()
  dragOver.value = false
  
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    setSelectedFile(event.dataTransfer.files[0])
  }
}

const setSelectedFile = (file: File) => {
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  
  // Auto-generate SKU from filename if empty
  if (!form.value.sku) {
    form.value.sku = file.name.replace(/\.[^/.]+$/, '').toUpperCase()
  }
}

const clearFile = () => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  selectedFile.value = null
  previewUrl.value = ''
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleSubmit = () => {
  if (!selectedFile.value || !isValid.value) return
  
  emit('submit', {
    file: selectedFile.value,
    metadata: form.value
  })
}
</script>
