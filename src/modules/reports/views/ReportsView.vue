<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p class="text-gray-600">Generate insights and reports across all business modules</p>
      </div>
      <div class="flex space-x-2">
        <Button variant="outline" @click="showCreateTemplate = true">
          <FileText class="w-4 h-4 mr-2" />
          New Template
        </Button>
        <Button @click="showCreateReport = true">
          <Plus class="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <BarChart3 class="h-8 w-8 text-blue-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Reports</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalReports }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <Clock class="h-8 w-8 text-orange-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Scheduled</p>
              <p class="text-2xl font-bold text-gray-900">{{ scheduledReports.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <TrendingUp class="h-8 w-8 text-green-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">This Month</p>
              <p class="text-2xl font-bold text-gray-900">{{ monthlyReports.length }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent class="pt-4">
          <div class="flex items-center">
            <Users class="h-8 w-8 text-purple-600" />
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Templates</p>
              <p class="text-2xl font-bold text-gray-900">{{ totalTemplates }}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Report Categories -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('procurement')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <ShoppingCart class="h-8 w-8 text-blue-600" />
            <h3 class="ml-3 text-lg font-semibold">Procurement Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">Supplier performance, spend analysis, order tracking</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">SOA</Badge>
            <Badge variant="secondary">Spend Analysis</Badge>
            <Badge variant="secondary">Supplier KPIs</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('sales')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <DollarSign class="h-8 w-8 text-green-600" />
            <h3 class="ml-3 text-lg font-semibold">Sales Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">Customer analytics, sales performance, revenue tracking</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">Revenue</Badge>
            <Badge variant="secondary">Customer Analysis</Badge>
            <Badge variant="secondary">Sales Pipeline</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('inventory')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <Package class="h-8 w-8 text-orange-600" />
            <h3 class="ml-3 text-lg font-semibold">Inventory Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">Stock levels, movement tracking, valuation</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">Stock Levels</Badge>
            <Badge variant="secondary">Movements</Badge>
            <Badge variant="secondary">Valuation</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('tasks')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <CheckSquare class="h-8 w-8 text-purple-600" />
            <h3 class="ml-3 text-lg font-semibold">Project Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">Task completion, project status, resource utilization</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">Progress</Badge>
            <Badge variant="secondary">Resources</Badge>
            <Badge variant="secondary">Timeline</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('financial')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <Calculator class="h-8 w-8 text-red-600" />
            <h3 class="ml-3 text-lg font-semibold">Financial Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">P&L, budget vs actual, cost analysis</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">P&L</Badge>
            <Badge variant="secondary">Budget</Badge>
            <Badge variant="secondary">Cost Analysis</Badge>
          </div>
        </CardContent>
      </Card>

      <Card class="cursor-pointer hover:shadow-lg transition-shadow" @click="handleCategoryClick('custom')">
        <CardContent class="pt-6">
          <div class="flex items-center mb-4">
            <Settings class="h-8 w-8 text-gray-600" />
            <h3 class="ml-3 text-lg font-semibold">Custom Reports</h3>
          </div>
          <p class="text-gray-600 mb-4">Build your own reports with custom data and filters</p>
          <div class="flex space-x-2">
            <Badge variant="secondary">Custom Fields</Badge>
            <Badge variant="secondary">Advanced Filters</Badge>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Recent Reports -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Recent Reports</h2>
          <div class="flex space-x-2">
            <Select v-model="statusFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="generating">Generating</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select v-model="typeFilter">
              <SelectTrigger class="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="soa">SOA</SelectItem>
                <SelectItem value="spend-analysis">Spend Analysis</SelectItem>
                <SelectItem value="inventory">Inventory</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div v-if="loading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
        <div v-else>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="report in filteredReports" :key="report.reportId">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <FileText class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div class="text-sm font-medium text-gray-900">{{ report.title }}</div>
                        <div class="text-sm text-gray-500">{{ report.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ report.type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ new Date(report.generatedAt).toLocaleDateString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge :variant="getStatusVariant(report.status)">
                      {{ report.status }}
                    </Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button variant="outline" size="sm" class="mr-2" @click="handleReportView(report)">
                      View
                    </Button>
                    <Button variant="outline" size="sm" v-if="report.status === 'completed'" @click="handleReportDownload(report)">
                      Download
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="filteredReports.length === 0" class="text-center py-8">
            <BarChart3 class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
            <p class="mt-1 text-sm text-gray-500">Generate your first report to get started.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  Plus, FileText, BarChart3, Clock, TrendingUp, Users, 
  ShoppingCart, DollarSign, Package, CheckSquare, Calculator, Settings 
} from 'lucide-vue-next'
import type { Report } from '../types/reports'

// Components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

// State
const statusFilter = ref('')
const typeFilter = ref('')
const showCreateReport = ref(false)
const showCreateTemplate = ref(false)
const loading = ref(false)

// Mock data for now - will be replaced with store
const reports = ref<Report[]>([])
const templates = ref([])

// Computed
const filteredReports = computed(() => {
  let filtered = reports.value

  if (statusFilter.value) {
    filtered = filtered.filter(report => report.status === statusFilter.value)
  }

  if (typeFilter.value) {
    filtered = filtered.filter(report => report.type === typeFilter.value)
  }

  return filtered.slice(0, 20) // Show recent 20
})

const totalReports = computed(() => reports.value.length)
const totalTemplates = computed(() => templates.value.length)
const scheduledReports = computed(() => reports.value.filter(r => r.schedule !== undefined))
const monthlyReports = computed(() => {
  const now = new Date()
  return reports.value.filter(report => {
    const reportDate = new Date(report.generatedAt)
    return reportDate.getMonth() === now.getMonth() && 
           reportDate.getFullYear() === now.getFullYear()
  })
})

// Methods
function getStatusVariant(status: string) {
  switch (status) {
    case 'completed': return 'default'
    case 'generating': return 'default'
    case 'failed': return 'destructive'
    case 'scheduled': return 'secondary'
    default: return 'secondary'
  }
}

function handleCategoryClick(category: string) {
  console.log('Category clicked:', category)
  // Navigate to category-specific report generation
}

function handleReportView(report: Report) {
  console.log('View report:', report)
}

function handleReportDownload(report: Report) {
  console.log('Download report:', report)
}

// Lifecycle
onMounted(() => {
  // Load reports from store when implemented
  console.log('ReportsView mounted')
})
</script>
