<template>
  <div class="space-y-4">
    <!-- Drawing Canvas -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Draw or Write</label>
      <div class="border rounded-lg bg-white">
        <!-- Canvas Toolbar -->
        <div class="flex items-center justify-between p-3 border-b bg-gray-50">
          <div class="flex items-center gap-2">
            <!-- Pen Tools -->
            <Button
              type="button"
              @click="setTool('pen')"
              size="sm"
              variant="ghost"
              :class="{ 'bg-blue-100 text-blue-700': currentTool === 'pen' }"
            >
              <PenTool class="w-4 h-4" />
            </Button>
            <Button
              type="button"
              @click="setTool('eraser')"
              size="sm"
              variant="ghost"
              :class="{ 'bg-blue-100 text-blue-700': currentTool === 'eraser' }"
            >
              <Eraser class="w-4 h-4" />
            </Button>
            
            <div class="w-px h-6 bg-gray-300 mx-1"></div>
            
            <!-- Stroke Width -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">Size:</span>
              <input
                v-model.number="strokeWidth"
                type="range"
                min="1"
                max="10"
                class="w-16"
              />
              <span class="text-xs text-gray-600 w-4">{{ strokeWidth }}</span>
            </div>
            
            <!-- Color Picker -->
            <div class="flex items-center gap-2">
              <span class="text-xs text-gray-600">Color:</span>
              <input
                v-model="strokeColor"
                type="color"
                class="w-8 h-6 rounded border cursor-pointer"
              />
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <Button
              type="button"
              @click="undoStroke"
              size="sm"
              variant="ghost"
              :disabled="paths.length === 0"
            >
              <Undo class="w-4 h-4" />
            </Button>
            <Button
              type="button"
              @click="clearCanvas"
              size="sm"
              variant="ghost"
              :disabled="paths.length === 0"
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <!-- Canvas -->
        <div class="relative">
          <canvas
            ref="canvas"
            width="600"
            height="400"
            @mousedown="startDrawing"
            @mousemove="draw"
            @mouseup="stopDrawing"
            @mouseleave="stopDrawing"
            @touchstart="handleTouch"
            @touchmove="handleTouch"
            @touchend="stopDrawing"
            class="cursor-crosshair touch-none"
            :class="{ 'cursor-grab': currentTool === 'eraser' }"
          ></canvas>
          
          <!-- Instructions Overlay -->
          <div
            v-if="paths.length === 0"
            class="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div class="text-center text-gray-400">
              <PenTool class="w-12 h-12 mx-auto mb-2" />
              <p class="text-sm">Click and drag to draw</p>
              <p class="text-xs">Use touch on mobile devices</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawing Stats -->
    <div v-if="paths.length > 0" class="text-xs text-gray-500">
      {{ paths.length }} stroke{{ paths.length !== 1 ? 's' : '' }} drawn
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Cancel
      </Button>
      <Button 
        @click="handleSubmit" 
        :disabled="paths.length === 0 || loading"
      >
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        Add Drawing
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { PenTool, Eraser, Undo, Trash2, Loader2 } from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { paths: Array<{ points: number[] }> }): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const canvas = ref<HTMLCanvasElement>()
const ctx = ref<CanvasRenderingContext2D | null>(null)

// Drawing state
const isDrawing = ref(false)
const currentTool = ref<'pen' | 'eraser'>('pen')
const strokeWidth = ref(3)
const strokeColor = ref('#000000')
const paths = ref<Array<{ points: number[]; color: string; width: number }>>([])
const currentPath = ref<number[]>([])

// Methods
const setTool = (tool: 'pen' | 'eraser') => {
  currentTool.value = tool
}

const getCanvasCoordinates = (event: MouseEvent | Touch): { x: number; y: number } => {
  if (!canvas.value) return { x: 0, y: 0 }
  
  const rect = canvas.value.getBoundingClientRect()
  const scaleX = canvas.value.width / rect.width
  const scaleY = canvas.value.height / rect.height
  
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  }
}

const startDrawing = (event: MouseEvent) => {
  if (!ctx.value) return
  
  isDrawing.value = true
  const coords = getCanvasCoordinates(event)
  currentPath.value = [coords.x, coords.y]
  
  ctx.value.beginPath()
  ctx.value.moveTo(coords.x, coords.y)
}

const draw = (event: MouseEvent) => {
  if (!isDrawing.value || !ctx.value) return
  
  const coords = getCanvasCoordinates(event)
  currentPath.value.push(coords.x, coords.y)
  
  if (currentTool.value === 'pen') {
    ctx.value.globalCompositeOperation = 'source-over'
    ctx.value.strokeStyle = strokeColor.value
    ctx.value.lineWidth = strokeWidth.value
  } else {
    ctx.value.globalCompositeOperation = 'destination-out'
    ctx.value.lineWidth = strokeWidth.value * 2
  }
  
  ctx.value.lineCap = 'round'
  ctx.value.lineJoin = 'round'
  ctx.value.lineTo(coords.x, coords.y)
  ctx.value.stroke()
}

const stopDrawing = () => {
  if (!isDrawing.value) return
  
  isDrawing.value = false
  
  if (currentPath.value.length >= 4 && currentTool.value === 'pen') {
    paths.value.push({
      points: [...currentPath.value],
      color: strokeColor.value,
      width: strokeWidth.value
    })
  }
  
  currentPath.value = []
}

const handleTouch = (event: TouchEvent) => {
  event.preventDefault()
  
  if (event.touches.length !== 1) return
  
  const touch = event.touches[0]
  const mouseEvent = new MouseEvent(event.type.replace('touch', 'mouse'), {
    clientX: touch.clientX,
    clientY: touch.clientY
  })
  
  switch (event.type) {
    case 'touchstart':
      startDrawing(mouseEvent)
      break
    case 'touchmove':
      draw(mouseEvent)
      break
    case 'touchend':
      stopDrawing()
      break
  }
}

const undoStroke = () => {
  if (paths.value.length === 0) return
  
  paths.value.pop()
  redrawCanvas()
}

const clearCanvas = () => {
  paths.value = []
  redrawCanvas()
}

const redrawCanvas = () => {
  if (!ctx.value || !canvas.value) return
  
  // Clear canvas
  ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
  
  // Redraw all paths
  paths.value.forEach(path => {
    if (path.points.length < 4) return
    
    ctx.value!.beginPath()
    ctx.value!.globalCompositeOperation = 'source-over'
    ctx.value!.strokeStyle = path.color
    ctx.value!.lineWidth = path.width
    ctx.value!.lineCap = 'round'
    ctx.value!.lineJoin = 'round'
    
    ctx.value!.moveTo(path.points[0], path.points[1])
    for (let i = 2; i < path.points.length; i += 2) {
      ctx.value!.lineTo(path.points[i], path.points[i + 1])
    }
    ctx.value!.stroke()
  })
}

const handleSubmit = () => {
  if (paths.value.length === 0) return
  
  // Convert paths to the format expected by the annotation system
  const annotationPaths = paths.value.map(path => ({
    points: path.points
  }))
  
  emit('submit', { paths: annotationPaths })
}

// Keyboard shortcuts
const handleKeydown = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'z':
        event.preventDefault()
        undoStroke()
        break
    }
  }
  
  switch (event.key) {
    case 'p':
      setTool('pen')
      break
    case 'e':
      setTool('eraser')
      break
    case 'c':
      if (event.ctrlKey || event.metaKey) {
        event.preventDefault()
        clearCanvas()
      }
      break
  }
}

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d')
    
    // Set up canvas background
    if (ctx.value) {
      ctx.value.fillStyle = '#ffffff'
      ctx.value.fillRect(0, 0, canvas.value.width, canvas.value.height)
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@reference "tailwindcss";
canvas {
  display: block;
  width: 100%;
  height: 400px;
}
</style>
