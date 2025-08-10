<template>
  <div class="w-full">
    <div class="border rounded-md flex flex-col h-80">
      <!-- Header -->
      <div class="px-3 py-2 border-b text-sm font-medium">Conversation</div>

      <!-- Messages -->
      <div ref="listRef" class="flex-1 overflow-auto p-3 space-y-3">
        <div v-for="msg in thread" :key="msg.id" class="flex items-start gap-2" :class="isMine(msg) ? 'justify-end' : 'justify-start'">
          <div class="max-w-[75%]">
            <div :class="[
              'rounded-md px-3 py-2 text-sm whitespace-pre-wrap break-words',
              isMine(msg) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
            ]">
              <div class="text-[11px] opacity-80 mb-1" v-if="!isMine(msg)">{{ msg.authorName || 'Unknown' }}</div>
              <div>{{ msg.content }}</div>
              <div class="text-[10px] opacity-75 mt-1 text-right">
                {{ formatTime(msg.createdAt) }}
              </div>
            </div>
          </div>
        </div>
        <div v-if="!thread.length" class="text-xs text-gray-500 text-center py-6">No messages yet</div>
      </div>

      <!-- Composer -->
      <div class="p-2 border-t flex items-center gap-2">
        <Input v-model="text" placeholder="Type a message..." class="h-9" @keydown.enter.prevent="send" />
        <Button type="button" size="sm" @click="send" :disabled="!text.trim() || sending">Send</Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from 'vue'
import { useCommentsStore } from '@/modules/tasks/stores/comments'
import { useAuthStore } from '@/modules/auth/stores/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Props {
  taskId: string
}
const props = defineProps<Props>()

const commentsStore = useCommentsStore()
const auth = useAuthStore()
const text = ref('')
const sending = ref(false)
const listRef = ref<HTMLElement | null>(null)

const thread = computed(() => commentsStore.getThread(props.taskId, 'task'))

const scrollToBottom = async () => {
  await nextTick()
  if (listRef.value) {
    listRef.value.scrollTop = listRef.value.scrollHeight
  }
}

onMounted(async () => {
  await commentsStore.fetchComments(props.taskId, 'task')
  commentsStore.subscribeComments(props.taskId, 'task')
  scrollToBottom()
})

onUnmounted(() => {
  commentsStore.unsubscribeComments(props.taskId, 'task')
})

watch(thread, () => scrollToBottom())

const isMine = (msg: any) => {
  const uid = auth.userProfile?.uid || auth.user?.uid
  return uid && msg.authorId === uid
}

const formatTime = (d: any) => {
  const date = d instanceof Date ? d : new Date(d)
  if (isNaN(date.getTime())) return ''
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

const send = async () => {
  const value = text.value.trim()
  if (!value) return
  sending.value = true
  try {
    await commentsStore.addComment(props.taskId, 'task', value)
    text.value = ''
  } finally {
    sending.value = false
  }
}
</script>
