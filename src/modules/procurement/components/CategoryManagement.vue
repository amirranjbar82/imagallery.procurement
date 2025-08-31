<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Product Categories</h2>
        <p class="text-sm text-muted-foreground">Manage hierarchical product categories</p>
      </div>
      <Button @click="showCreateDialog = true">
        <Plus class="mr-2 h-4 w-4" />
        Add Category
      </Button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <FolderTree class="h-8 w-8 text-blue-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Total Categories</p>
              <p class="text-2xl font-bold">{{ categoryStats.totalCategories }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <Layers class="h-8 w-8 text-green-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Total Levels</p>
              <p class="text-2xl font-bold">{{ categoryStats.totalLevels }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center">
            <TreePine class="h-8 w-8 text-purple-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-muted-foreground">Root Categories</p>
              <p class="text-2xl font-bold">{{ rootCategories.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Category Tree -->
    <Card>
      <CardHeader>
        <CardTitle>Category Hierarchy</CardTitle>
      </CardHeader>
      <CardContent>
        <div v-if="loading" class="flex justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
        
        <div v-else-if="error" class="text-center py-8">
          <AlertCircle class="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p class="text-red-600">{{ error }}</p>
          <Button @click="categoryStore.fetchCategories" class="mt-4">
            Try Again
          </Button>
        </div>
        
        <div v-else-if="categoryHierarchy.length === 0" class="text-center py-8">
          <FolderTree class="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p class="text-muted-foreground">No categories found</p>
          <Button @click="showCreateDialog = true" class="mt-4">
            Create First Category
          </Button>
        </div>
        
        <div v-else class="space-y-2">
          <CategoryTreeItem
            v-for="item in categoryHierarchy"
            :key="item.category.categoryId"
            :hierarchy="item"
            @edit="editCategory"
            @delete="deleteCategory"
            @add-child="addChildCategory"
          />
        </div>
      </CardContent>
    </Card>

    <!-- Create/Edit Category Dialog -->
    <div v-if="showCreateDialog || showEditDialog" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold mb-4">
          {{ showEditDialog ? 'Edit Category' : 'Create Category' }}
        </h3>
        
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="text-sm font-medium">Category Name *</label>
            <Input
              v-model="form.name"
              placeholder="Enter category name"
              :class="{ 'border-destructive': errors.name }"
            />
            <p v-if="errors.name" class="text-sm text-destructive mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label class="text-sm font-medium">Category Code</label>
            <Input
              v-model="form.code"
              placeholder="Auto-generated if empty"
            />
            <p class="text-xs text-muted-foreground mt-1">Leave empty for auto-generation</p>
          </div>

          <div>
            <label class="text-sm font-medium">Description</label>
            <textarea
              v-model="form.description"
              class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder="Category description..."
            />
          </div>

          <div>
            <label class="text-sm font-medium">Level *</label>
            <Select v-model="form.level">
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="level in availableLevels" :key="level" :value="level.toString()">
                  Level {{ level }}
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.level" class="text-sm text-destructive mt-1">{{ errors.level }}</p>
          </div>

          <div v-if="form.level && parseInt(form.level) > 1">
            <label class="text-sm font-medium">Parent Category *</label>
            <Select v-model="form.parentId">
              <SelectTrigger>
                <SelectValue placeholder="Select parent category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="category in availableParents" 
                  :key="category.categoryId" 
                  :value="category.categoryId"
                >
                  {{ category.name }} (Level {{ category.level }})
                </SelectItem>
              </SelectContent>
            </Select>
            <p v-if="errors.parentId" class="text-sm text-destructive mt-1">{{ errors.parentId }}</p>
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" @click="closeDialog">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              {{ showEditDialog ? 'Update' : 'Create' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useCategoryStore } from '@/modules/procurement/stores/category'
import type { ProductCategory } from '@/modules/procurement/types/category'

// Icons
import { 
  Plus, FolderTree, Layers, TreePine, AlertCircle
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Import the tree item component
import CategoryTreeItem from './CategoryTreeItem.vue'

// Store
const categoryStore = useCategoryStore()
const { categories, loading, error, categoryHierarchy, categoryStats, rootCategories } = storeToRefs(categoryStore)

// Local state
const showCreateDialog = ref(false)
const showEditDialog = ref(false)
const editingCategory = ref<ProductCategory | null>(null)

const form = reactive({
  name: '',
  code: '',
  description: '',
  level: '1',
  parentId: undefined as string | undefined
})

const errors = ref<Record<string, string>>({})

// Computed
const availableLevels = computed(() => {
  const maxLevel = Math.max(...categories.value.map(c => c.level), 0)
  return Array.from({ length: Math.min(maxLevel + 2, 10) }, (_, i) => i + 1)
})

const availableParents = computed(() => {
  const levelNum = typeof form.level === 'string' ? parseInt(form.level) : form.level
  if (!levelNum || levelNum <= 1) return []
  
  const targetLevel = levelNum - 1
  return categories.value
    .filter(c => 
      c.level === targetLevel && 
      c.isActive && 
      c.categoryId !== editingCategory.value?.categoryId
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))
})

// Methods
function validateForm(): boolean {
  errors.value = {}
  
  if (!form.name.trim()) {
    errors.value.name = 'Category name is required'
  }
  
  if (!form.level) {
    errors.value.level = 'Level is required'
  }
  
  const levelNum = typeof form.level === 'string' ? parseInt(form.level) : form.level
  if (levelNum && levelNum > 1 && !form.parentId) {
    errors.value.parentId = 'Parent category is required for levels > 1'
  }
  
  return Object.keys(errors.value).length === 0
}

async function handleSubmit() {
  if (!validateForm()) return
  
  try {
    if (showEditDialog.value && editingCategory.value) {
      await categoryStore.updateCategory({
        categoryId: editingCategory.value.categoryId,
        name: form.name,
        code: form.code || undefined,
        description: form.description || undefined,
        parentId: form.parentId
      })
    } else {
      await categoryStore.createCategory({
        name: form.name,
        code: form.code || '',
        description: form.description,
        level: typeof form.level === 'string' ? parseInt(form.level) : form.level,
        parentId: form.parentId
      })
    }
    
    closeDialog()
  } catch (err) {
    console.error('Form submission error:', err)
  }
}

function editCategory(category: ProductCategory) {
  editingCategory.value = category
  form.name = category.name
  form.code = category.code
  form.description = category.description || ''
  form.level = category.level.toString()
  form.parentId = category.parentId || undefined
  showEditDialog.value = true
}

function addChildCategory(parentCategory: ProductCategory) {
  form.name = ''
  form.code = ''
  form.description = ''
  form.level = (parentCategory.level + 1).toString()
  form.parentId = parentCategory.categoryId
  showCreateDialog.value = true
}

async function deleteCategory(category: ProductCategory) {
  if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
    await categoryStore.deleteCategory(category.categoryId)
  }
}

function closeDialog() {
  showCreateDialog.value = false
  showEditDialog.value = false
  editingCategory.value = null
  
  // Reset form
  form.name = ''
  form.code = ''
  form.description = ''
  form.level = '1'
  form.parentId = undefined
  errors.value = {}
}

// Lifecycle
onMounted(() => {
  categoryStore.fetchCategories()
})
</script>
