<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
    <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 my-8 space-y-5">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
          <span>⚡ Issue New Book Loan</span>
        </h3>
        <button 
          @click="$emit('close')" 
          class="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <X :size="20" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- 1. Book Selection with Live Stock Algorithm -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-bold uppercase text-slate-600">Select Book *</label>
            <span v-if="currentStock" class="text-[11px] font-mono font-bold" :class="isOutOfStock ? 'text-rose-600' : 'text-emerald-700'">
              {{ currentStock.available }} of {{ currentStock.total }} Copies Left
            </span>
          </div>

          <select 
            v-model="form.itemId" 
            required 
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
          >
            <option value="" disabled>Choose a book from catalog...</option>
            <option 
              v-for="b in books" 
              :key="b.id || b.itemId" 
              :value="b.id || b.itemId"
              :class="getBookStock(b).isOut ? 'text-rose-600 font-bold bg-rose-50' : 'text-slate-800'"
            >
              {{ getBookStock(b).isOut ? '🔴 [0 COPIES - OUT OF STOCK] ' : `📗 [${getBookStock(b).available}/${getBookStock(b).total} Avail] ` }}
              {{ b.title }} ({{ b.author || 'Author N/A' }}) - Shelf: {{ b.shelfNumber || 'Regular' }}
            </option>
          </select>
        </div>

        <!-- 2. Live Inventory Counter & Availability Warning Card -->
        <div 
          v-if="currentStock" 
          class="p-3.5 rounded-2xl border transition-all"
          :class="isOutOfStock ? 'bg-rose-50/80 border-rose-200' : 'bg-emerald-50/70 border-emerald-200'"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="text-lg">{{ isOutOfStock ? '🚫' : '📗' }}</span>
              <div>
                <p class="text-xs font-black leading-tight" :class="isOutOfStock ? 'text-rose-900' : 'text-emerald-900'">
                  {{ isOutOfStock ? 'Out of Stock (0 Copies Available)' : `In Stock: ${currentStock.available} of ${currentStock.total} Copies Available` }}
                </p>
                <p class="text-[10px] mt-0.5" :class="isOutOfStock ? 'text-rose-700' : 'text-emerald-700'">
                  {{ isOutOfStock ? 'All copies are currently borrowed out by other students.' : `${currentStock.borrowed} copies currently circulating on loan` }}
                </p>
              </div>
            </div>

            <!-- Stock Pill Badge -->
            <span 
              class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-2xs"
              :class="isOutOfStock ? 'bg-rose-600 text-white animate-pulse' : 'bg-emerald-600 text-white'"
            >
              {{ isOutOfStock ? '0 LEFT • WAIT' : `${currentStock.available} In Stock` }}
            </span>
          </div>

          <!-- Out of Stock Wait Alert -->
          <div v-if="isOutOfStock" class="mt-2.5 pt-2 border-t border-rose-200/80 flex items-start gap-2 text-rose-800">
            <Clock :size="16" class="shrink-0 text-rose-600 mt-0.5" />
            <div class="text-[11px] leading-relaxed">
              <p class="font-bold">መጽሐፉ አልቋል እባክዎ እስኪመለስ ድረስ ትንሽ ይጠብቁ! (Please Wait!)</p>
              <p class="text-[10px] text-rose-700">
                This item has zero available copies. Please wait until another patron returns a copy before checking out.
              </p>
            </div>
          </div>

          <!-- Low Stock Indicator -->
          <div v-else-if="currentStock.isLow" class="mt-2 pt-1.5 border-t border-emerald-200/60 text-[10px] text-amber-800 font-bold flex items-center gap-1">
            <AlertCircle :size="13" class="text-amber-600" />
            <span>Low Stock Alert: Only {{ currentStock.available }} copy remaining in stacks!</span>
          </div>
        </div>

        <!-- 3. Student Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Student / Borrower Name *</label>
            <input 
              v-model="form.studentName" 
              required 
              type="text" 
              placeholder="e.g. Birhanu Gize" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Student / Staff ID *</label>
            <input 
              v-model="form.studentId" 
              required 
              type="text" 
              placeholder="e.g. MAU/1234/14" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white font-mono" 
            />
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Phone Number</label>
            <input 
              v-model="form.phone" 
              type="text" 
              placeholder="0911000000" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Borrow Scope</label>
            <select 
              v-model="form.borrowScope" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="OUTSIDE">Outside Campus (Take Home)</option>
              <option value="INSIDE">Inside Library Only (Hall Reading)</option>
            </select>
          </div>
        </div>

        <!-- 4. Loan Type & Duration -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Loan Type</label>
            <select 
              v-model="form.loanType" 
              @change="onLoanTypeChange" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="SHORT">Short Borrow (1 - 3 Days)</option>
              <option value="LONG">Long Borrow (14 - 30 Days)</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Duration (Days)</label>
            <input 
              v-model.number="form.durationDays" 
              type="number" 
              min="1" 
              max="30" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button 
            type="button" 
            @click="$emit('close')" 
            class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Cancel
          </button>

          <!-- Submit Button Disabled when Out of Stock -->
          <button 
            type="submit" 
            :disabled="isSubmitting || isOutOfStock" 
            :class="isOutOfStock ? 'bg-slate-300 text-slate-500 cursor-not-allowed border border-slate-300' : 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'"
            class="px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2"
          >
            <span v-if="isOutOfStock">🚫 Out of Stock — Please Wait</span>
            <span v-else-if="isSubmitting" class="flex items-center gap-1.5">
              <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              <span>Issuing Loan...</span>
            </span>
            <span v-else>Confirm Loan Issue ({{ currentStock ? currentStock.available : 1 }} Available)</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { X, Clock, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  books: any[]
  isSubmitting?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: any): void
}>()

const form = reactive({
  itemId: '',
  studentName: '',
  studentId: '',
  phone: '',
  borrowScope: 'OUTSIDE',
  loanType: 'SHORT',
  durationDays: 3
})

// ══════════════════════════════════════════════════════════════
// ALGORITHM: COUNT COPIES & EVALUATE STOCK AVAILABILITY IN REAL-TIME
// ══════════════════════════════════════════════════════════════
const getBookStock = (b: any) => {
  if (!b) return { total: 0, available: 0, borrowed: 0, isOut: true, isLow: false }
  
  const total = Number(b.quantity ?? b.copies ?? b.total_copies ?? 1)
  let available = 0

  if (typeof b.availableQuantity === 'number') {
    available = b.availableQuantity
  } else if (typeof b.available_quantity === 'number') {
    available = b.available_quantity
  } else if (typeof b.availableCopies === 'number') {
    available = b.availableCopies
  } else if (typeof b.available_copies === 'number') {
    available = b.available_copies
  } else if (b.status === 'BORROWED') {
    available = 0
  } else {
    available = total
  }

  const normalizedAvailable = Math.max(0, available)
  const borrowed = Math.max(0, total - normalizedAvailable)

  return {
    total,
    available: normalizedAvailable,
    borrowed,
    isOut: normalizedAvailable <= 0,
    isLow: normalizedAvailable > 0 && normalizedAvailable <= 2,
  }
}

const selectedBook = computed(() => {
  if (!form.itemId) return null
  return (props.books || []).find((b: any) => (b.id || b.itemId) == form.itemId) || null
})

const currentStock = computed(() => {
  if (!selectedBook.value) return null
  return getBookStock(selectedBook.value)
})

const isOutOfStock = computed(() => {
  return currentStock.value ? currentStock.value.isOut : false
})

const onLoanTypeChange = () => {
  form.durationDays = form.loanType === 'SHORT' ? 3 : 14
}

const handleSubmit = () => {
  if (isOutOfStock.value) {
    alert('This book is currently out of stock. Please wait until another patron returns a copy.')
    return
  }
  emit('submit', { ...form })
}
</script>
