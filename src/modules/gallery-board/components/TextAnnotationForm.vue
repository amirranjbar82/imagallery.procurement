<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Rich Text Editor -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Note Content</label>
      <div class="border rounded-lg">
        <!-- Toolbar -->
        <div class="flex items-center gap-1 p-2 border-b bg-gray-50">
          <Button
            type="button"
            @click="toggleFormat('bold')"
            size="sm"
            variant="ghost"
            :class="{ 'bg-gray-200': isFormatActive('bold') }"
          >
            <Bold class="w-4 h-4" />
          </Button>
          <Button
            type="button"
            @click="toggleFormat('italic')"
            size="sm"
            variant="ghost"
            :class="{ 'bg-gray-200': isFormatActive('italic') }"
          >
            <Italic class="w-4 h-4" />
          </Button>
          <Button
            type="button"
            @click="toggleFormat('underline')"
            size="sm"
            variant="ghost"
            :class="{ 'bg-gray-200': isFormatActive('underline') }"
          >
            <Underline class="w-4 h-4" />
          </Button>
          
          <div class="w-px h-6 bg-gray-300 mx-1"></div>
          
          <Button
            type="button"
            @click="toggleList('ul')"
            size="sm"
            variant="ghost"
            :class="{ 'bg-gray-200': isListActive('ul') }"
          >
            <List class="w-4 h-4" />
          </Button>
          <Button
            type="button"
            @click="toggleList('ol')"
            size="sm"
            variant="ghost"
            :class="{ 'bg-gray-200': isListActive('ol') }"
          >
            <ListOrdered class="w-4 h-4" />
          </Button>
          
          <div class="w-px h-6 bg-gray-300 mx-1"></div>
          
          <Button
            type="button"
            @click="insertPrice"
            size="sm"
            variant="ghost"
          >
            <DollarSign class="w-4 h-4" />
          </Button>
        </div>
        
        <!-- Editor -->
        <div
          ref="editor"
          contenteditable="true"
          @input="handleInput"
          @keydown="handleKeydown"
          class="min-h-32 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
          placeholder="Enter your note here..."
        ></div>
      </div>
      <p class="text-xs text-gray-500">
        Use the toolbar to format text, add lists, or insert price information
      </p>
    </div>

    <!-- Quick Templates -->
    <div class="space-y-2">
      <label class="text-sm font-medium text-gray-700">Quick Templates</label>
      <div class="flex flex-wrap gap-2">
        <Button
          v-for="template in templates"
          :key="template.name"
          type="button"
          @click="insertTemplate(template)"
          size="sm"
          variant="outline"
        >
          {{ template.name }}
        </Button>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Cancel
      </Button>
      <Button type="submit" :disabled="!content.trim() || loading">
        <Loader2 v-if="loading" class="w-4 h-4 mr-2 animate-spin" />
        Add Note
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  DollarSign, 
  Loader2 
} from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

interface Emits {
  (e: 'submit', data: { html: string }): void
  (e: 'cancel'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const editor = ref<HTMLElement>()
const content = ref('')

const templates = [
  { name: 'Customer Feedback', content: '<strong>Customer says:</strong> <em>"[feedback]"</em>' },
  { name: 'Price Quote', content: '<strong>Price:</strong> $[amount]<br><strong>Valid until:</strong> [date]' },
  { name: 'Specifications', content: '<strong>Specifications:</strong><ul><li>[spec 1]</li><li>[spec 2]</li></ul>' },
  { name: 'Follow-up', content: '<strong>Follow-up required:</strong><br>• [action item]<br>• [deadline]' },
  { name: 'Customization', content: '<strong>Customization options:</strong><br>• Color: [options]<br>• Size: [options]<br>• Material: [options]' }
]

const handleInput = () => {
  if (editor.value) {
    content.value = editor.value.innerHTML
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  // Handle common keyboard shortcuts
  if (event.ctrlKey || event.metaKey) {
    switch (event.key) {
      case 'b':
        event.preventDefault()
        toggleFormat('bold')
        break
      case 'i':
        event.preventDefault()
        toggleFormat('italic')
        break
      case 'u':
        event.preventDefault()
        toggleFormat('underline')
        break
    }
  }
}

const toggleFormat = (command: string) => {
  document.execCommand(command, false)
  editor.value?.focus()
}

const toggleList = (listType: 'ul' | 'ol') => {
  const command = listType === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
  document.execCommand(command, false)
  editor.value?.focus()
}

const insertPrice = () => {
  const priceHtml = '<span style="background-color: #fef3c7; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$[price]</span>'
  document.execCommand('insertHTML', false, priceHtml)
  editor.value?.focus()
}

const insertTemplate = (template: { name: string; content: string }) => {
  if (editor.value) {
    editor.value.innerHTML = template.content
    content.value = template.content
    editor.value.focus()
  }
}

const isFormatActive = (command: string): boolean => {
  return document.queryCommandState(command)
}

const isListActive = (listType: 'ul' | 'ol'): boolean => {
  const command = listType === 'ul' ? 'insertUnorderedList' : 'insertOrderedList'
  return document.queryCommandState(command)
}

const handleSubmit = () => {
  if (!content.value.trim()) return
  
  emit('submit', { html: content.value })
}

onMounted(() => {
  if (editor.value) {
    editor.value.focus()
  }
})
</script>

<style scoped>
@reference "tailwindcss";

[contenteditable]:empty:before {
  content: attr(placeholder);
  color: #9ca3af;
  pointer-events: none;
}

[contenteditable] {
  @apply text-sm max-w-none;
  line-height: 1.5;
}

[contenteditable] p {
  @apply mb-2;
}

[contenteditable] ul {
  @apply list-disc list-inside mb-2;
}

[contenteditable] ol {
  @apply list-decimal list-inside mb-2;
}

[contenteditable] strong {
  @apply font-semibold;
}

[contenteditable] em {
  @apply italic;
}
</style>
