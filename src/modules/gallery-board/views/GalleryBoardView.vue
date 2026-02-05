<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col">
      <!-- Header -->
      <div class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Gallery Board</h1>
            <p class="text-gray-600">
              {{ currentScene?.name || 'No scene selected' }}
              <span v-if="currentScene && visibleLayers.length > 0" class="text-gray-400">
                • {{ visibleLayers.length }} items
              </span>
            </p>
          </div>
          
          <div class="flex items-center gap-3">
            <!-- Calibration Status -->
            <div class="flex items-center gap-2">
              <div 
                class="w-2 h-2 rounded-full"
                :class="hasCalibration ? 'bg-green-500' : 'bg-red-500'"
              ></div>
              <span class="text-sm text-gray-600">
                {{ hasCalibration ? 'Calibrated' : 'Not Calibrated' }}
              </span>
              <Button
                v-if="!hasCalibration"
                @click="showCalibrationWizard = true"
                size="sm"
                variant="outline"
              >
                Calibrate
              </Button>
            </div>

            <!-- Scene Controls -->
            <Button @click="createNewScene" variant="outline" class="gap-2">
              <Plus class="w-4 h-4" />
              New Scene
            </Button>
            
            <Button 
              @click="saveCurrentScene" 
              :disabled="!currentScene"
              class="gap-2"
            >
              <Save class="w-4 h-4" />
              Save
            </Button>
            
            <Button 
              @click="showExportDialog = true" 
              :disabled="!currentScene || visibleLayers.length === 0"
              class="gap-2"
            >
              <Download class="w-4 h-4" />
              Export
            </Button>

            <!-- Panel Toggles -->
            <div class="flex items-center gap-1 ml-3 border-l pl-3">
              <Button
                @click="galleryStore.showLayerPanel = !galleryStore.showLayerPanel"
                size="sm"
                variant="ghost"
                :class="{ 'bg-blue-100 text-blue-700': galleryStore.showLayerPanel }"
              >
                <Layers class="w-4 h-4" />
              </Button>
              <Button
                @click="showAssetPanel = !showAssetPanel"
                size="sm"
                variant="ghost"
                :class="{ 'bg-blue-100 text-blue-700': showAssetPanel }"
              >
                <Package class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Workspace -->
      <div class="flex-1 flex">
        <!-- Asset Panel -->
        <div v-if="showAssetPanel" class="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div class="p-4 border-b">
            <h3 class="font-medium text-gray-900">Assets</h3>
            <p class="text-sm text-gray-500">Drag items to the canvas</p>
          </div>
          
          <div class="flex-1 overflow-y-auto p-4">
            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="asset in galleryStore.assets"
                :key="asset.sku"
                @dragstart="startAssetDrag(asset.sku, $event)"
                draggable="true"
                class="bg-gray-50 rounded-lg p-3 cursor-move hover:bg-gray-100 transition-colors border"
              >
                <img
                  :src="asset.thumb"
                  :alt="asset.title"
                  class="w-full aspect-square object-cover rounded border mb-2"
                />
                <h4 class="font-medium text-sm text-gray-900 truncate">{{ asset.title }}</h4>
                <p class="text-xs text-gray-500">{{ asset.sku }}</p>
                <div v-if="asset.physical" class="text-xs text-gray-400 mt-1">
                  {{ asset.physical.widthCm }}×{{ asset.physical.heightCm }}cm
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-if="galleryStore.assets.length === 0" class="text-center py-8">
              <Package class="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p class="text-gray-500 text-sm">No assets available</p>
              <Button @click="$router.push('/settings/gallery-board/assets')" size="sm" class="mt-2">
                Add Assets
              </Button>
            </div>
          </div>
        </div>

        <!-- Canvas Area -->
        <div class="flex-1 flex flex-col">
          <!-- Canvas Toolbar -->
          <div class="bg-white border-b border-gray-200 px-4 py-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <!-- Zoom Controls -->
                <div class="flex items-center gap-2">
                  <Button @click="zoomOut" size="sm" variant="ghost">
                    <ZoomOut class="w-4 h-4" />
                  </Button>
                  <span class="text-sm text-gray-600 min-w-16 text-center">{{ Math.round(canvasZoom * 100) }}%</span>
                  <Button @click="zoomIn" size="sm" variant="ghost">
                    <ZoomIn class="w-4 h-4" />
                  </Button>
                  <Button @click="resetZoom" size="sm" variant="ghost">
                    <RotateCcw class="w-4 h-4" />
                  </Button>
                </div>

                <!-- Selection Tools -->
                <div class="flex items-center gap-2 border-l pl-4">
                  <Button
                    @click="selectAll"
                    :disabled="visibleLayers.length === 0"
                    size="sm"
                    variant="ghost"
                  >
                    Select All
                  </Button>
                  <Button
                    @click="galleryStore.clearSelection()"
                    :disabled="selectedLayers.length === 0"
                    size="sm"
                    variant="ghost"
                  >
                    Clear
                  </Button>
                </div>
              </div>

              <!-- Canvas Settings -->
              <div class="flex items-center gap-2">
                <Button
                  @click="galleryStore.showAnnotations = !galleryStore.showAnnotations"
                  size="sm"
                  variant="ghost"
                  :class="{ 'bg-blue-100 text-blue-700': galleryStore.showAnnotations }"
                >
                  <MessageSquare class="w-4 h-4" />
                </Button>
                <Button @click="showGridLines = !showGridLines" size="sm" variant="ghost">
                  <Grid class="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Canvas -->
          <div 
            ref="canvasContainer"
            class="flex-1 overflow-hidden bg-gray-50 relative"
            @drop="handleCanvasDrop"
            @dragover.prevent
          >
            <div 
              class="absolute inset-0 origin-top-left transition-transform duration-200"
              :style="{ transform: `scale(${canvasZoom}) translate(${canvasPan.x}px, ${canvasPan.y}px)` }"
            >
              <!-- Background -->
              <div 
                v-if="currentScene?.backgroundImage"
                class="absolute inset-0 bg-cover bg-center"
                :style="{ backgroundImage: `url(${currentScene.backgroundImage})` }"
              ></div>
              
              <!-- Grid Lines -->
              <div v-if="showGridLines" class="absolute inset-0 opacity-20">
                <svg width="100%" height="100%" class="pointer-events-none">
                  <defs>
                    <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                      <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#000" stroke-width="1"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
              </div>

              <!-- Layers -->
              <div
                v-for="layer in visibleLayers"
                :key="layer.id"
                @click="selectLayer(layer.id, $event)"
                class="absolute cursor-move"
                :class="{ 
                  'ring-2 ring-blue-500': selectedLayers.includes(layer.id),
                  'opacity-50': layer.locked 
                }"
                :style="{
                  left: layer.x + 'px',
                  top: layer.y + 'px',
                  transform: `rotate(${layer.rotation}deg) scale(${layer.scaleX}, ${layer.scaleY})`,
                  transformOrigin: `${layer.anchorX * 100}% ${layer.anchorY * 100}%`,
                  opacity: layer.opacity,
                  zIndex: layer.z
                }"
              >
                <img
                  :src="getLayerAsset(layer)?.src"
                  :alt="getLayerAsset(layer)?.title"
                  class="block max-w-none"
                  draggable="false"
                />
                
                <!-- Annotations -->
                <div
                  v-if="galleryStore.showAnnotations && layer.annotations && layer.annotations.length > 0"
                  class="absolute -top-2 -right-2"
                >
                  <div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                    {{ layer.annotations.length }}
                  </div>
                </div>
              </div>

              <!-- Drop Zone Indicator -->
              <div
                v-if="isDraggingAsset"
                class="absolute inset-0 border-2 border-dashed border-blue-500 bg-blue-50 bg-opacity-50 flex items-center justify-center"
              >
                <div class="text-blue-700 text-center">
                  <Package class="w-12 h-12 mx-auto mb-2" />
                  <p class="font-medium">Drop to add to scene</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Layer Panel -->
        <LayerPanel v-if="galleryStore.showLayerPanel" />
      </div>
    </div>

    <!-- Annotation Panel (Floating) -->
    <div
      v-if="selectedLayers.length > 0"
      class="fixed bottom-4 left-4 w-80 bg-white rounded-lg shadow-lg border z-50"
    >
      <AnnotationPanel />
    </div>

    <!-- Calibration Wizard -->
    <Dialog v-model:open="showCalibrationWizard">
      <DialogContent class="max-w-4xl">
        <DisplayCalibrationWizard
          @complete="handleCalibrationComplete"
          @cancel="showCalibrationWizard = false"
        />
      </DialogContent>
    </Dialog>

    <!-- Export Dialog -->
    <ExportDialog
      :open="showExportDialog"
      @close="showExportDialog = false"
      @exported="handleExportComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useGalleryBoardStore } from '../stores/gallery-board'
import type { DisplayCalibration, Layer, SKU } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  Plus,
  Save,
  Download,
  Layers,
  Package,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MessageSquare,
  Grid
} from 'lucide-vue-next'

// Import components directly
import LayerPanel from '../components/LayerPanel.vue'
import AnnotationPanel from '../components/AnnotationPanel.vue'
import DisplayCalibrationWizard from '../components/DisplayCalibrationWizard.vue'
import ExportDialog from '../components/ExportDialog.vue'

import { toast } from 'vue-sonner'

const galleryStore = useGalleryBoardStore()

// UI State
const showAssetPanel = ref(true)
const showCalibrationWizard = ref(false)
const showExportDialog = ref(false)
const showGridLines = ref(false)
const isDraggingAsset = ref(false)

// Canvas State
const canvasContainer = ref<HTMLElement>()
const canvasZoom = ref(1)
const canvasPan = ref({ x: 0, y: 0 })

// Computed
const currentScene = computed(() => galleryStore.currentScene)
const visibleLayers = computed(() => galleryStore.visibleLayers)
const selectedLayers = computed(() => galleryStore.selectedLayers)
const hasCalibration = computed(() => galleryStore.hasCalibration)

// Methods
const getLayerAsset = (layer: Layer) => {
  return galleryStore.assets.find(asset => asset.sku === layer.productSku)
}

const createNewScene = async () => {
  try {
    const name = prompt('Enter scene name:')
    if (name) {
      await galleryStore.createScene(name)
      toast.success('New scene created')
    }
  } catch (error) {
    toast.error('Failed to create scene')
  }
}

const saveCurrentScene = async () => {
  try {
    await galleryStore.saveScene()
    toast.success('Scene saved')
  } catch (error) {
    toast.error('Failed to save scene')
  }
}

const selectLayer = (layerId: string, event: MouseEvent) => {
  if (event.ctrlKey || event.metaKey) {
    galleryStore.toggleLayerSelection(layerId)
  } else {
    galleryStore.selectLayers([layerId])
  }
}

const selectAll = () => {
  const allLayerIds = visibleLayers.value.map(layer => layer.id)
  galleryStore.selectLayers(allLayerIds)
}

// Canvas Controls
const zoomIn = () => {
  canvasZoom.value = Math.min(canvasZoom.value * 1.2, 5)
}

const zoomOut = () => {
  canvasZoom.value = Math.max(canvasZoom.value / 1.2, 0.1)
}

const resetZoom = () => {
  canvasZoom.value = 1
  canvasPan.value = { x: 0, y: 0 }
}

// Unused function - keeping for future implementation
// const handleAssetDrop = (_asset: ProductMeta) => {
//   canvasZoom.value = 1
//   canvasPan.value = { x: 0, y: 0 }
// }

// Drag and Drop
let draggedAssetSku: SKU | null = null

const startAssetDrag = (sku: SKU, event: DragEvent) => {
  draggedAssetSku = sku
  isDraggingAsset.value = true
  
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', sku)
  }
}

const handleCanvasDrop = (event: DragEvent) => {
  event.preventDefault()
  isDraggingAsset.value = false
  
  if (!draggedAssetSku || !canvasContainer.value) return
  
  const rect = canvasContainer.value.getBoundingClientRect()
  const x = (event.clientX - rect.left - canvasPan.value.x) / canvasZoom.value
  const y = (event.clientY - rect.top - canvasPan.value.y) / canvasZoom.value
  
  try {
    galleryStore.addLayer(draggedAssetSku, x, y)
    toast.success('Item added to scene')
  } catch (error) {
    toast.error('Failed to add item')
  }
  
  draggedAssetSku = null
}

// Unused function - keeping for future implementation
// const handleLayerDrop = (_layer: Layer) => {
//   // Add your logic here
// }

// Event Handlers
const handleCalibrationComplete = (_calibration: DisplayCalibration) => {
  showCalibrationWizard.value = false
  toast.success('Display calibrated successfully')
}

const handleExportComplete = (_bundle: any) => {
  toast.success('Export completed successfully')
  // TODO: Handle download or show download link
}

// Initialize
onMounted(async () => {
  try {
    await galleryStore.initialize()
    
    // Create default scene if none exists
    if (!currentScene.value && galleryStore.scenes.length === 0) {
      await galleryStore.createScene('New Scene')
    } else if (galleryStore.scenes.length > 0 && !currentScene.value) {
      await galleryStore.loadScene(galleryStore.scenes[0].id)
    }
    
    // Show calibration wizard if not calibrated
    if (!hasCalibration.value) {
      setTimeout(() => {
        showCalibrationWizard.value = true
      }, 1000)
    }
  } catch (error) {
    toast.error('Failed to initialize Gallery Board')
    console.error('Initialization error:', error)
  }
})
</script>
