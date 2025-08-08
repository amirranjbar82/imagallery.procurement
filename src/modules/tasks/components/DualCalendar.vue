<template>
  <div class="space-y-2">
    <Label :for="id">{{ label }}</Label>
    <div class="relative">
      <div class="flex items-center space-x-2">
        <!-- Calendar Type Toggle -->
        <div class="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
          <button
            type="button"
            @click="calendarType = 'gregorian'"
            :class="[
              'px-2 py-1 text-xs font-medium rounded transition-colors',
              calendarType === 'gregorian' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Gregorian
          </button>
          <button
            type="button"
            @click="calendarType = 'jalali'"
            :class="[
              'px-2 py-1 text-xs font-medium rounded transition-colors',
              calendarType === 'jalali' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            ]"
          >
            Jalali
          </button>
        </div>
        
        <!-- Date Input -->
        <div class="flex-1">
          <Input
            :id="id"
            :type="calendarType === 'gregorian' ? 'date' : 'text'"
            :value="displayValue"
            @input="handleInput"
            :placeholder="calendarType === 'gregorian' ? 'YYYY-MM-DD' : 'YYYY/MM/DD'"
            class="w-full"
          />
        </div>
        
        <!-- Calendar Icon -->
        <button
          type="button"
          @click="showCalendar = !showCalendar"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Calendar class="w-4 h-4" />
        </button>
      </div>
      
      <!-- Calendar Popup -->
      <div
        v-if="showCalendar"
        class="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 min-w-[300px]"
      >
        <div class="space-y-3">
          <!-- Month/Year Navigation -->
          <div class="flex items-center justify-between">
            <button
              type="button"
              @click="previousMonth"
              class="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft class="w-4 h-4" />
            </button>
            
            <div class="text-sm font-medium">
              {{ currentMonthYear }}
            </div>
            
            <button
              type="button"
              @click="nextMonth"
              class="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
          
          <!-- Calendar Grid -->
          <div class="grid grid-cols-7 gap-1 text-center">
            <!-- Day Headers -->
            <div
              v-for="day in dayHeaders"
              :key="day"
              class="text-xs font-medium text-gray-500 p-2"
            >
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
                'p-2 text-sm rounded hover:bg-gray-100 transition-colors',
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
                day.isSelected ? 'bg-blue-500 text-white hover:bg-blue-600' : '',
                day.isToday ? 'bg-blue-50 text-blue-600 font-medium' : ''
              ]"
            >
              {{ day.day }}
            </button>
          </div>
          
          <!-- Actions -->
          <div class="flex justify-between pt-2 border-t">
            <button
              type="button"
              @click="selectToday"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              Today
            </button>
            <button
              type="button"
              @click="showCalendar = false"
              class="text-sm text-gray-600 hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface Props {
  id: string
  label: string
  modelValue?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const calendarType = ref<'gregorian' | 'jalali'>('gregorian')
const showCalendar = ref(false)
const currentDate = ref(new Date())

// Jalali date conversion utilities (simplified)
const jalaliMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
]

const gregorianMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

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

// Convert Jalali to Gregorian (simplified approximation)
function jalaliToGregorian(jYear: number, jMonth: number, jDay: number): Date {
  // This is a simplified conversion - in a real app, use a proper library
  const gYear = jYear + 621
  const gMonth = Math.max(0, Math.min(11, jMonth + 1))
  
  return new Date(gYear, gMonth, jDay)
}

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  if (calendarType.value === 'gregorian') {
    return props.modelValue
  } else {
    // Convert to Jalali format
    const date = new Date(props.modelValue)
    const jalali = gregorianToJalali(date)
    return `${jalali.year}/${jalali.month.toString().padStart(2, '0')}/${jalali.day.toString().padStart(2, '0')}`
  }
})

const currentMonthYear = computed(() => {
  if (calendarType.value === 'gregorian') {
    return `${gregorianMonths[currentDate.value.getMonth()]} ${currentDate.value.getFullYear()}`
  } else {
    const jalali = gregorianToJalali(currentDate.value)
    return `${jalaliMonths[jalali.month - 1]} ${jalali.year}`
  }
})

const dayHeaders = computed(() => {
  if (calendarType.value === 'gregorian') {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  } else {
    return ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'] // Jalali day headers
  }
})

const calendarDays = computed(() => {
  const days = []
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  // First day of the month
  const firstDay = new Date(year, month, 1)
  
  // Start from the first day of the week containing the first day of the month
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === new Date().toDateString()
    const isSelected = props.modelValue === date.toISOString().split('T')[0]
    
    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      day: calendarType.value === 'gregorian' 
        ? date.getDate() 
        : gregorianToJalali(date).day,
      date: date,
      isCurrentMonth,
      isToday,
      isSelected
    })
  }
  
  return days
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value
  
  if (calendarType.value === 'jalali' && value) {
    // Convert Jalali input to Gregorian for storage
    const parts = value.split('/')
    if (parts.length === 3) {
      const jYear = parseInt(parts[0])
      const jMonth = parseInt(parts[1])
      const jDay = parseInt(parts[2])
      
      if (!isNaN(jYear) && !isNaN(jMonth) && !isNaN(jDay)) {
        const gregorianDate = jalaliToGregorian(jYear, jMonth, jDay)
        value = gregorianDate.toISOString().split('T')[0]
      }
    }
  }
  
  emit('update:modelValue', value)
}

const selectDate = (day: any) => {
  if (!day.isCurrentMonth) return
  
  const dateStr = day.date.toISOString().split('T')[0]
  emit('update:modelValue', dateStr)
  showCalendar.value = false
}

const selectToday = () => {
  const today = new Date().toISOString().split('T')[0]
  emit('update:modelValue', today)
  showCalendar.value = false
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

// Close calendar when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    showCalendar.value = false
  }
}

watch(showCalendar, (show) => {
  if (show) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>
