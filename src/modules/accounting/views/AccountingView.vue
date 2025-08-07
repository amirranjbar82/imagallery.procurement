<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Accounting</h1>
        <p class="text-gray-600 mt-1">Manage your financial accounts and transactions</p>
      </div>
      <div class="flex space-x-2">
        <Button @click="showCreateTransactionDialog = true">
          <Plus class="h-4 w-4 mr-2" />
          New Transaction
        </Button>
        <Button @click="showCreateInvoiceDialog = true" variant="outline">
          <FileText class="h-4 w-4 mr-2" />
          New Invoice
        </Button>
      </div>
    </div>

    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <TrendingUp class="h-6 w-6 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Revenue</p>
            <p class="text-2xl font-bold text-gray-900">${{ financialSummary.totalRevenue.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-red-100 rounded-lg">
            <TrendingDown class="h-6 w-6 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Total Expenses</p>
            <p class="text-2xl font-bold text-gray-900">${{ financialSummary.totalExpenses.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <DollarSign class="h-6 w-6 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Net Income</p>
            <p class="text-2xl font-bold text-gray-900">${{ financialSummary.netIncome.toLocaleString() }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Wallet class="h-6 w-6 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Cash Balance</p>
            <p class="text-2xl font-bold text-gray-900">${{ financialSummary.cashBalance.toLocaleString() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Accounts Receivable</p>
            <p class="text-xl font-bold text-gray-900">${{ financialSummary.accountsReceivable.toLocaleString() }}</p>
          </div>
          <Receipt class="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Accounts Payable</p>
            <p class="text-xl font-bold text-gray-900">${{ financialSummary.accountsPayable.toLocaleString() }}</p>
          </div>
          <CreditCard class="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Outstanding Invoices</p>
            <p class="text-xl font-bold text-gray-900">{{ financialSummary.outstandingInvoices }}</p>
          </div>
          <FileText class="h-8 w-8 text-gray-400" />
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Overdue Invoices</p>
            <p class="text-xl font-bold text-red-600">{{ financialSummary.overdueInvoices }}</p>
          </div>
          <AlertTriangle class="h-8 w-8 text-red-400" />
        </div>
      </div>
    </div>

    <!-- Tabs for different sections -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <component :is="tab.icon" class="h-5 w-5 mr-2 inline" />
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <div class="p-6">
        <!-- Accounts Tab -->
        <div v-if="activeTab === 'accounts'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Chart of Accounts</h3>
            <Button @click="showCreateAccountDialog = true" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="account in activeAccounts" :key="account.accountId" class="hover:bg-gray-50">
                  <td class="px-4 py-4">
                    <div>
                      <div class="font-medium text-gray-900">{{ account.accountName }}</div>
                      <div class="text-sm text-gray-500">{{ account.accountNumber }}</div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <Badge :variant="getAccountTypeBadgeVariant(account.accountType)">
                      {{ account.accountType }}
                    </Badge>
                  </td>
                  <td class="px-4 py-4 font-medium">${{ account.balance.toLocaleString() }}</td>
                  <td class="px-4 py-4">
                    <Badge :variant="account.isActive ? 'default' : 'secondary'">
                      {{ account.isActive ? 'Active' : 'Inactive' }}
                    </Badge>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye class="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Transactions Tab -->
        <div v-if="activeTab === 'transactions'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <Button @click="showCreateTransactionDialog = true" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              New Transaction
            </Button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="transaction in transactions.slice(0, 10)" :key="transaction.transactionId" class="hover:bg-gray-50">
                  <td class="px-4 py-4 text-sm">{{ new Date(transaction.date).toLocaleDateString() }}</td>
                  <td class="px-4 py-4">
                    <div>
                      <div class="font-medium text-gray-900">{{ transaction.description }}</div>
                      <div class="text-sm text-gray-500">{{ transaction.transactionNumber }}</div>
                    </div>
                  </td>
                  <td class="px-4 py-4 font-medium">${{ transaction.totalAmount.toLocaleString() }}</td>
                  <td class="px-4 py-4">
                    <Badge :variant="getTransactionStatusBadgeVariant(transaction.status)">
                      {{ transaction.status }}
                    </Badge>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye class="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Invoices Tab -->
        <div v-if="activeTab === 'invoices'">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Invoices</h3>
            <Button @click="showCreateInvoiceDialog = true" size="sm">
              <Plus class="h-4 w-4 mr-2" />
              New Invoice
            </Button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="invoice in invoices.slice(0, 10)" :key="invoice.invoiceId" class="hover:bg-gray-50">
                  <td class="px-4 py-4 font-medium">{{ invoice.invoiceNumber }}</td>
                  <td class="px-4 py-4">
                    <Badge :variant="getInvoiceTypeBadgeVariant(invoice.type)">
                      {{ invoice.type }}
                    </Badge>
                  </td>
                  <td class="px-4 py-4 text-sm">{{ new Date(invoice.issueDate).toLocaleDateString() }}</td>
                  <td class="px-4 py-4 font-medium">${{ invoice.totalAmount.toLocaleString() }}</td>
                  <td class="px-4 py-4">
                    <Badge :variant="getInvoiceStatusBadgeVariant(invoice.status)">
                      {{ invoice.status }}
                    </Badge>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit class="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye class="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Wallet,
  Receipt,
  CreditCard,
  AlertTriangle,
  Edit,
  Eye,
  Building2,
  ArrowUpDown,

} from 'lucide-vue-next'
import { useAccountingStore } from '../stores/accounting'
import { storeToRefs } from 'pinia'
import type { AccountType, TransactionStatus, InvoiceStatus } from '../types/accounting'

const accountingStore = useAccountingStore()
const { 
  activeAccounts, 
  transactions, 
  invoices, 
  financialSummary
} = storeToRefs(accountingStore)

// Local state
const activeTab = ref('accounts')
const showCreateAccountDialog = ref(false)
const showCreateTransactionDialog = ref(false)
const showCreateInvoiceDialog = ref(false)

// Tab configuration
const tabs = [
  { id: 'accounts', name: 'Accounts', icon: Building2 },
  { id: 'transactions', name: 'Transactions', icon: ArrowUpDown },
  { id: 'invoices', name: 'Invoices', icon: FileText },
]

// Methods
function getAccountTypeBadgeVariant(type: AccountType) {
  switch (type) {
    case 'asset': return 'default'
    case 'liability': return 'destructive'
    case 'equity': return 'secondary'
    case 'revenue': return 'default'
    case 'expense': return 'outline'
    default: return 'secondary'
  }
}

function getTransactionStatusBadgeVariant(status: TransactionStatus) {
  switch (status) {
    case 'posted': return 'default'
    case 'approved': return 'default'
    case 'pending': return 'outline'
    case 'draft': return 'secondary'
    case 'rejected': return 'destructive'
    default: return 'secondary'
  }
}

function getInvoiceTypeBadgeVariant(type: string) {
  switch (type) {
    case 'sales': return 'default'
    case 'purchase': return 'outline'
    case 'credit_note': return 'secondary'
    case 'debit_note': return 'secondary'
    default: return 'secondary'
  }
}

function getInvoiceStatusBadgeVariant(status: InvoiceStatus) {
  switch (status) {
    case 'paid': return 'default'
    case 'sent': return 'outline'
    case 'partially_paid': return 'outline'
    case 'overdue': return 'destructive'
    case 'cancelled': return 'secondary'
    case 'draft': return 'secondary'
    default: return 'secondary'
  }
}

// Initialize
onMounted(() => {
  accountingStore.fetchAccounts()
  accountingStore.fetchTransactions()
  accountingStore.fetchInvoices()
  accountingStore.fetchBankAccounts()
})
</script>
