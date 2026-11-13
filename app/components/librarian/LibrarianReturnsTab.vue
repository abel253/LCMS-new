<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
          <RotateCcw :size="22" class="text-emerald-600" /> Book Returns & Fines Collection
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          Process book returns, inspect physical condition, verify overdue fine payments, and issue official clearance slips
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200">
          Ready for Return: {{ activeLoans.length }}
        </span>
        <button 
          @click="$emit('refresh')" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          title="Refresh Returns List"
        >
          <RefreshCw :size="14" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Active Loans Table Container -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-4">
      
      <!-- Table Header & Search -->
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <h3 class="font-black text-slate-900 text-sm flex items-center gap-2">
          <BookOpen :size="16" class="text-blue-600" /> 
          <span>Active Loans & Student Return Slips</span>
        </h3>

        <div class="flex items-center gap-2 w-full md:w-auto">
          <!-- Refresh Button -->
          <button 
            type="button" 
            @click="$emit('refresh')" 
            class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 border border-slate-200"
            title="Refresh Active Loans & New Slips"
          >
            <RefreshCw :size="13" />
            <span>Refresh</span>
          </button>

          <!-- Search Bar with Tracking Code, Student ID & Book Title support -->
          <div class="relative w-full md:w-72">
            <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search by code, ID, name..." 
              class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition" 
            />
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="text-slate-400 uppercase font-black border-b border-slate-100">
              <th class="py-3 px-3">TX / Tracking Code</th>
              <th class="py-3 px-3">Borrower Details</th>
              <th class="py-3 px-3">Book Title & Location</th>
              <th class="py-3 px-3 text-center">Loan Type</th>
              <th class="py-3 px-3">Due Date</th>
              <th class="py-3 px-3 text-center">Status</th>
              <th class="py-3 px-3 text-right">Fine Settlement</th>
              <th class="py-3 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="loan in filteredList" 
              :key="loan.transactionId || loan.id"
              :class="loan.isOverdue ? 'bg-rose-50/40' : ''"
              class="hover:bg-slate-50 transition-colors group"
            >
              <!-- Column 1: TX & Tracking Code -->
              <td class="py-3 px-3">
                <div class="space-y-0.5">
                  <span class="font-mono font-bold text-slate-800 text-xs">#{{ loan.transactionId || loan.id }}</span>
                  <div class="flex items-center gap-1">
                    <span class="px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-mono text-[10px] font-bold">
                      RET-REQ-{{ String(loan.transactionId || loan.id).padStart(5, '0') }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Column 2: Borrower -->
              <td class="py-3 px-3">
                <div class="space-y-0.5">
                  <p class="font-bold text-slate-900 whitespace-nowrap">{{ loan.borrowerName || loan.studentName || 'Student Patron' }}</p>
                  <p class="text-[10px] text-slate-500 font-mono">ID: {{ loan.borrowerId || loan.studentId || 'N/A' }}</p>
                  <p v-if="loan.department" class="text-[10px] text-slate-400">{{ loan.department }}</p>
                </div>
              </td>

              <!-- Column 3: Book Title & Shelf -->
              <td class="py-3 px-3">
                <div class="space-y-0.5 max-w-[220px]">
                  <p class="font-bold text-slate-800 truncate" :title="loan.bookTitle">{{ loan.bookTitle }}</p>
                  <div class="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span v-if="loan.shelfNumber">Shelf: {{ loan.shelfNumber }}</span>
                    <span v-if="loan.shelfType" class="text-blue-600 font-bold">({{ loan.shelfType }})</span>
                  </div>
                </div>
              </td>

              <!-- Column 4: Loan Type -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span 
                  :class="loan.loanType === 'SHORT' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-blue-100 text-blue-800 border border-blue-200'"
                  class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                >
                  {{ loan.loanType || 'SHORT' }}
                </span>
              </td>

              <!-- Column 5: Due Date -->
              <td class="py-3 px-3 font-semibold whitespace-nowrap" :class="loan.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'">
                {{ formatDate(loan.dueDate) }}
              </td>

              <!-- Column 6: Overdue Status -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <span v-if="loan.isOverdue" class="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-rose-200">
                  {{ loan.daysOverdue || 1 }} days late
                </span>
                <span v-else class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  On Time ✓
                </span>
              </td>

              <!-- Column 7: Calculated Fine & Payment Verification Status -->
              <td class="py-3 px-3 text-right whitespace-nowrap">
                <div class="space-y-1">
                  <!-- Fine Amount -->
                  <span class="font-black block text-xs" :class="loan.fineAmount > 0 ? (isLoanFinePaid(loan) ? 'text-emerald-700' : 'text-rose-600') : 'text-slate-400'">
                    {{ loan.fineAmount > 0 ? loan.fineAmount + ' ETB' : '0.00 ETB' }}
                  </span>

                  <!-- Status Badge -->
                  <div v-if="loan.fineAmount > 0">
                    <span 
                      v-if="isLoanFinePaid(loan)" 
                      class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block shadow-2xs"
                    >
                      ✓ Paid & Verified
                    </span>
                    <span 
                      v-else-if="loan.paymentProof?.txnReference || loan.finePaymentStatus === 'PAID_PENDING_VERIFICATION'" 
                      class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1 shadow-2xs"
                    >
                      ⚡ Slip Submitted
                    </span>
                    <span 
                      v-else 
                      class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300 inline-block"
                    >
                      ⚠ Unpaid
                    </span>
                  </div>

                  <!-- Student CBE Slip button if submitted -->
                  <div v-if="loan.paymentProof?.receiptScreenshot || loan.paymentProof?.txnReference">
                    <button
                      type="button"
                      @click.stop="openReceiptViewer(loan)"
                      class="mt-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer transition shadow-xs"
                      title="View Student Attached Slip"
                    >
                      <span>🔍 View Slip</span>
                      <span v-if="loan.paymentProof.txnReference" class="font-mono text-[9px] opacity-90">({{ loan.paymentProof.txnReference.slice(0, 8) }})</span>
                    </button>
                  </div>
                </div>
              </td>

              <!-- Column 8: Action -->
              <td class="py-3 px-3 text-center whitespace-nowrap">
                <button 
                  @click="openConfirmModal(loan)"
                  class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1 mx-auto"
                >
                  <Check :size="13" />
                  <span>Return Book</span>
                </button>
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="filteredList.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-400 text-xs">
                <div class="max-w-sm mx-auto space-y-1">
                  <p class="text-2xl">✨</p>
                  <p class="font-bold text-slate-700">No active book loans pending return.</p>
                  <p class="text-[11px] text-slate-400">All issued library books are up to date or returned.</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ================= 2-STEP RETURN & FINE VERIFICATION MODAL ================= -->
    <div v-if="isModalOpen && selectedLoan" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 my-8 animate-scale-up">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📥</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">Book Return & Fine Clearance Desk</h3>
              <p class="text-[10px] text-slate-500">Transaction #{{ selectedLoan.transactionId || selectedLoan.id }}</p>
            </div>
          </div>
          <button @click="isModalOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Loan Summary Card -->
        <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
          <div class="flex justify-between items-start">
            <span class="text-slate-500">Borrower:</span>
            <span class="font-bold text-slate-900 text-right">{{ selectedLoan.borrowerName || selectedLoan.studentName }} ({{ selectedLoan.borrowerId || selectedLoan.studentId }})</span>
          </div>
          <div class="flex justify-between items-start">
            <span class="text-slate-500">Book Title:</span>
            <span class="font-black text-slate-900 text-right max-w-[240px] truncate">{{ selectedLoan.bookTitle }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-500">Tracking Slip:</span>
            <span class="font-mono font-bold text-blue-700">RET-REQ-{{ String(selectedLoan.transactionId || selectedLoan.id).padStart(5, '0') }}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200 pt-1.5">
            <span class="text-slate-600 font-bold">Total Overdue Fine:</span>
            <span :class="selectedLoan.fineAmount > 0 ? (isFinePaid ? 'text-emerald-700 font-black' : 'text-rose-600 font-black') : 'text-emerald-700 font-black'">
              {{ selectedLoan.fineAmount > 0 ? selectedLoan.fineAmount + ' ETB' : '0.00 ETB (No Fine ✓)' }}
            </span>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════
             STEP 1: PENALTY PAYMENT VERIFICATION (If Fine > 0)
             ══════════════════════════════════════════════════════ -->
        <div v-if="selectedLoan.fineAmount > 0" class="space-y-2.5">
          
          <!-- Sub-case 1: Already Verified & Paid -->
          <div v-if="isFinePaid" class="p-3.5 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-xs space-y-1.5 text-emerald-950">
            <div class="flex items-center justify-between font-black">
              <span class="flex items-center gap-1.5 text-emerald-800">
                <span class="text-base">✅</span> የቅጣት ክፍያ ተረጋግጧል (Penalty Verified & Settled)
              </span>
              <span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-mono text-[10px]">
                {{ selectedLoan.fineAmount }} ETB CLEARED
              </span>
            </div>
            <p class="text-[11px] text-emerald-800 font-medium">
              የክፍያ ዘዴ: <strong>{{ finePaymentForm.method }}</strong> • መለያ/ደረሰኝ ቁጥር: <span class="font-mono font-bold">{{ finePaymentForm.reference || selectedLoan.paymentProof?.txnReference || 'CONFIRMED' }}</span>
            </p>
          </div>

          <!-- Sub-case 2: Unverified Fine - Librarian Must Verify or Waive -->
          <div v-else class="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-xs space-y-3 text-amber-950">
            <div class="flex items-center justify-between font-black">
              <span class="flex items-center gap-1.5 text-amber-900">
                <span class="text-base">⚠️</span> ያልተከፈለ ቅጣት: {{ selectedLoan.fineAmount }} ETB (Unpaid Penalty)
              </span>
              <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white font-mono text-[10px] uppercase shadow-2xs">
                Requires Verification
              </span>
            </div>

            <p class="text-[11px] text-amber-900 leading-relaxed">
              መጽሐፉን ከመመለስዎ በፊት እባክዎ የቅጣት ክፍያውን በካውንተር ይቀበሉ ወይም የባንክ ደረሰኙን አረጋግጠው <strong>"ክፍያውን አረጋግጥ"</strong> የሚለውን ይጫኑ።
            </p>

            <!-- Prominent Display: If student submitted online slip, show full proof & image -->
            <div v-if="selectedLoan.paymentProof?.txnReference || selectedLoan.paymentProof?.receiptScreenshot" class="bg-blue-50/90 p-3 rounded-2xl border-2 border-blue-300 space-y-2.5">
              <div class="flex items-center justify-between font-black text-blue-950 text-xs">
                <span class="flex items-center gap-1.5">
                  <span class="text-base">🧾</span> የተማሪው የክፍያ ማረጋገጫ (Attached Bank Payment Slip)
                </span>
                <span class="px-2 py-0.5 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold uppercase">
                  Slip Attached
                </span>
              </div>

              <!-- Ref number banner -->
              <div class="bg-white p-2.5 rounded-xl border border-blue-200 flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-slate-500 block font-bold uppercase">CBE Reference Number:</span>
                  <span class="font-mono font-black text-blue-900 text-sm tracking-wider">{{ selectedLoan.paymentProof.txnReference || 'N/A' }}</span>
                </div>
                <button 
                  v-if="selectedLoan.paymentProof.receiptScreenshot"
                  type="button" 
                  @click.stop="openReceiptViewer(selectedLoan)" 
                  class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold cursor-pointer transition shadow-2xs flex items-center gap-1"
                >
                  <span>በትልቁ እይ 🔍</span>
                </button>
              </div>

              <!-- Image thumbnail directly displayed in the modal -->
              <div v-if="selectedLoan.paymentProof.receiptScreenshot" class="space-y-1">
                <span class="text-[10px] text-slate-600 font-bold block">የተላከው የባንክ ደረሰኝ ምስል (Bank Receipt Image):</span>
                <div 
                  @click="openReceiptViewer(selectedLoan)"
                  class="rounded-xl overflow-hidden border border-blue-200 bg-white p-1.5 max-h-48 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
                  title="Click to zoom fullscreen"
                >
                  <img 
                    :src="selectedLoan.paymentProof.receiptScreenshot" 
                    alt="Payment Slip Screenshot" 
                    class="max-h-44 w-auto object-contain rounded-lg shadow-2xs" 
                  />
                </div>
                <p class="text-[9px] text-slate-400 text-center">ምስሉን በትልቁ ለማየት በላዩ ላይ ይጫኑ (Click image to expand)</p>
              </div>
            </div>

            <!-- In-line Payment Settlement Form -->
            <div class="bg-white p-3 rounded-xl border border-amber-200/80 space-y-2.5">
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] font-bold uppercase text-slate-600 mb-1">የክፍያ ዘዴ / Channel *</label>
                  <select 
                    v-model="finePaymentForm.method" 
                    class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="CASH">💵 Cash at Desk (በእጅ ጥሬ ገንዘብ)</option>
                    <option value="TELEBIRR">📱 Telebirr (ቴሌብር)</option>
                    <option value="CBE">🏦 CBE Bank Transfer (ንግድ ባንክ)</option>
                    <option value="WAIVED">🤝 Waive / ይቅርታ ተደርጓል</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[10px] font-bold uppercase text-slate-600 mb-1">የደረሰኝ / Ref ቁጥር</label>
                  <input 
                    v-model="finePaymentForm.reference" 
                    type="text" 
                    :placeholder="finePaymentForm.method === 'WAIVED' ? 'ምክንያት / ማብራሪያ' : 'e.g. CASH-041 or FT26...'" 
                    class="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono outline-none" 
                  />
                </div>
              </div>

              <button
                type="button"
                :disabled="isVerifyingFine"
                @click="verifyFinePayment"
                class="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <span v-if="isVerifyingFine" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ isVerifyingFine ? 'በማረጋገጥ ላይ...' : '✓ ክፍያውን አረጋግጥና መዝግብ (Verify Penalty Paid)' }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ══════════════════════════════════════════════════════
             STEP 2: PHYSICAL INSPECTION & RESTOCKING
             ══════════════════════════════════════════════════════ -->
        <div class="space-y-3 pt-1">
          <!-- Physical Condition Selector -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              የመጽሐፉ አካላዊ ሁኔታ (Physical Book Condition) *
            </label>
            <select 
              v-model="returnForm.condition" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="Good Condition">✓ Good Condition (ምንም እንከን የሌለው)</option>
              <option value="Minor Wear">● Minor Wear (ትንሽ ያረጀ)</option>
              <option value="Damaged">✕ Damaged / Requires Repair (የተቀደደ / የተጎዳ)</option>
              <option value="Lost">⚠ Lost Book Replacement (የጠፋ መጽሐፍ ካሳ)</option>
            </select>
          </div>

          <!-- Librarian Notes -->
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">
              የላይብረሪያን ማስታወሻ (Notes / Clearance Remarks)
            </label>
            <input 
              v-model="returnForm.notes" 
              type="text" 
              placeholder="e.g. Returned on circulation counter, barcode scanned" 
              class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white" 
            />
          </div>
        </div>

        <!-- Modal Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            @click="isModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <!-- Final Return Button: Instant One-Click Return for Librarian -->
          <button
            type="button"
            :disabled="isSubmittingReturn"
            @click="confirmReturnSubmit"
            class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-md cursor-pointer rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <span v-if="isSubmittingReturn" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <Check v-else :size="14" />
            <span>Confirm & Return Book Back (መጽሐፉን ተቀብለህ አስገባ)</span>
          </button>
        </div>

      </div>
    </div>

    <!-- ================= FULLSCREEN RECEIPT VIEWER MODAL ================= -->
    <div v-if="isReceiptViewerOpen && activeViewerReceipt" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🧾</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">Student CBE Penalty Slip</h3>
              <p class="text-[10px] text-slate-500 font-mono">Ref: {{ activeViewerReceipt.txnReference }}</p>
            </div>
          </div>
          <button @click="isReceiptViewerOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">Student:</span>
            <span class="font-bold text-slate-900">{{ activeViewerReceipt.studentName }} ({{ activeViewerReceipt.userId }})</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">Bank:</span>
            <span class="font-bold text-slate-800">{{ activeViewerReceipt.bankName || 'CBE' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-slate-500">Amount:</span>
            <span class="font-black text-rose-600 font-mono">{{ activeViewerReceipt.fineAmount }} ETB</span>
          </div>
        </div>

        <div v-if="activeViewerReceipt.receiptScreenshot" class="pt-2">
          <img 
            :src="activeViewerReceipt.receiptScreenshot" 
            alt="Bank Receipt Slip" 
            class="w-full max-h-[60vh] object-contain rounded-2xl border border-slate-200 bg-slate-50"
          />
        </div>

        <div class="pt-2 flex gap-2">
          <button
            type="button"
            @click="isReceiptViewerOpen = false"
            class="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition text-center cursor-pointer"
          >
            Close Slip Viewer
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RotateCcw, RefreshCw, BookOpen, Search, Check } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  loans: any[]
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'return', payload: any): void
}>()

const authStore = useAuthStore()
const toast = useToast()

const searchQuery = ref('')
const isModalOpen = ref(false)
const selectedLoan = ref<any>(null)
const isFinePaid = ref(false)
const isVerifyingFine = ref(false)
const isSubmittingReturn = ref(false)

const returnForm = ref({
  condition: 'Good Condition',
  notes: '',
})

const finePaymentForm = ref({
  method: 'CASH', // CASH | CBE | TELEBIRR | WAIVED
  reference: '',
  notes: '',
  amount: 0,
})

// Receipt Viewer State
const isReceiptViewerOpen = ref(false)
const activeViewerReceipt = ref<any>(null)

const isLoanFinePaid = (loan: any): boolean => {
  if (!loan || Number(loan.fineAmount || 0) <= 0) return true
  return Boolean(
    loan.finePaid || 
    loan.finePaymentStatus === 'VERIFIED_PAID' || 
    loan.finePaymentStatus === 'WAIVED' ||
    loan.paymentProof?.status === 'VERIFIED_PAID'
  )
}

const openReceiptViewer = (loan: any) => {
  if (!loan.paymentProof) return
  activeViewerReceipt.value = {
    ...loan.paymentProof,
    studentName: loan.borrowerName || loan.studentName,
    userId: loan.borrowerId || loan.studentId,
    fineAmount: loan.fineAmount
  }
  isReceiptViewerOpen.value = true
}

const activeLoans = computed(() => {
  return (props.loans || []).filter(l => l.status === 'ISSUED' || l.status === 'issued')
})

const filteredList = computed(() => {
  let list = activeLoans.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(l => 
      (l.borrowerName || l.studentName)?.toLowerCase().includes(q) ||
      (l.borrowerId || l.studentId)?.toLowerCase().includes(q) ||
      l.bookTitle?.toLowerCase().includes(q) ||
      String(l.transactionId || l.id).includes(q) ||
      `ret-req-${String(l.transactionId || l.id).padStart(5, '0')}`.includes(q)
    )
  }
  return list
})

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const openConfirmModal = (loan: any) => {
  selectedLoan.value = loan
  returnForm.value.condition = 'Good Condition'
  returnForm.value.notes = ''
  
  const alreadySettled = isLoanFinePaid(loan)
  isFinePaid.value = alreadySettled || Number(loan.fineAmount || 0) <= 0
  
  finePaymentForm.value = {
    method: loan.paymentProof?.paymentMethod || (loan.paymentProof?.txnReference ? 'CBE' : 'CASH'),
    reference: loan.paymentProof?.txnReference || '',
    notes: '',
    amount: Number(loan.fineAmount || 0),
  }
  isModalOpen.value = true
}

const verifyFinePayment = async () => {
  if (!selectedLoan.value) return
  isVerifyingFine.value = true
  try {
    const refNum = finePaymentForm.value.reference.trim() || `${finePaymentForm.value.method}-DESK-${Date.now().toString().slice(-6)}`
    const res: any = await $fetch('/api/loans/penalty-payment', {
      method: 'POST',
      body: {
        transactionId: selectedLoan.value.transactionId || selectedLoan.value.id,
        isLibrarianVerification: true,
        paymentMethod: finePaymentForm.value.method,
        fineAmount: finePaymentForm.value.amount || selectedLoan.value.fineAmount,
        txnReference: refNum,
        notes: finePaymentForm.value.notes,
        verifiedBy: authStore.user?.name || 'Circulation Librarian',
      }
    })
    
    isFinePaid.value = true
    selectedLoan.value.finePaid = true
    finePaymentForm.value.reference = refNum
    selectedLoan.value.paymentProof = {
      paymentMethod: finePaymentForm.value.method,
      txnReference: refNum,
      fineAmount: selectedLoan.value.fineAmount,
      status: 'VERIFIED_PAID',
    }

    toast.success(res?.message || 'Fine payment verified and recorded successfully!', 'Payment Verified')
    emit('refresh')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to verify fine payment', 'Verification Error')
  } finally {
    isVerifyingFine.value = false
  }
}

const confirmReturnSubmit = async () => {
  if (!selectedLoan.value) return
  isSubmittingReturn.value = true

  try {
    const refNum = finePaymentForm.value.reference?.trim() 
      || selectedLoan.value.paymentProof?.txnReference 
      || `${finePaymentForm.value.method}-DESK-${Date.now().toString().slice(-6)}`

    // If fine exists and hasn't been individually verified, settle it automatically
    if (selectedLoan.value.fineAmount > 0 && !isFinePaid.value) {
      await $fetch('/api/loans/penalty-payment', {
        method: 'POST',
        body: {
          transactionId: selectedLoan.value.transactionId || selectedLoan.value.id,
          isLibrarianVerification: true,
          paymentMethod: finePaymentForm.value.method,
          fineAmount: finePaymentForm.value.amount || selectedLoan.value.fineAmount,
          txnReference: refNum,
          notes: finePaymentForm.value.notes || 'Settled and verified by Librarian on return',
          verifiedBy: authStore.user?.name || 'Circulation Librarian',
        }
      }).catch(e => console.warn('Penalty payment settlement notice:', e))
    }

    emit('return', {
      id: selectedLoan.value.transactionId || selectedLoan.value.id,
      condition: returnForm.value.condition,
      notes: returnForm.value.notes,
      finePaid: true,
      paymentMethod: finePaymentForm.value.method,
      paymentReceipt: refNum,
    })
    isModalOpen.value = false
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to complete return', 'Error')
  } finally {
    isSubmittingReturn.value = false
  }
}
</script>
