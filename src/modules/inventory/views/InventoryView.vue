<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <Button @click="showCreateItem = true">
        <Plus class="w-4 h-4 mr-2" />
        New Item
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <Package class="h-8 w-8 text-blue-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Items</p>
              <p class="text-2xl font-bold text-gray-900">{{ inventoryItems.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <AlertTriangle class="h-8 w-8 text-orange-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Low Stock</p>
              <p class="text-2xl font-bold text-gray-900">{{ lowStockItems.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <DollarSign class="h-8 w-8 text-green-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Value</p>
              <p class="text-2xl font-bold text-gray-900">${{ totalInventoryValue.toLocaleString() }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <TrendingUp class="h-8 w-8 text-purple-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Active Items</p>
              <p class="text-2xl font-bold text-gray-900">
                {{ inventoryItems.filter(i => i.status === 'active').length }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Filter Bar -->
    <Card class="mb-6">
      <CardContent class="pt-4">
        <div class="flex flex-wrap gap-4">
          <div class="flex-1 min-w-64">
            <Input 
              placeholder="Search items..." 
              v-model="searchQuery"
              class="w-full"
            />
          </div>
          <Select v-model="categoryFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="office">Office Supplies</SelectItem>
              <SelectItem value="raw-materials">Raw Materials</SelectItem>
            </SelectContent>
          </Select>
          <Select v-model="statusFilter">
            <SelectTrigger class="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>

    <!-- Inventory Table -->
    <Card>
      <CardContent class="pt-4">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Level
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in filteredItems" :key="item.itemId">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ item.name }}</div>
                      <div class="text-sm text-gray-500">{{ item.description }}</div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.sku }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.category }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="[
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getStockLevel(item.itemId) <= item.reorderPoint 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    ]">
                      {{ getStockLevel(item.itemId) }} {{ item.unitOfMeasure }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="item.status === 'active' ? 'default' : 'secondary'">
                      {{ item.status }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" class="mr-2">Edit</Button>
                    <Button variant="outline" size="sm">Stock</Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredItems.length === 0" class="text-center py-8">
            <p class="text-gray-500">No inventory items found</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Plus, Package, AlertTriangle, DollarSign, TrendingUp } from 'lucide-vue-next'
import { useInventoryStore } from '../stores/inventory'
import type { InventoryItem } from '../types/inventory'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const inventoryStore = useInventoryStore()

// State
const searchQuery = ref('')
const categoryFilter = ref('')
const statusFilter = ref('')
const showCreateItem = ref(false)

// Computed
const { inventoryItems, stockLevels, lowStockItems, totalInventoryValue, loading } = inventoryStore

const filteredItems = computed(() => {
  let filtered = inventoryItems.value

  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (categoryFilter.value) {
    filtered = filtered.filter(item => item.category === categoryFilter.value)
  }

  if (statusFilter.value) {
    filtered = filtered.filter(item => item.status === statusFilter.value)
  }

  return filtered
})

// Methods
function getStockLevel(itemId: string): number {
  const stock = stockLevels.value.find(s => s.itemId === itemId)
  return stock?.quantityAvailable || 0
}

// Lifecycle
onMounted(() => {
  inventoryStore.fetchInventoryItems()
  inventoryStore.fetchStockLevels()
})
</script>
