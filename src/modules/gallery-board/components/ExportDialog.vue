<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-6">
      <div class="space-y-2">
        <h2 class="text-xl font-semibold">Export Scene</h2>
        <p class="text-sm text-gray-500">
          Export your scene as a preset bundle with color palette, thumbnails, and annotations
        </p>
      </div>

      <div class="space-y-6">
        <!-- Export Options -->
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">Export Options</h3>
          <div class="space-y-4">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Export Format</label>
              <select v-model="exportFormat" class="w-full p-2 border rounded-md">
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div class="space-y-2">
              <label class="flex items-center space-x-2">
                <input v-model="includeAnnotations" type="checkbox" class="rounded border-gray-300">
                <span class="text-sm font-medium text-gray-700">Include Annotations</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Preview Section -->
        <div class="space-y-4">
          <h3 class="font-medium text-gray-900">Preview</h3>
          <div class="bg-gray-50 rounded-lg p-4 h-48 flex items-center justify-center">
            <p class="text-gray-500">Preview will be shown here</p>
          </div>
        </div>
      </div>
      
      <div class="flex justify-end space-x-3 pt-4">
        <button 
          @click="handleClose" 
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          :disabled="isLoading"
        >
          Cancel
        </button>
        <button 
          @click="handleExport"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="animate-spin mr-2">↻</span>
          <span>Export {{ exportFormat.toUpperCase() }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { toast } from 'vue-sonner'

const props = defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'exported', bundle: any): void
}>()

const isLoading = ref(false)
const exportFormat = ref('png')
const includeAnnotations = ref(true)

const handleClose = () => {
  if (!isLoading.value) {
    emit('close')
  }
}

const handleExport = async () => {
  try {
    isLoading.value = true
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const bundle = {
      format: exportFormat.value,
      includeAnnotations: includeAnnotations.value,
      timestamp: new Date().toISOString()
    }
    
    emit('exported', bundle)
    emit('close')
    
    toast.success('Export completed successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    toast.error('Failed to export scene. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>
