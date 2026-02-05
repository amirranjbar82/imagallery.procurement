<template>
  <div class="space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="font-medium text-gray-900">Annotations</h3>
      <div class="flex items-center gap-2">
        <Button
          @click="galleryStore.showAnnotations = !galleryStore.showAnnotations"
          size="sm"
          variant="outline"
          :class="{ 'bg-blue-100 text-blue-700': galleryStore.showAnnotations }"
        >
          <MessageSquare class="w-4 h-4" />
          {{ galleryStore.showAnnotations ? 'Hide' : 'Show' }}
        </Button>
      </div>
    </div>

    <!-- Add Annotation Buttons -->
    <div v-if="selectedLayers.length > 0" class="flex gap-2">
      <Button
        @click="showTextDialog = true"
        size="sm"
        variant="outline"
        class="gap-2"
      >
        <Type class="w-4 h-4" />
        Text
      </Button>
      <Button
        @click="showInkDialog = true"
        size="sm"
        variant="outline"
        class="gap-2"
      >
        <PenTool class="w-4 h-4" />
        Ink
      </Button>
      <Button
        @click="showVoiceDialog = true"
        size="sm"
        variant="outline"
        class="gap-2"
      >
        <Mic class="w-4 h-4" />
        Voice
      </Button>
    </div>

    <!-- No Selection Message -->
    <div v-else class="text-center py-6 text-gray-500">
      <MessageSquare class="w-8 h-8 mx-auto mb-2 text-gray-300" />
      <p class="text-sm">Select a layer to add annotations</p>
    </div>

    <!-- Annotations List -->
    <div v-if="layerAnnotations.length > 0" class="space-y-3">
      <h4 class="text-sm font-medium text-gray-700">
        {{ selectedLayers.length === 1 ? 'Layer Annotations' : 'Selected Layers Annotations' }}
      </h4>
      
      <div class="space-y-2">
        <div
          v-for="annotation in layerAnnotations"
          :key="annotation.id"
          class="bg-gray-50 rounded-lg p-3 border"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex items-center gap-2">
              <Type v-if="annotation.type === 'text'" class="w-4 h-4 text-blue-600" />
              <PenTool v-else-if="annotation.type === 'ink'" class="w-4 h-4 text-green-600" />
              <Mic v-else-if="annotation.type === 'voice'" class="w-4 h-4 text-purple-600" />
              
              <Badge variant="secondary" class="text-xs">
                {{ annotation.type }}
              </Badge>
            </div>
            
            <div class="flex items-center gap-1">
              <Button
                @click="editAnnotation(annotation)"
                size="sm"
                variant="ghost"
                class="w-6 h-6 p-0"
              >
                <Edit class="w-3 h-3" />
              </Button>
              <Button
                @click="deleteAnnotation(annotation)"
                size="sm"
                variant="ghost"
                class="w-6 h-6 p-0 text-red-600"
              >
                <Trash2 class="w-3 h-3" />
              </Button>
            </div>
          </div>

          <!-- Annotation Content -->
          <div class="annotation-content">
            <!-- Text Annotation -->
            <div v-if="annotation.type === 'text'" v-html="annotation.html" class="prose prose-sm max-w-none"></div>
            
            <!-- Ink Annotation -->
            <div v-else-if="annotation.type === 'ink'" class="flex items-center gap-2">
              <svg width="100" height="60" class="border rounded bg-white">
                <path
                  v-for="(path, index) in annotation.paths"
                  :key="index"
                  :d="generateSVGPath(path.points)"
                  stroke="currentColor"
                  stroke-width="2"
                  fill="none"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="text-xs text-gray-500">Handwriting</span>
            </div>
            
            <!-- Voice Annotation -->
            <div v-else-if="annotation.type === 'voice'" class="flex items-center gap-3">
              <Button
                @click="toggleVoicePlayback(annotation)"
                size="sm"
                variant="outline"
                class="gap-2"
              >
                <Play v-if="!isPlaying(annotation.id)" class="w-3 h-3" />
                <Pause v-else class="w-3 h-3" />
                {{ isPlaying(annotation.id) ? 'Pause' : 'Play' }}
              </Button>
              <div class="flex-1">
                <div class="text-xs text-gray-500 mb-1">
                  {{ formatDuration(annotation.durationMs) }}
                </div>
                <!-- Simple waveform visualization -->
                <div class="flex items-center gap-px h-4">
                  <div
                    v-for="(height, index) in getWaveformData(annotation)"
                    :key="index"
                    class="bg-purple-400 rounded-sm"
                    :style="{ width: '2px', height: `${height}px` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Metadata -->
          <div class="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
            <span class="text-xs text-gray-500">
              {{ annotation.author || 'Unknown' }}
            </span>
            <span class="text-xs text-gray-500">
              {{ formatDate(annotation.createdAt) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Text Annotation Dialog -->
    <Dialog v-model:open="showTextDialog">
      <DialogContent class="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Text Annotation</DialogTitle>
          <DialogDescription>
            Add a text note to the selected layer
          </DialogDescription>
        </DialogHeader>
        <TextAnnotationForm
          @submit="handleTextSubmit"
          @cancel="showTextDialog = false"
          :loading="annotationLoading"
        />
      </DialogContent>
    </Dialog>

    <!-- Ink Annotation Dialog -->
    <Dialog v-model:open="showInkDialog">
      <DialogContent class="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add Handwriting Annotation</DialogTitle>
          <DialogDescription>
            Draw or write notes with your mouse or touch device
          </DialogDescription>
        </DialogHeader>
        <InkAnnotationForm
          @submit="handleInkSubmit"
          @cancel="showInkDialog = false"
          :loading="annotationLoading"
        />
      </DialogContent>
    </Dialog>

    <!-- Voice Annotation Dialog -->
    <Dialog v-model:open="showVoiceDialog">
      <DialogContent class="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Voice Annotation</DialogTitle>
          <DialogDescription>
            Record a voice note for the selected layer
          </DialogDescription>
        </DialogHeader>
        <VoiceAnnotationForm
          @submit="handleVoiceSubmit"
          @cancel="showVoiceDialog = false"
          :loading="annotationLoading"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useGalleryBoardStore } from '../stores/gallery-board'
import type { Annotation, TextAnnotation, InkAnnotation, VoiceAnnotation } from '../types/gallery-board'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import {
  MessageSquare,
  Type,
  PenTool,
  Mic,
  Edit,
  Trash2,
  Play,
  Pause
} from 'lucide-vue-next'
import TextAnnotationForm from './TextAnnotationForm.vue'
import InkAnnotationForm from './InkAnnotationForm.vue'
import VoiceAnnotationForm from './VoiceAnnotationForm.vue'
import { toast } from 'vue-sonner'

const galleryStore = useGalleryBoardStore()

// UI State
const showTextDialog = ref(false)
const showInkDialog = ref(false)
const showVoiceDialog = ref(false)
const annotationLoading = ref(false)
const playingAnnotations = ref<Set<string>>(new Set())

// Computed
const selectedLayers = computed(() => galleryStore.selectedLayers)

const layerAnnotations = computed(() => {
  if (!galleryStore.currentScene || selectedLayers.value.length === 0) return []
  
  const annotations: Annotation[] = []
  selectedLayers.value.forEach(layerId => {
    const layer = galleryStore.currentScene?.layers.find(l => l.id === layerId)
    if (layer?.annotations) {
      annotations.push(...layer.annotations)
    }
  })
  
  return annotations.sort((a, b) => b.createdAt - a.createdAt)
})

// Methods
const handleTextSubmit = (data: { html: string }) => {
  if (galleryStore.currentScene && selectedLayers.value.length > 0) {
    const newAnnotation: Omit<TextAnnotation, 'id' | 'createdAt'> = {
      type: 'text',
      html: data.html,
      author: 'Current User' // TODO: Replace with actual user
    }
    galleryStore.addAnnotation(selectedLayers.value[0], newAnnotation)
  }
}

const handleInkSubmit = (data: { paths: Array<{ points: number[] }> }) => {
  if (galleryStore.currentScene && selectedLayers.value.length > 0) {
    const newAnnotation: Omit<InkAnnotation, 'id' | 'createdAt'> = {
      type: 'ink',
      paths: data.paths,
      author: 'Current User' // TODO: Replace with actual user
    }
    galleryStore.addAnnotation(selectedLayers.value[0], newAnnotation)
  }
}

const handleVoiceSubmit = (data: { file: string; durationMs: number; waveformData?: number[] }) => {
  if (galleryStore.currentScene && selectedLayers.value.length > 0) {
    const newAnnotation: Omit<VoiceAnnotation, 'id' | 'createdAt'> = {
      type: 'voice',
      file: data.file,
      durationMs: data.durationMs,
      waveformData: data.waveformData,
      author: 'Current User' // TODO: Replace with actual user
    }
    galleryStore.addAnnotation(selectedLayers.value[0], newAnnotation)
  }
}

const editAnnotation = (annotation: Annotation) => {
  // TODO: Implement edit functionality
  toast.info(`Edit functionality for annotation ${annotation.id} coming soon`)
  console.log('Editing annotation:', annotation)
}

const deleteAnnotation = (annotation: Annotation) => {
  if (!confirm('Are you sure you want to delete this annotation?')) return
  
  // Find the layer containing this annotation
  const layer = galleryStore.currentScene?.layers.find(l => 
    l.annotations?.some(a => a.id === annotation.id)
  )
  
  if (layer) {
    galleryStore.deleteAnnotation(layer.id, annotation.id)
    toast.success('Annotation deleted')
  }
}

const toggleVoicePlayback = async (annotation: VoiceAnnotation) => {
  const isCurrentlyPlaying = playingAnnotations.value.has(annotation.id)
  
  if (isCurrentlyPlaying) {
    // Stop playback
    playingAnnotations.value.delete(annotation.id)
    // TODO: Stop actual audio playback
  } else {
    // Start playback
    playingAnnotations.value.add(annotation.id)
    
    try {
      // TODO: Implement actual audio playback
      // const audio = new Audio(annotation.file)
      // await audio.play()
      
      // Simulate playback duration
      setTimeout(() => {
        playingAnnotations.value.delete(annotation.id)
      }, annotation.durationMs || 3000)
      
    } catch (error) {
      playingAnnotations.value.delete(annotation.id)
      toast.error('Failed to play audio')
    }
  }
}

const isPlaying = (annotationId: string): boolean => {
  return playingAnnotations.value.has(annotationId)
}

const generateSVGPath = (points: number[]): string => {
  if (points.length < 4) return ''
  
  let path = `M ${points[0]} ${points[1]}`
  for (let i = 2; i < points.length; i += 2) {
    path += ` L ${points[i]} ${points[i + 1]}`
  }
  return path
}

const getWaveformData = (annotation: VoiceAnnotation): number[] => {
  // Return stored waveform data or generate mock data
  if (annotation.waveformData) {
    return annotation.waveformData.slice(0, 50) // Limit to 50 bars
  }
  
  // Generate mock waveform
  const bars = 50
  return Array.from({ length: bars }, () => Math.random() * 16 + 2)
}

const formatDuration = (ms?: number): string => {
  if (!ms) return '0:00'
  
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString()
}
</script>

<style scoped>
@reference "tailwindcss";
.annotation-content {
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #374151;
}

.prose {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.prose p {
  margin-bottom: 0.5rem;
}

.prose strong {
  font-weight: 600;
}

.prose em {
  font-style: italic;
}

.prose ul {
  list-style-type: disc;
  list-style-position: inside;
}

.prose ol {
  list-style-type: decimal;
  list-style-position: inside;
}
</style>
