<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Box Label Generator</h3>
        <p class="text-sm text-muted-foreground">
          Create professional box labels with QR codes and specifications
        </p>
      </div>
      <Button @click="showCreateDialog = true" size="sm">
        <Plus class="mr-2 h-4 w-4" />
        Create Label
      </Button>
    </div>

    <!-- Label Templates -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Label Templates</CardTitle>
            <CardDescription>Pre-designed label layouts</CardDescription>
          </div>
          <Button @click="showTemplateDialog = true" variant="outline" size="sm">
            <Layout class="mr-2 h-4 w-4" />
            Manage Templates
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="template in labelTemplates" :key="template.templateId" 
               @click="selectTemplate(template)"
               :class="[
                 'p-4 border rounded-lg cursor-pointer transition-colors',
                 selectedTemplate?.templateId === template.templateId 
                   ? 'border-primary bg-primary/5' 
                   : 'hover:bg-gray-50'
               ]">
            <div class="aspect-[3/2] bg-gray-100 rounded mb-3 flex items-center justify-center">
              <div class="text-xs text-gray-500">
                {{ template.layout.width }}mm × {{ template.layout.height }}mm
              </div>
            </div>
            <p class="font-medium">{{ template.name }}</p>
            <p class="text-sm text-muted-foreground">
              {{ template.description }}
            </p>
            <div class="flex items-center justify-between mt-2">
              <Badge :variant="template.isDefault ? 'default' : 'secondary'">
                {{ template.isDefault ? 'Default' : 'Custom' }}
              </Badge>
              <Button @click.stop="editTemplate(template)" variant="ghost" size="sm">
                <Edit class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Labels -->
    <Card>
      <CardHeader>
        <CardTitle>Recent Labels</CardTitle>
        <CardDescription>Recently generated box labels</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div v-for="label in recentLabels" :key="label.labelId" 
               class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <Package class="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p class="font-medium">{{ label.productName }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ label.productCode }} • {{ formatDate(label.createdAt) }}
                </p>
                <div class="flex items-center space-x-4 text-xs text-muted-foreground">
                  <span>{{ label.dimensions.width }}×{{ label.dimensions.height }}×{{ label.dimensions.depth || 0 }}cm</span>
                  <span v-if="label.weight">{{ label.weight }}kg</span>
                  <span v-if="label.batchNumber">Batch: {{ label.batchNumber }}</span>
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Button @click="previewLabel(label)" variant="ghost" size="sm">
                <Eye class="h-4 w-4" />
              </Button>
              <Button @click="printLabel(label)" variant="ghost" size="sm">
                <Printer class="h-4 w-4" />
              </Button>
              <Button @click="downloadLabel(label)" variant="ghost" size="sm">
                <Download class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Create Label Dialog -->
    <Dialog :open="showCreateDialog" @update:open="showCreateDialog = $event">
      <DialogContent class="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Box Label</DialogTitle>
          <DialogDescription>
            Generate a professional box label with product information and QR code
          </DialogDescription>
        </DialogHeader>

        <div class="grid grid-cols-2 gap-6">
          <!-- Form -->
          <div class="space-y-4">
            <form @submit.prevent="generateLabel">
              <div class="space-y-4">
                <div class="space-y-2">
                  <Label for="productName">Product Name</Label>
                  <Input
                    id="productName"
                    v-model="labelForm.productName"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div class="space-y-2">
                  <Label for="productCode">Product Code</Label>
                  <Input
                    id="productCode"
                    v-model="labelForm.productCode"
                    placeholder="Enter product code"
                    required
                  />
                </div>

                <div class="space-y-2">
                  <Label>Dimensions (cm)</Label>
                  <div class="grid grid-cols-3 gap-2">
                    <Input
                      v-model.number="labelForm.dimensions.width"
                      placeholder="Width"
                      type="number"
                      step="0.1"
                      required
                    />
                    <Input
                      v-model.number="labelForm.dimensions.height"
                      placeholder="Height"
                      type="number"
                      step="0.1"
                      required
                    />
                    <Input
                      v-model.number="labelForm.dimensions.depth"
                      placeholder="Depth"
                      type="number"
                      step="0.1"
                    />
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    v-model.number="labelForm.weight"
                    placeholder="Enter weight"
                    type="number"
                    step="0.01"
                  />
                </div>

                <div class="space-y-2">
                  <Label for="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    v-model="labelForm.batchNumber"
                    placeholder="Enter batch number"
                  />
                </div>

                <div class="space-y-2">
                  <Label for="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    v-model="labelForm.expiryDate"
                    type="date"
                  />
                </div>

                <div class="space-y-2">
                  <Label>Product Image</Label>
                  <div class="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                    <input
                      ref="imageInput"
                      type="file"
                      accept="image/*"
                      @change="handleImageSelect"
                      class="hidden"
                    />
                    <div v-if="!labelForm.imagePreview">
                      <ImageIcon class="mx-auto h-8 w-8 text-gray-400" />
                      <Button @click="imageInput?.click()" type="button" variant="outline" class="mt-2">
                        Choose Image
                      </Button>
                    </div>
                    <div v-else class="relative">
                      <img :src="labelForm.imagePreview" alt="Product" class="max-h-20 mx-auto rounded" />
                      <Button @click="removeImage" type="button" variant="ghost" size="sm" class="absolute -top-2 -right-2">
                        <X class="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label>Specifications</Label>
                  <div class="space-y-2">
                    <div v-for="(spec, index) in labelForm.specifications" :key="index" 
                         class="flex items-center space-x-2">
                      <Input v-model="spec.key" placeholder="Property" class="flex-1" />
                      <Input v-model="spec.value" placeholder="Value" class="flex-1" />
                      <Button @click="removeSpecification(index)" type="button" variant="ghost" size="sm">
                        <X class="h-4 w-4" />
                      </Button>
                    </div>
                    <Button @click="addSpecification" type="button" variant="outline" size="sm">
                      <Plus class="mr-2 h-4 w-4" />
                      Add Specification
                    </Button>
                  </div>
                </div>

                <div class="space-y-2">
                  <Label for="template">Label Template</Label>
                  <Select v-model="labelForm.templateId">
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="template in labelTemplates" 
                                 :key="template.templateId" 
                                 :value="template.templateId">
                        {{ template.name }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </form>
          </div>

          <!-- Preview -->
          <div class="space-y-4">
            <div class="text-sm font-medium">Label Preview</div>
            <div class="border rounded-lg p-4 bg-white" style="aspect-ratio: 3/2;">
              <div class="h-full flex flex-col justify-between text-xs">
                <!-- Header -->
                <div class="flex justify-between items-start">
                  <div>
                    <div class="font-bold text-sm">{{ labelForm.productName || 'Product Name' }}</div>
                    <div class="text-gray-600">{{ labelForm.productCode || 'PRODUCT-CODE' }}</div>
                  </div>
                  <div v-if="labelForm.imagePreview" class="w-12 h-12 bg-gray-100 rounded">
                    <img :src="labelForm.imagePreview" alt="Product" class="w-full h-full object-cover rounded" />
                  </div>
                </div>

                <!-- Specifications -->
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div class="font-medium">Dimensions:</div>
                    <div>{{ labelForm.dimensions.width || 0 }}×{{ labelForm.dimensions.height || 0 }}×{{ labelForm.dimensions.depth || 0 }}cm</div>
                  </div>
                  <div v-if="labelForm.weight">
                    <div class="font-medium">Weight:</div>
                    <div>{{ labelForm.weight }}kg</div>
                  </div>
                  <div v-if="labelForm.batchNumber">
                    <div class="font-medium">Batch:</div>
                    <div>{{ labelForm.batchNumber }}</div>
                  </div>
                  <div v-if="labelForm.expiryDate">
                    <div class="font-medium">Expires:</div>
                    <div>{{ formatDate(new Date(labelForm.expiryDate)) }}</div>
                  </div>
                </div>

                <!-- Custom Specifications -->
                <div v-if="labelForm.specifications.length > 0" class="grid grid-cols-2 gap-1 text-xs">
                  <div v-for="spec in labelForm.specifications.filter(s => s.key && s.value)" :key="spec.key">
                    <span class="font-medium">{{ spec.key }}:</span> {{ spec.value }}
                  </div>
                </div>

                <!-- Footer with QR Code -->
                <div class="flex justify-between items-end">
                  <div class="text-xs text-gray-500">
                    {{ formatDate(new Date()) }}
                  </div>
                  <div class="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <QrCode class="h-8 w-8 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button @click="showCreateDialog = false" type="button" variant="outline">
            Cancel
          </Button>
          <Button @click="generateLabel" :disabled="generating">
            <Loader2 v-if="generating" class="mr-2 h-4 w-4 animate-spin" />
            Generate Label
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Template Management Dialog -->
    <Dialog :open="showTemplateDialog" @update:open="showTemplateDialog = $event">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Label Templates</DialogTitle>
          <DialogDescription>
            Manage label templates and layouts
          </DialogDescription>
        </DialogHeader>
        
        <div class="space-y-4">
          <div class="text-sm text-muted-foreground">
            Template management interface would be implemented here
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Label Preview Dialog -->
    <Dialog :open="showPreviewDialog" @update:open="showPreviewDialog = $event">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Label Preview</DialogTitle>
        </DialogHeader>
        <div v-if="previewingLabel" class="space-y-4">
          <div class="border rounded-lg p-6 bg-white">
            <!-- Full label preview would be rendered here -->
            <div class="text-center text-muted-foreground">
              Full-size label preview for {{ previewingLabel.productName }}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { BoxLabel, LabelTemplate } from '@/modules/procurement/types/supplier'

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  Plus, 
  Layout, 
  Edit, 
  Package, 
  Eye, 
  Printer, 
  Download, 
  X, 
  Loader2,
  ImageIcon,
  QrCode
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  supplierId: string
}>()

// Store
const supplierStore = useSupplierStore()

// State
const showCreateDialog = ref(false)
const showTemplateDialog = ref(false)
const showPreviewDialog = ref(false)
const selectedTemplate = ref<LabelTemplate | null>(null)
const previewingLabel = ref<BoxLabel | null>(null)
const generating = ref(false)
const imageInput = ref<HTMLInputElement | null>(null)

const labelForm = ref({
  productName: '',
  productCode: '',
  dimensions: {
    width: 0,
    height: 0,
    depth: 0
  },
  weight: 0,
  batchNumber: '',
  expiryDate: '',
  imagePreview: '',
  specifications: [] as Array<{ key: string; value: string }>,
  templateId: ''
})

// Computed
const labelTemplates = computed(() => supplierStore.labelTemplates)
const recentLabels = computed(() => 
  supplierStore.boxLabels
    .filter(label => label.supplierId === props.supplierId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
)

// Methods
function selectTemplate(template: LabelTemplate) {
  selectedTemplate.value = selectedTemplate.value?.templateId === template.templateId ? null : template
  labelForm.value.templateId = template.templateId
}

function editTemplate(template: LabelTemplate) {
  // Template editing logic would go here
  console.log('Edit template:', template)
}

function handleImageSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      labelForm.value.imagePreview = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

function removeImage() {
  labelForm.value.imagePreview = ''
}

function addSpecification() {
  labelForm.value.specifications.push({ key: '', value: '' })
}

function removeSpecification(index: number) {
  labelForm.value.specifications.splice(index, 1)
}

async function generateLabel() {
  generating.value = true
  try {
    const specifications: Record<string, any> = {}
    labelForm.value.specifications
      .filter(spec => spec.key && spec.value)
      .forEach(spec => {
        specifications[spec.key] = spec.value
      })

    const labelData = {
      supplierId: props.supplierId,
      productName: labelForm.value.productName,
      productCode: labelForm.value.productCode,
      specifications,
      qrCodeData: JSON.stringify({
        productCode: labelForm.value.productCode,
        batchNumber: labelForm.value.batchNumber,
        dimensions: labelForm.value.dimensions,
        weight: labelForm.value.weight
      }),
      imageUrl: labelForm.value.imagePreview,
      dimensions: labelForm.value.dimensions,
      weight: labelForm.value.weight || undefined,
      batchNumber: labelForm.value.batchNumber || undefined,
      expiryDate: labelForm.value.expiryDate ? new Date(labelForm.value.expiryDate) : undefined,
      createdBy: 'current-user'
    }

    await supplierStore.generateBoxLabel(labelData)
    
    showCreateDialog.value = false
    resetForm()
  } catch (error) {
    console.error('Failed to generate label:', error)
  } finally {
    generating.value = false
  }
}

function resetForm() {
  labelForm.value = {
    productName: '',
    productCode: '',
    dimensions: { width: 0, height: 0, depth: 0 },
    weight: 0,
    batchNumber: '',
    expiryDate: '',
    imagePreview: '',
    specifications: [],
    templateId: ''
  }
}

function previewLabel(label: BoxLabel) {
  previewingLabel.value = label
  showPreviewDialog.value = true
}

function printLabel(label: BoxLabel) {
  // Print label logic would go here
  console.log('Print label:', label.labelId)
}

function downloadLabel(label: BoxLabel) {
  // Download label logic would go here
  console.log('Download label:', label.labelId)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  // Fetch label templates and recent labels would be called here
})
</script>
