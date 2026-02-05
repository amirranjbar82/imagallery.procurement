<template>
  <Card>
    <CardHeader>
      <CardTitle class="flex items-center justify-between">
        <span class="flex items-center gap-2">
          <Calendar class="w-5 h-5" />
          مدیریت نمای هفتگی
        </span>
        <Button @click="createNewWeeklyOverview">
          <Plus class="w-4 h-4 mr-2" />
          هفته جدید
        </Button>
      </CardTitle>
    </CardHeader>
    <CardContent class="space-y-6">
      <!-- Week Selection -->
      <div class="flex gap-4 items-center">
        <div>
          <Label>انتخاب هفته</Label>
          <Input
            type="week"
            v-model="selectedWeek"
            class="w-40"
          />
        </div>
        <div>
          <Label>بازه هفته</Label>
          <p class="text-sm text-gray-600">{{ getWeekRange() }}</p>
        </div>
      </div>

      <!-- Current Week Overview -->
      <div v-if="currentOverview">
        <h3 class="text-lg font-medium mb-4">نمای کلی هفته جاری</h3>
        
        <!-- Capacity Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <!-- Tuesday -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-base flex items-center justify-between">
                سه‌شنبه
                <Badge variant="outline">{{ getTuesdayDate() }}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm">ظرفیت:</span>
                  <div class="flex items-center gap-2">
                    <Input
                      type="number"
                      v-model.number="currentOverview.tuesdayCapacity"
                      class="w-16 h-8 text-center"
                      min="0"
                      max="10"
                    />
                    <span class="text-sm text-gray-500">سفارش</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">برنامه‌ریزی شده:</span>
                  <span class="font-medium text-blue-600">
                    {{ currentOverview.scheduledOrders.tuesday.length }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: getTuesdayUtilization() + '%' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 text-center">
                  {{ getTuesdayUtilization() }}% استفاده
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Thursday -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-base flex items-center justify-between">
                پنج‌شنبه
                <Badge variant="outline">{{ getThursdayDate() }}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm">ظرفیت:</span>
                  <div class="flex items-center gap-2">
                    <Input
                      type="number"
                      v-model.number="currentOverview.thursdayCapacity"
                      class="w-16 h-8 text-center"
                      min="0"
                      max="10"
                    />
                    <span class="text-sm text-gray-500">سفارش</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">برنامه‌ریزی شده:</span>
                  <span class="font-medium text-green-600">
                    {{ currentOverview.scheduledOrders.thursday.length }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-green-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: getThursdayUtilization() + '%' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 text-center">
                  {{ getThursdayUtilization() }}% استفاده
                </p>
              </div>
            </CardContent>
          </Card>

          <!-- Saturday -->
          <Card>
            <CardHeader class="pb-3">
              <CardTitle class="text-base flex items-center justify-between">
                شنبه
                <Badge variant="outline">{{ getSaturdayDate() }}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm">ظرفیت:</span>
                  <div class="flex items-center gap-2">
                    <Input
                      type="number"
                      v-model.number="currentOverview.saturdayCapacity"
                      class="w-16 h-8 text-center"
                      min="0"
                      max="10"
                    />
                    <span class="text-sm text-gray-500">سفارش</span>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm">برنامه‌ریزی شده:</span>
                  <span class="font-medium text-purple-600">
                    {{ currentOverview.scheduledOrders.saturday.length }}
                  </span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    :style="{ width: getSaturdayUtilization() + '%' }"
                  ></div>
                </div>
                <p class="text-xs text-gray-500 text-center">
                  {{ getSaturdayUtilization() }}% استفاده
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Buffer Days -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">روزهای پشتیبان (Buffer Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="text-center p-3 bg-blue-50 rounded-lg">
                <p class="text-sm font-medium text-blue-800">چهارشنبه</p>
                <p class="text-xs text-blue-600">پشتیبان سه‌شنبه</p>
                <p class="text-lg font-bold text-blue-600">
                  {{ currentOverview.bufferDays.wednesday.length }}
                </p>
              </div>
              <div class="text-center p-3 bg-green-50 rounded-lg">
                <p class="text-sm font-medium text-green-800">جمعه</p>
                <p class="text-xs text-green-600">پشتیبان پنج‌شنبه</p>
                <p class="text-lg font-bold text-green-600">
                  {{ currentOverview.bufferDays.friday.length }}
                </p>
              </div>
              <div class="text-center p-3 bg-purple-50 rounded-lg">
                <p class="text-sm font-medium text-purple-800">یکشنبه</p>
                <p class="text-xs text-purple-600">پشتیبان شنبه</p>
                <p class="text-lg font-bold text-purple-600">
                  {{ currentOverview.bufferDays.sunday.length }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Weekly Statistics -->
        <Card>
          <CardHeader>
            <CardTitle class="text-base">آمار هفتگی</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="text-center">
                <p class="text-2xl font-bold text-blue-600">{{ getTotalCapacity() }}</p>
                <p class="text-sm text-gray-600">کل ظرفیت</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-green-600">{{ getTotalScheduled() }}</p>
                <p class="text-sm text-gray-600">برنامه‌ریزی شده</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-orange-600">{{ getAvailableCapacity() }}</p>
                <p class="text-sm text-gray-600">ظرفیت آزاد</p>
              </div>
              <div class="text-center">
                <p class="text-2xl font-bold text-purple-600">{{ getOverallUtilization() }}%</p>
                <p class="text-sm text-gray-600">استفاده کلی</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Action Buttons -->
        <div class="flex gap-3">
          <Button @click="saveChanges" :disabled="!hasChanges" class="bg-green-600 hover:bg-green-700">
            <Save class="w-4 h-4 mr-2" />
            ذخیره تغییرات
          </Button>
          <Button variant="outline" @click="resetChanges" :disabled="!hasChanges">
            <RotateCcw class="w-4 h-4 mr-2" />
            بازگردانی
          </Button>
          <Button variant="outline" @click="exportWeeklyPlan">
            <Download class="w-4 h-4 mr-2" />
            خروجی برنامه
          </Button>
        </div>
      </div>

      <!-- No Overview State -->
      <div v-else class="text-center py-8 text-gray-500">
        <Calendar class="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>نمای هفتگی برای این هفته ایجاد نشده</p>
        <Button @click="createWeeklyOverview" class="mt-3">
          ایجاد نمای هفتگی
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDeliveryInstallationStore } from '../stores/delivery-installation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  Plus, 
  Save, 
  RotateCcw, 
  Download 
} from 'lucide-vue-next'
import type { WeeklyOverview } from '@/shared/types/delivery-installation'

// Store
const deliveryStore = useDeliveryInstallationStore()

// State
const selectedWeek = ref(getCurrentWeek())
const originalOverview = ref<WeeklyOverview | null>(null)

// Computed
const currentOverview = computed(() => {
  const weekStart = getWeekStartDate(selectedWeek.value)
  return deliveryStore.weeklyOverviews.find(overview => 
    new Date(overview.weekStart).toDateString() === weekStart.toDateString()
  )
})

const hasChanges = computed(() => {
  if (!currentOverview.value || !originalOverview.value) return false
  
  return (
    currentOverview.value.tuesdayCapacity !== originalOverview.value.tuesdayCapacity ||
    currentOverview.value.thursdayCapacity !== originalOverview.value.thursdayCapacity ||
    currentOverview.value.saturdayCapacity !== originalOverview.value.saturdayCapacity
  )
})

// Methods
function getCurrentWeek(): string {
  const now = new Date()
  const year = now.getFullYear()
  const week = getWeekNumber(now)
  return `${year}-W${week.toString().padStart(2, '0')}`
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

function getWeekStartDate(weekString: string): Date {
  const [year, week] = weekString.split('-W')
  const simple = new Date(parseInt(year), 0, 1 + (parseInt(week) - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  }
  return ISOweekStart
}

function getWeekRange(): string {
  const weekStart = getWeekStartDate(selectedWeek.value)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  
  return `${weekStart.toLocaleDateString('fa-IR')} - ${weekEnd.toLocaleDateString('fa-IR')}`
}

function getTuesdayDate(): string {
  const weekStart = getWeekStartDate(selectedWeek.value)
  const tuesday = new Date(weekStart)
  tuesday.setDate(weekStart.getDate() + 1) // Tuesday is day 2 of week
  return tuesday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getThursdayDate(): string {
  const weekStart = getWeekStartDate(selectedWeek.value)
  const thursday = new Date(weekStart)
  thursday.setDate(weekStart.getDate() + 3) // Thursday is day 4 of week
  return thursday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getSaturdayDate(): string {
  const weekStart = getWeekStartDate(selectedWeek.value)
  const saturday = new Date(weekStart)
  saturday.setDate(weekStart.getDate() + 5) // Saturday is day 6 of week
  return saturday.toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })
}

function getTuesdayUtilization(): number {
  if (!currentOverview.value || currentOverview.value.tuesdayCapacity === 0) return 0
  return Math.round((currentOverview.value.scheduledOrders.tuesday.length / currentOverview.value.tuesdayCapacity) * 100)
}

function getThursdayUtilization(): number {
  if (!currentOverview.value || currentOverview.value.thursdayCapacity === 0) return 0
  return Math.round((currentOverview.value.scheduledOrders.thursday.length / currentOverview.value.thursdayCapacity) * 100)
}

function getSaturdayUtilization(): number {
  if (!currentOverview.value || currentOverview.value.saturdayCapacity === 0) return 0
  return Math.round((currentOverview.value.scheduledOrders.saturday.length / currentOverview.value.saturdayCapacity) * 100)
}

function getTotalCapacity(): number {
  if (!currentOverview.value) return 0
  return currentOverview.value.tuesdayCapacity + currentOverview.value.thursdayCapacity + currentOverview.value.saturdayCapacity
}

function getTotalScheduled(): number {
  if (!currentOverview.value) return 0
  return (
    currentOverview.value.scheduledOrders.tuesday.length +
    currentOverview.value.scheduledOrders.thursday.length +
    currentOverview.value.scheduledOrders.saturday.length
  )
}

function getAvailableCapacity(): number {
  return getTotalCapacity() - getTotalScheduled()
}

function getOverallUtilization(): number {
  const total = getTotalCapacity()
  if (total === 0) return 0
  return Math.round((getTotalScheduled() / total) * 100)
}

async function createWeeklyOverview() {
  const weekStart = getWeekStartDate(selectedWeek.value)
  await deliveryStore.createWeeklyOverview(weekStart)
}

async function createNewWeeklyOverview() {
  selectedWeek.value = getCurrentWeek()
  await createWeeklyOverview()
}

function saveChanges() {
  if (currentOverview.value) {
    // TODO: Save changes to store/Firebase
    originalOverview.value = { ...currentOverview.value }
    console.log('Weekly overview changes saved')
  }
}

function resetChanges() {
  if (originalOverview.value && currentOverview.value) {
    currentOverview.value.tuesdayCapacity = originalOverview.value.tuesdayCapacity
    currentOverview.value.thursdayCapacity = originalOverview.value.thursdayCapacity
    currentOverview.value.saturdayCapacity = originalOverview.value.saturdayCapacity
  }
}

function exportWeeklyPlan() {
  if (!currentOverview.value) return
  
  const weekRange = getWeekRange()
  let content = `نمای هفتگی تحویل و نصب\n${weekRange}\n\n`
  
  content += `ظرفیت‌ها:\n`
  content += `سه‌شنبه: ${currentOverview.value.tuesdayCapacity} سفارش\n`
  content += `پنج‌شنبه: ${currentOverview.value.thursdayCapacity} سفارش\n`
  content += `شنبه: ${currentOverview.value.saturdayCapacity} سفارش\n\n`
  
  content += `برنامه‌ریزی شده:\n`
  content += `سه‌شنبه: ${currentOverview.value.scheduledOrders.tuesday.length} سفارش\n`
  content += `پنج‌شنبه: ${currentOverview.value.scheduledOrders.thursday.length} سفارش\n`
  content += `شنبه: ${currentOverview.value.scheduledOrders.saturday.length} سفارش\n\n`
  
  content += `استفاده کلی: ${getOverallUtilization()}%\n`
  content += `ظرفیت آزاد: ${getAvailableCapacity()} سفارش`
  
  // Create and download file
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `weekly-overview-${selectedWeek.value}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Watch for week changes
watch(selectedWeek, () => {
  if (currentOverview.value) {
    originalOverview.value = { ...currentOverview.value }
  }
}, { immediate: true })
</script>
