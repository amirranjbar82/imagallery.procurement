<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Basic Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            placeholder="e.g., SUP001"
            :class="{ 'border-destructive': errors.code }"
          />
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
              <SelectItem value="telegram">Telegram</SelectItem>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="teams">Microsoft Teams</SelectItem>
              <SelectItem value="phone">Phone</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Address Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Address Information</h3>
      
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

    <!-- Financial Information -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Financial Information</h3>
      
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

    <!-- Bank Details (Optional) -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Bank Details</h3>
        <button
          type="button"
          class="text-slate-900 hover:text-slate-700 text-sm font-medium"
          @click="showBankDetails = !showBankDetails"
        >
          {{ showBankDetails ? 'Hide' : 'Show' }} Bank Details
        </button>
      </div>
      
      <div v-if="showBankDetails" class="space-y-4 p-4 border rounded-lg">
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
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
      
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

    <!-- Form Actions -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div class="flex justify-end space-x-4">
        <button 
          type="button" 
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          :disabled="loading"
          class="px-4 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 disabled:opacity-50 flex items-center"
        >
          <template v-if="loading">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            {{ isEdit ? 'Updating...' : 'Creating...' }}
          </template>
          <template v-else>
            {{ isEdit ? 'Update Supplier' : 'Create Supplier' }}
          </template>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier, CreateSupplierRequest } from '@/modules/procurement/types/supplier'

// Icons
import { X } from 'lucide-vue-next'

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
const { loading, error } = storeToRefs(supplierStore)

// Computed
const isEdit = computed(() => !!props.supplier)

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

const errors = ref<Record<string, string>>({})
const showBankDetails = ref(false)
const tagInput = ref('')

// Methods
function validateForm(): boolean {
  errors.value = {}

  // Required fields
  if (!form.name.trim()) errors.value.name = 'Supplier name is required'
  if (!form.code.trim()) errors.value.code = 'Supplier code is required'
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
      const supplierId = await supplierStore.createSupplier(form)
      
      if (supplierId) {
        const newSupplier: Supplier = {
          supplierId,
          ...form,
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

    if (props.supplier.bankDetails?.bankName) {
      showBankDetails.value = true
    }
  }
})
</script>
