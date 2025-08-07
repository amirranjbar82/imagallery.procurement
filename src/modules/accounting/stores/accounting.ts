import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { 
  Account, 
  Transaction, 
  Invoice, 
  Payment, 
  BankAccount, 
  TaxRate, 
  FinancialSummary,
  AccountType,
  TransactionStatus,
  InvoiceStatus,
  PaymentStatus
} from '../types/accounting'

export const useAccountingStore = defineStore('accounting', () => {
  // State
  const accounts = ref<Account[]>([])
  const transactions = ref<Transaction[]>([])
  const invoices = ref<Invoice[]>([])
  const payments = ref<Payment[]>([])
  const bankAccounts = ref<BankAccount[]>([])
  const taxRates = ref<TaxRate[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const activeAccounts = computed(() => {
    return accounts.value.filter(account => account.isActive)
  })

  const getAccountsByType = computed(() => (type: AccountType) => {
    return accounts.value.filter(account => account.accountType === type && account.isActive)
  })

  const pendingTransactions = computed(() => {
    return transactions.value.filter(transaction => transaction.status === 'pending')
  })

  const outstandingInvoices = computed(() => {
    return invoices.value.filter(invoice => 
      invoice.status === 'sent' || invoice.status === 'partially_paid'
    )
  })

  const overdueInvoices = computed(() => {
    const today = new Date()
    return invoices.value.filter(invoice => 
      (invoice.status === 'sent' || invoice.status === 'partially_paid') &&
      new Date(invoice.dueDate) < today
    )
  })

  const activeBankAccounts = computed(() => {
    return bankAccounts.value.filter(account => account.isActive)
  })

  const totalCashBalance = computed(() => {
    return activeBankAccounts.value.reduce((total, account) => total + account.balance, 0)
  })

  const financialSummary = computed((): FinancialSummary => {
    const revenueAccounts = getAccountsByType.value('revenue')
    const expenseAccounts = getAccountsByType.value('expense')
    
    const totalRevenue = revenueAccounts.reduce((total, account) => total + account.balance, 0)
    const totalExpenses = expenseAccounts.reduce((total, account) => total + account.balance, 0)
    
    const accountsReceivable = invoices.value
      .filter(inv => inv.type === 'sales' && inv.remainingAmount > 0)
      .reduce((total, inv) => total + inv.remainingAmount, 0)
    
    const accountsPayable = invoices.value
      .filter(inv => inv.type === 'purchase' && inv.remainingAmount > 0)
      .reduce((total, inv) => total + inv.remainingAmount, 0)

    return {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
      accountsReceivable,
      accountsPayable,
      cashBalance: totalCashBalance.value,
      outstandingInvoices: outstandingInvoices.value.length,
      overdueInvoices: overdueInvoices.value.length
    }
  })

  // Actions
  async function fetchAccounts(filters?: { type?: AccountType; isActive?: boolean }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'accounts'), orderBy('accountNumber'))
      
      if (filters?.type) {
        q = query(q, where('accountType', '==', filters.type))
      }
      if (filters?.isActive !== undefined) {
        q = query(q, where('isActive', '==', filters.isActive))
      }
      
      const querySnapshot = await getDocs(q)
      accounts.value = querySnapshot.docs.map(doc => ({
        accountId: doc.id,
        ...doc.data()
      })) as Account[]
    } catch (err) {
      error.value = 'Failed to fetch accounts'
      console.error('Error fetching accounts:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchTransactions(filters?: { status?: TransactionStatus; accountId?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'transactions'), orderBy('date', 'desc'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      const querySnapshot = await getDocs(q)
      transactions.value = querySnapshot.docs.map(doc => ({
        transactionId: doc.id,
        ...doc.data()
      })) as Transaction[]
    } catch (err) {
      error.value = 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoices(filters?: { status?: InvoiceStatus; type?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'invoices'), orderBy('issueDate', 'desc'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.type) {
        q = query(q, where('type', '==', filters.type))
      }
      
      const querySnapshot = await getDocs(q)
      invoices.value = querySnapshot.docs.map(doc => ({
        invoiceId: doc.id,
        ...doc.data()
      })) as Invoice[]
    } catch (err) {
      error.value = 'Failed to fetch invoices'
      console.error('Error fetching invoices:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchPayments(filters?: { status?: PaymentStatus; invoiceId?: string }) {
    loading.value = true
    error.value = null
    try {
      let q = query(collection(db, 'payments'), orderBy('paymentDate', 'desc'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.invoiceId) {
        q = query(q, where('invoiceId', '==', filters.invoiceId))
      }
      
      const querySnapshot = await getDocs(q)
      payments.value = querySnapshot.docs.map(doc => ({
        paymentId: doc.id,
        ...doc.data()
      })) as Payment[]
    } catch (err) {
      error.value = 'Failed to fetch payments'
      console.error('Error fetching payments:', err)
    } finally {
      loading.value = false
    }
  }

  async function fetchBankAccounts() {
    loading.value = true
    error.value = null
    try {
      const q = query(collection(db, 'bankAccounts'), orderBy('accountName'))
      const querySnapshot = await getDocs(q)
      bankAccounts.value = querySnapshot.docs.map(doc => ({
        bankAccountId: doc.id,
        ...doc.data()
      })) as BankAccount[]
    } catch (err) {
      error.value = 'Failed to fetch bank accounts'
      console.error('Error fetching bank accounts:', err)
    } finally {
      loading.value = false
    }
  }

  async function createAccount(account: Omit<Account, 'accountId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'accounts'), {
        ...account,
        createdAt: now,
        updatedAt: now
      })
      
      const newAccount: Account = {
        accountId: docRef.id,
        ...account,
        createdAt: now,
        updatedAt: now
      }
      
      accounts.value.push(newAccount)
      return newAccount
    } catch (err) {
      error.value = 'Failed to create account'
      console.error('Error creating account:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createTransaction(transaction: Omit<Transaction, 'transactionId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'transactions'), {
        ...transaction,
        createdAt: now,
        updatedAt: now
      })
      
      const newTransaction: Transaction = {
        transactionId: docRef.id,
        ...transaction,
        createdAt: now,
        updatedAt: now
      }
      
      transactions.value.unshift(newTransaction)
      return newTransaction
    } catch (err) {
      error.value = 'Failed to create transaction'
      console.error('Error creating transaction:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(invoice: Omit<Invoice, 'invoiceId' | 'createdAt' | 'updatedAt'>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date()
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoice,
        createdAt: now,
        updatedAt: now
      })
      
      const newInvoice: Invoice = {
        invoiceId: docRef.id,
        ...invoice,
        createdAt: now,
        updatedAt: now
      }
      
      invoices.value.unshift(newInvoice)
      return newInvoice
    } catch (err) {
      error.value = 'Failed to create invoice'
      console.error('Error creating invoice:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus) {
    loading.value = true
    error.value = null
    try {
      const invoiceRef = doc(db, 'invoices', invoiceId)
      await updateDoc(invoiceRef, {
        status,
        updatedAt: new Date()
      })
      
      const index = invoices.value.findIndex(inv => inv.invoiceId === invoiceId)
      if (index !== -1) {
        invoices.value[index] = { 
          ...invoices.value[index], 
          status, 
          updatedAt: new Date() 
        }
      }
    } catch (err) {
      error.value = 'Failed to update invoice status'
      console.error('Error updating invoice status:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    accounts,
    transactions,
    invoices,
    payments,
    bankAccounts,
    taxRates,
    loading,
    error,
    
    // Getters
    activeAccounts,
    getAccountsByType,
    pendingTransactions,
    outstandingInvoices,
    overdueInvoices,
    activeBankAccounts,
    totalCashBalance,
    financialSummary,
    
    // Actions
    fetchAccounts,
    fetchTransactions,
    fetchInvoices,
    fetchPayments,
    fetchBankAccounts,
    createAccount,
    createTransaction,
    createInvoice,
    updateInvoiceStatus
  }
})
