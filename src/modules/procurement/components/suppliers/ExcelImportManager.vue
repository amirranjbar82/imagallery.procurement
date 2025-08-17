<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Excel Import</h3>
        <p class="text-sm text-muted-foreground">
          Import suppliers from Excel files with AI-powered mapping
        </p>
      </div>
      <Button @click="showImportDialog = true" size="sm">
        <Upload class="mr-2 h-4 w-4" />
        Import Excel
      </Button>
    </div>

    <!-- Import Templates -->
    <Card>
      <CardHeader>
        <CardTitle>Import Templates</CardTitle>
        <CardDescription>Saved column mappings for Excel imports</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div v-for="template in importTemplates" :key="template.templateId" 
               class="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p class="font-medium">{{ template.name }}</p>
              <p class="text-sm text-muted-foreground">
                {{ template.description }} • Used {{ template.usageCount }} times
              </p>
            </div>
            <div class="flex items-center space-x-2">
              <Button @click="useTemplate(template)" variant="outline" size="sm">
                Use Template
              </Button>
              <Button @click="editTemplate(template)" variant="ghost" size="sm">
                <Edit class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button @click="showTemplateDialog = true" variant="outline" class="w-full">
            <Plus class="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </CardContent>
    </Card>

    <!-- Recent Import Jobs -->
    <Card>
      <CardHeader>
        <CardTitle>Import History</CardTitle>
        <CardDescription>Recent Excel import jobs</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-2">
          <div v-for="job in importJobs" :key="job.jobId" 
               class="flex items-center justify-between p-3 border rounded-lg">
            <div>
              <p class="font-medium">{{ job.fileName }}</p>
              <p class="text-sm text-muted-foreground">
                {{ formatDate(job.createdAt) }} • 
                {{ job.successfulRows }}/{{ job.totalRows }} successful
              </p>
            </div>
            <Badge :variant="getJobStatusVariant(job.status)">
              {{ job.status }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Import Dialog -->
    <Dialog :open="showImportDialog" @update:open="showImportDialog = $event">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Suppliers from Excel</DialogTitle>
          <DialogDescription>
            Upload an Excel file and map columns to supplier fields
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-6">
          <!-- Step 1: File Upload -->
          <div v-if="importStep === 1" class="space-y-4">
            <div class="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <input
                ref="fileInput"
                type="file"
                accept=".xlsx,.xls"
                @change="handleFileSelect"
                class="hidden"
              />
              <Upload class="mx-auto h-12 w-12 text-gray-400" />
              <div class="mt-4">
                <Button @click="$refs.fileInput?.click()" variant="outline">
                  Choose Excel File
                </Button>
                <p class="mt-2 text-sm text-gray-500">
                  or drag and drop your Excel file here
                </p>
              </div>
              <div v-if="selectedFile" class="mt-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="useTemplate" v-model:checked="useExistingTemplate" />
              <Label for="useTemplate">Use existing template</Label>
            </div>

            <div v-if="useExistingTemplate" class="space-y-2">
              <Label>Select Template</Label>
              <Select v-model="selectedTemplateId">
                <SelectTrigger>
                  <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="template in importTemplates" 
                             :key="template.templateId" 
                             :value="template.templateId">
                    {{ template.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <!-- Step 2: Column Mapping -->
          <div v-if="importStep === 2" class="space-y-4">
            <div class="text-sm text-muted-foreground">
              Map Excel columns to supplier fields
            </div>
            
            <div class="space-y-3">
              <div v-for="mapping in columnMappings" :key="mapping.excelColumn" 
                   class="grid grid-cols-3 gap-4 items-center">
                <div class="font-medium">{{ mapping.excelColumn }}</div>
                <Select v-model="mapping.supplierField">
                  <SelectTrigger>
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                    <SelectItem value="contactPerson">Contact Person</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="address.street">Address</SelectItem>
                    <SelectItem value="address.city">City</SelectItem>
                    <SelectItem value="address.country">Country</SelectItem>
                    <SelectItem value="paymentTerms">Payment Terms</SelectItem>
                    <SelectItem value="currency">Currency</SelectItem>
                  </SelectContent>
                </Select>
                <Checkbox v-model:checked="mapping.required" />
              </div>
            </div>

            <div class="flex items-center space-x-2">
              <Checkbox id="saveTemplate" v-model:checked="saveAsTemplate" />
              <Label for="saveTemplate">Save as template</Label>
            </div>

            <div v-if="saveAsTemplate" class="space-y-2">
              <Input v-model="templateName" placeholder="Template name" />
              <Textarea v-model="templateDescription" placeholder="Template description" rows="2" />
            </div>
          </div>

          <!-- Step 3: Preview & Import -->
          <div v-if="importStep === 3" class="space-y-4">
            <div class="text-sm text-muted-foreground">
              Preview imported data (showing first 5 rows)
            </div>
            
            <div class="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead v-for="field in previewFields" :key="field">
                      {{ field }}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="(row, index) in previewData" :key="index">
                    <TableCell v-for="field in previewFields" :key="field">
                      {{ row[field] }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg">
              <p class="text-sm text-blue-800">
                Ready to import {{ totalRows }} suppliers
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button v-if="importStep > 1" @click="importStep--" variant="outline">
            Back
          </Button>
          <Button @click="closeImportDialog" variant="outline">
            Cancel
          </Button>
          <Button v-if="importStep < 3" @click="nextStep" :disabled="!canProceed">
            Next
          </Button>
          <Button v-if="importStep === 3" @click="startImport" :disabled="importing">
            <Loader2 v-if="importing" class="mr-2 h-4 w-4 animate-spin" />
            Import Suppliers
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Template Dialog -->
    <Dialog :open="showTemplateDialog" @update:open="showTemplateDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Import Template</DialogTitle>
          <DialogDescription>
            Save column mappings for future imports
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div class="space-y-2">
            <Label for="templateName">Template Name</Label>
            <Input
              id="templateName"
              v-model="newTemplate.name"
              placeholder="Enter template name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="templateDesc">Description</Label>
            <Textarea
              id="templateDesc"
              v-model="newTemplate.description"
              placeholder="Template description"
              rows="2"
            />
          </div>

          <DialogFooter>
            <Button @click="showTemplateDialog = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Create Template
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { ExcelImportTemplate, ExcelImportJob, ExcelImportMapping } from '@/modules/procurement/types/supplier'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

// Icons
import { Upload, Plus, Edit, Loader2 } from 'lucide-vue-next'

// Store
const supplierStore = useSupplierStore()

// State
const showImportDialog = ref(false)
const showTemplateDialog = ref(false)
const importStep = ref(1)
const selectedFile = ref<File | null>(null)
const useExistingTemplate = ref(false)
const selectedTemplateId = ref('')
const saveAsTemplate = ref(false)
const templateName = ref('')
const templateDescription = ref('')
const importing = ref(false)
const loading = ref(false)

const columnMappings = ref<ExcelImportMapping[]>([])
const previewData = ref<any[]>([])
const totalRows = ref(0)

const newTemplate = ref({
  name: '',
  description: ''
})

// Computed
const importTemplates = computed(() => supplierStore.excelImportTemplates)
const importJobs = computed(() => supplierStore.excelImportJobs)

const canProceed = computed(() => {
  if (importStep.value === 1) {
    return selectedFile.value !== null
  }
  if (importStep.value === 2) {
    return columnMappings.value.some(m => m.supplierField)
  }
  return true
})

const previewFields = computed(() => {
  return columnMappings.value
    .filter(m => m.supplierField)
    .map(m => m.supplierField)
})

// Methods
function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
    // TODO: Parse Excel file and extract column headers
    // For now, mock some column mappings
    columnMappings.value = [
      { excelColumn: 'Company Name', supplierField: 'name', required: true },
      { excelColumn: 'Contact', supplierField: 'contactPerson', required: false },
      { excelColumn: 'Email', supplierField: 'email', required: true },
      { excelColumn: 'Phone', supplierField: 'phone', required: false },
    ]
  }
}

function nextStep() {
  if (importStep.value === 2) {
    // Generate preview data
    previewData.value = [
      { name: 'ABC Corp', contactPerson: 'John Doe', email: 'john@abc.com', phone: '123-456-7890' },
      { name: 'XYZ Ltd', contactPerson: 'Jane Smith', email: 'jane@xyz.com', phone: '098-765-4321' },
    ]
    totalRows.value = 25 // Mock total
  }
  importStep.value++
}

async function startImport() {
  importing.value = true
  try {
    if (selectedFile.value) {
      const templateId = useExistingTemplate.value ? selectedTemplateId.value : undefined
      await supplierStore.processExcelImport(selectedFile.value, templateId)
    }
    closeImportDialog()
  } catch (error) {
    console.error('Import failed:', error)
  } finally {
    importing.value = false
  }
}

function closeImportDialog() {
  showImportDialog.value = false
  importStep.value = 1
  selectedFile.value = null
  columnMappings.value = []
  previewData.value = []
  useExistingTemplate.value = false
  selectedTemplateId.value = ''
  saveAsTemplate.value = false
  templateName.value = ''
  templateDescription.value = ''
}

function useTemplate(template: ExcelImportTemplate) {
  selectedTemplateId.value = template.templateId
  useExistingTemplate.value = true
  showImportDialog.value = true
}

function editTemplate(template: ExcelImportTemplate) {
  // TODO: Implement template editing
  console.log('Edit template:', template)
}

async function saveTemplate() {
  loading.value = true
  try {
    await supplierStore.createExcelImportTemplate({
      name: newTemplate.value.name,
      description: newTemplate.value.description,
      mappings: columnMappings.value,
      createdBy: 'current-user'
    })
    showTemplateDialog.value = false
    newTemplate.value = { name: '', description: '' }
  } catch (error) {
    console.error('Error saving template:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

function getJobStatusVariant(status: string) {
  switch (status) {
    case 'completed':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'processing':
      return 'secondary'
    default:
      return 'outline'
  }
}

// Lifecycle
onMounted(() => {
  // Fetch import templates and jobs would be called here
})
</script>
