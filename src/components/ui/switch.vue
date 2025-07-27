<template>
  <button
    type="button"
    :class="[
      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2',
      checked ? 'bg-slate-900' : 'bg-gray-200'
    ]"
    @click="$emit('update:checked', !checked)"
  >
    <span
      :class="[
        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
        checked ? 'translate-x-6' : 'translate-x-1'
      ]"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  checked: boolean
}

defineProps<Props>()

defineEmits<{
  'update:checked': [value: boolean]
}>()
</script>
