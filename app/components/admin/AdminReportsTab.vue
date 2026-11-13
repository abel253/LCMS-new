<template>
  <div class="space-y-6">
    
    <!-- Printable University Audit Header (Visible during Print & Screen) -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <span class="text-2xl">📊</span>
          <h2 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Executive Audit & Circulation Detailed Report
          </h2>
        </div>
        <p class="text-xs text-slate-500">
          Mekdela Amba University Library — Comprehensive Circulation Ledger, Book Returns, Closed Shelf & Penalty Audit
        </p>
        <p class="text-[10px] font-mono text-slate-400 mt-1">
          Generated: {{ new Date(reportData?.generatedAt || Date.now()).toLocaleString() }} • Official Circulation Ledger
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2 self-start sm:self-auto">
        <button 
          @click="refreshData" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition"
          title="Refresh Report Data"
        >
          <RefreshCw :size="14" />
          <span>Refresh</span>
        </button>

        <button 
          @click="exportToCSV" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition"
          title="Export Detailed Ledger to CSV"
        >
          <Download :size="14" />
          <span>Export CSV</span>
        </button>

        <button 
          @click="printReport" 
          class="flex items-center gap-1.5 px-4 py-2 bg-[#06387d] hover:bg-[#0b4db0] text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition"
        >
          <Printer :size="14" />
          <span>Print / Export PDF</span>
        </button>
      </div>
    </div>

    <!-- 1. KPI SUMMARY CARDS -->
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
      <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Catalog Titles</span>
        <p class="text-2xl font-black text-slate-900 mt-1.5">{{ summary.totalBooks }}</p>
        <span class="text-[10px] text-blue-600 font-semibold mt-1 inline-block">{{ summary.totalCopies }} total copies</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-blue-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Active Loans</span>
        <p class="text-2xl font-black text-blue-900 mt-1.5">{{ summary.activeLoansCount }}</p>
        <span class="text-[10px] text-blue-700 font-semibold mt-1 inline-block">Currently with patrons</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Returned & Cleared</span>
        <p class="text-2xl font-black text-emerald-700 mt-1.5">{{ summary.returnedLoansCount }}</p>
        <span class="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">Archived returns</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-purple-600 tracking-wider">Circulation Rate</span>
        <p class="text-2xl font-black text-purple-800 mt-1.5">{{ summary.utilizationRate }}%</p>
        <span class="text-[10px] text-purple-600 font-semibold mt-1 inline-block">Active utilization</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-rose-600 tracking-wider">Overdue Items</span>
        <p class="text-2xl font-black text-rose-700 mt-1.5">{{ summary.overdueCount }}</p>
        <span class="text-[10px] text-rose-600 font-semibold mt-1 inline-block">Late returns</span>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs">
        <span class="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Accrued Penalties</span>
        <p class="text-2xl font-black text-amber-900 mt-1.5">{{ summary.totalFineAmount }} <span class="text-xs font-bold text-amber-700">ETB</span></p>
        <span class="text-[10px] text-amber-700 font-semibold mt-1 inline-block">Total overdue fines</span>
      </div>
    </div>

    <!-- 2. DETAILED REPORT CONTROLS & SUB-TABS -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-5">
      
      <!-- Sub-Tab Navigation -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div class="flex flex-wrap items-center gap-2">
          <button
            v-for="tab in reportSubTabs"
            :key="tab.id"
            @click="activeSubTab = tab.id"
            :class="[
              'px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2',
              activeSubTab === tab.id
                ? 'bg-[#06387d] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            <span>{{ tab.icon }}</span>
            <span>{{ tab.label }}</span>
            <span 
              v-if="tab.badge !== undefined" 
              :class="activeSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
              class="px-1.5 py-0.2 rounded-full text-[10px] font-mono"
            >
              {{ tab.badge }}
            </span>
          </button>
        </div>

        <!-- Search in Ledger -->
        <div class="relative w-full md:w-80">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="ledgerSearch"
            type="text" 
            placeholder="Search by student, ID, book title..."
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>
      </div>

      <!-- TAB 1: DETAILED CIRCULATION & LOAN LEDGER -->
      <div v-if="activeSubTab === 'transactions'" class="space-y-4">
        
        <!-- Filter Pills -->
        <div class="flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2">
            <span class="text-slate-400 font-bold uppercase text-[10px]">Filter Status:</span>
            <button 
              v-for="st in ['ALL', 'ISSUED', 'RETURNED', 'OVERDUE']" 
              :key="st"
              @click="statusFilter = st"
              :class="statusFilter === st ? 'bg-blue-100 text-blue-800 font-black' : 'text-slate-600 hover:bg-slate-100'"
              class="px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px]"
            >
              {{ st === 'ALL' ? 'All Loans' : (st === 'ISSUED' ? 'Active Loans' : (st === 'RETURNED' ? 'Returned' : 'Overdue')) }}
            </button>
          </div>

          <span class="text-slate-500 font-mono text-[11px]">
            Showing {{ filteredTransactions.length }} detailed records
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-[11px] uppercase text-slate-400 font-black">
                <th class="py-3 px-3">TX #</th>
                <th class="py-3 px-3">Borrower Details</th>
                <th class="py-3 px-3">Department</th>
                <th class="py-3 px-3">Book Title & Location</th>
                <th class="py-3 px-3">Issue Date</th>
                <th class="py-3 px-3">Due Date</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-right">Fine (ETB)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr 
                v-for="tx in filteredTransactions" 
                :key="tx.id"
                :class="tx.isOverdue ? 'bg-rose-50/40' : ''"
                class="hover:bg-slate-50 transition-colors"
              >
                <!-- TX ID -->
                <td class="py-3 px-3 font-mono font-bold text-slate-800">
                  #{{ tx.id }}
                </td>

                <!-- Borrower Details -->
                <td class="py-3 px-3">
                  <p class="font-bold text-slate-900">{{ tx.borrowerName }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">ID: {{ tx.borrowerId }}</p>
                </td>

                <!-- Department -->
                <td class="py-3 px-3 text-slate-600">
                  {{ tx.department }}
                </td>

                <!-- Book Title & Shelf -->
                <td class="py-3 px-3 max-w-[220px]">
                  <p class="font-bold text-slate-800 truncate" :title="tx.bookTitle">{{ tx.bookTitle }}</p>
                  <p class="text-[10px] text-slate-400 font-mono">Shelf: {{ tx.shelfNumber }} • {{ tx.shelfType }}</p>
                </td>

                <!-- Issue Date -->
                <td class="py-3 px-3 font-mono text-slate-600">
                  {{ formatDate(tx.issueDate) }}
                </td>

                <!-- Due Date -->
                <td class="py-3 px-3 font-mono font-semibold" :class="tx.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'">
                  {{ formatDate(tx.dueDate) }}
                  <span v-if="tx.isOverdue" class="block text-[9px] text-rose-500 font-bold">({{ tx.daysOverdue }} days late)</span>
                </td>

                <!-- Status Badge -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <span 
                    :class="{
                      'bg-emerald-100 text-emerald-800 border-emerald-200': tx.status === 'RETURNED',
                      'bg-blue-100 text-blue-800 border-blue-200': tx.status === 'ISSUED' && !tx.isOverdue,
                      'bg-rose-100 text-rose-800 border-rose-200': tx.isOverdue,
                    }"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase border"
                  >
                    {{ tx.status === 'RETURNED' ? 'Returned' : (tx.isOverdue ? 'Overdue' : 'Active Loan') }}
                  </span>
                </td>

                <!-- Fine Amount -->
                <td class="py-3 px-3 text-right font-black font-mono whitespace-nowrap" :class="tx.fineAmount > 0 ? 'text-rose-600' : 'text-slate-400'">
                  {{ tx.fineAmount > 0 ? tx.fineAmount + ' ETB' : '0.00' }}
                </td>
              </tr>

              <tr v-if="filteredTransactions.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
                  No circulation transaction records match your search filter.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>

      <!-- TAB 2: OVERDUE FINES & PENALTIES DETAILED AUDIT -->
      <div v-else-if="activeSubTab === 'overdue'" class="space-y-4">
        <div class="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-900">
          <div>
            <h4 class="font-black text-sm text-rose-900 flex items-center gap-1.5">
              <span>⚠️</span> Overdue Fines & Penalties Ledger
            </h4>
            <p class="text-[11px] text-rose-700 mt-0.5">
              Total Accrued Penalty: <strong>{{ summary.totalFineAmount }} ETB</strong> across {{ overdueList.length }} overdue books.
            </p>
          </div>
          <span class="px-3 py-1 bg-rose-600 text-white font-mono font-bold rounded-xl text-xs">
            Overdue: {{ overdueList.length }}
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse text-xs">
            <thead>
              <tr class="border-b border-slate-200 text-[11px] uppercase text-slate-400 font-black">
                <th class="py-3 px-3">TX #</th>
                <th class="py-3 px-3">Student Name & ID</th>
                <th class="py-3 px-3">Department</th>
                <th class="py-3 px-3">Overdue Book Title</th>
                <th class="py-3 px-3">Shelf</th>
                <th class="py-3 px-3">Due Date</th>
                <th class="py-3 px-3 text-center">Days Late</th>
                <th class="py-3 px-3 text-right">Penalty Fine</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="item in overdueList" :key="item.transactionId" class="hover:bg-rose-50/30 transition-colors">
                <td class="py-3 px-3 font-mono font-bold text-slate-800">#{{ item.transactionId }}</td>
                <td class="py-3 px-3">
                  <p class="font-bold text-slate-900">{{ item.studentName }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">{{ item.studentId }}</p>
                </td>
                <td class="py-3 px-3 text-slate-600">{{ item.department || 'General' }}</td>
                <td class="py-3 px-3 font-bold text-slate-800 max-w-[200px] truncate">{{ item.bookTitle }}</td>
                <td class="py-3 px-3 font-mono text-slate-600">{{ item.shelfNumber || '42' }}</td>
                <td class="py-3 px-3 font-mono text-rose-600 font-bold">{{ formatDate(item.dueDate) }}</td>
                <td class="py-3 px-3 text-center">
                  <span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-black text-[10px]">
                    {{ item.daysOverdue }} days
                  </span>
                </td>
                <td class="py-3 px-3 text-right font-black text-rose-600 font-mono text-xs">
                  {{ item.fine }} ETB
                </td>
              </tr>
              <tr v-if="overdueList.length === 0">
                <td colspan="8" class="py-8 text-center text-slate-400 text-xs">
                  ✓ No overdue accounts. All student book loans are returned on time!
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB 3: CATEGORY & SHELF DISTRIBUTION BREAKDOWN -->
      <div v-else-if="activeSubTab === 'categories'" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <!-- Subject Category Table -->
          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>📚</span> Subject Faculty Breakdown
            </h4>
            <div class="border border-slate-200 rounded-2xl overflow-hidden">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-2.5">Category</th>
                    <th class="p-2.5 text-right">Titles</th>
                    <th class="p-2.5 text-right">Share</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="cat in categoryList" :key="cat.name">
                    <td class="p-2.5 font-bold text-slate-800">{{ cat.name }}</td>
                    <td class="p-2.5 text-right font-mono text-slate-600">{{ cat.count || cat.titles }}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-blue-600">{{ cat.percentage || cat.share }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Shelf Type Distribution -->
          <div class="space-y-3">
            <h4 class="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <span>🗄️</span> Shelf Type Access Distribution
            </h4>
            <div class="border border-slate-200 rounded-2xl overflow-hidden">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-slate-50 text-slate-400 font-bold border-b border-slate-200">
                  <tr>
                    <th class="p-2.5">Shelf Type</th>
                    <th class="p-2.5 text-right">Items</th>
                    <th class="p-2.5 text-right">Distribution</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="shelf in shelfList" :key="shelf.type">
                    <td class="p-2.5 font-bold text-slate-800">{{ shelf.type }}</td>
                    <td class="p-2.5 text-right font-mono text-slate-600">{{ shelf.count }}</td>
                    <td class="p-2.5 text-right font-mono font-bold text-emerald-600">{{ shelf.percentage }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

    </div>

    <!-- Official University Printable Certification Block -->
    <div class="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-600 print:border-none">
      <div class="space-y-1 text-center sm:text-left">
        <p class="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Mekdela Amba University Central Library</p>
        <p class="text-[10px] text-slate-500">Official Institutional Circulation, Borrowing & Revenue Clearance Report</p>
      </div>

      <div class="flex items-center gap-8">
        <div class="text-center border-t border-slate-300 pt-2 w-36">
          <p class="text-[10px] text-slate-400 uppercase font-bold">Prepared By</p>
          <p class="font-bold text-slate-800 text-xs mt-0.5">Circulation Librarian</p>
        </div>
        <div class="text-center border-t border-slate-300 pt-2 w-36">
          <p class="text-[10px] text-slate-400 uppercase font-bold">Approved By</p>
          <p class="font-bold text-slate-800 text-xs mt-0.5">Library Director</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RefreshCw, Download, Printer, Search } from 'lucide-vue-next'

const props = defineProps<{
  reportsData?: any
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

// Fetch reports data from server
const { data: reportApiResponse, refresh: refreshReportApi } = await useFetch('/api/reports')

const reportData = computed(() => {
  return reportApiResponse.value?.data || reportApiResponse.value || props.reportsData?.data || props.reportsData || {}
})

const activeSubTab = ref<'transactions' | 'overdue' | 'categories'>('transactions')
const ledgerSearch = ref('')
const statusFilter = ref<'ALL' | 'ISSUED' | 'RETURNED' | 'OVERDUE'>('ALL')

const reportSubTabs = computed(() => [
  { id: 'transactions', label: 'Detailed Circulation Ledger', icon: '📋', badge: detailedTransactions.value.length },
  { id: 'overdue', label: 'Overdue Penalties Audit', icon: '⚠️', badge: overdueList.value.length },
  { id: 'categories', label: 'Faculty & Shelf Breakdown', icon: '📚' }
])

const summary = computed(() => {
  return reportData.value?.summary || {
    totalBooks: 3995,
    totalCopies: 8200,
    availableCopies: 7780,
    borrowedCopies: 420,
    utilizationRate: 72,
    totalBorrowsAllTime: 1250,
    activeLoansCount: 142,
    returnedLoansCount: 1108,
    overdueCount: 3,
    totalFineAmount: 340
  }
})

const detailedTransactions = computed(() => {
  return reportData.value?.detailedTransactions || []
})

const overdueList = computed(() => {
  return reportData.value?.overdueDetails || []
})

const categoryList = computed(() => {
  return reportData.value?.categoryBreakdown || [
    { name: 'Computer Science & Informatics', count: 940, percentage: 38 },
    { name: 'Health & Medical Sciences', count: 820, percentage: 26 },
    { name: 'Engineering & Technology', count: 780, percentage: 20 },
    { name: 'Business & Economics', count: 650, percentage: 12 },
    { name: 'General Reference & Languages', count: 405, percentage: 4 }
  ]
})

const shelfList = computed(() => {
  return reportData.value?.shelfBreakdown || [
    { type: 'Open Shelf', count: 3200, percentage: 80 },
    { type: 'Closed Shelf', count: 795, percentage: 20 }
  ]
})

const filteredTransactions = computed(() => {
  let list = detailedTransactions.value

  if (statusFilter.value === 'ISSUED') {
    list = list.filter(t => t.status === 'ISSUED' && !t.isOverdue)
  } else if (statusFilter.value === 'RETURNED') {
    list = list.filter(t => t.status === 'RETURNED')
  } else if (statusFilter.value === 'OVERDUE') {
    list = list.filter(t => t.isOverdue)
  }

  if (ledgerSearch.value.trim()) {
    const q = ledgerSearch.value.toLowerCase()
    list = list.filter(t => 
      t.borrowerName?.toLowerCase().includes(q) ||
      t.borrowerId?.toLowerCase().includes(q) ||
      t.bookTitle?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q) ||
      String(t.id).includes(q)
    )
  }

  return list
})

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const refreshData = async () => {
  await refreshReportApi()
  emit('refresh')
}

const exportToCSV = () => {
  const headers = ['TX ID', 'Borrower Name', 'Borrower ID', 'Department', 'Book Title', 'Shelf Number', 'Shelf Type', 'Issue Date', 'Due Date', 'Status', 'Fine (ETB)']
  const rows = filteredTransactions.value.map(t => [
    t.id,
    `"${t.borrowerName}"`,
    `"${t.borrowerId}"`,
    `"${t.department}"`,
    `"${t.bookTitle}"`,
    `"${t.shelfNumber}"`,
    `"${t.shelfType}"`,
    t.issueDate,
    t.dueDate,
    t.status,
    t.fineAmount
  ])

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', `MAU_Library_Detailed_Report_${new Date().toISOString().split('T')[0]}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const printReport = () => {
  if (typeof window !== 'undefined') {
    window.print()
  }
}
</script>
