<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Technical Checklist - {{ order?.invoiceNo }}</DialogTitle>
        <DialogDescription>
          Review and complete technical information before delivery/installation
        </DialogDescription>
      </DialogHeader>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Order Information -->
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Invoice Number</Label>
                <p class="font-medium">{{ order?.invoiceNo }}</p>
              </div>
              <div>
                <Label>Customer</Label>
                <p class="font-medium">{{ order?.customerName }}</p>
              </div>
              <div>
                <Label>Service Type</Label>
                <Badge :variant="getServiceTypeBadgeVariant(order?.serviceType || '')">
                  {{ getServiceTypeLabel(order?.serviceType || '') }}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Item Details -->
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="itemType">Item Type *</Label>
                <Input
                  id="itemType"
                  v-model="form.itemType"
                  placeholder="Crystal Chandelier"
                  required
                />
              </div>
              <div>
                <Label for="brand">Brand/Model *</Label>
                <Input
                  id="brand"
                  v-model="form.brand"
                  placeholder="Brand and model information"
                  required
                />
              </div>
              <div>
                <Label for="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  v-model.number="form.quantity"
                  type="number"
                  placeholder="1"
                  required
                />
              </div>
              <div>
                <Label for="unit">Unit *</Label>
                <Select v-model="form.unit" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="meter">Meter</SelectItem>
                    <SelectItem value="kg">Kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="installationHeight">Installation Height (cm)</Label>
                <Input
                  id="installationHeight"
                  v-model.number="form.installationHeight"
                  type="number"
                  placeholder="280"
                />
              </div>
              <div>
                <Label for="ceilingCondition">Ceiling Condition</Label>
                <Select v-model="form.ceilingCondition">
                  <SelectTrigger>
                    <SelectValue placeholder="Select ceiling condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concrete">Concrete</SelectItem>
                    <SelectItem value="gypsum">Gypsum</SelectItem>
                    <SelectItem value="wood">Wood</SelectItem>
                    <SelectItem value="metal">Metal</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label for="layers">Number of Layers</Label>
                <Input
                  id="layers"
                  v-model.number="form.layers"
                  type="number"
                  placeholder="3"
                />
              </div>
              <div>
                <Label for="weight">Approximate Weight (kg)</Label>
                <Input
                  id="weight"
                  v-model.number="form.weight"
                  type="number"
                  placeholder="25"
                />
              </div>
              <div>
                <Label for="dimensions">Dimensions (cm)</Label>
                <Input
                  id="dimensions"
                  v-model="form.dimensions"
                  placeholder="80x80x60"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Equipment Requirements -->
        <Card>
          <CardHeader>
            <CardTitle>Equipment Requirements</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="needsLadder"
                    v-model:checked="form.needsLadder"
                  />
                  <Label for="needsLadder">Needs Ladder</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="needsLift"
                    v-model:checked="form.needsLift"
                  />
                  <Label for="needsLift">Needs Lift</Label>
                </div>
              </div>
              <div>
                <Label for="specialTools">Special Tools Required</Label>
                <Textarea
                  id="specialTools"
                  v-model="specialToolsText"
                  placeholder="Drill, screwdriver, wrench"
                  rows="3"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Accessories Check -->
        <Card>
          <CardHeader>
            <CardTitle>Accessories Check</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center space-x-2">
              <Checkbox
                id="accessoriesComplete"
                v-model:checked="form.accessoriesComplete"
              />
              <Label for="accessoriesComplete">All accessories and parts are complete</Label>
            </div>
            
            <div v-if="!form.accessoriesComplete">
              <Label for="missingAccessories">Missing Accessories</Label>
              <Textarea
                id="missingAccessories"
                v-model="missingAccessoriesText"
                placeholder="Chain, screws and nuts, remote control"
                rows="2"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Building Restrictions -->
        <Card>
          <CardHeader>
            <CardTitle>Building Restrictions</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="entryHours">Permitted Entry Hours</Label>
                <Input
                  id="entryHours"
                  v-model="form.buildingRestrictions!.entryHours"
                  placeholder="8:00-18:00"
                />
              </div>
              <div class="space-y-3">
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="requiresPermit"
                    v-model:checked="form.buildingRestrictions!.requiresPermit"
                  />
                  <Label for="requiresPermit">Requires Permit</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="elevatorAccess"
                    v-model:checked="form.buildingRestrictions!.elevatorAccess"
                  />
                  <Label for="elevatorAccess">Elevator Access</Label>
                </div>
                <div class="flex items-center space-x-2">
                  <Checkbox
                    id="parkingAvailable"
                    v-model:checked="form.buildingRestrictions!.parkingAvailable"
                  />
                  <Label for="parkingAvailable">Parking Available</Label>
                </div>
              </div>
            </div>
            
            <div>
              <Label for="specialRules">Building Special Rules</Label>
              <Textarea
                id="specialRules"
                v-model="specialRulesText"
                placeholder="No work on holidays, noise restrictions"
                rows="2"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Transportation -->
        <Card>
          <CardHeader>
            <CardTitle>Transportation</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label for="vehicleType">Vehicle Type *</Label>
                <Select v-model="form.vehicleType" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="van">Van</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="small_car">Small Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="flex items-center space-x-2 pt-6">
                <Checkbox
                  id="multipleLocations"
                  v-model:checked="form.multipleLocations"
                />
                <Label for="multipleLocations">Multiple Pickup Locations</Label>
              </div>
            </div>
            
            <div>
              <Label for="pickupLocations">Pickup Locations</Label>
              <Textarea
                id="pickupLocations"
                v-model="pickupLocationsText"
                placeholder="Main warehouse, Branch store 1"
                rows="2"
              />
            </div>
          </CardContent>
        </Card>

        <!-- Notes -->
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              id="notes"
              v-model="form.notes"
              placeholder="Additional notes, important tips, recommendations"
              rows="4"
            />
          </CardContent>
        </Card>

        <DialogFooter>
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :disabled="loading">
            <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
            Complete Checklist
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useDeliveryInstallationStore } from '../stores/delivery-installation'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-vue-next'
import type { DeliveryOrder, TechnicalChecklist } from '@/shared/types/delivery-installation'

// Props
interface Props {
  open: boolean
  order?: DeliveryOrder | null
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:open': [value: boolean]
  'checklist-completed': [orderId: string]
}>()

// Store
const deliveryStore = useDeliveryInstallationStore()

// State
const loading = ref(false)

const form = reactive<Partial<TechnicalChecklist>>({
  itemType: '',
  installationHeight: 0,
  ceilingCondition: '',
  layers: 0,
  weight: 0,
  dimensions: '',
  needsLadder: false,
  needsLift: false,
  specialTools: [],
  accessoriesComplete: true,
  missingAccessories: [],
  buildingRestrictions: {
    entryHours: '',
    requiresPermit: false,
    elevatorAccess: true,
    parkingAvailable: true,
    specialRules: []
  },
  vehicleType: 'van',
  multipleLocations: false,
  pickupLocations: [],
  isComplete: false,
  checkedBy: '',
  notes: ''
})

// Text fields for arrays
const specialToolsText = ref('')
const missingAccessoriesText = ref('')
const specialRulesText = ref('')
const pickupLocationsText = ref('')

// Computed
const isFormValid = computed(() => {
  return form.itemType && form.vehicleType
})

// Methods
function getServiceTypeLabel(type: string) {
  const labels = {
    'delivery_only': 'Delivery Only',
    'installation_delivery': 'Installation & Delivery',
    'uninstallation_delivery': 'Uninstallation & Delivery'
  }
  return labels[type as keyof typeof labels] || type
}

function getServiceTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'delivery_only': 'info' as const,
    'installation_delivery': 'success' as const,
    'uninstallation_delivery': 'warning' as const
  }
  return variants[type as keyof typeof variants] || 'default'
}

function parseTextToArray(text: string): string[] {
  return text.split(',').map(item => item.trim()).filter(item => item.length > 0)
}

async function handleSubmit() {
  if (!props.order || !isFormValid.value) return
  
  loading.value = true
  
  try {
    // Convert text fields to arrays
    form.specialTools = parseTextToArray(specialToolsText.value)
    form.missingAccessories = parseTextToArray(missingAccessoriesText.value)
    form.buildingRestrictions!.specialRules = parseTextToArray(specialRulesText.value)
    form.pickupLocations = parseTextToArray(pickupLocationsText.value)
    
    // Mark as complete
    form.isComplete = true
    form.checkedBy = 'current-user' // TODO: Get from auth store
    form.checkedAt = new Date()
    
    // Update the technical checklist
    await deliveryStore.updateTechnicalChecklist(props.order.id, form)
    
    emit('checklist-completed', props.order.id)
    emit('update:open', false)
  } catch (error) {
    console.error('Error completing checklist:', error)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.itemType = ''
  form.installationHeight = 0
  form.ceilingCondition = ''
  form.layers = 0
  form.weight = 0
  form.dimensions = ''
  form.needsLadder = false
  form.needsLift = false
  form.accessoriesComplete = true
  form.buildingRestrictions = {
    entryHours: '',
    requiresPermit: false,
    elevatorAccess: true,
    parkingAvailable: true,
    specialRules: []
  }
  form.vehicleType = 'van'
  form.multipleLocations = false
  form.isComplete = false
  form.checkedBy = ''
  form.notes = ''
  
  specialToolsText.value = ''
  missingAccessoriesText.value = ''
  specialRulesText.value = ''
  pickupLocationsText.value = ''
}

// Watch for order changes to populate form
watch(() => props.order, (newOrder) => {
  if (newOrder && newOrder.technicalChecklist) {
    const checklist = newOrder.technicalChecklist
    
    // Populate form with existing data
    Object.assign(form, checklist)
    
    // Convert arrays to text
    specialToolsText.value = checklist.specialTools?.join(', ') || ''
    missingAccessoriesText.value = checklist.missingAccessories?.join(', ') || ''
    specialRulesText.value = checklist.buildingRestrictions?.specialRules?.join(', ') || ''
    pickupLocationsText.value = checklist.pickupLocations?.join(', ') || ''
  } else if (newOrder) {
    // Initialize with order data
    resetForm()
    if (newOrder.items.length > 0) {
      const firstItem = newOrder.items[0]
      form.itemType = firstItem.name
      form.installationHeight = firstItem.installationHeight
      form.layers = firstItem.layers
      form.weight = firstItem.weight
      form.dimensions = firstItem.dimensions
      pickupLocationsText.value = firstItem.location === 'warehouse' ? 'Main warehouse' : 
                                  firstItem.location === 'store' ? 'Store' : 'Multiple locations'
    }
  }
}, { immediate: true })

// Watch for dialog close to reset form
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    setTimeout(resetForm, 300) // Reset after dialog animation
  }
})
</script>
