<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Sticky Header Actions -->
    <div class="sticky top-0 z-10 bg-white/80 backdrop-blur border-b">
      <div class="px-6 py-4 flex items-start justify-between gap-4">
        <h2 class="text-base font-semibold text-gray-900">
          {{ isEdit ? 'Edit Supplier' : 'Add Supplier' }}
        </h2>
        <div class="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" @click="$emit('cancel')">Cancel</Button>
          <Button type="submit" :disabled="loading">
            <Save class="h-4 w-4 mr-2" />
            {{ isEdit ? 'Update' : 'Save' }}
          </Button>
        </div>
      </div>
    </div>
    <!-- Tabs -->
    <div class="px-6 pt-4">
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid grid-cols-5 w-full">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="company">Company Address</TabsTrigger>
          <TabsTrigger value="factory">Factory Address</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="additional">Additional</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- Basic Information -->
    <div v-if="activeTab==='basic'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Supplier Name *</label>
          <Input
            v-model="form.name"
            placeholder="Enter supplier name"
            :class="{ 'border-destructive': errors.name }"
          />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Supplier Code *</label>
          <Input
            v-model="form.code"
            placeholder="Auto-generated on save"
            :class="{ 'border-destructive': errors.code }"
            readonly
            disabled
          />
          <p class="text-xs text-muted-foreground">Code will be auto-generated starting from 001</p>
          <p v-if="errors.code" class="text-sm text-destructive">{{ errors.code }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Contact Person *</label>
          <Input
            v-model="form.contactPerson"
            placeholder="Primary contact name"
            :class="{ 'border-destructive': errors.contactPerson }"
          />
          <p v-if="errors.contactPerson" class="text-sm text-destructive">{{ errors.contactPerson }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Email *</label>
          <Input
            v-model="form.email"
            type="email"
            placeholder="contact@supplier.com"
            :class="{ 'border-destructive': errors.email }"
          />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Phone *</label>
          <Input
            v-model="form.phone"
            type="tel"
            placeholder="+1 (555) 123-4567"
            :class="{ 'border-destructive': errors.phone }"
          />
          <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Communication Platform</label>
          <Select v-model="form.communicationPlatform">
            <SelectTrigger>
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="whatsapp">WhatsApp</SelectItem>
              <SelectItem value="wechat">WeChat</SelectItem>
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Company Address -->
    <div v-if="activeTab==='company'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Company Address</h3>
      </div>
      <div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Street Address *</label>
          <Input
            v-model="form.address.street"
            placeholder="Enter street address"
            :class="{ 'border-destructive': errors['address.street'] }"
          />
          <p v-if="errors['address.street']" class="text-sm text-destructive">{{ errors['address.street'] }}</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">City *</label>
            <Input
              v-model="form.address.city"
              placeholder="City"
              :class="{ 'border-destructive': errors['address.city'] }"
            />
            <p v-if="errors['address.city']" class="text-sm text-destructive">{{ errors['address.city'] }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">State/Province</label>
            <Input
              v-model="form.address.state"
              placeholder="State/Province"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Postal Code *</label>
            <Input
              v-model="form.address.postalCode"
              placeholder="Postal Code"
              :class="{ 'border-destructive': errors['address.postalCode'] }"
            />
            <p v-if="errors['address.postalCode']" class="text-sm text-destructive">{{ errors['address.postalCode'] }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Country *</label>
          <Input
            v-model="form.address.country"
            placeholder="Country"
            :class="{ 'border-destructive': errors['address.country'] }"
          />
          <p v-if="errors['address.country']" class="text-sm text-destructive">{{ errors['address.country'] }}</p>
        </div>
      </div>
    </div>

    <!-- Factory Address -->
    <div v-if="activeTab==='factory'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Factory Address</h3>
      </div>
      <div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Street Address</label>
          <Input
            v-model="form.factoryAddress!.street"
            placeholder="Enter factory street address"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">City</label>
            <Input
              v-model="form.factoryAddress!.city"
              placeholder="City"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">State/Province</label>
            <Input
              v-model="form.factoryAddress!.state"
              placeholder="State/Province"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Postal Code</label>
            <Input
              v-model="form.factoryAddress!.postalCode"
              placeholder="Postal Code"
            />
          </div>
        </div>

        <div class="space-y-2 mt-4">
          <label class="text-sm font-medium">Country</label>
          <Input
            v-model="form.factoryAddress!.country"
            placeholder="Country"
          />
        </div>
      </div>
    </div>

    <!-- Financial Information -->
    <div v-if="activeTab==='financial'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Financial Information</h3>
      </div>
      <div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Payment Terms *</label>
            <Select v-model="form.paymentTerms">
              <SelectTrigger>
                <SelectValue placeholder="Select payment terms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Net 15">Net 15</SelectItem>
                <SelectItem value="Net 30">Net 30</SelectItem>
                <SelectItem value="Net 45">Net 45</SelectItem>
                <SelectItem value="Net 60">Net 60</SelectItem>
                <SelectItem value="COD">Cash on Delivery</SelectItem>
                <SelectItem value="Prepaid">Prepaid</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.paymentTerms" class="text-sm text-destructive">{{ errors.paymentTerms }}</p>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Currency *</label>
            <Select v-model="form.currency">
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
                <SelectItem value="EUR">EUR - Euro</SelectItem>
                <SelectItem value="GBP">GBP - British Pound</SelectItem>
                <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.currency" class="text-sm text-destructive">{{ errors.currency }}</p>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Tax ID</label>
          <Input
            v-model="form.taxId"
            placeholder="Tax identification number"
          />
        </div>
      </div>
    </div>

    <!-- Bank Details (Optional) -->
    <div v-if="activeTab==='financial'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Bank Details</h3>
      </div>
      <div class="space-y-4 p-4 border rounded-lg">
        <div class="space-y-2">
          <label class="text-sm font-medium">Bank Name</label>
          <Input
            v-model="form.bankDetails!.bankName"
            placeholder="Bank name"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">Account Number</label>
            <Input
              v-model="form.bankDetails!.accountNumber"
              placeholder="Account number"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">Routing Number</label>
            <Input
              v-model="form.bankDetails!.routingNumber"
              placeholder="Routing number"
            />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-medium">SWIFT Code</label>
            <Input
              v-model="form.bankDetails!.swiftCode"
              placeholder="SWIFT code"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium">IBAN</label>
            <Input
              v-model="form.bankDetails!.iban"
              placeholder="IBAN"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Information -->
    <div v-if="activeTab==='additional'" class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Additional Information</h3>
      </div>
      <div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Description</label>
          <textarea
            v-model="form.description"
            class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Brief description of the supplier..."
          />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium">Tags</label>
          <Input
            v-model="tagInput"
            placeholder="Enter tags separated by commas"
            @keyup.enter="addTags"
          />
          <div v-if="form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
            <Badge
              v-for="(tag, index) in form.tags"
              :key="index"
              variant="secondary"
              class="cursor-pointer"
              @click="removeTag(index)"
            >
              {{ tag }}
              <X class="ml-1 h-3 w-3" />
            </Badge>
          </div>
        </div>
      </div>
    </div>

    
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier, CreateSupplierRequest } from '@/modules/procurement/types/supplier'

// Icons
import { X, Save } from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Props
interface Props {
  supplier?: Supplier
}

const props = defineProps<Props>()

// Emits
defineEmits<{
  cancel: []
  success: [supplier: Supplier]
}>()

// Store
const supplierStore = useSupplierStore()
const { loading } = storeToRefs(supplierStore)

// Computed
const isEdit = computed(() => !!props.supplier)

// Tabs state
const activeTab = ref<'basic' | 'company' | 'factory' | 'financial' | 'additional'>('basic')

// Form state
const form = reactive<CreateSupplierRequest>({
  name: '',
  code: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  factoryAddress: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: ''
  },
  paymentTerms: '',
  currency: '',
  taxId: '',
  bankDetails: {
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    swiftCode: '',
    iban: ''
  },
  communicationPlatform: 'email',
  description: '',
  tags: []
})

// Re-apply fixed size whenever tab changes to avoid any layout jumps
watch(activeTab, () => {
  setTimeout(() => {
    const nodes = Array.from(document.querySelectorAll('[data-radix-dialog-content]')) as HTMLElement[]
    const el = nodes[nodes.length - 1]
    if (el) {
      el.style.setProperty('width', '1000px', 'important')
      el.style.setProperty('min-width', '1000px', 'important')
      el.style.setProperty('max-width', 'none', 'important')
      el.style.setProperty('height', '90vh', 'important')
      el.style.setProperty('max-height', '90vh', 'important')
      el.style.setProperty('overflow-y', 'auto', 'important')
    }
  }, 0)
})

const errors = ref<Record<string, string>>({})
const tagInput = ref('')

// Methods
function generateNameCode(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 6) // Limit to 6 characters
}

function validateForm(): boolean {
  errors.value = {}

  // Required fields
  if (!form.name.trim()) errors.value.name = 'Supplier name is required'
  // Remove code validation since it's auto-generated
  if (!form.contactPerson.trim()) errors.value.contactPerson = 'Contact person is required'
  if (!form.email.trim()) errors.value.email = 'Email is required'
  if (!form.phone.trim()) errors.value.phone = 'Phone is required'
  if (!form.address.street.trim()) errors.value['address.street'] = 'Street address is required'
  if (!form.address.city.trim()) errors.value['address.city'] = 'City is required'
  if (!form.address.country.trim()) errors.value['address.country'] = 'Country is required'
  if (!form.address.postalCode.trim()) errors.value['address.postalCode'] = 'Postal code is required'
  if (!form.paymentTerms) errors.value.paymentTerms = 'Payment terms are required'
  if (!form.currency) errors.value.currency = 'Currency is required'

  // Email validation
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.value.email = 'Please enter a valid email address'
  }

  return Object.keys(errors.value).length === 0
}

function addTags() {
  if (tagInput.value.trim()) {
    const newTags = tagInput.value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag && !form.tags.includes(tag))
    
    form.tags.push(...newTags)
    tagInput.value = ''
  }
}

function removeTag(index: number) {
  form.tags.splice(index, 1)
}

async function handleSubmit() {
  if (!validateForm()) {
    // Switch to the first invalid tab for better feedback
    const firstKey = Object.keys(errors.value)[0]
    if (firstKey) {
      const tab = getTabForField(firstKey)
      activeTab.value = tab
    }
    return
  }

  try {
    if (isEdit.value && props.supplier) {
      const success = await supplierStore.updateSupplier({
        supplierId: props.supplier.supplierId,
        ...form
      })
      
      if (success) {
        // Emit the updated supplier
        const updatedSupplier = { ...props.supplier, ...form }
        // @ts-ignore - emit with success event
        emit('success', updatedSupplier)
      }
    } else {
      // Auto-generate codes before creating
      const nameCode = generateNameCode(form.name)
      
      // Generate sequential supplier code (simple implementation)
      const existingSuppliers = supplierStore.suppliers
      const nextNumber = existingSuppliers.length + 1
      const supplierCode = `SUP${nextNumber.toString().padStart(3, '0')}`
      
      const supplierData = {
        ...form,
        code: supplierCode,
        nameCode: nameCode
      }
      
      const supplierId = await supplierStore.createSupplier(supplierData)
      
      if (supplierId) {
        const newSupplier: Supplier = {
          supplierId,
          ...supplierData,
          status: 'pending',
          rating: 0,
          totalOrders: 0,
          totalSpend: 0,
          createdBy: '',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        // @ts-ignore - emit with success event
        emit('success', newSupplier)
      }
    }
  } catch (err) {
    console.error('Form submission error:', err)
  }
}

// Initialize form with supplier data if editing
onMounted(() => {
  // Fix dialog size so content switch (tabs) doesn't resize the window
  setTimeout(() => {
    // Pick the most recently opened dialog content and enforce size with !important
    const nodes = Array.from(document.querySelectorAll('[data-radix-dialog-content]')) as HTMLElement[]
    const el = nodes[nodes.length - 1]
    if (el) {
      el.style.setProperty('width', '1000px', 'important')
      el.style.setProperty('min-width', '1000px', 'important')
      el.style.setProperty('max-width', 'none', 'important')
      el.style.setProperty('height', '90vh', 'important')
      el.style.setProperty('max-height', '90vh', 'important')
      el.style.setProperty('overflow-y', 'auto', 'important')
      // console.debug('SupplierForm: fixed dialog size applied')
    }
  }, 100)

  if (props.supplier) {
    Object.assign(form, {
      name: props.supplier.name,
      code: props.supplier.code,
      contactPerson: props.supplier.contactPerson,
      email: props.supplier.email,
      phone: props.supplier.phone,
      address: { ...props.supplier.address },
      paymentTerms: props.supplier.paymentTerms,
      currency: props.supplier.currency,
      taxId: props.supplier.taxId || '',
      bankDetails: props.supplier.bankDetails ? { ...props.supplier.bankDetails } : {
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        swiftCode: '',
        iban: ''
      },
      communicationPlatform: props.supplier.communicationPlatform,
      description: props.supplier.description || '',
      tags: [...props.supplier.tags]
    })

  }
})

function getTabForField(field: string): 'basic' | 'company' | 'factory' | 'financial' | 'additional' {
  // Map validation keys to tabs
  if (field.startsWith('address.')) return 'company'
  if (field.startsWith('factoryAddress.')) return 'factory'
  if (field === 'paymentTerms' || field === 'currency' || field === 'taxId') return 'financial'
  if (field.startsWith('bankDetails.')) return 'financial'
  // Default to basic
  return 'basic'
}
</script>
