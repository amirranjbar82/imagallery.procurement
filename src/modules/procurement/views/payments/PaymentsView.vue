<template>
  <div class="space-y-6">
    <ProcurementHeader>
      <template #search>
        <Input 
          v-model="search" 
          placeholder="Search payments..." 
          class="h-8"
        />
      </template>
      <template #filters>
        <Select v-model="statusFilter">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="methodFilter">
          <SelectTrigger class="w-40 h-8">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="credit_card">Credit Card</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="letter_of_credit">Letter of Credit</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </template>
      <template #actions>
        <div class="flex items-center gap-2">
          <div class="text-sm text-muted-foreground hidden md:block">{{ filteredPayments.length }} results</div>
          <Button @click="openCreatePayment()" size="sm">
            <Plus class="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </template>
      <!-- Optional #stats slot could be added later to mirror Tasks quick stats -->
    </ProcurementHeader>

    <!-- Table -->
    <Card>
      <div v-if="fetchError" class="p-3">
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Unable to load payments</AlertTitle>
          <AlertDescription>{{ fetchError }}</AlertDescription>
        </Alert>
      </div>
      <CardContent class="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-[160px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('paymentNumber')">
                  Payment #
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
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
              <TableHead class="w-[140px] text-right">
                <button class="inline-flex items-center gap-1" @click="toggleSort('amount')">
                  Amount
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[140px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('paymentMethod')">
                  Method
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[140px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('status')">
                  Status
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[140px]">
                <button class="inline-flex items-center gap-1" @click="toggleSort('paymentDate')">
                  Date
                  <ArrowUpDown class="h-4 w-4" />
                </button>
              </TableHead>
              <TableHead class="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="p in sortedPayments" :key="p.paymentId">
              <TableCell>
                <div class="font-medium">{{ p.paymentNumber }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ invoiceNumberMap[p.invoiceId] || '-' }}</div>
              </TableCell>
              <TableCell>
                <div class="font-medium">{{ supplierNameMap[p.invoiceId] || '-' }}</div>
              </TableCell>
              <TableCell class="text-right">{{ currency(p.amount) }}</TableCell>
              <TableCell class="capitalize">{{ formatMethod(p.paymentMethod) }}</TableCell>
              <TableCell>
                <Badge :variant="statusVariant(p.status)">{{ p.status }}</Badge>
              </TableCell>
              <TableCell>{{ formatDate(p.paymentDate) }}</TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon"><MoreVertical class="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewPayment(p)">View</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <!-- Create Payment Dialog -->
    <Dialog v-model:open="showDialog">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment for an invoice.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div>
            <Label>Invoice</Label>
            <Select v-model="form.invoiceId">
              <SelectTrigger>
                <SelectValue placeholder="Select invoice" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Invoices</SelectLabel>
                  <SelectItem v-for="i in invoicesStore.invoices" :key="i.invoiceId" :value="i.invoiceId">
                    {{ i.invoiceNumber }} — {{ i.supplierName }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <Label>Amount</Label>
              <Input type="number" min="0" step="0.01" v-model.number="form.amount" />
            </div>
            <div>
              <Label>Method</Label>
              <Select v-model="form.paymentMethod">
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
          </div>
          <div>
            <Label>Date</Label>
            <Input type="date" v-model="form.paymentDateStr" />
          </div>
          <div>
            <Label>Notes</Label>
            <Textarea v-model="form.notes" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" @click="showDialog = false">Cancel</Button>
          <Button :disabled="creating" @click="create">
            <Loader2 v-if="creating" class="mr-2 h-4 w-4 animate-spin" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useInvoicesStore } from '@/modules/procurement/stores/invoices'
import type { Payment, PaymentMethod, CreatePaymentRequest } from '@/modules/procurement/types/invoices'

// UI
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectLabel, SelectGroup, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Plus, Loader2, ArrowUpDown, AlertCircle } from 'lucide-vue-next'
import ProcurementHeader from '@/modules/procurement/components/ProcurementHeader.vue'

const invoicesStore = useInvoicesStore()
const { payments } = storeToRefs(invoicesStore)

const search = ref('')
const statusFilter = ref<'all' | Payment['status']>('all')
const methodFilter = ref<'all' | PaymentMethod>('all')
const showDialog = ref(false)
const creating = ref(false)
const fetchError = ref<string | null>(null)

const form = ref<{ invoiceId: string | null; amount: number; paymentMethod: PaymentMethod | null; paymentDateStr: string; notes?: string }>({
  invoiceId: null,
  amount: 0,
  paymentMethod: null,
  paymentDateStr: ''
})

type SortField = 'paymentNumber' | 'invoiceNumber' | 'supplierName' | 'amount' | 'paymentMethod' | 'status' | 'paymentDate'
const sortField = ref<SortField>('paymentDate')
const sortDirection = ref<'asc' | 'desc'>('desc')

const filteredPayments = computed(() => {
  const q = search.value.toLowerCase()
  const status = statusFilter.value
  const method = methodFilter.value
  return payments.value.filter((p: Payment) => {
    const m = method === 'all' || p.paymentMethod === method
    const s = status === 'all' || p.status === status
    const t = !q || p.paymentNumber.toLowerCase().includes(q)
    return m && s && t
  })
})

const sortedPayments = computed(() => {
  const arr = [...filteredPayments.value]
  const dir = sortDirection.value === 'asc' ? 1 : -1
  return arr.sort((a, b) => {
    let av: any
    let bv: any
    switch (sortField.value) {
      case 'paymentNumber': av = a.paymentNumber || ''; bv = b.paymentNumber || ''; return av.localeCompare(bv) * dir
      case 'invoiceNumber': av = invoiceNumberMap.value[a.invoiceId] || ''; bv = invoiceNumberMap.value[b.invoiceId] || ''; return av.localeCompare(bv) * dir
      case 'supplierName': av = supplierNameMap.value[a.invoiceId] || ''; bv = supplierNameMap.value[b.invoiceId] || ''; return av.localeCompare(bv) * dir
      case 'amount': av = a.amount || 0; bv = b.amount || 0; return (av - bv) * dir
      case 'paymentMethod': av = a.paymentMethod || ''; bv = b.paymentMethod || ''; return String(av).localeCompare(String(bv)) * dir
      case 'status': av = a.status || ''; bv = b.status || ''; return String(av).localeCompare(String(bv)) * dir
      case 'paymentDate': av = a.paymentDate ? new Date(a.paymentDate).getTime() : 0; bv = b.paymentDate ? new Date(b.paymentDate).getTime() : 0; return (av - bv) * dir
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

// Maps for invoice number and supplier name (from current invoices list)
const invoiceNumberMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  invoicesStore.invoices.forEach(i => { map[i.invoiceId] = i.invoiceNumber })
  return map
})
const supplierNameMap = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  invoicesStore.invoices.forEach(i => { map[i.invoiceId] = i.supplierName })
  return map
})

function currency(n: number) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n || 0)
}
function formatDate(d?: Date) {
  if (!d) return '-'
  const iso = (typeof d === 'string' ? d : d.toISOString()).slice(0, 10)
  return iso
}
function statusVariant(s: Payment['status']) {
  switch (s) {
    case 'completed': return 'success'
    case 'failed': return 'destructive'
    case 'processing': return 'secondary'
    default: return 'default'
  }
}

function viewPayment(_p: Payment) {
  // placeholder for detail
}

function formatMethod(m: PaymentMethod) {
  return String(m).replace(/_/g, ' ')
}

function openCreatePayment() {
  form.value = { invoiceId: null, amount: 0, paymentMethod: 'bank_transfer', paymentDateStr: new Date().toISOString().slice(0,10) }
  showDialog.value = true
}

async function create() {
  if (!form.value.invoiceId || !form.value.paymentMethod || !form.value.paymentDateStr) return
  creating.value = true
  try {
    const payload: CreatePaymentRequest = {
      invoiceId: form.value.invoiceId,
      amount: form.value.amount,
      paymentMethod: form.value.paymentMethod,
      paymentDate: new Date(form.value.paymentDateStr),
      notes: form.value.notes
    }
    const id = await invoicesStore.createPayment(payload)
    if (id) {
      showDialog.value = false
    }
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  // Ensure invoices and payments are loaded to enrich table
  fetchError.value = null
  try {
    await invoicesStore.fetchInvoices()
    await invoicesStore.fetchPayments()
  } catch (err: any) {
    // Surface readable error
    fetchError.value = err?.message || String(err)
  }
})

// Coerce any empty/null values coming from Select to 'all'
watch(statusFilter, (val) => {
  if (!val) statusFilter.value = 'all'
})
watch(methodFilter, (val) => {
  if (!val) methodFilter.value = 'all'
})
</script>
