<template>
  <div class="space-y-6">
    <!-- Header & Summary Stats -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
          <MessageSquareText :size="24" class="text-blue-600" /> 
          <span>{{ isAdmin ? 'Helpdesk & Escalated Inquiries (የተማሪዎች እና የአስተዳደር ጥያቄዎች)' : 'Student Inquiries & Helpdesk (የተማሪዎች ጥያቄዎች እና መልዕክቶች)' }}</span>
        </h2>
        <p class="text-xs text-slate-500 mt-0.5">
          {{ isAdmin ? 'በላይብረሪያን የተላለፉ (Escalated) እና የተማሪዎች አጠቃላይ ጥያቄዎች የሚስተናገዱበት የአድሚን ዴስክ' : 'በ Contact / Help ቅጽ በኩል የተላኩ የተማሪዎች ጥያቄዎች ምላሽ የሚሰጥበት ወይም ወደ አድሚን የሚተላለፍበት ገጽ' }}
        </p>
      </div>

      <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
        <button 
          @click="$emit('refresh')" 
          class="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition shadow-2xs"
          title="Refresh Inquiries"
        >
          <RefreshCw :size="14" />
          <span>Refresh</span>
        </button>
      </div>
    </div>

    <!-- Mini Stat Cards (4 Cards) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div class="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <span class="text-[10px] font-black uppercase text-slate-400 tracking-wider">ጠቅላላ (Total)</span>
          <p class="text-2xl font-black text-slate-900 font-mono mt-0.5">{{ inquiries.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Inbox :size="20" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-rose-200/80 p-4 shadow-2xs flex items-center justify-between bg-rose-50/20">
        <div>
          <span class="text-[10px] font-black uppercase text-rose-600 tracking-wider">ያልተነበቡ (Unread)</span>
          <p class="text-2xl font-black text-rose-700 font-mono mt-0.5">{{ unreadCount }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle :size="20" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-amber-300 p-4 shadow-2xs flex items-center justify-between bg-amber-50/30">
        <div>
          <span class="text-[10px] font-black uppercase text-amber-700 tracking-wider">ወደ አድሚን የተላለፉ</span>
          <p class="text-2xl font-black text-amber-800 font-mono mt-0.5">{{ escalatedCount }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
          <ArrowUpRight :size="20" />
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-emerald-200/80 p-4 shadow-2xs flex items-center justify-between bg-emerald-50/20">
        <div>
          <span class="text-[10px] font-black uppercase text-emerald-600 tracking-wider">ምላሽ የተሰጣቸው</span>
          <p class="text-2xl font-black text-emerald-800 font-mono mt-0.5">{{ resolvedCount }}</p>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
          <CheckCircle2 :size="20" />
        </div>
      </div>
    </div>

    <!-- Main Container -->
    <div class="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
      
      <!-- Search & Filters -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <!-- Filter Tabs -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <button
            v-for="f in ['ALL', 'UNREAD', 'ESCALATED', 'RESOLVED']"
            :key="f"
            type="button"
            @click="activeStatusFilter = f"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer',
              activeStatusFilter === f 
                ? 'bg-[#06387d] text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            ]"
          >
            {{ f === 'ALL' ? 'ሁሉንም (All)' : (f === 'UNREAD' ? 'ያልተነበቡ (Unread)' : (f === 'ESCALATED' ? '⚠️ ወደ አድሚን የተላለፉ (Escalated)' : 'የተፈቱ (Resolved)')) }}
          </button>
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-80">
          <Search :size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search by student name, ID, email..." 
            class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition" 
          />
        </div>
      </div>

      <!-- Inquiries List -->
      <div class="space-y-4">
        
        <!-- Individual Inquiry Card -->
        <div 
          v-for="item in filteredInquiries" 
          :key="item.id"
          :class="[
            'p-4 sm:p-5 rounded-2xl border transition-all space-y-3.5',
            item.status === 'ESCALATED' 
              ? 'bg-amber-50/50 border-amber-300 shadow-xs ring-1 ring-amber-300' 
              : (item.status === 'UNREAD' ? 'bg-blue-50/30 border-blue-200 shadow-2xs' : 'bg-white border-slate-200 hover:border-slate-300')
          ]"
        >
          <!-- Card Header: Student Info & Category -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center font-black text-white shrink-0 text-sm shadow-xs"
                :class="item.status === 'ESCALATED' ? 'bg-gradient-to-tr from-amber-500 to-amber-700' : (item.status === 'UNREAD' ? 'bg-gradient-to-tr from-blue-600 to-indigo-600' : 'bg-slate-400')"
              >
                {{ (item.name || 'P').charAt(0).toUpperCase() }}
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-black text-slate-900 text-sm">{{ item.name }}</h4>
                  
                  <!-- Status Badges -->
                  <span 
                    v-if="item.status === 'ESCALATED'" 
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500 text-white shadow-2xs flex items-center gap-1 animate-pulse"
                  >
                    <span>⚠️</span> ወደ አድሚን ተላልፏል (Escalated to Admin)
                  </span>
                  <span 
                    v-else-if="item.status === 'UNREAD'" 
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-500 text-white"
                  >
                    አዲስ (New)
                  </span>
                  <span 
                    v-else 
                    class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800"
                  >
                    ተፈቷል / ምላሽ ተሰጥቷል (Resolved)
                  </span>
                </div>

                <div class="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5 flex-wrap">
                  <span v-if="item.studentId && item.studentId !== 'N/A'">ID: <strong>{{ item.studentId }}</strong></span>
                  <span v-if="item.studentId && item.studentId !== 'N/A'">•</span>
                  <span>{{ item.email }}</span>
                  <span v-if="item.phone && item.phone !== 'N/A'">• {{ item.phone }}</span>
                </div>
              </div>
            </div>

            <!-- Category Badge & Time -->
            <div class="flex items-center gap-2 self-end sm:self-auto">
              <span 
                :class="[
                  'px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider',
                  item.category.includes('Book') ? 'bg-amber-100 text-amber-900 border border-amber-200' :
                  item.category.includes('Digital') ? 'bg-purple-100 text-purple-900 border border-purple-200' :
                  'bg-blue-100 text-blue-900 border border-blue-200'
                ]"
              >
                {{ item.category }}
              </span>
              <span class="text-[11px] text-slate-400 font-medium">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>
          </div>

          <!-- Student's Original Message Body -->
          <div class="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-200/70 text-xs text-slate-800 leading-relaxed">
            <span class="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider">የተማሪው መልዕክት (Student Message):</span>
            <p class="font-medium whitespace-pre-wrap">{{ item.message }}</p>
          </div>

          <!-- Escalation Notice Banner (If Escalated to Admin) -->
          <div v-if="item.escalationReason" class="bg-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-xs text-amber-950 space-y-1">
            <div class="flex items-center justify-between font-black">
              <span class="flex items-center gap-1.5 text-amber-900">
                <span class="text-base">⚠️</span> ወደ አድሚን የተላለፈበት ምክንያት (Escalated to Admin)
              </span>
              <span class="text-[10px] text-amber-700 font-mono">By {{ item.escalatedBy || 'Librarian' }} • {{ formatDate(item.escalatedAt) }}</span>
            </div>
            <p class="text-[11px] text-amber-900 font-semibold bg-white/70 p-2 rounded-xl border border-amber-200">
              {{ item.escalationReason }}
            </p>
          </div>

          <!-- Librarian Response Box (If Replied) -->
          <div v-if="item.replyMessage" class="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 text-xs text-emerald-950 space-y-1">
            <div class="flex items-center justify-between font-black">
              <span class="flex items-center gap-1.5 text-emerald-900">
                <span>💬</span> የላይብረሪያኑ ይፋዊ ምላሽ (Official Response)
              </span>
              <span class="text-[10px] text-emerald-700 font-mono">By {{ item.repliedBy || 'Librarian' }} • {{ formatDate(item.repliedAt) }}</span>
            </div>
            <p class="text-[11px] text-emerald-900 font-medium bg-white/80 p-2.5 rounded-xl border border-emerald-200 whitespace-pre-wrap">
              {{ item.replyMessage }}
            </p>
          </div>

          <!-- Card Actions Row -->
          <div class="flex flex-wrap items-center justify-between gap-2.5 pt-1">
            <div class="flex items-center gap-2 flex-wrap">
              
              <!-- 1. Open Direct In-App Reply Modal -->
              <button
                type="button"
                @click="openReplyModal(item)"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <MessageSquareText :size="13" />
                <span>💬 ምላሽ ስጥ (Reply Message)</span>
              </button>

              <!-- 2. Escalate to Admin Button (Librarian can forward unresolved problems to Admin) -->
              <button 
                v-if="!item.isEscalated && item.status !== 'ESCALATED'"
                type="button"
                @click="openEscalateModal(item)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition border border-amber-300 cursor-pointer shadow-2xs"
                title="Forward issue to Library Administration"
              >
                <ArrowUpRight :size="13" />
                <span>⚠️ ወደ አድሚን አስተላልፍ (Escalate)</span>
              </button>

              <!-- 3. Direct Phone Call if available -->
              <a 
                v-if="item.phone && item.phone !== 'N/A'"
                :href="`tel:${item.phone}`"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                <Phone :size="13" />
                <span>ደውል (Call)</span>
              </a>
            </div>

            <!-- Mark Resolved / Unread Action -->
            <div class="flex items-center gap-2">
              <button 
                v-if="item.status === 'UNREAD' || item.status === 'ESCALATED'"
                type="button"
                @click="updateInquiryStatus(item.id, 'RESOLVED')"
                class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Check :size="13" />
                <span>ተፈትቷል / አረጋግጥ (Mark Resolved)</span>
              </button>
              <button 
                v-else
                type="button"
                @click="updateInquiryStatus(item.id, 'UNREAD')"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition cursor-pointer"
              >
                <span>እንደገና ክፈት (Reopen)</span>
              </button>
            </div>
          </div>

        </div>

        <!-- Empty State -->
        <div v-if="filteredInquiries.length === 0" class="p-12 text-center text-slate-400 space-y-2">
          <Inbox :size="36" class="mx-auto text-slate-300" />
          <p class="text-sm font-bold text-slate-600">ምንም የተማሪ የእርዳታ ጥያቄ አልተገኘም</p>
          <p class="text-xs">No inquiries matching the selected filter or search term</p>
        </div>

      </div>

    </div>

    <!-- ================= 1. DIRECT IN-APP REPLY MODAL ================= -->
    <div v-if="isReplyModalOpen && activeInquiry" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">💬</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">የተማሪውን ጥያቄ ምላሽ ስጥ (Reply to Inquiry)</h3>
              <p class="text-[10px] text-slate-500">To: {{ activeInquiry.name }} ({{ activeInquiry.email }})</p>
            </div>
          </div>
          <button @click="isReplyModalOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Inquiry Summary Pill -->
        <div class="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1">
          <div class="flex justify-between text-slate-500 text-[10px]">
            <span>Category: <strong class="text-slate-800">{{ activeInquiry.category }}</strong></span>
            <span>ID: <strong class="text-slate-800">{{ activeInquiry.studentId || 'N/A' }}</strong></span>
          </div>
          <p class="text-slate-800 font-medium italic line-clamp-2">"{{ activeInquiry.message }}"</p>
        </div>

        <!-- Quick Response Templates -->
        <div class="space-y-1.5">
          <label class="block text-[10px] font-bold uppercase text-slate-500">ፈጣን ምላሾች (Quick Templates):</label>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="(tpl, idx) in quickTemplates"
              :key="idx"
              type="button"
              @click="replyMessage = tpl"
              class="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 rounded-lg text-[10px] font-semibold transition border border-slate-200 cursor-pointer text-left"
            >
              {{ tpl }}
            </button>
          </div>
        </div>

        <!-- Custom Reply Message Textarea -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">
            የምላሽ መልዕክት (Response Message) *
          </label>
          <textarea
            v-model="replyMessage"
            required
            rows="4"
            placeholder="የተማሪውን ጥያቄ በተሟላ መልኩ የሚያብራራ ይፋዊ ምላሽ እዚህ ይፃፉ..."
            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white transition"
          ></textarea>
        </div>

        <!-- Reply Modal Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="isReplyModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="!replyMessage.trim() || isSubmitting"
            @click="submitReply"
            class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSubmitting ? 'በመላክ ላይ...' : '✓ ምላሹን ላክ እና እንደተፈታ መዝግብ' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ================= 2. ESCALATE TO ADMIN MODAL ================= -->
    <div v-if="isEscalateModalOpen && activeInquiry" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">⚠️</span>
            <div>
              <h3 class="font-black text-slate-900 text-sm">ወደ ላይብረሪ አስተዳደር አስተላልፍ (Escalate to Admin)</h3>
              <p class="text-[10px] text-slate-500">Inquiry #{{ activeInquiry.id }} • {{ activeInquiry.name }}</p>
            </div>
          </div>
          <button @click="isEscalateModalOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <div class="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <p class="font-bold flex items-center gap-1">
            <span>ℹ️</span> ለምን ወደ አድሚን ይተላለፋል?
          </p>
          <p class="text-[11px] text-amber-800 leading-relaxed">
            ላይብረሪያኑ በስራ ዴስኩ መፍታት የማይችላቸውን ጉዳዮች (የመጽሐፍ መጥፋት ካሳ ዋጋ፣ የተማሪ መለያ እግድ ወይም የፖሊሲ ልዩ ፍቃድ) ወደ አድሚን ዳሽቦርድ ያስተላልፋሉ።
          </p>
        </div>

        <!-- Escalation Reason Selector -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">
            የማስተላለፊያ ምክንያት (Primary Reason) *
          </label>
          <select
            v-model="escalationReasonType"
            class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-amber-500"
          >
            <option value="የጠፋ መጽሐፍ የካሳ ዋጋ ውሳኔ ይፈልጋል">የጠፋ መጽሐፍ የካሳ ዋጋ ውሳኔ ይፈልጋል (Lost book price decision)</option>
            <option value="የተማሪ አካውንት ወይም መታወቂያ ልዩ እግድ ይፈልጋል">የተማሪ አካውንት ወይም መታወቂያ ልዩ እግድ ይፈልጋል (Account suspension/exception)</option>
            <option value="የስርዓት ወይም የክፍያ ስህተት ማጣራት ይፈልጋል">የስርዓት ወይም የክፍያ ስህተት ማጣራት ይፈልጋል (Payment/system mismatch)</option>
            <option value="የዲፓርትመንት ወይም የአስተዳደር ልዩ ፍቃድ ይፈልጋል">የዲፓርትመንት ወይም የአስተዳደር ልዩ ፍቃድ ይፈልጋል (Department approval)</option>
            <option value="OTHER">ሌላ ልዩ ማብራሪያ (Other custom reason)</option>
          </select>
        </div>

        <!-- Additional Escalation Notes -->
        <div>
          <label class="block text-xs font-bold uppercase text-slate-700 mb-1">
            ተጨማሪ ማብራሪያ ለአድሚኑ (Detailed Notes for Admin) *
          </label>
          <textarea
            v-model="escalationCustomNote"
            rows="3"
            placeholder="ጉዳዩን አድሚኑ በቀላሉ እንዲረዳው የሚያስችል ማብራሪያ እዚህ ይፃፉ..."
            class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-amber-500 focus:bg-white"
          ></textarea>
        </div>

        <!-- Escalate Actions -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
          <button
            type="button"
            @click="isEscalateModalOpen = false"
            class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isSubmitting"
            @click="submitEscalation"
            class="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span v-if="isSubmitting" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>{{ isSubmitting ? 'በማስተላለፍ ላይ...' : '⚠️ ወደ አድሚን አስተላልፍ (Confirm Escalation)' }}</span>
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  MessageSquareText, 
  RefreshCw, 
  Inbox, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Phone, 
  Check,
  ArrowUpRight
} from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const props = withDefaults(defineProps<{
  inquiries: any[]
  isAdmin?: boolean
}>(), {
  isAdmin: false
})

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'update-status', payload: any): void
}>()

const authStore = useAuthStore()
const searchQuery = ref('')
const activeStatusFilter = ref('ALL')
const isSubmitting = ref(false)

// Reply Modal State
const isReplyModalOpen = ref(false)
const activeInquiry = ref<any>(null)
const replyMessage = ref('')

const quickTemplates = [
  'መጽሐፉ በመደርደሪያው ላይ ተዘጋጅቷል፤ መጥተው መውሰድ ይችላሉ።',
  'የውሰት ጊዜዎ ተራዝሞልዎታል፤ ደረሰኙን በዳሽቦርድዎ ይመልከቱ።',
  'እባክዎ የተማሪ መታወቂያዎን ይዘው ወደ ዋናው የውሰት ዴስክ ይምጡ።',
  'የጠየቁት መጽሐፍ አሁን ላይ አልቋል፤ ሌላ ተማሪ ሲመልስ ይጠብቁ።'
]

// Escalate Modal State
const isEscalateModalOpen = ref(false)
const escalationReasonType = ref('የጠፋ መጽሐፍ የካሳ ዋጋ ውሳኔ ይፈልጋል')
const escalationCustomNote = ref('')

const unreadCount = computed(() => {
  return (props.inquiries || []).filter(i => i.status === 'UNREAD').length
})

const escalatedCount = computed(() => {
  return (props.inquiries || []).filter(i => i.status === 'ESCALATED' || i.isEscalated).length
})

const resolvedCount = computed(() => {
  return (props.inquiries || []).filter(i => i.status === 'RESOLVED').length
})

const filteredInquiries = computed(() => {
  let list = props.inquiries || []

  if (activeStatusFilter.value === 'UNREAD') {
    list = list.filter(i => i.status === 'UNREAD')
  } else if (activeStatusFilter.value === 'ESCALATED') {
    list = list.filter(i => i.status === 'ESCALATED' || i.isEscalated)
  } else if (activeStatusFilter.value === 'RESOLVED') {
    list = list.filter(i => i.status === 'RESOLVED')
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim()
    list = list.filter(i => 
      (i.name || '').toLowerCase().includes(q) ||
      (i.studentId || '').toLowerCase().includes(q) ||
      (i.email || '').toLowerCase().includes(q) ||
      (i.category || '').toLowerCase().includes(q) ||
      (i.message || '').toLowerCase().includes(q) ||
      (i.escalationReason || '').toLowerCase().includes(q) ||
      (i.replyMessage || '').toLowerCase().includes(q)
    )
  }

  return list
})

const formatDate = (date: any) => {
  if (!date) return '—'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const updateInquiryStatus = (id: number, status: string) => {
  emit('update-status', { id, status })
}

const openReplyModal = (item: any) => {
  activeInquiry.value = item
  replyMessage.value = item.replyMessage || ''
  isReplyModalOpen.value = true
}

const submitReply = async () => {
  if (!activeInquiry.value || !replyMessage.value.trim()) return
  isSubmitting.value = true
  try {
    emit('update-status', {
      id: activeInquiry.value.id,
      status: 'RESOLVED',
      replyMessage: replyMessage.value.trim(),
      repliedBy: authStore.user?.name || (props.isAdmin ? 'Library Administrator' : 'Circulation Librarian')
    })
    isReplyModalOpen.value = false
    activeInquiry.value = null
    replyMessage.value = ''
  } finally {
    isSubmitting.value = false
  }
}

const openEscalateModal = (item: any) => {
  activeInquiry.value = item
  escalationReasonType.value = 'የጠፋ መጽሐፍ የካሳ ዋጋ ውሳኔ ይፈልጋል'
  escalationCustomNote.value = ''
  isEscalateModalOpen.value = true
}

const submitEscalation = async () => {
  if (!activeInquiry.value) return
  isSubmitting.value = true
  try {
    const finalReason = escalationReasonType.value === 'OTHER'
      ? (escalationCustomNote.value.trim() || 'ልዩ የአስተዳደር ጉዳይ')
      : `${escalationReasonType.value}${escalationCustomNote.value.trim() ? ' — ' + escalationCustomNote.value.trim() : ''}`

    emit('update-status', {
      id: activeInquiry.value.id,
      status: 'ESCALATED',
      escalationReason: finalReason,
      escalatedBy: authStore.user?.name || 'Circulation Librarian'
    })
    isEscalateModalOpen.value = false
    activeInquiry.value = null
  } finally {
    isSubmitting.value = false
  }
}
</script>
