<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Delivery & Installation Management</h1>
        <p class="text-gray-600 mt-1">Manage delivery and installation processes</p>
      </div>
      <div class="flex gap-3">
        <Button @click="showCreateOrderDialog = true" class="bg-blue-600 hover:bg-blue-700">
          <Plus class="w-4 h-4 mr-2" />
          New Order
        </Button>
        <Button variant="outline" @click="refreshData">
          <RefreshCw class="w-4 h-4 mr-2" :class="{ 'animate-spin': loading }" />
          Refresh
        </Button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Today's Orders</p>
              <p class="text-2xl font-bold text-blue-600">{{ todayOrders.length }}</p>
            </div>
            <Calendar class="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Pending Planning</p>
              <p class="text-2xl font-bold text-orange-600">{{ pendingOrders.length }}</p>
            </div>
            <Clock class="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Scheduled</p>
              <p class="text-2xl font-bold text-green-600">{{ scheduledOrders.length }}</p>
            </div>
            <CheckCircle class="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Completed Orders</p>
              <p class="text-2xl font-bold text-purple-600">{{ completedOrders.length }}</p>
            </div>
            <Package class="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Main Content Tabs -->
    <Tabs default-value="scheduling" class="w-full">
      <TabsList class="grid w-full grid-cols-3">
        <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
        <TabsTrigger value="daily-programs">Daily Programs</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>

      <!-- Scheduling Tab -->
      <TabsContent value="scheduling">
        <SchedulingCalendar 
          :orders="orders"
          :weekly-overview="currentWeekOverview"
          @schedule-order="scheduleOrder"
          @create-weekly-overview="createWeeklyOverview"
        />
      </TabsContent>

      <!-- Daily Programs Tab -->
      <TabsContent value="daily-programs">
        <DailyProgramManager 
          :programs="dailyPrograms"
          :orders="scheduledOrders"
          @publish-program="publishDailyProgram"
        />
      </TabsContent>

      <!-- Reports Tab -->
      <TabsContent value="reports">
        <ReportsView 
          :orders="orders"
          @generate-report="generateReport"
        />
      </TabsContent>
    </Tabs>

    <!-- Create Order Dialog -->
    <CreateOrderDialog 
      v-model:open="showCreateOrderDialog"
      @order-created="handleOrderCreated"
    />

    <!-- Order Details Dialog -->
    <OrderDetailsDialog 
      v-model:open="showOrderDetailsDialog"
      :order="selectedOrder"
    />

    <!-- Technical Checklist Dialog -->
    <TechnicalChecklistForm 
      v-model:open="showTechnicalChecklistDialog"
      :order="selectedOrder"
      @checklist-completed="handleChecklistCompleted"
    />

    <!-- Payment Confirmation Dialog -->
    <PaymentConfirmationDialog 
      v-model:open="showPaymentConfirmationDialog"
      :order="selectedOrder"
      @payment-confirmed="handlePaymentConfirmed"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDeliveryInstallationStore } from '../stores/delivery-installation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  RefreshCw, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Package
} from 'lucide-vue-next'
import type { DeliveryOrder } from '@/shared/types/delivery-installation'

// Components
import SchedulingCalendar from '../components/SchedulingCalendar.vue'
import DailyProgramManager from '../components/DailyProgramManager.vue'
import ReportsView from '../components/ReportsView.vue'
import CreateOrderDialog from '../components/CreateOrderDialog.vue'
import OrderDetailsDialog from '../components/OrderDetailsDialog.vue'
import TechnicalChecklistForm from '../components/TechnicalChecklistForm.vue'
import PaymentConfirmationDialog from '../components/PaymentConfirmationDialog.vue'

// Store
const deliveryStore = useDeliveryInstallationStore()

// State
const showCreateOrderDialog = ref(false)
const showOrderDetailsDialog = ref(false)
const showTechnicalChecklistDialog = ref(false)
const showPaymentConfirmationDialog = ref(false)
const selectedOrder = ref<DeliveryOrder | null>(null)

// Computed
const { 
  orders, 
  dailyPrograms, 
  todayOrders, 
  pendingOrders, 
  scheduledOrders, 
  completedOrders,
  currentWeekOverview,
  loading 
} = deliveryStore

// Methods
async function refreshData() {
  await deliveryStore.fetchOrders()
}

async function createWeeklyOverview() {
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1))
  await deliveryStore.createWeeklyOverview(startOfWeek)
}

async function scheduleOrder(orderId: string, date: Date, timeSlot: string) {
  await deliveryStore.scheduleOrder(orderId, date, timeSlot)
}

async function publishDailyProgram(date: Date, orderIds: string[]) {
  await deliveryStore.publishDailyProgram(date, orderIds)
}

function handleOrderCreated() {
  showCreateOrderDialog.value = false
  refreshData()
}

function handleChecklistCompleted(_orderId: string) {
  showTechnicalChecklistDialog.value = false
  selectedOrder.value = null
  refreshData()
}

function handlePaymentConfirmed(_orderId: string) {
  showPaymentConfirmationDialog.value = false
  selectedOrder.value = null
  refreshData()
}

function generateReport(type: string, params: any) {
  console.log('Generate report:', type, params)
}

// Lifecycle
onMounted(() => {
  deliveryStore.initializeSampleData()
})
</script>
