<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Custom Fields</h3>
        <p class="text-sm text-muted-foreground">
          Manage custom fields for suppliers
        </p>
      </div>
      <Button @click="showCreateDialog = true" size="sm">
        <Plus class="mr-2 h-4 w-4" />
        Add Field
      </Button>
    </div>

    <!-- Custom Fields List -->
    <div class="space-y-4">
      <Card v-for="field in customFields" :key="field.fieldId">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <div>
              <CardTitle class="text-base">{{ field.fieldName }}</CardTitle>
              <CardDescription>
                {{ field.fieldType }} • {{ field.required ? 'Required' : 'Optional' }}
              </CardDescription>
            </div>
            <div class="flex items-center space-x-2">
              <Button @click="editField(field)" variant="ghost" size="sm">
                <Edit class="h-4 w-4" />
              </Button>
              <Button @click="deleteField(field.fieldId)" variant="ghost" size="sm">
                <Trash class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent v-if="field.description" class="pt-0">
          <p class="text-sm text-muted-foreground">{{ field.description }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Create/Edit Field Dialog -->
    <Dialog :open="showCreateDialog || showEditDialog" @update:open="closeDialog">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingField ? 'Edit Custom Field' : 'Create Custom Field' }}
          </DialogTitle>
          <DialogDescription>
            {{ editingField ? 'Update the custom field details' : 'Add a new custom field for suppliers' }}
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="saveField" class="space-y-4">
          <div class="space-y-2">
            <Label for="fieldName">Field Name</Label>
            <Input
              id="fieldName"
              v-model="fieldForm.fieldName"
              placeholder="Enter field name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="fieldType">Field Type</Label>
            <Select v-model="fieldForm.fieldType" required>
              <SelectTrigger>
                <SelectValue placeholder="Select field type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
                <SelectItem value="select">Select</SelectItem>
                <SelectItem value="multiselect">Multi-select</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Options for select/multiselect -->
          <div v-if="fieldForm.fieldType === 'select' || fieldForm.fieldType === 'multiselect'" class="space-y-2">
            <Label>Options</Label>
            <div class="space-y-2">
              <div v-for="(option, index) in fieldForm.options" :key="index" class="flex items-center space-x-2">
                <Input v-model="fieldForm.options[index]" placeholder="Option value" />
                <Button @click="removeOption(index)" type="button" variant="ghost" size="sm">
                  <X class="h-4 w-4" />
                </Button>
              </div>
              <Button @click="addOption" type="button" variant="outline" size="sm">
                <Plus class="mr-2 h-4 w-4" />
                Add Option
              </Button>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="description">Description (Optional)</Label>
            <Textarea
              id="description"
              v-model="fieldForm.description"
              placeholder="Field description"
              rows="2"
            />
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="required" v-model:checked="fieldForm.required" />
            <Label for="required">Required field</Label>
          </div>

          <DialogFooter>
            <Button @click="closeDialog" type="button" variant="outline">Cancel</Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ editingField ? 'Update' : 'Create' }}
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
import type { CustomField } from '@/modules/procurement/types/supplier'

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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'

// Icons
import { Plus, Edit, Trash, X, Loader2 } from 'lucide-vue-next'

// Store
const supplierStore = useSupplierStore()

// State
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingField = ref<CustomField | null>(null)
const loading = ref(false)

const fieldForm = ref({
  fieldName: '',
  fieldType: 'text' as const,
  options: [] as string[],
  required: false,
  description: ''
})

// Computed
const customFields = computed(() => supplierStore.customFields)

// Methods
function resetForm() {
  fieldForm.value = {
    fieldName: '',
    fieldType: 'text',
    options: [],
    required: false,
    description: ''
  }
}

function closeDialog() {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingField.value = null
  resetForm()
}

function editField(field: CustomField) {
  editingField.value = field
  fieldForm.value = {
    fieldName: field.fieldName,
    fieldType: field.fieldType,
    options: [...(field.options || [])],
    required: field.required,
    description: field.description || ''
  }
  showEditDialog.value = true
}

function addOption() {
  fieldForm.value.options.push('')
}

function removeOption(index: number) {
  fieldForm.value.options.splice(index, 1)
}

async function saveField() {
  loading.value = true
  try {
    const fieldData = {
      fieldName: fieldForm.value.fieldName,
      fieldType: fieldForm.value.fieldType,
      options: fieldForm.value.fieldType === 'select' || fieldForm.value.fieldType === 'multiselect' 
        ? fieldForm.value.options.filter(opt => opt.trim()) 
        : undefined,
      required: fieldForm.value.required,
      description: fieldForm.value.description || undefined,
      createdBy: 'current-user' // This would come from auth store
    }

    if (editingField.value) {
      // Update existing field (would need to implement updateCustomField in store)
      console.log('Update field:', fieldData)
    } else {
      // Create new field
      await supplierStore.createCustomField(fieldData)
    }

    closeDialog()
  } catch (error) {
    console.error('Error saving field:', error)
  } finally {
    loading.value = false
  }
}

async function deleteField(fieldId: string) {
  if (confirm('Are you sure you want to delete this custom field?')) {
    // Would need to implement deleteCustomField in store
    console.log('Delete field:', fieldId)
  }
}

// Lifecycle
onMounted(() => {
  supplierStore.fetchCustomFields()
})
</script>
