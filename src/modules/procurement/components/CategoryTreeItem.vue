<template>
  <div class="border border-gray-200 rounded-lg">
    <div 
      class="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
      :class="{ 'bg-gray-50': isExpanded }"
      @click="toggleExpanded"
    >
      <div class="flex items-center space-x-3">
        <!-- Indentation based on depth -->
        <div :style="{ marginLeft: `${hierarchy.depth * 20}px` }" class="flex items-center space-x-2">
          <!-- Expand/Collapse Icon -->
          <button 
            v-if="hierarchy.children.length > 0"
            class="p-1 hover:bg-gray-200 rounded"
            @click.stop="toggleExpanded"
          >
            <ChevronRight 
              class="h-4 w-4 transition-transform"
              :class="{ 'rotate-90': isExpanded }"
            />
          </button>
          <div v-else class="w-6"></div>
          
          <!-- Category Icon -->
          <FolderTree class="h-5 w-5 text-blue-600" />
          
          <!-- Category Info -->
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-medium">{{ hierarchy.category.name }}</span>
              <Badge variant="outline" class="text-xs">
                Level {{ hierarchy.category.level }}
              </Badge>
              <Badge variant="secondary" class="text-xs">
                {{ hierarchy.category.code }}
              </Badge>
            </div>
            <div v-if="hierarchy.category.description" class="text-sm text-muted-foreground">
              {{ hierarchy.category.description }}
            </div>
            <div class="text-xs text-muted-foreground">
              Path: {{ hierarchy.path.join(' > ') }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Actions -->
      <div class="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="sm"
          @click.stop="$emit('add-child', hierarchy.category)"
          title="Add Subcategory"
        >
          <Plus class="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          @click.stop="$emit('edit', hierarchy.category)"
          title="Edit Category"
        >
          <Edit class="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          @click.stop="$emit('delete', hierarchy.category)"
          title="Delete Category"
          class="text-red-600 hover:text-red-700"
        >
          <Trash2 class="h-4 w-4" />
        </Button>
      </div>
    </div>
    
    <!-- Children -->
    <div v-if="isExpanded && hierarchy.children.length > 0" class="border-t border-gray-200">
      <CategoryTreeItem
        v-for="child in hierarchy.children"
        :key="child.category.categoryId"
        :hierarchy="child"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
        @add-child="$emit('add-child', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { CategoryHierarchy, ProductCategory } from '@/modules/procurement/types/category'

// Icons
import { 
  ChevronRight, FolderTree, Plus, Edit, Trash2
} from 'lucide-vue-next'

// UI Components
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Props
interface Props {
  hierarchy: CategoryHierarchy
}

// (name provided via normal <script> block below for recursion)

// Emits
defineEmits<{
  edit: [category: ProductCategory]
  delete: [category: ProductCategory]
  'add-child': [category: ProductCategory]
}>()

// Local state
const isExpanded = ref(false)

// Props
const props = defineProps<Props>()

// Methods
function toggleExpanded() {
  if (props.hierarchy.children.length > 0) {
    isExpanded.value = !isExpanded.value
  }
}
</script>

<script lang="ts">
export default {
  name: 'CategoryTreeItem',
}
</script>
