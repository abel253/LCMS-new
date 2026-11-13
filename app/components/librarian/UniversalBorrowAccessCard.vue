<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-wider">
            Universal Patron Clearance
          </span>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            ✓ Shared Cross-Shift Access Active
          </span>
        </div>
        <h3 class="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <ScanLine :size="22" class="text-blue-600" />
          Universal Patron Loan Access & Direct Circulation
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Any on-duty librarian can access student records, issue walk-in loans without restrictions, and return or renew books issued across any shift.
        </p>
      </div>

      <button 
        @click="$emit('open-issue-modal')"
        class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
      >
        <Plus :size="16" />
        <span>Direct Walk-in Loan</span>
      </button>
    </div>

    <!-- Search Input for Universal Lookup -->
    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-100/80 space-y-3">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div class="relative flex-1">
          <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery"
            type="text"
            placeholder="Enter Student ID (e.g. 1212, UGR/1245/14), Borrower Name, or Book Title..."
            class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 shadow-2xs transition"
            @keyup.enter="performSearch"
          />
        </div>

        <button 
          @click="performSearch"
          class="px-5 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Search :size="14" />
          <span>Universal Lookup</span>
        </button>

        <button 
          v-if="searchQuery"
          @click="clearSearch"
          class="px-3 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
        >
          Clear
        </button>
      </div>

      <!-- Quick Tips -->
      <div class="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
        <span class="text-blue-600 font-bold">💡 Multi-Shift Notice:</span>
        <span>Even if the student borrowed a book from another librarian during the morning or weekend shift, you can clear and return it instantly right here.</span>
      </div>
    </div>

    <!-- Patron Results Overview -->
    <div v-if="searchedPatronLoans.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-black text-slate-800 flex items-center gap-2">
          <span>Active Borrow Records for:</span>
          <span class="px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 font-mono text-xs font-black">
            {{ activePatronName }}
          </span>
        </h4>
        <span class="text-xs font-bold text-slate-500">
          Total Items Out: {{ searchedPatronLoans.length }}
        </span>
      </div>

      <!-- Result Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="loan in searchedPatronLoans" 
          :key="loan.id || loan.transactionId"
          class="p-4 rounded-2xl border transition-all flex flex-col justify-between"
          :class="loan.isOverdue ? 'bg-rose-50/60 border-rose-200' : 'bg-slate-50/80 border-slate-200'"
        >
          <div class="space-y-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <span class="text-[10px] font-mono text-slate-400">TX #{{ loan.id || loan.transactionId }}</span>
                <h5 class="text-sm font-black text-slate-900 leading-snug">{{ loan.bookTitle }}</h5>
                <p class="text-xs text-slate-500">{{ loan.author || 'Author N/A' }}</p>
              </div>

              <span 
                v-if="loan.status === 'RETURNED'"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700"
              >
                Returned
              </span>
              <span 
                v-else-if="loan.isOverdue"
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-200 text-rose-800 animate-pulse"
              >
                Overdue
              </span>
              <span 
                v-else
                class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800"
              >
                On Time
              </span>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60">
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Borrower</span>
                <span class="font-bold text-slate-800">{{ loan.borrowerName || loan.studentName }}</span>
                <span class="font-mono text-slate-500 block text-[10px]">ID: {{ loan.borrowerId || loan.studentId }}</span>
              </div>
              <div>
                <span class="text-slate-400 block text-[10px] uppercase font-bold">Due Date</span>
                <span :class="loan.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 font-bold'">
                  {{ loan.dueDate || 'In 14 Days' }}
                </span>
                <span class="text-slate-500 block text-[10px]">Type: {{ loan.loanType === 'SHORT' ? 'Short Loan' : 'Regular Long Loan' }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-end gap-2">
            <button 
              v-if="loan.status !== 'RETURNED'"
              @click="$emit('return-book', loan.id || loan.transactionId)"
              class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle :size="13" />
              <span>Process Return</span>
            </button>

            <button 
              v-if="loan.status !== 'RETURNED'"
              @click="$emit('renew-loan', loan.id || loan.transactionId)"
              class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
            >
              <RotateCcw :size="13" />
              <span>Renew (+7d)</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State when searching and no results -->
    <div v-else-if="hasSearched && searchedPatronLoans.length === 0" class="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
      <p class="text-sm font-bold text-slate-700">No active loans found for "{{ searchQuery }}"</p>
      <p class="text-xs text-slate-400">The student currently has no checked-out books across any library shift.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ScanLine, Search, Plus, CheckCircle, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  loans: any[]
}>()

const emit = defineEmits<{
  (e: 'open-issue-modal'): void
  (e: 'return-book', id: number | string): void
  (e: 'renew-loan', id: number | string): void
}>()

const searchQuery = ref('')
const hasSearched = ref(false)

const searchedPatronLoans = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return (props.loans || []).filter((l: any) => 
    (l.borrowerId || l.studentId)?.toLowerCase().includes(q) ||
    (l.borrowerName || l.studentName)?.toLowerCase().includes(q) ||
    l.bookTitle?.toLowerCase().includes(q)
  )
})

const activePatronName = computed(() => {
  if (searchedPatronLoans.value.length > 0) {
    const first = searchedPatronLoans.value[0]
    return `${first.borrowerName || first.studentName} (${first.borrowerId || first.studentId})`
  }
  return searchQuery.value
})

const performSearch = () => {
  hasSearched.value = true
}

const clearSearch = () => {
  searchQuery.value = ''
  hasSearched.value = false
}
</script>
