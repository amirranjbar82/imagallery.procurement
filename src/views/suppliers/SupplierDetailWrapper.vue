<template>
  <div>
    <SupplierDetail 
      @back="goBack"
      @edit="editSupplier"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupplierStore } from '@/stores/supplier'
import type { Supplier } from '@/types/supplier'
import SupplierDetail from './SupplierDetail.vue'

const route = useRoute()
const router = useRouter()
const supplierStore = useSupplierStore()

const supplierId = route.params.id as string

onMounted(async () => {
  // Load supplier data when component mounts
  await supplierStore.fetchSupplierById(supplierId)
})

function goBack() {
  router.push('/suppliers')
}

function editSupplier(supplier: Supplier) {
  // TODO: Navigate to edit form or open edit modal
  console.log('Edit supplier:', supplier)
}
</script>
