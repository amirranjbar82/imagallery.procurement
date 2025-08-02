<template>
  <div class="container">
    <!-- List View -->
    <SupplierList v-if="currentView === 'list'" @create="openCreateDialog" @view="viewSupplier" @edit="editSupplier" />

    <!-- Detail View -->
    <SupplierDetail v-else-if="currentView === 'detail' && selectedSupplierId" :supplier-id="selectedSupplierId"
      @back="backToList" @edit="editSupplier" />

    <!-- Create Supplier Dialog -->
    <Dialog :open="showCreateDialog" @update:open="showCreateDialog = $event">
      <DialogContent class="min-w-6xl p-0 overflow-hidden rounded-xl">
        <div class="max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Create New Supplier</DialogTitle>
            <DialogDescription>
              Add a new supplier to your procurement system
            </DialogDescription>
          </DialogHeader>
          <SupplierForm @cancel="closeCreateDialog" @success="handleCreateSuccess" />
        </div>
      </DialogContent>
    </Dialog>

    <!-- Edit Supplier Dialog -->
    <Dialog :open="showEditDialog" @update:open="showEditDialog = $event">
      <DialogContent class="min-w-6xl p-0 overflow-hidden rounded-xl">
        <div class="max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
            <DialogDescription>
              Update supplier information
            </DialogDescription>
          </DialogHeader>
          <SupplierForm v-if="supplierToEdit" :supplier="supplierToEdit" @cancel="closeEditDialog"
            @success="handleEditSuccess" />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Supplier } from '@/modules/procurement/types/supplier'

// Components
import SupplierList from '@/modules/procurement/views/suppliers/SupplierList.vue'
import SupplierDetail from '@/modules/procurement/views/suppliers/SupplierDetail.vue'
import SupplierForm from '@/modules/procurement/views/suppliers/SupplierForm.vue'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Store
const supplierStore = useSupplierStore()

// State
const currentView = ref<'list' | 'detail'>('list')
const selectedSupplierId = ref<string>('')
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const supplierToEdit = ref<Supplier | null>(null)

// Methods
function openCreateDialog() {
  showCreateDialog.value = true
}

function closeCreateDialog() {
  showCreateDialog.value = false
}

function handleCreateSuccess(supplier: Supplier) {
  closeCreateDialog()
  // Optionally navigate to the new supplier detail
  // viewSupplier(supplier)
}

function editSupplier(supplier: Supplier) {
  supplierToEdit.value = supplier
  showEditDialog.value = true
}

function closeEditDialog() {
  showEditDialog.value = false
  supplierToEdit.value = null
}

function handleEditSuccess(supplier: Supplier) {
  closeEditDialog()
  // Refresh the current view if we're viewing the edited supplier
  if (currentView.value === 'detail' && selectedSupplierId.value === supplier.supplierId) {
    supplierStore.setSelectedSupplier(supplier)
  }
}

function viewSupplier(supplier: Supplier) {
  selectedSupplierId.value = supplier.supplierId
  supplierStore.setSelectedSupplier(supplier)
  currentView.value = 'detail'
}

function backToList() {
  currentView.value = 'list'
  selectedSupplierId.value = ''
  supplierStore.setSelectedSupplier(null)
}

// Lifecycle
onMounted(() => {
  // Initial data load is handled by SupplierList component
})
</script>
