<template>
  <div class="space-y-6">
    <ProcurementHeader>
      <template #search>
        <Input 
          v-model="search" 
          placeholder="Search invoices..." 
          class="h-8"
        />
      </template>
      <template #filters>
        <Select v-model="statusFilter" @update:modelValue="handleStatusFilterUpdate">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="text-sm text-muted-foreground hidden md:block">{{ filteredInvoices.length }} results</div>
          <Button @click="showCreateDialog = true" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Create Invoice
          </Button>
        </div>
      </template>
      <template #stats>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ invoicesStore.invoiceStats.totalInvoices }}</div>
                <div class="text-xs text-muted-foreground">Total Invoices</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ invoicesStore.invoiceStats.pendingInvoices }}</div>
                <div class="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ invoicesStore.invoiceStats.overdueInvoices }}</div>
                <div class="text-xs text-muted-foreground">Overdue</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card class="py-1.5">
          <CardContent class="p-1.5">
            <div class="flex items-center space-x-3">
              <div>
                <div class="text-xl font-bold">{{ currency(invoicesStore.invoiceStats.totalOutstanding) }}</div>
                <div class="text-xs text-muted-foreground">Outstanding</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </template>
    </ProcurementHeader>

    <!-- Errors -->
    <div v-if="suppliersError" class="mb-3">
      <Alert variant="destructive">
        <AlertTitle>Suppliers unavailable</AlertTitle>
        <AlertDescription>{{ suppliersError }}</AlertDescription>
      </Alert>
    </div>
    <div v-if="invoicesError" class="mb-3">
      <Alert variant="destructive">
        <AlertTitle>Invoices unavailable</AlertTitle>
        <AlertDescription>{{ invoicesError }}</AlertDescription>
      </Alert>
    </div>

    <!-- Table -->
    <Card>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[160px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('invoiceNumber')">
                  Invoice #
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead>
                <button class="inline-flex items-center gap-1" @click="toggleSort('supplierName')">
                  Supplier
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[120px] text-right">
                <button class="inline-flex items-center gap-1" @click="toggleSort('totalAmount')">
                  Total
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[120px] text-right">
                <button class="inline-flex items-center gap-1" @click="toggleSort('paidAmount')">
                  Paid
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[120px] text-right">
                <button class="inline-flex items-center gap-1" @click="toggleSort('remainingAmount')">
                  Remaining
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[140px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('status')">
                  Status
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[160px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('dueDate')">
                  Dates
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[100px] text-center">Files</TableHead>
              <TableHead class="w-[120px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="inv in sortedInvoices" :key="inv.invoiceId">
              <TableCell>
                <div class="font-medium">{{ inv.invoiceNumber }}</div>
                <div class="text-xs text-muted-foreground">{{ inv.orderNumber || '-' }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ inv.supplierName }}</div>
              </TableCell>
              <TableCell class="text-right">{{ currency(inv.totalAmount) }}</TableCell>
              <TableCell class="text-right">{{ currency(inv.paidAmount) }}</TableCell>
              <TableCell class="text-right">{{ currency(inv.remainingAmount) }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(inv.status)">{{ inv.status }}</Badge>
              </TableCell>
              <TableCell>
                <div class="text-xs">
                  <div>Inv: {{ formatDate(inv.invoiceDate) }}</div>
                  <div>Due: {{ formatDate(inv.dueDate) }}</div>
                </div>
              </TableCell>
              <TableCell class="text-center">
                <button class="underline text-sm" @click="openAttachments(inv)">
                  {{ inv.attachments?.length || 0 }}
                </button>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon"><MoreVertical class="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="triggerUpload(inv)">Upload File</DropdownMenuItem>
                    <DropdownMenuItem @click="openCreatePayment(inv)">Record Payment</DropdownMenuItem>
                    <DropdownMenuItem @click="viewInvoice(inv)">View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Hidden file input for attachments -->
    <input ref="fileInput" type="file" class="hidden" @change="onFileChange" />

    <!-- Create Invoice Dialog -->
    <Dialog v-model:open="showCreateDialog">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Record a supplier invoice.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Supplier</Label>
              <Select v-model="form.supplierId">
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="s in suppliers" :key="s.supplierId" :value="s.supplierId">{{ s.name }}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Invoice Date</Label>
              <Input type="date" v-model="form.invoiceDateStr" />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" v-model="form.dueDateStr" />
            </div>
            <div>
              <Label>Payment Terms</Label>
              <Input v-model="form.paymentTerms" placeholder="e.g. Net 30" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea v-model="form.notes" placeholder="Optional notes..." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showCreateDialog = false">Cancel</Button>
          <Button :disabled="creating" @click="createInvoice">
            <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Record Payment Dialog -->
    <Dialog v-model:open="showPaymentDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" v-model.number="paymentForm.amount" />
            </div>
            <div>
              <Label>Method</Label>
              <Select v-model="paymentForm.paymentMethod">
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="letter_of_credit">Letter of Credit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" v-model="paymentForm.paymentDateStr" />
            </div>
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea v-model="paymentForm.notes" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showPaymentDialog = false">Cancel</Button>
          <Button :disabled="creatingPayment" @click="createPayment">
            <Loader2 v-if="creatingPayment" class="mr-2 h-4 w-4 animate-spin" />
            Save Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Attachments Dialog -->
    <Dialog v-model:open="showAttachmentsDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Invoice Attachments</DialogTitle>
          <DialogDescription v-if="attachmentsTitle">{{ attachmentsTitle }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-2 max-h-80 overflow-auto">
          <div v-if="currentAttachments.length === 0" class="text-sm text-muted-foreground">No attachments</div>
          <div v-for="(url, idx) in currentAttachments" :key="idx" class="flex items-center justify-between gap-3 p-2 border rounded">
            <div class="truncate text-sm">{{ url }}</div>
            <div class="flex items-center gap-2">
              <a :href="url" target="_blank" class="text-sm underline">Open</a>
              <Button variant="ghost" size="icon" class="h-7 w-7" @click="deleteInvoiceAttachment(url)">
                <Trash class="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showAttachmentsDialog = false">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useInvoicesStore } from '@/modules/procurement/stores/invoices'
import { useSupplierStore } from '@/modules/procurement/stores/supplier'
import type { Invoice, CreateInvoiceRequest, CreatePaymentRequest, PaymentMethod } from '@/modules/procurement/types/invoices'

// UI components (shadcn-vue)
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectTrigger, SelectContent, SelectValue, SelectItem } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { MoreVertical, Plus, Loader2, ArrowUpDown, Trash } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import ProcurementHeader from '@/modules/procurement/components/ProcurementHeader.vue'

const invoicesStore = useInvoicesStore()
const suppliersStore = useSupplierStore()
const { suppliers } = storeToRefs(suppliersStore)

const search = ref('')
const statusFilter = ref('all')
const showCreateDialog = ref(false)
const showPaymentDialog = ref(false)
const creating = ref(false)
const creatingPayment = ref(false)
const invoicesError = ref<string | null>(null)
const suppliersError = ref<string | null>(null)

// suppliers come from storeToRefs for reactivity typing

const filteredInvoices = computed(() => {
  const q = search.value.toLowerCase()
  const status = statusFilter.value
  return invoicesStore.invoices.filter((i: Invoice) => {
    const m = !q || i.invoiceNumber.toLowerCase().includes(q) || i.supplierName.toLowerCase().includes(q) || i.orderNumber?.toLowerCase().includes(q)
    const s = !status || status === 'all' || i.status === status
    return m && s
  })
})

type SortField = 'invoiceNumber' | 'supplierName' | 'totalAmount' | 'paidAmount' | 'remainingAmount' | 'status' | 'dueDate'
const sortField = ref<SortField>('dueDate')
const sortDirection = ref<'asc' | 'desc'>('desc')

const sortedInvoices = computed(() => {
  const arr = [...filteredInvoices.value]
  const field = sortField.value
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return arr.sort((a, b) => {
    let av: any
    let bv: any
    switch (field) {
      case 'invoiceNumber': av = a.invoiceNumber || ''; bv = b.invoiceNumber || ''; return av.localeCompare(bv) * dir
      case 'supplierName': av = a.supplierName || ''; bv = b.supplierName || ''; return av.localeCompare(bv) * dir
      case 'totalAmount': av = a.totalAmount || 0; bv = b.totalAmount || 0; return (av - bv) * dir
      case 'paidAmount': av = a.paidAmount || 0; bv = b.paidAmount || 0; return (av - bv) * dir
      case 'remainingAmount': av = a.remainingAmount || 0; bv = b.remainingAmount || 0; return (av - bv) * dir
      case 'status': av = a.status || ''; bv = b.status || ''; return av.localeCompare(bv) * dir
      case 'dueDate': av = a.dueDate ? new Date(a.dueDate).getTime() : 0; bv = b.dueDate ? new Date(b.dueDate).getTime() : 0; return (av - bv) * dir
      default: return 0
    }
  })
})

function toggleSort(field: SortField) {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0)
}

function formatDate(d?: Date) {
  if (!d) return '-'
  const iso = (typeof d === 'string' ? d : d.toISOString()).slice(0, 10)
  return iso
}

function statusVariant(s: Invoice['status']) {
  switch (s) {
    case 'paid': return 'success'
    case 'overdue': return 'destructive'
    case 'approved': return 'secondary'
    case 'sent': return 'outline'
    default: return 'default'
  }
}

function viewInvoice(_inv: Invoice) {
  // placeholder for future detail view
}

// Upload attachment handling
const fileInput = ref<HTMLInputElement | null>(null)
const targetInvoiceId = ref<string | null>(null)

function triggerUpload(inv: Invoice) {
  targetInvoiceId.value = inv.invoiceId
  fileInput.value?.click()
}

async function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file && targetInvoiceId.value) {
    await invoicesStore.uploadInvoiceAttachment(targetInvoiceId.value, file)
  }
  if (input) input.value = ''
  targetInvoiceId.value = null
}

// Create Invoice
const form = ref({
  supplierId: '',
  invoiceDateStr: '',
  dueDateStr: '',
  paymentTerms: 'Net 30',
  notes: ''
})

async function createInvoice() {
  if (!form.value.supplierId || !form.value.invoiceDateStr || !form.value.dueDateStr) return
  creating.value = true
  try {
    const payload: CreateInvoiceRequest = {
      supplierId: form.value.supplierId,
      invoiceDate: new Date(form.value.invoiceDateStr),
      dueDate: new Date(form.value.dueDateStr),
      lineItems: [],
      paymentTerms: form.value.paymentTerms,
      notes: form.value.notes || undefined,
      internalNotes: undefined
    }
    const id = await invoicesStore.createInvoice(payload)
    if (id) {
      showCreateDialog.value = false
    }
  } finally {
    creating.value = false
  }
}

// Payment Dialog
const paymentForm = ref<{ invoiceId: string | null; amount: number; paymentMethod: PaymentMethod | null; paymentDateStr: string; notes?: string}>({
  invoiceId: null,
  amount: 0,
  paymentMethod: null,
  paymentDateStr: ''
})

function openCreatePayment(inv: Invoice) {
  paymentForm.value = { invoiceId: inv.invoiceId, amount: inv.remainingAmount, paymentMethod: 'bank_transfer', paymentDateStr: new Date().toISOString().slice(0,10) }
  showPaymentDialog.value = true
}

async function createPayment() {
  if (!paymentForm.value.invoiceId || !paymentForm.value.paymentMethod || !paymentForm.value.paymentDateStr) return
  creatingPayment.value = true
  try {
    const payload: CreatePaymentRequest = {
      invoiceId: paymentForm.value.invoiceId,
      amount: paymentForm.value.amount,
      paymentMethod: paymentForm.value.paymentMethod,
      paymentDate: new Date(paymentForm.value.paymentDateStr),
      notes: paymentForm.value.notes
    }
    const id = await invoicesStore.createPayment(payload)
    if (id) {
      showPaymentDialog.value = false
    }
  } finally {
    creatingPayment.value = false
  }
}

// Attachments dialog state
const showAttachmentsDialog = ref(false)
const currentAttachments = ref<string[]>([])
const attachmentsTitle = ref<string>('')
const currentInvoiceId = ref<string | null>(null)

function openAttachments(inv: Invoice) {
  currentAttachments.value = inv.attachments || []
  attachmentsTitle.value = inv.invoiceNumber
  currentInvoiceId.value = inv.invoiceId
  showAttachmentsDialog.value = true
}

async function deleteInvoiceAttachment(url: string) {
  if (!currentInvoiceId.value) return
  try {
    const ok = confirm('Delete this attachment? This cannot be undone.')
    if (!ok) return
    const res = await invoicesStore.removeInvoiceAttachment(currentInvoiceId.value, url)
    if (res) {
      currentAttachments.value = currentAttachments.value.filter((u) => u !== url)
      toast.success('Attachment deleted')
    } else {
      toast.error('Failed to delete attachment')
    }
  } catch (e) {
    console.error('Failed to delete attachment', e)
    toast.error('Failed to delete attachment')
  }
}

onMounted(async () => {
  // Ensure filter is never empty
  if (!statusFilter.value) statusFilter.value = 'all'

  try {
    suppliersError.value = null
    await suppliersStore.fetchSuppliers()
  } catch (e: any) {
    console.error('Failed to fetch suppliers for invoices:', e)
    suppliersError.value = 'Failed to fetch suppliers. Please check your Firestore permissions.'
  }

  try {
    invoicesError.value = null
    await invoicesStore.fetchInvoices()
    await invoicesStore.fetchInvoiceStats()
  } catch (e: any) {
    console.error('Failed to fetch invoices:', e)
    invoicesError.value = 'Failed to fetch invoices. Please check your Firestore permissions.'
  }
})

function handleStatusFilterUpdate(value: unknown) {
  const v = (value ?? 'all') as string
  statusFilter.value = v && v.length > 0 ? v : 'all'
}
</script>
