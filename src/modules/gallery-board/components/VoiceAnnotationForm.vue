<template>
  <div class="space-y-4">
    <!-- Recording Interface -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-gray-700">Voice Recording</label>
      
      <!-- Recording Status -->
      <div class="text-center p-6 bg-gray-50 rounded-lg border">
        <div class="mb-4">
          <div
            class="w-20 h-20 mx-auto rounded-full flex items-center justify-center transition-all duration-300"
            :class="[
              isRecording 
                ? 'bg-red-100 border-4 border-red-300 animate-pulse' 
                : 'bg-blue-100 border-4 border-blue-300'
            ]"
          >
            <Mic 
              class="w-8 h-8"
              :class="isRecording ? 'text-red-600' : 'text-blue-600'"
            />
          </div>
        </div>
        
        <div class="space-y-2">
          <p class="font-medium text-gray-900">
            {{ isRecording ? 'Recording...' : hasRecording ? 'Recording Complete' : 'Ready to Record' }}
          </p>
          <p class="text-sm text-gray-600">
            {{ formatDuration(currentDuration) }}
          </p>
        </div>
      </div>

      <!-- Recording Controls -->
      <div class="flex justify-center gap-3">
        <Button
          v-if="!isRecording && !hasRecording"
          @click="startRecording"
          :disabled="!canRecord"
          class="gap-2"
        >
          <Mic class="w-4 h-4" />
          Start Recording
        </Button>
        
        <Button
          v-if="isRecording"
          @click="stopRecording"
          variant="destructive"
          class="gap-2"
        >
          <Square class="w-4 h-4" />
          Stop Recording
        </Button>
        
        <template v-if="hasRecording && !isRecording">
          <Button
            @click="playRecording"
            :disabled="isPlaying"
            variant="outline"
            class="gap-2"
          >
            <Play v-if="!isPlaying" class="w-4 h-4" />
            <Pause v-else class="w-4 h-4" />
            {{ isPlaying ? 'Playing...' : 'Play' }}
          </Button>
          
          <Button
            @click="deleteRecording"
            variant="outline"
            class="gap-2"
          >
            <Trash2 class="w-4 h-4" />
            Delete
          </Button>
          
          <Button
            @click="startRecording"
            variant="outline"
            class="gap-2"
          >
            <RotateCcw class="w-4 h-4" />
            Re-record
          </Button>
        </template>
      </div>

      <!-- Browser Support Warning -->
      <div v-if="!canRecord" class="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div class="flex items-start gap-2">
          <AlertTriangle class="w-5 h-5 text-yellow-600 mt-0.5" />
          <div class="text-sm text-yellow-800">
            <p class="font-medium">Recording not supported</p>
            <p>Your browser doesn't support audio recording or microphone access was denied.</p>
          </div>
        </div>
      </div>

      <!-- Waveform Visualization -->
      <div v-if="hasRecording" class="space-y-2">
        <label class="text-sm font-medium text-gray-700">Waveform</label>
        <div class="bg-white border rounded-lg p-4">
          <div class="flex items-center justify-center gap-px h-16">
            <div
              v-for="(height, index) in waveformData"
              :key="index"
              class="bg-blue-500 rounded-sm transition-all duration-150"
              :style="{ 
                width: '3px', 
                height: `${height}px`,
                opacity: isPlaying && index <= playbackProgress ? 1 : 0.3
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recording Settings -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-gray-700">Settings</label>
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-xs text-gray-600">Quality</label>
          <Select v-model="audioQuality">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low (32kbps)</SelectItem>
              <SelectItem value="medium">Medium (64kbps)</SelectItem>
              <SelectItem value="high">High (128kbps)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-2">
          <label class="text-xs text-gray-600">Max Duration</label>
          <Select v-model="maxDuration">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
              <SelectItem value="300">5 minutes</SelectItem>
            </SelectContent>
          </Select>
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
        :disabled="!hasRecording || loading"
      >
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        Add Voice Note
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Loader2 
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { file: string; durationMs: number; waveformData?: number[] }): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

// Recording state
const mediaRecorder = ref<MediaRecorder | null>(null)
const audioStream = ref<MediaStream | null>(null)
const audioChunks = ref<Blob[]>([])
const recordedBlob = ref<Blob | null>(null)
const audioUrl = ref<string>('')

const isRecording = ref(false)
const hasRecording = ref(false)
const isPlaying = ref(false)
const canRecord = ref(false)
const currentDuration = ref(0)
const playbackProgress = ref(0)

// Settings
const audioQuality = ref('medium')
const maxDuration = ref('120')

// Waveform data
const waveformData = ref<number[]>([])
const audioContext = ref<AudioContext | null>(null)
const analyser = ref<AnalyserNode | null>(null)

// Timers
const recordingTimer = ref<number | null>(null)
const playbackTimer = ref<number | null>(null)

// Methods
const checkRecordingSupport = async () => {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      canRecord.value = false
      return
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    stream.getTracks().forEach(track => track.stop()) // Stop immediately after checking
    canRecord.value = true
  } catch (error) {
    console.error('Microphone access denied:', error)
    canRecord.value = false
  }
}

const startRecording = async () => {
  try {
    audioStream.value = await navigator.mediaDevices.getUserMedia({ 
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      }
    })

    // Set up audio context for waveform visualization
    audioContext.value = new AudioContext()
    const source = audioContext.value.createMediaStreamSource(audioStream.value)
    analyser.value = audioContext.value.createAnalyser()
    analyser.value.fftSize = 256
    source.connect(analyser.value)

    // Configure MediaRecorder
    const options = getRecorderOptions()
    mediaRecorder.value = new MediaRecorder(audioStream.value, options)
    
    audioChunks.value = []
    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.value.push(event.data)
      }
    }

    mediaRecorder.value.onstop = () => {
      recordedBlob.value = new Blob(audioChunks.value, { type: 'audio/webm' })
      audioUrl.value = URL.createObjectURL(recordedBlob.value)
      hasRecording.value = true
      generateWaveform()
    }

    // Start recording
    mediaRecorder.value.start(100) // Collect data every 100ms
    isRecording.value = true
    currentDuration.value = 0
    
    // Start timer
    recordingTimer.value = window.setInterval(() => {
      currentDuration.value += 100
      
      // Auto-stop at max duration
      if (currentDuration.value >= parseInt(maxDuration.value) * 1000) {
        stopRecording()
      }
      
      // Update waveform during recording
      updateWaveformVisualization()
    }, 100)

    toast.success('Recording started')
  } catch (error) {
    console.error('Failed to start recording:', error)
    toast.error('Failed to start recording')
  }
}

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop()
    isRecording.value = false
    
    if (recordingTimer.value) {
      clearInterval(recordingTimer.value)
      recordingTimer.value = null
    }
    
    // Stop audio stream
    if (audioStream.value) {
      audioStream.value.getTracks().forEach(track => track.stop())
      audioStream.value = null
    }
    
    // Close audio context
    if (audioContext.value) {
      audioContext.value.close()
      audioContext.value = null
    }
    
    toast.success('Recording stopped')
  }
}

const playRecording = async () => {
  if (!audioUrl.value) return
  
  try {
    const audio = new Audio(audioUrl.value)
    isPlaying.value = true
    playbackProgress.value = 0
    
    // Update progress during playback
    playbackTimer.value = window.setInterval(() => {
      const progress = (audio.currentTime / audio.duration) * waveformData.value.length
      playbackProgress.value = Math.floor(progress)
    }, 50)
    
    audio.onended = () => {
      isPlaying.value = false
      playbackProgress.value = 0
      if (playbackTimer.value) {
        clearInterval(playbackTimer.value)
        playbackTimer.value = null
      }
    }
    
    await audio.play()
  } catch (error) {
    isPlaying.value = false
    toast.error('Failed to play recording')
  }
}

const deleteRecording = () => {
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
  
  recordedBlob.value = null
  audioUrl.value = ''
  hasRecording.value = false
  currentDuration.value = 0
  waveformData.value = []
  playbackProgress.value = 0
  
  toast.success('Recording deleted')
}

const getRecorderOptions = () => {
  const bitrates = {
    low: 32000,
    medium: 64000,
    high: 128000
  }
  
  return {
    mimeType: 'audio/webm;codecs=opus',
    audioBitsPerSecond: bitrates[audioQuality.value as keyof typeof bitrates]
  }
}

const updateWaveformVisualization = () => {
  if (!analyser.value) return
  
  const bufferLength = analyser.value.frequencyBinCount
  const dataArray = new Uint8Array(bufferLength)
  analyser.value.getByteFrequencyData(dataArray)
  
  // Calculate average amplitude
  const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength
  const height = Math.max(2, (average / 255) * 60) // Scale to 2-60px height
  
  waveformData.value.push(height)
  
  // Limit waveform data to prevent memory issues
  if (waveformData.value.length > 200) {
    waveformData.value.shift()
  }
}

const generateWaveform = () => {
  // If we don't have real-time waveform data, generate a simple representation
  if (waveformData.value.length === 0) {
    const duration = currentDuration.value
    const bars = Math.min(100, Math.floor(duration / 100))
    
    waveformData.value = Array.from({ length: bars }, () => 
      Math.random() * 50 + 10 // Random heights between 10-60px
    )
  }
}

const formatDuration = (ms: number): string => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const handleSubmit = async () => {
  if (!recordedBlob.value) return
  
  try {
    // In a real implementation, you would upload the blob to your server
    // For now, we'll create a mock file URL
    const fileName = `voice_${Date.now()}.webm`
    const mockFileUrl = `/data/notes/${fileName}`
    
    emit('submit', {
      file: mockFileUrl,
      durationMs: currentDuration.value,
      waveformData: waveformData.value
    })
  } catch (error) {
    toast.error('Failed to save voice recording')
    console.error('Voice submission error:', error)
  }
}

onMounted(() => {
  checkRecordingSupport()
})

onUnmounted(() => {
  // Cleanup
  if (recordingTimer.value) {
    clearInterval(recordingTimer.value)
  }
  if (playbackTimer.value) {
    clearInterval(playbackTimer.value)
  }
  if (audioStream.value) {
    audioStream.value.getTracks().forEach(track => track.stop())
  }
  if (audioContext.value) {
    audioContext.value.close()
  }
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value)
  }
})
</script>
