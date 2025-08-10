<template>
  <div class="space-y-2" :key="`root-${calendarType}-${renderTick}`">
    <div class="relative" :key="`rel-${calendarType}-${renderTick}`">
      <div class="flex items-center justify-between w-full mb-2">
        <!-- Segmented control (Gregorian ⇄ Jalali) -->
        <div class="flex items-center gap-2">
          <div class="inline-flex rounded-md overflow-hidden border">
            <button type="button"
              @click="setCalendar('gregorian')"
              :class="[
                'px-2 py-1 text-[11px]',
                calendarType === 'gregorian' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              ]"
            >Gregorian</button>
            <button type="button"
              @click="setCalendar('jalali')"
              :class="[
                'px-2 py-1 text-[11px]',
                calendarType === 'jalali' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'
              ]"
            >Jalali</button>
          </div>
        </div>
        <!-- no manual input; only calendar view -->
      </div>
      <!-- Single Calendar Panel (no inner popup) -->
      <div class="space-y-3 p-0" :key="`panel-${calendarType}-${renderTick}`">
        <!-- Month/Year Navigation -->
        <div class="flex items-center justify-between">
          <button type="button" @click="previousMonth" class="p-1 hover:bg-gray-100 rounded">
            <ChevronLeft class="w-4 h-4" />
          </button>
          <div class="text-sm font-medium">{{ currentMonthYear }}</div>
          <button type="button" @click="nextMonth" class="p-1 hover:bg-gray-100 rounded">
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- Calendar Grid -->
        <div 
          class="grid grid-cols-7 gap-1 text-center max-h-[340px] overflow-auto"
          :key="`${calendarType}-${currentDate.getFullYear()}-${currentDate.getMonth()}-${renderTick}`"
        >
          <!-- Day Headers -->
          <div v-for="day in dayHeaders" :key="day" class="text-xs font-medium text-gray-500 p-2">
            {{ day }}
          </div>

          <!-- Calendar Days -->
          <button
            v-for="day in calendarDays"
            :key="day.key"
            type="button"
            @click="selectDate(day)"
            :disabled="!day.isCurrentMonth"
            :class="[
              'p-2 text-sm rounded transition-colors',
              day.isSelected
                ? 'bg-blue-600 text-white hover:bg-blue-600'
                : day.isToday
                  ? 'bg-blue-50 text-blue-600 font-medium hover:bg-blue-100'
                  : day.isCurrentMonth
                    ? 'text-gray-900 hover:bg-gray-100'
                    : 'text-gray-300 hover:bg-transparent',
            ]"
          >
            {{ day.day }}
          </button>
        </div>

        <!-- Actions -->
        <div class="flex justify-between pt-2 border-t">
          <button type="button" @click="selectToday" class="text-sm text-blue-600 hover:text-blue-700">
            Today
          </button>
          <div />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  id: string
  label: string
  modelValue?: string
  autoOpen?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const calendarType = ref<'gregorian' | 'jalali'>('gregorian')
const currentDate = ref(new Date())

// No Switch; segmented control updates calendarType directly

// Force rerender ticker on calendarType change
const renderTick = ref(0)
watch(calendarType, () => { 
  renderTick.value++ 
  console.debug('[DualCalendar] calendarType changed:', calendarType.value, 'renderTick:', renderTick.value)
})

// Explicit setter used by segmented buttons
const setCalendar = (mode: 'gregorian' | 'jalali') => {
  if (calendarType.value !== mode) {
    calendarType.value = mode
  }
}

// Jalali date conversion utilities (simplified)
const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const gregorianMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Format date as local YYYY-MM-DD to avoid UTC offset shifting a day
function formatLocalISO(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Convert Gregorian to Jalali (simplified approximation)
function gregorianToJalali(gDate: Date): { year: number, month: number, day: number } {
  // This is a simplified conversion - in a real app, use a proper library like moment-jalaali
  const gYear = gDate.getFullYear()
  const gMonth = gDate.getMonth() + 1
  const gDay = gDate.getDate()
  
  // Approximate conversion (not accurate for all dates)
  let jYear = gYear - 621
  if (gMonth < 3 || (gMonth === 3 && gDay < 21)) {
    jYear--
  }
  
  return {
    year: jYear,
    month: Math.max(1, Math.min(12, gMonth - 2)),
    day: gDay
  }
}

// Removed unused jalaliToGregorian helper

const currentMonthYear = computed(() => {
  // depend on renderTick to force recompute on toggle
  void renderTick.value
  if (calendarType.value === 'gregorian') {
    return `${gregorianMonths[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
  } else {
    const jalali = gregorianToJalali(currentDate.value)
    return `${jalaliMonths[jalali.month - 1]} ${jalali.year}`
  }
})

const dayHeaders = computed(() => {
  void renderTick.value
  if (calendarType.value === 'gregorian') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  } else {
    return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] // Jalali day headers
  }
})

const calendarDays = computed(() => {
  void renderTick.value
  const days = [] as Array<{
    key: string
    day: number
    date: Date
    isCurrentMonth: boolean
    isToday: boolean
    isSelected: boolean
  }>

  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // First day of the month (Gregorian base)
  const firstDay = new Date(year, month, 1)

  // Determine start-of-week offset
  // Gregorian grid starts on Sunday (0)
  // Jalali grid starts on Saturday; map JS getDay() to Saturday=0..Friday=6 via (d+1)%7
  const weekOffset = calendarType.value === 'gregorian'
    ? firstDay.getDay()
    : (firstDay.getDay() + 1) % 7

  // Compute current month identity for comparison
  const currentJalali = gregorianToJalali(currentDate.value)
  const currentJalaliMonth = currentJalali.month

  // Start from the beginning of the grid week
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - weekOffset)

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const isCurrentMonth = calendarType.value === 'gregorian'
      ? date.getMonth() === month
      : gregorianToJalali(date).month === currentJalaliMonth

    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = props.modelValue === formatLocalISO(date)

    const j = calendarType.value === 'jalali' ? gregorianToJalali(date) : null

    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: calendarType.value === 'gregorian' ? date.getDate() : (j as any).day,
      date,
      isCurrentMonth,
      isToday,
      isSelected
    })
  }

  return days
})

// No manual input mode

const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  
  const dateStr = formatLocalISO(day.date)
  emit('update:modelValue', dateStr)
}

const selectToday = () => {
  const today = formatLocalISO(new Date())
  emit('update:modelValue', today)
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// Refresh grid when switching calendar type to ensure immediate visual update
watch(calendarType, () => {
  currentDate.value = new Date(currentDate.value)
})
// No inner popup; no click-outside handling needed

// autoOpen is unused now; kept for compatibility
</script>
