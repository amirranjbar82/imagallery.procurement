<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="min-w-[840px] p-0 overflow-hidden rounded-xl">
      <div class="max-h-[90vh] overflow-y-auto">
        <!-- Header with actions on the right -->
        <div class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
          <div class="px-6 py-4 flex items-start justify-between gap-4">
            <div>
              <DialogHeader class="p-0">
                <DialogTitle class="flex items-center gap-2">
                  <Camera class="h-5 w-5" />
                  Quick Add Supplier
                </DialogTitle>
                <DialogDescription>
                  Capture or upload a photo of a supplier card/invoice to quickly create a new supplier. We will try to auto-fill fields. You can edit before saving.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div class="flex items-center gap-2 shrink-0">
              <Button variant="outline" @click="emit('update:open', false)">Cancel</Button>
              <Button :disabled="submitLoading" @click="submit" ref="saveBtnRef">
                <Save class="h-4 w-4 mr-2" />
                {{ submitLoading ? 'Saving...' : 'Save' }}
              </Button>
            </div>
          </div>
        </div>
        <div class="p-6">

        <!-- Step 1: Capture / Upload -->
        <div v-if="!imageBlobUrl" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="text-sm font-medium">Camera</div>
            <div class="aspect-video bg-black/90 rounded-lg overflow-hidden flex items-center justify-center relative">
              <video ref="videoEl" autoplay playsinline class="w-full h-full object-contain" />
              <div v-if="cameraError" class="absolute inset-0 flex items-center justify-center">
                <div class="text-red-600 text-sm">{{ cameraError }}</div>
              </div>
            </div>
            <div class="flex gap-2">
              <Button variant="default" :disabled="!cameraStream" @click="capturePhoto">
                <Camera class="h-4 w-4 mr-2" /> Capture
              </Button>
              <Button variant="outline" @click="initCamera">
                <RefreshCw class="h-4 w-4 mr-2" /> Re-initialize Camera
              </Button>
            </div>
          </div>

          <div class="space-y-3">
            <div class="text-sm font-medium">Upload Image</div>
            <div class="border rounded-lg p-6 text-center">
              <input ref="fileEl" type="file" accept="image/*" class="hidden" @change="onFileChange" />
              <Button variant="outline" @click="fileEl?.click()">
                <ImageIcon class="h-4 w-4 mr-2" /> Choose Image
              </Button>
              <p class="text-xs text-muted-foreground mt-2">JPEG, PNG. Use this if the camera is unavailable.</p>
            </div>
          </div>
        </div>

        <!-- Step 2: Preview & Form -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium">Captured Image</div>
              <Button variant="ghost" class="h-8 px-2" @click="retake">
                <RotateCcw class="h-4 w-4 mr-1" /> Retake
              </Button>
            </div>
            <img :src="imageBlobUrl" alt="preview" class="w-full rounded-lg border" />
            <div class="flex items-center gap-2">
              <Button variant="secondary" :disabled="ocrLoading" @click="runOcr">
                <ScanLine class="h-4 w-4 mr-2" />
                {{ ocrLoading ? 'Reading...' : 'Try Auto-fill' }}
              </Button>
              <span v-if="ocrError" class="text-red-600 text-xs">{{ ocrError }}</span>
            </div>
          </div>

          <div class="space-y-4">
            <Tabs defaultValue="basic" class="w-full">
              <TabsList class="grid grid-cols-4 w-full">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="address">Address</TabsTrigger>
                <TabsTrigger value="finance">Finance</TabsTrigger>
                <TabsTrigger value="additional">Additional</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Name</Label>
                    <Input v-model="form.name" placeholder="Supplier name" />
                  </div>
                  <div>
                    <Label>Contact Person</Label>
                    <Input v-model="form.contactPerson" placeholder="Contact person" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input v-model="form.email" type="email" placeholder="email@example.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input v-model="form.phone" placeholder="+1 555 123 4567" />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Input v-model="form.currency" placeholder="USD" />
                  </div>
                  <div>
                    <Label>Payment Terms</Label>
                    <Input v-model="form.paymentTerms" placeholder="Net 30" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="address" class="mt-4">
                <Label>Address</Label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
                  <Input v-model="form.address.street" placeholder="Street" />
                  <Input v-model="form.address.city" placeholder="City" />
                  <Input v-model="form.address.state" placeholder="State" />
                  <Input v-model="form.address.country" placeholder="Country" />
                  <Input v-model="form.address.postalCode" placeholder="Postal Code" />
                </div>
              </TabsContent>

              <TabsContent value="finance" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Tax ID</Label>
                    <Input v-model="form.taxId" placeholder="Optional" />
                  </div>
                  <div>
                    <Label>Bank Name</Label>
                    <Input v-model="form.bankDetails!.bankName" placeholder="Optional" />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input v-model="form.bankDetails!.accountNumber" placeholder="Optional" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="additional" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label>Communication</Label>
                    <Input v-model="form.communicationPlatform" placeholder="email" />
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <Input v-model="tagsInput" placeholder="comma,separated,tags" />
                  </div>
                </div>
                <div class="mt-4">
                  <Label>Description</Label>
                  <Input v-model="form.description" placeholder="Optional" />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onBeforeUnmount } from 'vue'
import { Camera, RotateCcw, Image as ImageIcon, RefreshCw, ScanLine, Save } from 'lucide-vue-next'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { CreateSupplierRequest } from '@/modules/procurement/types/supplier'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

const emit = defineEmits<{
  'update:open': [value: boolean]
  'success': [supplierId: string]
}>()

const props = defineProps<{ open: boolean }>()

const supplierStore = useSupplierStore()

const videoEl = ref<HTMLVideoElement | null>(null)
const fileEl = ref<HTMLInputElement | null>(null)
const cameraStream = ref<MediaStream | null>(null)
const cameraError = ref<string | null>(null)

const imageBlob = ref<Blob | null>(null)
const imageBlobUrl = ref<string | null>(null)

const ocrLoading = ref(false)
const ocrError = ref<string | null>(null)
const submitLoading = ref(false)
const saveBtnRef = ref<HTMLButtonElement | null>(null)

const tagsInput = ref('')

const form = reactive<CreateSupplierRequest>({
  name: '',
  code: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: { street: '', city: '', state: '', country: '', postalCode: '' },
  paymentTerms: 'Net 30',
  currency: 'USD',
  taxId: '',
  bankDetails: { bankName: '', accountNumber: '', routingNumber: '', swiftCode: '', iban: '' },
  communicationPlatform: 'email',
  description: '',
  tags: []
})

watch(() => props.open, (val) => {
  if (val) {
    reset()
    initCamera()
    // Apply fixed size after dialog renders
    setTimeout(() => {
      applyDialogStyles()
      saveBtnRef.value?.focus()
    }, 100)
  } else {
    stopCamera()
  }
})

function reset() {
  imageBlob.value = null
  imageBlobUrl.value = null
  ocrLoading.value = false
  ocrError.value = null
  submitLoading.value = false
  Object.assign(form, {
    name: '', code: '', contactPerson: '', email: '', phone: '',
    address: { street: '', city: '', state: '', country: '', postalCode: '' },
    paymentTerms: 'Net 30', currency: 'USD',
    taxId: '',
    bankDetails: { bankName: '', accountNumber: '', routingNumber: '', swiftCode: '', iban: '' },
    communicationPlatform: 'email', description: '', tags: []
  })
  tagsInput.value = ''
}

async function initCamera() {
  cameraError.value = null
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      cameraError.value = 'Camera not supported in this browser.'
      return
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    cameraStream.value = stream
    if (videoEl.value) {
      videoEl.value.srcObject = stream
    }
  } catch (e: any) {
    cameraError.value = e?.message || 'Unable to access camera.'
  }
}

function stopCamera() {
  cameraStream.value?.getTracks().forEach(t => t.stop())
  cameraStream.value = null
}

onBeforeUnmount(stopCamera)

function capturePhoto() {
  if (!videoEl.value) return
  const video = videoEl.value
  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(video, 0, 0)
  canvas.toBlob((blob) => {
    if (blob) {
      setImageBlob(blob)
    }
  }, 'image/jpeg', 0.92)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  setImageBlob(file)
}

function setImageBlob(blob: Blob) {
  if (imageBlobUrl.value) URL.revokeObjectURL(imageBlobUrl.value)
  imageBlob.value = blob
  imageBlobUrl.value = URL.createObjectURL(blob)
}

function retake() {
  if (imageBlobUrl.value) URL.revokeObjectURL(imageBlobUrl.value)
  imageBlob.value = null
  imageBlobUrl.value = null
}

function applyDialogStyles() {
  const nodes = Array.from(document.querySelectorAll('[data-radix-dialog-content]')) as HTMLElement[]
  const el = nodes[nodes.length - 1]
  if (el) {
    el.style.setProperty('width', '1000px', 'important')
    el.style.setProperty('min-width', '1000px', 'important')
    el.style.setProperty('max-width', 'none', 'important')
    el.style.setProperty('height', '90vh', 'important')
    el.style.setProperty('max-height', '90vh', 'important')
    el.style.setProperty('overflow-y', 'auto', 'important')
    // console.debug('QuickAddSupplierDialog: fixed dialog size applied')
  }
}

async function runOcr() {
  if (!imageBlob.value) return
  ocrLoading.value = true
  ocrError.value = null
  try {
    // Lazy import Tesseract only when used
    // @ts-ignore - optional dependency, types may be missing unless installed
    const { createWorker } = await import('tesseract.js')
    const worker: any = await createWorker()
    await worker.loadLanguage('eng')
    await worker.initialize('eng')
    const { data } = await worker.recognize(imageBlob.value)
    await worker.terminate()

    const text = data.text || ''
    // Naive parsing for demo: email, phone, first non-empty line as name
    const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
    const phoneMatch = text.match(/\+?\d[\d\s\-()]{6,}/)
    const lines = text.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean)

    if (!form.name && lines.length) form.name = lines[0].slice(0, 80)
    if (!form.contactPerson && lines.length > 1) form.contactPerson = lines[1].slice(0, 80)
    if (emailMatch) form.email = emailMatch[0]
    if (phoneMatch) form.phone = phoneMatch[0]
  } catch (e: any) {
    ocrError.value = 'Auto-fill failed. You can fill manually.'
    console.error(e)
  } finally {
    ocrLoading.value = false
  }
}

function buildCode(): string {
  return `SUP-${Date.now()}`
}

async function submit() {
  submitLoading.value = true
  try {
    // Ensure mandatory minimal fields
    if (!form.name) form.name = 'New Supplier'
    if (!form.contactPerson) form.contactPerson = 'Unknown'
    if (!form.email) form.email = 'unknown@example.com'
    if (!form.phone) form.phone = 'N/A'
    if (!form.currency) form.currency = 'USD'
    if (!form.paymentTerms) form.paymentTerms = 'Net 30'
    if (!form.communicationPlatform) form.communicationPlatform = 'email'

    form.code = buildCode()
    form.tags = tagsInput.value
      ? tagsInput.value.split(',').map(t => t.trim()).filter(Boolean)
      : []

    const supplierId = await supplierStore.createSupplier({ ...form })
    if (!supplierId) throw new Error('Failed to create supplier')

    // Attach image as supplier document if available
    if (imageBlob.value) {
      const file = new File([imageBlob.value], `quick-add-${Date.now()}.jpg`, { type: 'image/jpeg' })
      await supplierStore.uploadSupplierDocument({
        supplierId,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        description: 'Quick add capture',
        file
      })
    }

    emit('success', supplierId)
    emit('update:open', false)
  } catch (e) {
    console.error(e)
  } finally {
    submitLoading.value = false
  }
}
</script>
