<template>
  <div class="space-y-6">
    <!-- Header -->
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center justify-between">
          <span class="flex items-center gap-2">
            <BarChart3 class="w-5 h-5" />
            گزارش‌ها و آمار
          </span>
          <div class="flex gap-2">
            <Select v-model="selectedPeriod">
              <SelectTrigger class="w-32">
                <SelectValue placeholder="دوره" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">روزانه</SelectItem>
                <SelectItem value="weekly">هفتگی</SelectItem>
                <SelectItem value="monthly">ماهانه</SelectItem>
              </SelectContent>
            </Select>
            <Button @click="exportReport" variant="outline">
              <Download class="w-4 h-4 mr-2" />
              خروجی
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">کل سفارش‌ها</p>
              <p class="text-2xl font-bold text-blue-600">{{ kpis.totalOrders }}</p>
              <p class="text-xs text-gray-500">{{ selectedPeriod === 'daily' ? 'امروز' : selectedPeriod === 'weekly' ? 'این هفته' : 'این ماه' }}</p>
            </div>
            <Package class="w-8 h-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">تحویل موفق</p>
              <p class="text-2xl font-bold text-green-600">{{ kpis.successfulDeliveries }}</p>
              <p class="text-xs text-green-600">{{ kpis.successRate.toFixed(1) }}% نرخ موفقیت</p>
            </div>
            <CheckCircle class="w-8 h-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">به موقع</p>
              <p class="text-2xl font-bold text-purple-600">{{ kpis.onTimeDeliveries }}</p>
              <p class="text-xs text-purple-600">{{ kpis.onTimeRate.toFixed(1) }}% به موقع</p>
            </div>
            <Clock class="w-8 h-8 text-purple-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">بازگشت تیم</p>
              <p class="text-2xl font-bold text-orange-600">{{ kpis.revisitCount }}</p>
              <p class="text-xs text-orange-600">{{ kpis.revisitRate.toFixed(1) }}% نرخ بازگشت</p>
            </div>
            <RotateCcw class="w-8 h-8 text-orange-500" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Status Distribution -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">توزیع وضعیت سفارش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="status in statusDistribution" :key="status.name" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: status.color }"></div>
                <span class="text-sm">{{ status.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ status.count }}</span>
                <div class="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ 
                      width: status.percentage + '%', 
                      backgroundColor: status.color 
                    }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 w-8">{{ status.percentage }}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Service Type Distribution -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">توزیع نوع خدمات</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div v-for="service in serviceDistribution" :key="service.name" class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: service.color }"></div>
                <span class="text-sm">{{ service.label }}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm font-medium">{{ service.count }}</span>
                <div class="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300"
                    :style="{ 
                      width: service.percentage + '%', 
                      backgroundColor: service.color 
                    }"
                  ></div>
                </div>
                <span class="text-xs text-gray-500 w-8">{{ service.percentage }}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Performance Metrics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Team Performance -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">عملکرد تیم</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">میانگین سفارش روزانه</span>
              <span class="font-medium">{{ kpis.averageOrdersPerDay.toFixed(1) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">استفاده از ظرفیت</span>
              <span class="font-medium">{{ kpis.teamUtilization.toFixed(1) }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">میانگین تأخیر</span>
              <span class="font-medium">{{ kpis.averageDelay.toFixed(1) }} ساعت</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Issues Breakdown -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">تحلیل مشکلات</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">مشکلات پرداخت</span>
              <span class="font-medium text-red-600">{{ kpis.paymentIssues }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">مشکلات فنی</span>
              <span class="font-medium text-orange-600">{{ kpis.technicalIssues }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">مشکلات هماهنگی</span>
              <span class="font-medium text-yellow-600">{{ kpis.coordinationIssues }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">شکایات مشتری</span>
              <span class="font-medium text-purple-600">{{ kpis.customerComplaints }}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Weekly Capacity -->
      <Card>
        <CardHeader>
          <CardTitle class="text-base">ظرفیت هفتگی</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">سه‌شنبه</span>
              <div class="flex items-center gap-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div class="bg-blue-500 h-2 rounded-full" style="width: 80%"></div>
                </div>
                <span class="text-xs">4/5</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">پنج‌شنبه</span>
              <div class="flex items-center gap-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div class="bg-green-500 h-2 rounded-full" style="width: 60%"></div>
                </div>
                <span class="text-xs">3/5</span>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">شنبه</span>
              <div class="flex items-center gap-2">
                <div class="w-16 bg-gray-200 rounded-full h-2">
                  <div class="bg-purple-500 h-2 rounded-full" style="width: 100%"></div>
                </div>
                <span class="text-xs">5/5</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Orders Table -->
    <Card>
      <CardHeader>
        <CardTitle class="text-base">سفارش‌های اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b">
                <th class="text-right p-2">فاکتور</th>
                <th class="text-right p-2">مشتری</th>
                <th class="text-right p-2">نوع خدمات</th>
                <th class="text-right p-2">وضعیت</th>
                <th class="text-right p-2">تاریخ</th>
                <th class="text-right p-2">به موقع</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in recentOrders" :key="order.id" class="border-b hover:bg-gray-50">
                <td class="p-2 font-medium">{{ order.invoiceNo }}</td>
                <td class="p-2">{{ order.customerName }}</td>
                <td class="p-2">
                  <Badge :variant="getServiceTypeBadgeVariant(order.serviceType)" size="sm">
                    {{ getServiceTypeLabel(order.serviceType) }}
                  </Badge>
                </td>
                <td class="p-2">
                  <Badge :variant="getStatusBadgeVariant(order.status)" size="sm">
                    {{ getStatusLabel(order.status) }}
                  </Badge>
                </td>
                <td class="p-2">{{ formatDate(order.updatedAt) }}</td>
                <td class="p-2">
                  <div class="flex items-center">
                    <CheckCircle v-if="order.isOnTime" class="w-4 h-4 text-green-500" />
                    <XCircle v-else class="w-4 h-4 text-red-500" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  BarChart3, 
  Package, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Download,
  XCircle
} from 'lucide-vue-next'
import type { DeliveryOrder, DeliveryKPIs } from '@/shared/types/delivery-installation'

// Props
interface Props {
  orders: DeliveryOrder[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'generate-report': [type: string, params: any]
}>()

// State
const selectedPeriod = ref('weekly')

// Computed
const kpis = computed((): DeliveryKPIs => {
  const now = new Date()
  let startDate: Date
  let endDate = now

  switch (selectedPeriod.value) {
    case 'daily':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    case 'weekly':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case 'monthly':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  }

  const periodOrders = props.orders.filter(order => 
    order.createdAt >= startDate && order.createdAt <= endDate
  )

  const completedOrders = periodOrders.filter(order => order.status === 'completed')
  const onTimeOrders = completedOrders.filter(order => order.isOnTime)
  const revisitOrders = periodOrders.filter(order => order.requiresRevisit)

  return {
    period: selectedPeriod.value as any,
    startDate,
    endDate,
    totalOrders: periodOrders.length,
    successfulDeliveries: completedOrders.length,
    successRate: periodOrders.length > 0 ? (completedOrders.length / periodOrders.length) * 100 : 0,
    onTimeDeliveries: onTimeOrders.length,
    onTimeRate: completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length) * 100 : 0,
    averageDelay: 0.5, // Mock data
    revisitCount: revisitOrders.reduce((sum, order) => sum + order.revisitCount, 0),
    revisitRate: periodOrders.length > 0 ? (revisitOrders.length / periodOrders.length) * 100 : 0,
    customerComplaints: 2, // Mock data
    paymentIssues: periodOrders.filter(order => order.paymentStatus === 'failed').length,
    technicalIssues: 1, // Mock data
    coordinationIssues: 0, // Mock data
    teamUtilization: 75, // Mock data
    averageOrdersPerDay: periodOrders.length / (selectedPeriod.value === 'daily' ? 1 : selectedPeriod.value === 'weekly' ? 7 : 30)
  }
})

const statusDistribution = computed(() => {
  const statusCounts = props.orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = props.orders.length
  const colors = {
    'created': '#6B7280',
    'planned': '#3B82F6',
    'technical_check': '#F59E0B',
    'payment_pending': '#EF4444',
    'scheduled': '#8B5CF6',
    'ready': '#10B981',
    'in_progress': '#F97316',
    'completed': '#059669',
    'failed': '#DC2626',
    'rescheduled': '#6B7280'
  }

  const labels = {
    'created': 'ایجاد شده',
    'planned': 'برنامه‌ریزی شده',
    'technical_check': 'بررسی فنی',
    'payment_pending': 'انتظار پرداخت',
    'scheduled': 'زمان‌بندی شده',
    'ready': 'آماده',
    'in_progress': 'در حال اجرا',
    'completed': 'تکمیل شده',
    'failed': 'ناموفق',
    'rescheduled': 'تغییر برنامه'
  }

  return Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    label: labels[status as keyof typeof labels] || status,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[status as keyof typeof colors] || '#6B7280'
  }))
})

const serviceDistribution = computed(() => {
  const serviceCounts = props.orders.reduce((acc, order) => {
    acc[order.serviceType] = (acc[order.serviceType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const total = props.orders.length
  const colors = {
    'delivery_only': '#3B82F6',
    'installation_delivery': '#10B981',
    'uninstallation_delivery': '#F59E0B'
  }

  const labels = {
    'delivery_only': 'تحویل',
    'installation_delivery': 'نصب و تحویل',
    'uninstallation_delivery': 'جمع‌آوری و تحویل'
  }

  return Object.entries(serviceCounts).map(([service, count]) => ({
    name: service,
    label: labels[service as keyof typeof labels] || service,
    count,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    color: colors[service as keyof typeof colors] || '#6B7280'
  }))
})

const recentOrders = computed(() => {
  return props.orders
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)
})

// Methods
function getServiceTypeLabel(type: string) {
  const labels = {
    'delivery_only': 'تحویل',
    'installation_delivery': 'نصب و تحویل',
    'uninstallation_delivery': 'جمع‌آوری و تحویل'
  }
  return labels[type as keyof typeof labels] || type
}

function getServiceTypeBadgeVariant(type: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'delivery_only': 'info' as const,
    'installation_delivery': 'success' as const,
    'uninstallation_delivery': 'warning' as const
  }
  return variants[type as keyof typeof variants] || 'default'
}

function getStatusLabel(status: string) {
  const labels = {
    'created': 'ایجاد شده',
    'planned': 'برنامه‌ریزی شده',
    'technical_check': 'بررسی فنی',
    'payment_pending': 'انتظار پرداخت',
    'scheduled': 'زمان‌بندی شده',
    'ready': 'آماده',
    'in_progress': 'در حال اجرا',
    'completed': 'تکمیل شده',
    'failed': 'ناموفق',
    'rescheduled': 'تغییر برنامه'
  }
  return labels[status as keyof typeof labels] || status
}

function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'outline' | 'destructive' | 'success' | 'warning' | 'info' | 'critical' | 'low' {
  const variants = {
    'created': 'secondary' as const,
    'planned': 'default' as const,
    'technical_check': 'outline' as const,
    'payment_pending': 'destructive' as const,
    'scheduled': 'default' as const,
    'ready': 'success' as const,
    'in_progress': 'warning' as const,
    'completed': 'success' as const,
    'failed': 'destructive' as const,
    'rescheduled': 'outline' as const
  }
  return variants[status as keyof typeof variants] || 'default'
}

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function exportReport() {
  const reportData = {
    period: selectedPeriod.value,
    kpis: kpis.value,
    statusDistribution: statusDistribution.value,
    serviceDistribution: serviceDistribution.value,
    recentOrders: recentOrders.value
  }
  
  emit('generate-report', 'comprehensive', reportData)
  
  // Create and download CSV
  let csv = 'نوع گزارش,مقدار\n'
  csv += `کل سفارش‌ها,${kpis.value.totalOrders}\n`
  csv += `تحویل موفق,${kpis.value.successfulDeliveries}\n`
  csv += `نرخ موفقیت,${kpis.value.successRate.toFixed(1)}%\n`
  csv += `تحویل به موقع,${kpis.value.onTimeDeliveries}\n`
  csv += `نرخ به موقع,${kpis.value.onTimeRate.toFixed(1)}%\n`
  csv += `تعداد بازگشت,${kpis.value.revisitCount}\n`
  csv += `نرخ بازگشت,${kpis.value.revisitRate.toFixed(1)}%\n`
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `delivery-report-${selectedPeriod.value}-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>
