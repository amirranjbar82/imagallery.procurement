<template>
  <div class="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
    <!-- Header -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <h3 class="font-medium text-gray-900">Layers</h3>
        <div class="flex items-center gap-2">
          <Button
            @click="galleryStore.showLayerPanel = false"
            size="sm"
            variant="ghost"
          >
            <X class="w-4 h-4" />
          </Button>
        </div>
      </div>
      <p class="text-sm text-gray-500 mt-1">
        {{ visibleLayers.length }} layers in scene
      </p>
    </div>

    <!-- Layer Controls -->
    <div class="p-4 border-b border-gray-200">
      <div class="flex items-center gap-2">
        <Button
          @click="bringToFront"
          :disabled="selectedLayers.length === 0"
          size="sm"
          variant="outline"
          class="gap-1"
        >
          <MoveUp class="w-3 h-3" />
          Front
        </Button>
        <Button
          @click="bringForward"
          :disabled="selectedLayers.length === 0"
          size="sm"
          variant="outline"
          class="gap-1"
        >
          <ChevronUp class="w-3 h-3" />
          +1
        </Button>
        <Button
          @click="sendBackward"
          :disabled="selectedLayers.length === 0"
          size="sm"
          variant="outline"
          class="gap-1"
        >
          <ChevronDown class="w-3 h-3" />
          -1
        </Button>
        <Button
          @click="sendToBack"
          :disabled="selectedLayers.length === 0"
          size="sm"
          variant="outline"
          class="gap-1"
        >
          <MoveDown class="w-3 h-3" />
          Back
        </Button>
      </div>
    </div>

    <!-- Layers List -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-2 space-y-1">
        <div
          v-for="layer in sortedLayers"
          :key="layer.id"
          @click="selectLayer(layer.id, $event)"
          @dblclick="toggleLayerLock(layer.id)"
          class="group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors"
          :class="[
            isSelected(layer.id) 
              ? 'bg-blue-100 border border-blue-300' 
              : 'hover:bg-gray-50 border border-transparent',
            layer.locked ? 'opacity-75' : ''
          ]"
          draggable="true"
          @dragstart="startDrag(layer.id, $event)"
          @dragover.prevent
          @drop="handleDrop(layer.id, $event)"
        >
          <!-- Drag Handle -->
          <div class="opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical class="w-4 h-4 text-gray-400" />
          </div>

          <!-- Layer Thumbnail -->
          <div class="relative">
            <img
              :src="getLayerAsset(layer)?.thumb"
              :alt="getLayerAsset(layer)?.title"
              class="w-10 h-10 object-cover rounded border"
            />
            <!-- Lock Overlay -->
            <div
              v-if="layer.locked"
              class="absolute inset-0 bg-black bg-opacity-50 rounded flex items-center justify-center"
            >
              <Lock class="w-3 h-3 text-white" />
            </div>
          </div>

          <!-- Layer Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="font-medium text-sm text-gray-900 truncate">
                {{ getLayerAsset(layer)?.title || layer.productSku }}
              </p>
              <Badge v-if="layer.locked" variant="secondary" class="text-xs">
                Locked
              </Badge>
            </div>
            <p class="text-xs text-gray-500 truncate">
              {{ layer.productSku }} • Z: {{ layer.z }}
            </p>
          </div>

          <!-- Layer Controls -->
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <!-- Visibility Toggle -->
            <Button
              @click.stop="toggleVisibility(layer.id)"
              size="sm"
              variant="ghost"
              class="w-6 h-6 p-0"
            >
              <Eye v-if="layer.visible" class="w-3 h-3 text-gray-600" />
              <EyeOff v-else class="w-3 h-3 text-gray-400" />
            </Button>

            <!-- Lock Toggle -->
            <Button
              @click.stop="toggleLayerLock(layer.id)"
              size="sm"
              variant="ghost"
              class="w-6 h-6 p-0"
            >
              <Lock v-if="layer.locked" class="w-3 h-3 text-gray-600" />
              <Unlock v-else class="w-3 h-3 text-gray-400" />
            </Button>

            <!-- Delete -->
            <Button
              @click.stop="deleteLayer(layer.id)"
              size="sm"
              variant="ghost"
              class="w-6 h-6 p-0 text-red-600 hover:text-red-700"
            >
              <Trash2 class="w-3 h-3" />
            </Button>
          </div>

          <!-- Z-Order Indicator -->
          <div class="absolute -left-1 top-1/2 transform -translate-y-1/2">
            <div 
              class="w-2 h-6 rounded-r"
              :style="{ backgroundColor: getZOrderColor(layer.z) }"
            ></div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="visibleLayers.length === 0" class="text-center py-8">
          <Layers class="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p class="text-gray-500 text-sm">No layers in scene</p>
          <p class="text-gray-400 text-xs mt-1">
            Drag products from the asset panel to create layers
          </p>
        </div>
      </div>
    </div>

    <!-- Selected Layer Info -->
    <div v-if="selectedLayers.length > 0" class="p-4 border-t border-gray-200 bg-gray-50">
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <h4 class="font-medium text-sm text-gray-900">
            {{ selectedLayers.length === 1 ? 'Selected Layer' : `${selectedLayers.length} Layers Selected` }}
          </h4>
          <Button
            @click="galleryStore.clearSelection()"
            size="sm"
            variant="ghost"
          >
            Clear
          </Button>
        </div>

        <!-- Single Layer Controls -->
        <div v-if="selectedLayers.length === 1" class="space-y-2">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="text-gray-500">Position:</span>
              <span class="ml-1 font-mono">
                {{ Math.round(selectedLayerData[0]?.x || 0) }}, {{ Math.round(selectedLayerData[0]?.y || 0) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">Scale:</span>
              <span class="ml-1 font-mono">
                {{ (selectedLayerData[0]?.scaleX || 1).toFixed(2) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500">Rotation:</span>
              <span class="ml-1 font-mono">{{ Math.round(selectedLayerData[0]?.rotation || 0) }}°</span>
            </div>
            <div>
              <span class="text-gray-500">Opacity:</span>
              <span class="ml-1 font-mono">{{ Math.round((selectedLayerData[0]?.opacity || 1) * 100) }}%</span>
            </div>
          </div>

          <!-- True Scale Reset -->
          <div v-if="canResetToTrueScale" class="pt-2 border-t border-gray-200">
            <Button
              @click="resetToTrueScale"
              size="sm"
              variant="outline"
              class="w-full gap-2"
            >
              <RotateCcw class="w-3 h-3" />
              Reset to True Scale
            </Button>
          </div>
        </div>

        <!-- Multi-Layer Controls -->
        <div v-else class="space-y-2">
          <div class="flex gap-2">
            <Button
              @click="lockSelectedLayers"
              size="sm"
              variant="outline"
              class="flex-1 gap-1"
            >
              <Lock class="w-3 h-3" />
              Lock All
            </Button>
            <Button
              @click="unlockSelectedLayers"
              size="sm"
              variant="outline"
              class="flex-1 gap-1"
            >
              <Unlock class="w-3 h-3" />
              Unlock All
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGalleryBoardStore } from '../stores/gallery-board'
import { Layer, LayerId } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  X,
  MoveUp,
  MoveDown,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Layers,
  RotateCcw
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const galleryStore = useGalleryBoardStore()

// Computed
const visibleLayers = computed(() => galleryStore.visibleLayers)
const selectedLayers = computed(() => galleryStore.selectedLayers)
const selectedLayerData = computed(() => galleryStore.selectedLayersData)

const sortedLayers = computed(() => {
  if (!galleryStore.currentScene) return []
  return [...galleryStore.currentScene.layers].sort((a, b) => b.z - a.z) // Highest Z first
})

const canResetToTrueScale = computed(() => {
  if (selectedLayers.value.length !== 1) return false
  const layer = selectedLayerData.value[0]
  if (!layer) return false
  
  const asset = galleryStore.assets.find(a => a.sku === layer.productSku)
  return asset?.physical && galleryStore.hasCalibration
})

// Methods
const isSelected = (layerId: LayerId): boolean => {
  return selectedLayers.value.includes(layerId)
}

const selectLayer = (layerId: LayerId, event: MouseEvent) => {
  if (event.ctrlKey || event.metaKey) {
    // Multi-select
    galleryStore.toggleLayerSelection(layerId)
  } else {
    // Single select
    galleryStore.selectLayers([layerId])
  }
}

const getLayerAsset = (layer: Layer) => {
  return galleryStore.assets.find(asset => asset.sku === layer.productSku)
}

const getZOrderColor = (z: number): string => {
  // Generate color based on Z-order for visual indication
  const maxZ = Math.max(...sortedLayers.value.map(l => l.z), 1)
  const normalized = z / maxZ
  const hue = normalized * 240 // Blue to red spectrum
  return `hsl(${hue}, 60%, 60%)`
}

// Layer ordering actions
const bringToFront = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.reorderLayer(layerId, 'front')
  })
  toast.success('Moved to front')
}

const bringForward = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.reorderLayer(layerId, 'forward')
  })
  toast.success('Moved forward')
}

const sendBackward = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.reorderLayer(layerId, 'backward')
  })
  toast.success('Moved backward')
}

const sendToBack = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.reorderLayer(layerId, 'back')
  })
  toast.success('Moved to back')
}

// Layer controls
const toggleVisibility = (layerId: LayerId) => {
  const layer = galleryStore.currentScene?.layers.find(l => l.id === layerId)
  if (layer) {
    galleryStore.updateLayer(layerId, { visible: !layer.visible })
  }
}

const toggleLayerLock = (layerId: LayerId) => {
  const layer = galleryStore.currentScene?.layers.find(l => l.id === layerId)
  if (layer) {
    galleryStore.updateLayer(layerId, { locked: !layer.locked })
    toast.success(layer.locked ? 'Layer unlocked' : 'Layer locked')
  }
}

const deleteLayer = (layerId: LayerId) => {
  if (confirm('Are you sure you want to delete this layer?')) {
    galleryStore.deleteLayer(layerId)
    toast.success('Layer deleted')
  }
}

const lockSelectedLayers = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.updateLayer(layerId, { locked: true })
  })
  toast.success(`Locked ${selectedLayers.value.length} layers`)
}

const unlockSelectedLayers = () => {
  selectedLayers.value.forEach(layerId => {
    galleryStore.updateLayer(layerId, { locked: false })
  })
  toast.success(`Unlocked ${selectedLayers.value.length} layers`)
}

const resetToTrueScale = () => {
  if (selectedLayers.value.length !== 1) return
  
  const layerId = selectedLayers.value[0]
  const layer = selectedLayerData.value[0]
  const asset = galleryStore.assets.find(a => a.sku === layer.productSku)
  
  if (asset?.physical && galleryStore.hasCalibration) {
    const trueScale = galleryStore.calculateTrueScale(
      asset.physical.widthCm, 
      asset.physical.heightCm
    )
    
    galleryStore.updateLayer(layerId, {
      scaleX: trueScale,
      scaleY: trueScale
    })
    
    toast.success('Reset to true scale')
  }
}

// Drag and drop for reordering
let draggedLayerId: LayerId | null = null

const startDrag = (layerId: LayerId, event: DragEvent) => {
  draggedLayerId = layerId
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
}

const handleDrop = (targetLayerId: LayerId, event: DragEvent) => {
  event.preventDefault()
  
  if (!draggedLayerId || draggedLayerId === targetLayerId) return
  
  const draggedLayer = galleryStore.currentScene?.layers.find(l => l.id === draggedLayerId)
  const targetLayer = galleryStore.currentScene?.layers.find(l => l.id === targetLayerId)
  
  if (draggedLayer && targetLayer) {
    // Swap Z-orders
    const tempZ = draggedLayer.z
    galleryStore.updateLayer(draggedLayerId, { z: targetLayer.z })
    galleryStore.updateLayer(targetLayerId, { z: tempZ })
    
    toast.success('Layer order updated')
  }
  
  draggedLayerId = null
}
</script>
