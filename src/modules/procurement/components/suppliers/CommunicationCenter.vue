<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium">Communication Center</h3>
        <p class="text-sm text-muted-foreground">
          Send emails and WhatsApp messages to suppliers
        </p>
      </div>
      <Button @click="showComposeDialog = true" size="sm">
        <Send class="mr-2 h-4 w-4" />
        Compose Message
      </Button>
    </div>

    <!-- Communication Stats -->
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Total Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ communicationStats.total }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Sent Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ communicationStats.sentToday }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Pending</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ communicationStats.pending }}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader class="pb-2">
          <CardTitle class="text-sm font-medium">Success Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ communicationStats.successRate }}%</div>
        </CardContent>
      </Card>
    </div>

    <!-- Communication Templates -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Message Templates</CardTitle>
            <CardDescription>Pre-defined message templates</CardDescription>
          </div>
          <Button @click="showTemplateDialog = true" variant="outline" size="sm">
            <Plus class="mr-2 h-4 w-4" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="template in communicationTemplates" :key="template.templateId" 
               class="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
               @click="useTemplate(template)">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">{{ template.name }}</p>
                <p class="text-sm text-muted-foreground">{{ template.platform }}</p>
              </div>
              <div class="flex items-center space-x-2">
                <Badge :variant="template.isActive ? 'default' : 'secondary'">
                  {{ template.isActive ? 'Active' : 'Inactive' }}
                </Badge>
                <Button @click.stop="editTemplate(template)" variant="ghost" size="sm">
                  <Edit class="h-4 w-4" />
                </Button>
              </div>
            </div>
            <p class="text-sm text-muted-foreground mt-2 line-clamp-2">
              {{ template.content }}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Communication History -->
    <Card>
      <CardHeader>
        <div class="flex items-center justify-between">
          <div>
            <CardTitle>Communication History</CardTitle>
            <CardDescription>Recent messages sent to suppliers</CardDescription>
          </div>
          <div class="flex items-center space-x-2">
            <Select v-model="filterPlatform">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                
              </SelectContent>
            </Select>
            <Select v-model="filterStatus">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div v-for="log in filteredCommunicationLogs" :key="log.logId" 
               class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center space-x-4">
              <div class="w-10 h-10 rounded-lg flex items-center justify-center"
                   :class="getPlatformIconClass(log.platform)">
                <component :is="getPlatformIcon(log.platform)" class="h-5 w-5 text-white" />
              </div>
              <div>
                <p class="font-medium">{{ log.subject || 'No Subject' }}</p>
                <p class="text-sm text-muted-foreground">
                  To: {{ getSupplierName(log.supplierId) }} • {{ formatDate(log.sentAt) }}
                </p>
                <p class="text-sm text-muted-foreground line-clamp-1">
                  {{ log.content }}
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <Badge :variant="getStatusVariant(log.status)">
                {{ log.status }}
              </Badge>
              <Button @click="viewMessage(log)" variant="ghost" size="sm">
                <Eye class="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Compose Message Dialog -->
    <Dialog :open="showComposeDialog" @update:open="showComposeDialog = $event">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose Message</DialogTitle>
          <DialogDescription>
            Send a message to suppliers via email or WhatsApp
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="sendMessage" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="platform">Platform</Label>
              <Select v-model="messageForm.platform" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div class="flex items-center space-x-2">
                      <Mail class="h-4 w-4" />
                      <span>Email</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="whatsapp">
                    <div class="flex items-center space-x-2">
                      <MessageCircle class="h-4 w-4" />
                      <span>WhatsApp</span>
                    </div>
                  </SelectItem>
                  
                </SelectContent>
              </Select>
            </div>

            <div class="space-y-2">
              <Label for="supplier">Supplier</Label>
              <Select v-model="messageForm.supplierId" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="supplier in suppliers" 
                             :key="supplier.supplierId" 
                             :value="supplier.supplierId">
                    {{ supplier.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div v-if="messageForm.platform === 'email'" class="space-y-2">
            <Label for="subject">Subject</Label>
            <Input
              id="subject"
              v-model="messageForm.subject"
              placeholder="Email subject"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="content">Message</Label>
            <Textarea
              id="content"
              v-model="messageForm.content"
              placeholder="Type your message here..."
              rows="6"
              required
            />
            <div class="text-xs text-muted-foreground">
              Available variables: {supplierName}, {contactPerson}, {orderNumber}
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="saveTemplate" v-model:checked="messageForm.saveAsTemplate" />
            <Label for="saveTemplate">Save as template</Label>
          </div>

          <div v-if="messageForm.saveAsTemplate" class="space-y-2">
            <Input v-model="messageForm.templateName" placeholder="Template name" />
          </div>

          <DialogFooter>
            <Button @click="showComposeDialog = false" type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="sending">
              <Loader2 v-if="sending" class="mr-2 h-4 w-4 animate-spin" />
              <Send class="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Template Dialog -->
    <Dialog :open="showTemplateDialog" @update:open="showTemplateDialog = $event">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {{ editingTemplate ? 'Edit Template' : 'Create Template' }}
          </DialogTitle>
          <DialogDescription>
            {{ editingTemplate ? 'Update template details' : 'Create a new message template' }}
          </DialogDescription>
        </DialogHeader>
        
        <form @submit.prevent="saveTemplate" class="space-y-4">
          <div class="space-y-2">
            <Label for="templateName">Template Name</Label>
            <Input
              id="templateName"
              v-model="templateForm.name"
              placeholder="Enter template name"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="templatePlatform">Platform</Label>
            <Select v-model="templateForm.platform" required>
              <SelectTrigger>
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="templateForm.platform === 'email'" class="space-y-2">
            <Label for="templateSubject">Subject</Label>
            <Input
              id="templateSubject"
              v-model="templateForm.subject"
              placeholder="Email subject template"
            />
          </div>

          <div class="space-y-2">
            <Label for="templateContent">Content</Label>
            <Textarea
              id="templateContent"
              v-model="templateForm.content"
              placeholder="Message template content"
              rows="4"
              required
            />
          </div>

          <div class="flex items-center space-x-2">
            <Checkbox id="templateActive" v-model:checked="templateForm.isActive" />
            <Label for="templateActive">Active template</Label>
          </div>

          <DialogFooter>
            <Button @click="closeTemplateDialog" type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" :disabled="loading">
              <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              {{ editingTemplate ? 'Update' : 'Create' }}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>

    <!-- Message View Dialog -->
    <Dialog :open="showMessageDialog" @update:open="showMessageDialog = $event">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{{ viewingMessage?.subject || 'Message Details' }}</DialogTitle>
          <DialogDescription>
            {{ viewingMessage?.platform }} message sent {{ viewingMessage ? formatDate(viewingMessage.sentAt) : '' }}
          </DialogDescription>
        </DialogHeader>
        
        <div v-if="viewingMessage" class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Platform:</span>
              {{ viewingMessage.platform }}
            </div>
            <div>
              <span class="font-medium">Status:</span>
              <Badge :variant="getStatusVariant(viewingMessage.status)" class="ml-2">
                {{ viewingMessage.status }}
              </Badge>
            </div>
            <div>
              <span class="font-medium">Sent:</span>
              {{ formatDate(viewingMessage.sentAt) }}
            </div>
            <div v-if="viewingMessage.deliveredAt">
              <span class="font-medium">Delivered:</span>
              {{ formatDate(viewingMessage.deliveredAt) }}
            </div>
          </div>
          
          <div class="border-t pt-4">
            <div class="font-medium mb-2">Message Content:</div>
            <div class="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {{ viewingMessage.content }}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { CommunicationLog, CommunicationTemplate, CommunicationPlatform } from '@/modules/procurement/types/supplier'

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'

// Icons
import { 
  Send, 
  Plus, 
  Edit, 
  Eye, 
  Mail, 
  MessageCircle, 
  Loader2 
} from 'lucide-vue-next'

// Props
const props = defineProps<{
  supplierId?: string
}>()

// Store
const supplierStore = useSupplierStore()

// State
const showComposeDialog = ref(false)
const showTemplateDialog = ref(false)
const showMessageDialog = ref(false)
const editingTemplate = ref<CommunicationTemplate | null>(null)
const viewingMessage = ref<CommunicationLog | null>(null)
const filterPlatform = ref('all')
const filterStatus = ref('all')
const sending = ref(false)
const loading = ref(false)

const messageForm = ref({
  platform: 'email' as CommunicationPlatform,
  supplierId: props.supplierId || '',
  subject: '',
  content: '',
  saveAsTemplate: false,
  templateName: ''
})

const templateForm = ref({
  name: '',
  platform: 'email' as CommunicationPlatform,
  subject: '',
  content: '',
  isActive: true
})

// Computed
const suppliers = computed(() => supplierStore.suppliers)
const communicationTemplates = computed(() => supplierStore.communicationTemplates)
const communicationLogs = computed(() => supplierStore.communicationLogs)

const filteredCommunicationLogs = computed(() => {
  let filtered = communicationLogs.value

  if (props.supplierId) {
    filtered = filtered.filter(log => log.supplierId === props.supplierId)
  }

  if (filterPlatform.value !== 'all') {
    filtered = filtered.filter(log => log.platform === filterPlatform.value)
  }

  if (filterStatus.value !== 'all') {
    filtered = filtered.filter(log => log.status === filterStatus.value)
  }

  return filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
})

const communicationStats = computed(() => {
  const logs = props.supplierId 
    ? communicationLogs.value.filter(log => log.supplierId === props.supplierId)
    : communicationLogs.value

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const sentToday = logs.filter(log => {
    const sentDate = new Date(log.sentAt)
    sentDate.setHours(0, 0, 0, 0)
    return sentDate.getTime() === today.getTime()
  }).length

  const pending = logs.filter(log => log.status === 'pending').length
  const successful = logs.filter(log => ['sent', 'delivered', 'read'].includes(log.status)).length
  const successRate = logs.length > 0 ? Math.round((successful / logs.length) * 100) : 0

  return {
    total: logs.length,
    sentToday,
    pending,
    successRate
  }
})

// Methods
function getPlatformIcon(platform: CommunicationPlatform) {
  switch (platform) {
    case 'email':
      return Mail
    case 'whatsapp':
      return MessageCircle
    
    default:
      return MessageCircle
  }
}

function getPlatformIconClass(platform: CommunicationPlatform) {
  switch (platform) {
    case 'email':
      return 'bg-blue-500'
    case 'whatsapp':
      return 'bg-green-500'
    
    default:
      return 'bg-gray-500'
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'sent':
    case 'delivered':
    case 'read':
      return 'default'
    case 'failed':
      return 'destructive'
    case 'pending':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getSupplierName(supplierId: string): string {
  const supplier = suppliers.value.find(s => s.supplierId === supplierId)
  return supplier?.name || 'Unknown Supplier'
}

function useTemplate(template: CommunicationTemplate) {
  messageForm.value.platform = template.platform
  messageForm.value.subject = template.subject || ''
  messageForm.value.content = template.content
  showComposeDialog.value = true
}

function editTemplate(template: CommunicationTemplate) {
  editingTemplate.value = template
  templateForm.value = {
    name: template.name,
    platform: template.platform,
    subject: template.subject || '',
    content: template.content,
    isActive: template.isActive
  }
  showTemplateDialog.value = true
}

function closeTemplateDialog() {
  showTemplateDialog.value = false
  editingTemplate.value = null
  templateForm.value = {
    name: '',
    platform: 'email',
    subject: '',
    content: '',
    isActive: true
  }
}

function viewMessage(log: CommunicationLog) {
  viewingMessage.value = log
  showMessageDialog.value = true
}

async function sendMessage() {
  sending.value = true
  try {
    await supplierStore.sendCommunication(
      messageForm.value.supplierId,
      messageForm.value.platform,
      messageForm.value.subject,
      messageForm.value.content
    )

    if (messageForm.value.saveAsTemplate && messageForm.value.templateName) {
      // Save as template logic would go here
    }

    showComposeDialog.value = false
    messageForm.value = {
      platform: 'email',
      supplierId: props.supplierId || '',
      subject: '',
      content: '',
      saveAsTemplate: false,
      templateName: ''
    }
  } catch (error) {
    console.error('Failed to send message:', error)
  } finally {
    sending.value = false
  }
}

async function saveTemplate() {
  loading.value = true
  try {
    // Template save logic would go here
    console.log('Save template:', templateForm.value)
    closeTemplateDialog()
  } catch (error) {
    console.error('Failed to save template:', error)
  } finally {
    loading.value = false
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Lifecycle
onMounted(() => {
  // Fetch communication data would be called here
})
</script>
