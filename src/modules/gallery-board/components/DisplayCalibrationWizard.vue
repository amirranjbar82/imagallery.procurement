<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold text-gray-900">Display Calibration</h2>
      <p class="text-gray-600 mt-2">
        Calibrate your display for accurate true-scale product rendering
      </p>
    </div>

    <!-- Method Selection -->
    <div v-if="step === 'method'" class="space-y-6">
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Choose Calibration Method</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Method 1: Device Specs -->
        <div 
          @click="selectMethod('specs')"
          class="border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-blue-300"
          :class="selectedMethod === 'specs' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
        >
          <div class="text-center">
            <Monitor class="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h4 class="font-medium text-gray-900 mb-2">Device Specifications</h4>
            <p class="text-sm text-gray-600 mb-4">
              Enter your display's diagonal size and resolution for automatic calculation
            </p>
            <Badge variant="default">Recommended</Badge>
          </div>
        </div>

        <!-- Method 2: Physical Card -->
        <div 
          @click="selectMethod('card')"
          class="border-2 rounded-lg p-6 cursor-pointer transition-all hover:border-blue-300"
          :class="selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
        >
          <div class="text-center">
            <CreditCard class="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h4 class="font-medium text-gray-900 mb-2">Physical Reference</h4>
            <p class="text-sm text-gray-600 mb-4">
              Use a credit card (85.6mm) to manually calibrate pixel density
            </p>
            <Badge variant="secondary">Manual</Badge>
          </div>
        </div>
      </div>

      <div class="flex justify-center">
        <Button @click="nextStep" :disabled="!selectedMethod">
          Continue
        </Button>
      </div>
    </div>

    <!-- Device Specs Method -->
    <div v-if="step === 'specs'" class="space-y-6">
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Device Specifications</h3>
        <p class="text-gray-600">Enter your display information for automatic calibration</p>
      </div>

      <div class="max-w-md mx-auto space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Display Diagonal (inches)</label>
          <Input
            v-model.number="deviceSpecs.diagonal"
            type="number"
            step="0.1"
            placeholder="e.g., 27, 32, 65"
            class="text-center"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Width (pixels)</label>
            <Input
              v-model.number="deviceSpecs.width"
              type="number"
              placeholder="1920"
              class="text-center"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Height (pixels)</label>
            <Input
              v-model.number="deviceSpecs.height"
              type="number"
              placeholder="1080"
              class="text-center"
            />
          </div>
        </div>

        <!-- Common Presets -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Common Presets</label>
          <div class="grid grid-cols-2 gap-2">
            <Button 
              v-for="preset in commonPresets" 
              :key="preset.name"
              @click="applyPreset(preset)"
              variant="outline"
              size="sm"
            >
              {{ preset.name }}
            </Button>
          </div>
        </div>

        <!-- Calculated Result -->
        <div v-if="calculatedPPCM > 0" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="text-center">
            <h4 class="font-medium text-green-900">Calculated Pixel Density</h4>
            <p class="text-2xl font-bold text-green-700 mt-1">
              {{ calculatedPPCM.toFixed(2) }} px/cm
            </p>
            <p class="text-sm text-green-600 mt-1">
              {{ (calculatedPPCM * 2.54).toFixed(2) }} DPI
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <Button @click="previousStep" variant="outline">
          Back
        </Button>
        <Button @click="nextStep" :disabled="calculatedPPCM <= 0">
          Continue
        </Button>
      </div>
    </div>

    <!-- Physical Card Method -->
    <div v-if="step === 'card'" class="space-y-6">
      <div class="text-center">
        <h3 class="text-lg font-medium text-gray-900 mb-2">Physical Reference Calibration</h3>
        <p class="text-gray-600">Hold a credit card against the rectangle below and resize to match</p>
      </div>

      <div class="max-w-2xl mx-auto">
        <!-- Instructions -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex items-start gap-3">
            <Info class="w-5 h-5 text-yellow-600 mt-0.5" />
            <div class="text-sm text-yellow-800">
              <p class="font-medium mb-1">Instructions:</p>
              <ol class="list-decimal list-inside space-y-1">
                <li>Get a standard credit card (85.6mm × 53.98mm)</li>
                <li>Hold it against your screen over the rectangle below</li>
                <li>Drag the corners to match the card's size exactly</li>
                <li>Click "Calibrate" when the sizes match perfectly</li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Calibration Rectangle -->
        <div class="flex justify-center">
          <div class="relative border-2 border-dashed border-blue-500 bg-blue-50">
            <div 
              ref="calibrationRect"
              class="relative bg-white border-2 border-blue-600 cursor-move"
              :style="{ 
                width: cardRect.width + 'px', 
                height: cardRect.height + 'px' 
              }"
              @mousedown="startDrag"
            >
              <!-- Corner Handles -->
              <div 
                v-for="corner in ['nw', 'ne', 'sw', 'se']" 
                :key="corner"
                :class="getCornerClasses(corner)"
                @mousedown.stop="startResize($event, corner)"
              ></div>
              
              <!-- Center Content -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-center">
                  <CreditCard class="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p class="text-sm font-medium text-blue-900">Credit Card</p>
                  <p class="text-xs text-blue-700">85.6 × 53.98 mm</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Measurements -->
        <div class="text-center mt-4">
          <p class="text-sm text-gray-600">
            Current size: {{ cardRect.width }} × {{ cardRect.height }} pixels
          </p>
          <p v-if="cardPPCM > 0" class="text-sm font-medium text-blue-600">
            Pixel density: {{ cardPPCM.toFixed(2) }} px/cm
          </p>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <Button @click="previousStep" variant="outline">
          Back
        </Button>
        <Button @click="nextStep" :disabled="cardPPCM <= 0">
          Calibrate
        </Button>
      </div>
    </div>

    <!-- Confirmation -->
    <div v-if="step === 'confirm'" class="space-y-6">
      <div class="text-center">
        <CheckCircle class="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">Calibration Complete</h3>
        <p class="text-gray-600">Your display has been calibrated for true-scale rendering</p>
      </div>

      <div class="max-w-md mx-auto bg-gray-50 rounded-lg p-6">
        <h4 class="font-medium text-gray-900 mb-4">Calibration Results</h4>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Method:</span>
            <span class="font-medium">{{ selectedMethod === 'specs' ? 'Device Specifications' : 'Physical Reference' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Pixel Density:</span>
            <span class="font-medium">{{ finalPPCM.toFixed(2) }} px/cm</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">DPI:</span>
            <span class="font-medium">{{ (finalPPCM * 2.54).toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Calibrated:</span>
            <span class="font-medium">{{ new Date().toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-center gap-3">
        <Button @click="recalibrate" variant="outline">
          Recalibrate
        </Button>
        <Button @click="saveCalibration">
          Save & Continue
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useGalleryBoardStore } from '../stores/gallery-board'
import { DisplayCalibration } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  CreditCard, 
  Info, 
  CheckCircle 
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Emits {
  (e: 'complete', calibration: DisplayCalibration): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()
const galleryStore = useGalleryBoardStore()

// Wizard state
const step = ref<'method' | 'specs' | 'card' | 'confirm'>('method')
const selectedMethod = ref<'specs' | 'card' | null>(null)

// Device specs method
const deviceSpecs = ref({
  diagonal: 0,
  width: 0,
  height: 0
})

// Physical card method
const calibrationRect = ref<HTMLElement>()
const cardRect = ref({
  width: 200,
  height: 126 // Approximate credit card ratio
})
const isDragging = ref(false)
const isResizing = ref(false)
const resizeCorner = ref<string>('')

// Common display presets
const commonPresets = [
  { name: '1080p 24"', diagonal: 24, width: 1920, height: 1080 },
  { name: '1080p 27"', diagonal: 27, width: 1920, height: 1080 },
  { name: '4K 32"', diagonal: 32, width: 3840, height: 2160 },
  { name: '4K 43"', diagonal: 43, width: 3840, height: 2160 },
  { name: '4K 55"', diagonal: 55, width: 3840, height: 2160 },
  { name: '4K 65"', diagonal: 65, width: 3840, height: 2160 }
]

// Computed values
const calculatedPPCM = computed(() => {
  if (!deviceSpecs.value.diagonal || !deviceSpecs.value.width || !deviceSpecs.value.height) {
    return 0
  }

  const diagonal = deviceSpecs.value.diagonal
  const width = deviceSpecs.value.width
  const height = deviceSpecs.value.height
  
  // Calculate diagonal in pixels
  const diagonalPixels = Math.sqrt(width * width + height * height)
  
  // Convert diagonal from inches to cm
  const diagonalCm = diagonal * 2.54
  
  // Calculate pixels per cm
  return diagonalPixels / diagonalCm
})

const cardPPCM = computed(() => {
  // Credit card width is 85.6mm = 8.56cm
  return cardRect.value.width / 8.56
})

const finalPPCM = computed(() => {
  return selectedMethod.value === 'specs' ? calculatedPPCM.value : cardPPCM.value
})

// Methods
const selectMethod = (method: 'specs' | 'card') => {
  selectedMethod.value = method
}

const applyPreset = (preset: typeof commonPresets[0]) => {
  deviceSpecs.value = { ...preset }
}

const nextStep = () => {
  switch (step.value) {
    case 'method':
      step.value = selectedMethod.value!
      break
    case 'specs':
    case 'card':
      step.value = 'confirm'
      break
  }
}

const previousStep = () => {
  switch (step.value) {
    case 'specs':
    case 'card':
      step.value = 'method'
      break
    case 'confirm':
      step.value = selectedMethod.value!
      break
  }
}

const recalibrate = () => {
  step.value = 'method'
  selectedMethod.value = null
}

const saveCalibration = async () => {
  const calibration: DisplayCalibration = {
    pixelsPerCm: finalPPCM.value,
    method: selectedMethod.value!,
    calibratedAt: Date.now(),
    deviceId: navigator.userAgent, // Simple device identification
    deviceInfo: selectedMethod.value === 'specs' ? {
      diagonal: deviceSpecs.value.diagonal,
      resolution: {
        width: deviceSpecs.value.width,
        height: deviceSpecs.value.height
      }
    } : undefined
  }

  try {
    await galleryStore.saveCalibration(calibration)
    toast.success('Display calibration saved successfully')
    emit('complete', calibration)
  } catch (error) {
    toast.error('Failed to save calibration')
    console.error('Calibration save error:', error)
  }
}

// Card calibration drag/resize handlers
const startDrag = (event: MouseEvent) => {
  if (isResizing.value) return
  isDragging.value = true
  event.preventDefault()
}

const startResize = (event: MouseEvent, corner: string) => {
  isResizing.value = true
  resizeCorner.value = corner
  event.preventDefault()
}

const handleMouseMove = (event: MouseEvent) => {
  if (!isResizing.value) return

  const rect = calibrationRect.value?.getBoundingClientRect()
  if (!rect) return

  const deltaX = event.clientX - rect.left
  const deltaY = event.clientY - rect.top

  const aspectRatio = 85.6 / 53.98 // Credit card aspect ratio

  switch (resizeCorner.value) {
    case 'se':
      cardRect.value.width = Math.max(100, deltaX)
      cardRect.value.height = Math.max(60, cardRect.value.width / aspectRatio)
      break
    case 'sw':
      cardRect.value.width = Math.max(100, rect.width - deltaX)
      cardRect.value.height = Math.max(60, cardRect.value.width / aspectRatio)
      break
    case 'ne':
      cardRect.value.width = Math.max(100, deltaX)
      cardRect.value.height = Math.max(60, cardRect.value.width / aspectRatio)
      break
    case 'nw':
      cardRect.value.width = Math.max(100, rect.width - deltaX)
      cardRect.value.height = Math.max(60, cardRect.value.width / aspectRatio)
      break
  }
}

const handleMouseUp = () => {
  isDragging.value = false
  isResizing.value = false
  resizeCorner.value = ''
}

const getCornerClasses = (corner: string) => {
  const baseClasses = 'absolute w-3 h-3 bg-blue-600 border border-white cursor-pointer hover:bg-blue-700'
  
  switch (corner) {
    case 'nw':
      return `${baseClasses} -top-1 -left-1 cursor-nw-resize`
    case 'ne':
      return `${baseClasses} -top-1 -right-1 cursor-ne-resize`
    case 'sw':
      return `${baseClasses} -bottom-1 -left-1 cursor-sw-resize`
    case 'se':
      return `${baseClasses} -bottom-1 -right-1 cursor-se-resize`
    default:
      return baseClasses
  }
}

onMounted(() => {
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>
