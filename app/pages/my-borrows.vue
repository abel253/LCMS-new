<!-- pages/my-borrows.vue -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const authStore = useAuthStore()
const router = useRouter()
const toast = useToast()

const loading = ref(true)
const borrows = ref<any[]>([])
const activeFilter = ref<'ALL' | 'ISSUED' | 'RETURNED'>('ALL')
const searchQuery = ref('')

// Return Receipt Modal state
const selectedReceipt = ref<any | null>(null)
const isReceiptModalOpen = ref(false)

// Return Request / Voucher Modal state
const returnNotice = ref<any | null>(null)
const isReturnNoticeOpen = ref(false)

// Penalty Payment Form State
const paymentForm = ref({
  txnReference: '',
  receiptScreenshot: '',
  isSubmitting: false,
  error: '',
  success: '',
})
const copiedAccount = ref(false)

const copyCBEAccount = () => {
  navigator.clipboard.writeText('1000345678912')
  copiedAccount.value = true
  setTimeout(() => { copiedAccount.value = false }, 2500)
}

const handleScreenshotUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || !target.files[0]) return

  const file = target.files[0]
  paymentForm.value.error = ''
  paymentForm.value.success = ''

  const reader = new FileReader()
  reader.onload = (e) => {
    paymentForm.value.receiptScreenshot = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const submitPenaltyPayment = async () => {
  const refCode = paymentForm.value.txnReference.trim()
  if (!refCode) {
    paymentForm.value.error = 'Please enter your payment reference number (or "CASH").'
    return
  }

  paymentForm.value.isSubmitting = true
  paymentForm.value.error = ''
  paymentForm.value.success = ''

  try {
    const res: any = await $fetch('/api/loans/penalty-payment', {
      method: 'POST',
      body: {
        transactionId: returnNotice.value.transactionId,
        txnReference: refCode,
        receiptScreenshot: paymentForm.value.receiptScreenshot || '',
        fineAmount: returnNotice.value.fineAmount,
        bankName: 'Commercial Bank of Ethiopia (CBE)',
        accountNumber: '1000345678912',
      },
    })

    if (res?.success) {
      paymentForm.value.success = 'Payment slip submitted! The librarian will verify it and clear your return.'
      toast.success('Payment proof submitted to circulation desk!', 'Submitted')
      await fetchUserBorrows()
      setTimeout(() => {
        isReturnNoticeOpen.value = false
      }, 1200)
    }
  } catch (err: any) {
    paymentForm.value.error = err?.data?.statusMessage || err?.message || 'Failed to submit payment proof.'
  } finally {
    paymentForm.value.isSubmitting = false
  }
}

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const fetchUserBorrows = async () => {
  loading.value = true
  try {
    const userId = authStore.currentUserId || authStore.user?.userId || authStore.user?.id
    const url = userId ? `/api/loans?userId=${encodeURIComponent(userId)}` : '/api/loans'
    const res: any = await $fetch(url)
    borrows.value = Array.isArray(res) ? res : (res?.data || [])
  } catch (err) {
    console.error('Failed to load user borrows:', err)
  } finally {
    loading.value = false
  }
}

const filteredBorrows = computed(() => {
  let list = borrows.value
  if (activeFilter.value !== 'ALL') {
    list = list.filter((b) => b.status === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter((b) =>
      b.bookTitle?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q) ||
      b.shelfNumber?.toLowerCase().includes(q)
    )
  }
  return list
})

const activeCount = computed(() => borrows.value.filter((b) => b.status === 'ISSUED').length)
const overdueCount = computed(() => borrows.value.filter((b) => b.isOverdue && b.status === 'ISSUED').length)
const returnedCount = computed(() => borrows.value.filter((b) => b.status === 'RETURNED').length)

// 1. Student initiates return (Request Return Slip)
const initiateReturn = (borrow: any) => {
  returnNotice.value = {
    transactionId: borrow.transactionId || borrow.id,
    bookTitle: borrow.bookTitle,
    author: borrow.author,
    isbn: borrow.isbn,
    shelfNumber: borrow.shelfNumber,
    dueDate: borrow.dueDate,
    isOverdue: borrow.isOverdue,
    fineAmount: borrow.fineAmount,
    loanType: borrow.loanType,
    paymentProof: borrow.paymentProof || null,
    refCode: `RET-REQ-${(borrow.transactionId || borrow.id).toString().padStart(5, '0')}`,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
  paymentForm.value = {
    txnReference: borrow.paymentProof?.txnReference || '',
    receiptScreenshot: borrow.paymentProof?.receiptScreenshot || '',
    isSubmitting: false,
    error: '',
    success: '',
  }
  isReturnNoticeOpen.value = true
}

const handleDoneReturnSlip = () => {
  const code = returnNotice.value?.refCode || 'RET-REQ'
  isReturnNoticeOpen.value = false
  fetchUserBorrows()
  toast.success(`Return tracking code #${code} registered! Please present this tracking code to the librarian at the circulation counter to complete return.`, 'Return Request Registered')
}

// 2. View official return clearance certificate
const openReceiptModal = (borrow: any) => {
  selectedReceipt.value = {
    receiptNo: borrow.receiptNo || `RET-${new Date(borrow.returnDate || borrow.dueDate).getFullYear()}-${String(borrow.transactionId || borrow.id).padStart(5, '0')}`,
    transactionId: borrow.transactionId || borrow.id,
    bookTitle: borrow.bookTitle,
    author: borrow.author,
    isbn: borrow.isbn || 'N/A',
    studentName: borrow.borrowerName || authStore.user?.name || 'Student Patron',
    studentId: borrow.borrowerId || authStore.currentUserId || 'N/A',
    department: borrow.department || authStore.user?.department || 'General',
    issueDate: borrow.issueDate,
    dueDate: borrow.dueDate,
    returnDate: borrow.returnDate || formatDate(new Date()),
    loanType: borrow.loanType || 'LONG',
    shelfType: borrow.shelfType || 'Open Shelf',
    fineAmount: borrow.fineAmount || 0,
    status: 'RETURNED & CLEARED',
    verifiedBy: 'Mekdela Amba University Library Circulation Desk',
  }
  isReceiptModalOpen.value = true
}

const printReceipt = () => {
  window.print()
}

onMounted(() => {
  authStore.init()
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=/my-borrows')
    return
  }
  fetchUserBorrows()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-6xl mx-auto space-y-6">

      <!-- Header & User Info -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-2xl">📚</span>
            <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              My Borrowed Books & Returns
            </h1>
          </div>
          <p class="text-xs text-slate-500">
            Active Loans, Overdue Penalties & Official Clearance Certificates
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              👤 {{ authStore.user?.name || 'Student' }} ({{ authStore.currentUserId || 'ID: N/A' }})
            </span>
            <span class="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              🏛️ {{ authStore.user?.department || 'General' }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 self-stretch sm:self-auto">
          <NuxtLink to="/search" class="px-4 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition">
            + Search Books Catalog
          </NuxtLink>
          <button @click="fetchUserBorrows()" class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition" title="Refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      <!-- Stats Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p class="text-2xl font-black text-slate-900">{{ borrows.length }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">Total Borrows</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-blue-200 shadow-xs">
          <p class="text-2xl font-black text-blue-600">{{ activeCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">Active Loans</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs">
          <p class="text-2xl font-black text-rose-600">{{ overdueCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">Overdue Fines</p>
        </div>
        <div class="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs">
          <p class="text-2xl font-black text-emerald-600">{{ returnedCount }}</p>
          <p class="text-xs font-bold text-slate-500 mt-1">Returned & Cleared</p>
        </div>
      </div>

      <!-- Filters & Search Bar -->
      <div class="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="flex p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
            <button
              v-for="tab in [['ALL', 'All Loans'], ['ISSUED', 'Active Loans'], ['RETURNED', 'Returned & Cleared']]"
              :key="tab[0]"
              @click="activeFilter = tab[0] as any"
              :class="activeFilter === tab[0] ? 'bg-white text-[#06387d] shadow-xs' : 'text-slate-500 hover:text-slate-900'"
              class="px-4 py-2 rounded-lg transition cursor-pointer flex-1 sm:flex-none text-center"
            >
              {{ tab[1] }}
            </button>
          </div>

          <div class="relative w-full sm:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by title, isbn, shelf..."
              class="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition"
            />
          </div>
        </div>

        <!-- Borrows List -->
        <div v-if="loading" class="py-16 text-center text-slate-400">
          <div class="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p class="text-xs font-bold">Loading your circulation records...</p>
        </div>

        <div v-else-if="filteredBorrows.length === 0" class="py-16 text-center text-slate-400">
          <span class="text-4xl block mb-2">📖</span>
          <p class="text-sm font-bold text-slate-700">No borrow records found</p>
          <p class="text-xs mt-1">Visit the search catalog to borrow books from the university library.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-100 text-slate-400 uppercase font-black">
                <th class="py-3 px-3">Tx #</th>
                <th class="py-3 px-3">Book Details</th>
                <th class="py-3 px-3">Loan Type</th>
                <th class="py-3 px-3">Due Date</th>
                <th class="py-3 px-3">Fine / Penalty</th>
                <th class="py-3 px-3 text-center">Status</th>
                <th class="py-3 px-3 text-right">Actions / Voucher</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="b in filteredBorrows" :key="b.id" class="hover:bg-slate-50/70 transition">
                <!-- Transaction ID -->
                <td class="py-3.5 px-3 font-mono font-bold text-slate-500">
                  #{{ b.transactionId || b.id }}
                </td>

                <!-- Book Details -->
                <td class="py-3.5 px-3">
                  <p class="font-bold text-slate-900 text-xs">{{ b.bookTitle }}</p>
                  <p class="text-[10px] text-slate-400">{{ b.author }} • ISBN: {{ b.isbn || 'N/A' }}</p>
                  <span class="inline-block mt-0.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    Shelf: {{ b.shelfNumber || 'A-01' }}
                  </span>
                </td>

                <!-- Loan Type & Duration -->
                <td class="py-3.5 px-3">
                  <span
                    :class="b.loanType === 'SHORT' ? 'bg-purple-100 text-purple-800' : 'bg-indigo-100 text-indigo-800'"
                    class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase inline-block"
                  >
                    {{ b.loanType === 'SHORT' ? '⚡ SHORT' : '📚 LONG' }} ({{ b.durationDays }}d)
                  </span>
                </td>

                <!-- Due Date -->
                <td class="py-3.5 px-3 font-medium whitespace-nowrap">
                  <p :class="b.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'">
                    {{ formatDate(b.dueDate) }}
                  </p>
                  <span v-if="b.isOverdue" class="text-[10px] text-rose-500 font-bold">
                    ⚠️ Overdue: {{ b.daysOverdue }} days
                  </span>
                  <span v-else-if="b.status === 'ISSUED'" class="text-[10px] text-emerald-600 font-semibold">
                    ✓ On Time
                  </span>
                </td>

                <!-- Fine Calculation -->
                <td class="py-3.5 px-3">
                  <span
                    v-if="b.fineAmount > 0"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 block w-fit"
                  >
                    {{ b.fineAmount }} ETB Fine
                  </span>
                  <span v-else class="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full block w-fit">
                    0.00 ETB (No Fine)
                  </span>
                </td>

                <!-- Status Badge -->
                <td class="py-3.5 px-3 text-center">
                  <span
                    :class="{
                      'bg-emerald-100 text-emerald-800 border-emerald-200': b.status === 'RETURNED',
                      'bg-blue-100 text-blue-800 border-blue-200': b.status === 'ISSUED',
                      'bg-amber-100 text-amber-800 border-amber-200': b.status === 'REQUESTED',
                    }"
                    class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border inline-block"
                  >
                    {{ b.status === 'RETURNED' ? '✓ Returned' : (b.status === 'ISSUED' ? '📖 Active' : b.status) }}
                  </span>
                </td>

                <!-- Action / Proof -->
                <td class="py-3.5 px-3 text-right whitespace-nowrap">
                  <!-- Case 1: Book is currently with student (ISSUED) -> Option to request return voucher & pay penalty -->
                  <template v-if="b.status === 'ISSUED'">
                    <div v-if="b.paymentProof" class="flex flex-col items-end gap-1">
                      <button
                        @click="initiateReturn(b)"
                        class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1 ml-auto"
                      >
                        <span>🧾 View / Edit Slip</span>
                        <span class="text-[9px] bg-emerald-700 px-1.5 py-0.5 rounded-full">Proof Sent</span>
                      </button>
                      <span class="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                        <span>✓ Proof Sent to Librarian</span>
                      </span>
                    </div>

                    <button
                      v-else-if="b.fineAmount > 0"
                      @click="initiateReturn(b)"
                      class="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5 ml-auto"
                    >
                      <span>💳 Pay Fine & Return</span>
                      <span class="text-[9px] bg-rose-700 px-1.5 py-0.5 rounded-full">{{ b.fineAmount }} ETB</span>
                    </button>

                    <button
                      v-else
                      @click="initiateReturn(b)"
                      class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1 ml-auto"
                    >
                      <span>🔄 Request Return Voucher</span>
                    </button>
                  </template>

                  <!-- Case 2: Book is already returned (RETURNED) -> Official Clearance Receipt -->
                  <template v-else-if="b.status === 'RETURNED'">
                    <button
                      @click="openReceiptModal(b)"
                      class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-[11px] font-bold shadow-xs cursor-pointer transition flex items-center gap-1.5 ml-auto"
                    >
                      <span>📜 Return Certificate</span>
                      <span class="text-[9px] bg-emerald-800 px-1.5 py-0.5 rounded-full">Receipt</span>
                    </button>
                  </template>

                  <span v-else class="text-slate-400 text-xs italic">Processing...</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ================= MODAL 1: RETURN SUBMISSION VOUCHER & PENALTY PAYMENT ================= -->
    <div v-if="isReturnNoticeOpen && returnNotice" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔄</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">Book Return & Penalty Settlement</h3>
              <p class="text-[10px] text-slate-500">Mekdela Amba University Library Circulation</p>
            </div>
          </div>
          <button @click="isReturnNoticeOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Tracking Code Header -->
        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 text-center space-y-1">
          <span class="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Return Tracking Code</span>
          <p class="text-2xl font-mono font-black text-blue-900">{{ returnNotice.refCode }}</p>
          <p class="text-[11px] text-blue-800 font-medium">
            Present this code to the librarian at the circulation desk when handing over the book.
          </p>
        </div>

        <!-- Book & Borrow Summary -->
        <div class="space-y-1.5 text-xs border border-slate-100 rounded-2xl p-3.5 bg-slate-50/70">
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">Book Title:</span>
            <span class="font-bold text-slate-900 text-right max-w-[250px] truncate">{{ returnNotice.bookTitle }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">Borrower ID:</span>
            <span class="font-bold text-slate-900 font-mono">{{ authStore.currentUserId }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500 font-medium">Due Date:</span>
            <span class="font-bold text-slate-900">{{ formatDate(returnNotice.dueDate) }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200/60 pt-1.5">
            <span class="text-slate-600 font-bold">Fine Settlement Status:</span>
            <span :class="returnNotice.fineAmount > 0 ? 'text-rose-600 font-black' : 'text-emerald-600 font-black'">
              {{ returnNotice.fineAmount > 0 ? returnNotice.fineAmount + ' ETB Overdue Fine' : '0.00 ETB (On Time ✓)' }}
            </span>
          </div>
        </div>

        <!-- CASE A: BOOK HAS PENALTY FINE -> BANK DETAILS & SCREENSHOT UPLOAD -->
        <div v-if="returnNotice.fineAmount > 0" class="space-y-3 pt-1">
          
          <!-- Bank Account Info Card -->
          <div class="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-amber-900 flex items-center gap-1.5">
                <span>🏦</span> CBE Bank Account for Fine Settlement
              </span>
              <span class="text-[10px] bg-rose-600 text-white font-black px-2 py-0.5 rounded-full">
                {{ returnNotice.fineAmount }} ETB
              </span>
            </div>

            <div class="bg-white/80 p-2.5 rounded-xl border border-amber-200/60 text-xs space-y-1">
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Bank Name:</span>
                <span class="font-bold text-slate-800">Commercial Bank of Ethiopia (CBE)</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Account Number:</span>
                <div class="flex items-center gap-1.5">
                  <span class="font-mono font-black text-slate-900 text-sm">1000345678912</span>
                  <button
                    type="button"
                    @click="copyCBEAccount"
                    class="px-2 py-0.5 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold cursor-pointer transition shadow-2xs"
                  >
                    {{ copiedAccount ? '✓ Copied' : '📋 Copy' }}
                  </button>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-500">Account Name:</span>
                <span class="font-bold text-slate-800">Mekdela Amba University Library Revenue</span>
              </div>
            </div>
            <p class="text-[10px] text-amber-800">
              💡 Please transfer via CBE Mobile Banking or branch, then upload your transaction slip below.
            </p>
          </div>

          <!-- Sub-Case 1: Payment Proof Already Submitted -->
          <div v-if="returnNotice.paymentProof" class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div class="flex items-center gap-1.5 text-emerald-800 font-bold">
              <span>✓</span>
              <span>Payment Proof Submitted to Librarian</span>
            </div>
            <div class="flex justify-between items-center text-[11px] text-emerald-900">
              <span>CBE Reference:</span>
              <span class="font-mono font-bold">{{ returnNotice.paymentProof.txnReference }}</span>
            </div>
            <div v-if="returnNotice.paymentProof.receiptScreenshot" class="pt-1">
              <span class="text-[10px] text-slate-500 block mb-1">Attached Receipt Screenshot:</span>
              <img 
                :src="returnNotice.paymentProof.receiptScreenshot" 
                alt="Payment Receipt" 
                class="w-full max-h-44 object-contain rounded-xl border border-emerald-200 bg-white"
              />
            </div>
          </div>

          <!-- Sub-Case 2: Submit / Upload New Payment Proof -->
          <div v-else class="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                CBE Transaction Reference Number *
              </label>
              <input
                v-model="paymentForm.txnReference"
                type="text"
                placeholder="e.g. FT2611894223..."
                class="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600 shadow-2xs uppercase"
                required
              />
              <p class="text-[10px] text-slate-400 mt-0.5">Found on your CBE mobile banking receipt (starts with FT)</p>
            </div>

            <div>
              <label class="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                Upload Payment Slip Screenshot
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                @change="handleScreenshotUpload"
                class="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs cursor-pointer file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-500"
              />
              <p class="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP screenshot of your CBE transfer receipt</p>
            </div>

            <!-- Instant Image Preview -->
            <div v-if="paymentForm.receiptScreenshot" class="p-2 bg-white border border-blue-200 rounded-xl space-y-1">
              <div class="flex items-center justify-between text-[10px] font-bold text-blue-700">
                <span>Receipt Preview:</span>
                <button type="button" @click="paymentForm.receiptScreenshot = ''" class="text-rose-600 hover:underline cursor-pointer">Remove</button>
              </div>
              <img :src="paymentForm.receiptScreenshot" alt="Receipt Preview" class="w-full max-h-40 object-contain rounded-lg border border-slate-100" />
            </div>

            <!-- Feedback Message -->
            <div v-if="paymentForm.error" class="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
              ✕ {{ paymentForm.error }}
            </div>
            <div v-if="paymentForm.success" class="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              ✓ {{ paymentForm.success }}
            </div>

            <!-- Single Primary Action Button When Submitting Payment -->
            <button
              type="button"
              @click="submitPenaltyPayment"
              :disabled="paymentForm.isSubmitting"
              class="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <span v-if="paymentForm.isSubmitting">Submitting Slip...</span>
              <template v-else>
                <span>💳 Submit Penalty Payment Proof</span>
              </template>
            </button>
          </div>

        </div>

        <!-- Modal Footer: Only shown when payment is already submitted OR when fine is 0 (Never duplicate submit button) -->
        <div v-if="returnNotice.fineAmount === 0 || returnNotice.paymentProof" class="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            @click="handleDoneReturnSlip"
            class="w-full py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition text-center"
          >
            Done
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL 2: OFFICIAL RETURN CLEARANCE CERTIFICATE ================= -->
    <div v-if="isReceiptModalOpen && selectedReceipt" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 print:shadow-none print:border-none">
        
        <!-- Printable Certificate Box -->
        <div id="print-receipt-area" class="border-2 border-emerald-600/30 rounded-2xl p-6 bg-radial from-emerald-50/20 to-white space-y-5">
          <!-- University Header -->
          <div class="text-center border-b border-slate-200 pb-4 space-y-1">
            <p class="text-xs font-black tracking-widest text-slate-400 uppercase">Mekdela Amba University</p>
            <h2 class="text-lg font-black text-slate-900">Official Library Return & Clearance Certificate</h2>
            <p class="text-xs font-bold text-emerald-800">Circulation & Repository Clearance Desk</p>
            <p class="text-[10px] font-mono text-slate-500 pt-1">Receipt No: <strong>{{ selectedReceipt.receiptNo }}</strong></p>
          </div>

          <!-- Certificate Body Details -->
          <div class="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
              <p class="font-bold text-slate-900">{{ selectedReceipt.studentName }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Student ID</span>
              <p class="font-bold text-slate-900 font-mono">{{ selectedReceipt.studentId }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
              <p class="font-bold text-slate-800">{{ selectedReceipt.department }}</p>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Loan Type</span>
              <p class="font-bold text-slate-800">{{ selectedReceipt.loanType }} • {{ selectedReceipt.shelfType }}</p>
            </div>
          </div>

          <div class="border-t border-b border-slate-100 py-3 text-xs space-y-2">
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">Book Title:</span>
              <span class="font-black text-slate-900 text-right max-w-[240px] truncate">{{ selectedReceipt.bookTitle }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">Borrow Date:</span>
              <span class="font-bold text-slate-800 font-mono">{{ formatDate(selectedReceipt.issueDate) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-slate-500 font-medium">Official Return Date:</span>
              <span class="font-bold text-emerald-700 font-mono">{{ formatDate(selectedReceipt.returnDate) }}</span>
            </div>
            <div class="flex justify-between border-t border-slate-100 pt-1.5">
              <span class="text-slate-600 font-bold">Fine Settlement:</span>
              <span :class="selectedReceipt.fineAmount > 0 ? 'text-rose-600 font-black' : 'text-emerald-700 font-black'">
                {{ selectedReceipt.fineAmount > 0 ? selectedReceipt.fineAmount + ' ETB (Settled)' : '0.00 ETB (On Time ✓)' }}
              </span>
            </div>
          </div>

          <!-- Official Stamp Seal -->
          <div class="flex items-center justify-between pt-2">
            <div class="border-2 border-emerald-600 rounded-xl px-3 py-1.5 text-center bg-emerald-50/50">
              <span class="text-[9px] font-black text-emerald-800 uppercase block tracking-wider">✓ VERIFIED & CLEARED</span>
              <span class="text-[8px] font-mono text-emerald-600">MAU LIBRARY CIRCULATION</span>
            </div>
            <div class="text-right">
              <p class="text-[10px] font-bold text-slate-500 uppercase">Authorized Librarian</p>
              <p class="text-xs font-black text-slate-900">{{ selectedReceipt.verifiedBy }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            @click="isReceiptModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            @click="printReceipt()"
            class="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-2"
          >
            <span>🖨️ Print Return Certificate</span>
          </button>
        </div>

      </div>
    </div>

  </div>
</template>
