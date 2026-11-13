<template>
  <!-- Full Screen Wrapper: Prevents window scroll so sidebar is 100% CONSTANT/FIXED -->
  <div class="h-screen w-full flex overflow-hidden bg-[#f0f4f9] text-slate-800 font-sans antialiased">
    
    <!-- Mobile Backdrop Overlay -->
    <transition
      enter-active-class="transition-opacity duration-300 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isSidebarOpen && isMobile" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
      ></div>
    </transition>

    <!-- ================= 1. CONSTANT FIXED LEFT SIDEBAR ================= -->
    <aside 
      :class="[
        'bg-[#06387d] text-white flex flex-col justify-between transition-all duration-300 z-50 h-screen shrink-0',
        isMobile ? 'fixed inset-y-0 left-0 shadow-2xl' : 'sticky top-0',
        isSidebarOpen ? 'w-64 translate-x-0' : (isMobile ? '-translate-x-full' : 'w-20 translate-x-0')
      ]"
    >
      <div class="flex flex-col h-full overflow-hidden">
        
        <!-- University Branding / Logo Section -->
        <div class="p-4 sm:p-5 flex flex-col items-center text-center border-b border-blue-800/40 shrink-0">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md mb-2 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" class="w-full h-full object-contain" alt="MAU Logo" />
          </div>
          
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h2 class="text-xs font-black tracking-wider uppercase leading-tight text-white">Mekdela Amba University</h2>
            <p class="text-[13px] font-black tracking-wider text-amber-300 mt-0.5">MAU-LCS</p>
            <p class="text-[9px] text-blue-200 uppercase tracking-widest font-medium">Library Circulation System</p>
          </div>
        </div>

        <!-- Navigation Links with Custom Hidden Sleek Scrollbar -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm font-medium">
          <!-- Dashboard -->
          <button 
            @click="selectTab('dashboard')"
            :class="activeTab === 'dashboard' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <LayoutDashboard :size="18" class="shrink-0" />
            <span v-show="isSidebarOpen" class="font-semibold">Dashboard</span>
          </button>

          <!-- Books Management -->
          <button 
            @click="selectTab('books')"
            :class="activeTab === 'books' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <BookOpen :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Books Management</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Users Management -->
          <button 
            @click="selectTab('users')"
            :class="activeTab === 'users' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <Users :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Users Management</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Librarian Shifts & Duty Roster -->
          <button 
            @click="selectTab('shifts')"
            :class="activeTab === 'shifts' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <CalendarClock :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Librarian Shifts & Duty</span>
            </div>
            <span v-show="isSidebarOpen" class="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 font-black uppercase text-slate-900 shadow-2xs">
              Duty
            </span>
          </button>

          <!-- Circulation & Universal Loans -->
          <button 
            @click="selectTab('borrowing')"
            :class="activeTab === 'borrowing' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <ArrowLeftRight :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Circulation & Loans</span>
            </div>
            <span v-show="isSidebarOpen" class="text-xs font-mono text-blue-200">{{ loansList.length }}</span>
          </button>

          <!-- Research & Proposals -->
          <button 
            @click="selectTab('proposals')"
            :class="activeTab === 'proposals' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <FileText :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Research & Proposals</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Student Inquiries & Helpdesk (with Escalations from Librarian) -->
          <button 
            @click="selectTab('inquiries')"
            :class="activeTab === 'inquiries' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <MessageSquareText :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Helpdesk & Escalations</span>
            </div>
            <span v-if="escalatedInquiriesCount > 0 && isSidebarOpen" class="text-[9px] px-2 py-0.5 rounded-full bg-rose-500 font-black uppercase text-white shadow-xs animate-pulse">
              {{ escalatedInquiriesCount }} Urgent
            </span>
            <ChevronRight v-else-if="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Reports & Analytics -->
          <button 
            @click="selectTab('reports')"
            :class="activeTab === 'reports' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <BarChart3 :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Reports & Analytics</span>
            </div>
            <span v-show="isSidebarOpen" class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-300 font-extrabold uppercase">
              Live
            </span>
          </button>

          <!-- Staff Meetings -->
          <button 
            @click="selectTab('meetings')"
            :class="activeTab === 'meetings' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <Video :size="18" class="shrink-0 text-emerald-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Staff Video Meetings</span>
            </div>
            <span v-show="isSidebarOpen" class="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500 font-black uppercase text-white shadow-xs">
              Meet
            </span>
          </button>

          <!-- Settings & Profile -->
          <div class="pt-4 mt-2 border-t border-blue-800/40 space-y-1">
            <button 
              @click="selectTab('settings')"
              :class="activeTab === 'settings' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-200/80 hover:bg-white/10 hover:text-white'"
              class="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition"
            >
              <Settings :size="16" />
              <span v-show="isSidebarOpen">Settings & Profile</span>
            </button>
            <button 
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-rose-300 hover:bg-rose-500/20 hover:text-rose-100 text-xs font-bold cursor-pointer transition"
            >
              <LogOut :size="16" />
              <span v-show="isSidebarOpen">Logout</span>
            </button>
          </div>
        </nav>

        <!-- Sidebar Campus Graphic Banner -->
        <div v-show="isSidebarOpen" class="p-3 shrink-0">
          <div class="rounded-2xl overflow-hidden relative shadow-lg border border-blue-400/20 bg-gradient-to-t from-blue-950 to-transparent">
            <div class="h-20 bg-cover bg-center opacity-85" style="background-image: url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80')"></div>
            <div class="absolute inset-0 bg-gradient-to-t from-[#06387d] via-transparent to-transparent flex items-end p-2.5">
              <div class="text-[10px] text-white/90">
                <p class="font-extrabold text-amber-300">Mekdela Campus</p>
                <p class="text-[9px] text-blue-200">Main Library Circulation</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </aside>

    <!-- ================= 2. MAIN SCROLLABLE VIEW AREA ================= -->
    <div class="flex-1 flex flex-col h-screen overflow-y-auto min-w-0">
      
      <!-- STICKY TOP APP HEADER -->
      <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 py-3 flex items-center justify-between shadow-xs shrink-0">
        <div class="flex items-center gap-3">
          <button 
            @click="isSidebarOpen = !isSidebarOpen"
            class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu :size="20" />
          </button>
          <div>
            <h1 class="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-none">
              Mekdela Amba University Library
            </h1>
            <p class="text-xs text-slate-400 italic mt-0.5 font-medium hidden sm:block">Knowledge Today, A Better Tomorrow</p>
          </div>
        </div>

        <!-- Right Header Items: System status & Exact Screenshot 2 Profile Dropdown -->
        <div class="flex items-center gap-2 sm:gap-3">

          <!-- View Site Button (Navigate to Public Website) -->
          <NuxtLink
            to="/"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-[#006ea6] border border-blue-200 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="View Public Website"
          >
            <Globe :size="13" />
            <span>View Site</span>
          </NuxtLink>

          <!-- Library Operating Status & Announcement Control Button -->
          <button 
            type="button"
            @click="isStatusModalOpen = true"
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold cursor-pointer transition shadow-2xs',
              statusStore.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
              statusStore.status === 'CLOSED' ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100' :
              'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
            ]"
            title="Manage Library Operating Status & Broadcast Notice"
          >
            <span :class="['w-2 h-2 rounded-full', statusStore.statusBadgeColor, statusStore.status === 'CLOSED' ? 'animate-pulse' : '']"></span>
            <span>{{ statusStore.statusBadgeText }}</span>
            <Megaphone :size="12" class="opacity-75" />
          </button>

          <!-- Language Selector (Ethiopian Languages & English) -->
          <SharedLanguageSelector theme="light" />

          <!-- Top-Right User Profile Dropdown matching Screenshot 2 -->
          <SharedUserProfileDropdown 
            @select-tab="selectTab" 
            @logout="handleLogout" 
          />
        </div>
      </header>

      <!-- MAIN TAB CONTENT CONTAINER -->
      <main class="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        <!-- Active Library Status Announcement Banner -->
        <SharedLibraryServiceStatusBanner />

        <!-- 1. DASHBOARD OVERVIEW TAB -->
        <AdminDashboardTab 
          v-if="activeTab === 'dashboard'" 
          :stats-data="statsData" 
          @select-tab="selectTab" 
          @open-status-modal="isStatusModalOpen = true"
        />

        <!-- 2. BOOKS MANAGEMENT TAB -->
        <AdminBooksTab 
          v-else-if="activeTab === 'books'" 
          :books="books" 
          @add-book="isAddBookOpen = true"
          @edit-book="openEditBookModal"
          @delete-book="handleDeleteBook"
        />

        <!-- 3. USERS MANAGEMENT TAB -->
        <AdminUsersTab 
          v-else-if="activeTab === 'users'" 
          :users="usersList"
          @refresh="refreshUsers"
          @add-user="openAddUserModal"
          @edit-user="openEditUserModal"
          @delete-user="handleDeleteUser"
        />

        <!-- 4. LIBRARIAN SHIFTS & DUTY ROSTER TAB -->
        <AdminShiftsTab 
          v-else-if="activeTab === 'shifts'" 
          :librarians="librariansOnly"
        />

        <!-- 5. CIRCULATION: BORROWING & RETURNS TAB -->
        <AdminBorrowingTab 
          v-else-if="activeTab === 'borrowing' || activeTab === 'closed-shelf'" 
          :loans="loansList"
          @issue-loan="isIssueLoanOpen = true"
          @return-book="handleReturnLoan"
          @renew-loan="handleRenewLoan"
        />

        <!-- 6. RESEARCH & PROPOSALS TAB -->
        <AdminProposalsTab 
          v-else-if="activeTab === 'proposals'" 
          :proposals="proposals"
          @add-proposal="isAddProposalOpen = true"
          @edit-proposal="openEditProposalModal"
          @delete-proposal="handleDeleteProposal"
        />

        <!-- 7. REPORTS & ANALYTICS TAB -->
        <AdminReportsTab 
          v-else-if="activeTab === 'reports'" 
          @refresh="refreshStats"
        />

        <!-- 8. STUDENT INQUIRIES & ESCALATED HELPDESK TAB -->
        <LibrarianInquiriesTab 
          v-else-if="activeTab === 'inquiries'" 
          :inquiries="inquiriesList" 
          :is-admin="true"
          @refresh="refreshInquiries" 
          @update-status="handleUpdateInquiryStatus" 
        />

        <!-- 8. SETTINGS & PROFILE TAB (WITH IMAGE UPLOAD!) -->
        <AdminSettingsTab 
          v-else-if="activeTab === 'settings'" 
        />

        <!-- 9. STAFF VIDEO MEETINGS TAB -->
        <AdminMeetingsTab 
          v-else-if="activeTab === 'meetings'" 
          @schedule-room="navigateTo('/meeting')"
          @refresh="refreshStats"
        />
      </main>

    </div>

    <!-- ================= MODALS ================= -->
    <AdminBookModal 
      :is-open="isAddBookOpen"
      :is-submitting="isSubmitting"
      @close="isAddBookOpen = false"
      @submit="handleCreateBook"
    />

    <AdminBookModal 
      :is-open="isEditBookOpen"
      :is-editing="true"
      :book-data="selectedBookForEdit"
      :is-submitting="isSubmitting"
      @close="isEditBookOpen = false"
      @submit="handleUpdateBook"
    />

    <AdminIssueModal 
      :is-open="isIssueLoanOpen"
      :books="books"
      :is-submitting="isSubmitting"
      @close="isIssueLoanOpen = false"
      @submit="handleIssueLoanSubmit"
    />

    <AdminProposalModal 
      :is-open="isAddProposalOpen"
      :is-submitting="isSubmitting"
      @close="isAddProposalOpen = false"
      @submit="handleCreateProposal"
    />

    <AdminProposalModal 
      :is-open="isEditProposalOpen"
      :is-editing="true"
      :proposal-data="selectedProposalForEdit"
      :is-submitting="isSubmitting"
      @close="isEditProposalOpen = false"
      @submit="handleUpdateProposal"
    />

    <AdminUserModal 
      :is-open="isUserModalOpen"
      :is-editing="isEditingUser"
      :user-data="selectedUserForEdit"
      @close="isUserModalOpen = false"
      @save="handleSaveUser"
    />

    <!-- Library Service Status & Schedule Announcement Modal -->
    <SharedLibraryStatusModal 
      :is-open="isStatusModalOpen"
      @close="isStatusModalOpen = false"
      @saved="statusStore.fetchStatus()"
    />

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useServiceStatusStore } from '~/stores/serviceStatus'
import { useToast } from '~/composables/useToast'
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  FileText,
  Lock,
  BarChart3,
  Video,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Power,
  Globe,
  ExternalLink,
  Megaphone,
  CalendarClock,
  MessageSquareText
} from 'lucide-vue-next'

const authStore = useAuthStore()
const statusStore = useServiceStatusStore()
const toast = useToast()
const { currentLang, translatePageDom } = useLanguage()

// State
const activeTab = ref('dashboard')

// Re-apply translation immediately whenever admin switches tabs
watch(activeTab, () => {
  if (currentLang.value !== 'en') {
    setTimeout(() => translatePageDom(currentLang.value), 50)
    setTimeout(() => translatePageDom(currentLang.value), 200)
  }
})
const isSidebarOpen = ref(true)
const isMobile = ref(false)
const isSystemActive = ref(true)
const isSubmitting = ref(false)
const isStatusModalOpen = ref(false)

// Modals
const isAddBookOpen = ref(false)
const isEditBookOpen = ref(false)
const selectedBookForEdit = ref<any>(null)
const isIssueLoanOpen = ref(false)
const isAddProposalOpen = ref(false)
const isEditProposalOpen = ref(false)
const selectedProposalForEdit = ref<any>(null)

// 1. Database Data Fetching
const { data: statsResponse, refresh: refreshStats } = await useFetch('/api/stats')
const statsData = computed(() => statsResponse.value?.data || {
  totalBooks: 3995,
  totalStudents: 12480,
  totalBorrows: 2340,
  activeUsers: 1245,
  pendingRequests: 0,
  topBooks: [],
  recentActivities: []
})

const { data: booksData, refresh: refreshBooks } = await useFetch('/api/items')
const books = computed(() => booksData.value || [])

const { data: requestsData, refresh: refreshRequests } = await useFetch('/api/requests')
const pendingRequestsCount = computed(() => {
  return (requestsData.value || []).filter((r: any) => r.status === 'requested').length
})

const { data: proposalsData, refresh: refreshProposals } = await useFetch('/api/research')
const proposals = computed(() => {
  const raw = proposalsData.value?.data || proposalsData.value || []
  return Array.isArray(raw) ? raw : []
})

const { data: usersData, refresh: refreshUsers } = await useFetch('/api/users')
const usersList = computed(() => {
  const raw = usersData.value?.data || usersData.value || []
  return Array.isArray(raw) ? raw : []
})

// User Management Modal State & Handlers
const isUserModalOpen = ref(false)
const isEditingUser = ref(false)
const selectedUserForEdit = ref<any>(null)

const openAddUserModal = () => {
  isEditingUser.value = false
  selectedUserForEdit.value = null
  isUserModalOpen.value = true
}

const openEditUserModal = (user: any) => {
  isEditingUser.value = true
  selectedUserForEdit.value = { ...user }
  isUserModalOpen.value = true
}

const handleSaveUser = async (formData: any) => {
  isSubmitting.value = true
  try {
    if (isEditingUser.value && selectedUserForEdit.value) {
      const id = selectedUserForEdit.value.userId || selectedUserForEdit.value.id
      const res: any = await $fetch(`/api/users/${id}`, {
        method: 'PUT',
        body: formData,
      })
      toast.success(res?.message || 'User profile updated successfully!', 'User Updated')
    } else {
      const res: any = await $fetch('/api/users', {
        method: 'POST',
        body: formData,
      })
      toast.success(res?.message || `User "${formData.name}" created successfully!`, 'Account Created')
    }
    isUserModalOpen.value = false
    await refreshUsers()
    await refreshStats()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Operation failed', 'Error')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteUser = async (user: any) => {
  const name = user.name || user.userId
  const id = user.userId || user.id
  if (!confirm(`Are you sure you want to delete user "${name}" (${user.userType})?`)) {
    return
  }

  isSubmitting.value = true
  try {
    const res: any = await $fetch(`/api/users/${id}`, {
      method: 'DELETE',
    })
    toast.success(res?.message || 'User account deleted successfully', 'User Deleted')
    await refreshUsers()
    await refreshStats()
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to delete user', 'Delete Failed')
  } finally {
    isSubmitting.value = false
  }
}

// Real Universal Loans API & Handlers
const { data: loansData, refresh: refreshLoans } = await useFetch('/api/loans')
const loansList = computed(() => {
  const raw = loansData.value
  return Array.isArray(raw) ? raw : []
})

const librariansOnly = computed(() => {
  return usersList.value.filter((u: any) => 
    String(u.userType || u.role || '').toLowerCase().includes('librarian') ||
    String(u.userType || u.role || '').toLowerCase().includes('admin')
  )
})

// Student Inquiries & Escalations API
const { data: inquiriesResponse, refresh: refreshInquiries } = await useFetch('/api/contact')
const inquiriesList = computed(() => {
  return inquiriesResponse.value?.data || inquiriesResponse.value || []
})
const escalatedInquiriesCount = computed(() => {
  return inquiriesList.value.filter((i: any) => i.status === 'ESCALATED' || i.isEscalated).length
})

const handleUpdateInquiryStatus = async (payload: any) => {
  const { id, ...body } = payload
  try {
    const res: any = await $fetch(`/api/contact/${id}`, {
      method: 'PATCH',
      body
    })
    await refreshInquiries()
    toast.success(res?.message || 'Inquiry ticket updated successfully', 'Success')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to update inquiry', 'Error')
  }
}

const handleReturnLoan = async (payload: any) => {
  const transactionId = typeof payload === 'object' && payload !== null ? (payload.id || payload.transactionId) : payload
  try {
    const res: any = await $fetch('/api/loans/return', {
      method: 'POST',
      body: { 
        transactionId: Number(transactionId),
        condition: typeof payload === 'object' ? payload.condition : 'Good Condition',
        notes: typeof payload === 'object' ? payload.notes : '',
        paymentMethod: typeof payload === 'object' ? payload.paymentMethod : undefined,
        paymentReceipt: typeof payload === 'object' ? payload.paymentReceipt : undefined,
      },
    })
    await Promise.all([refreshLoans(), refreshStats(), refreshBooks()])
    toast.success(res?.message || 'Book returned and clearance granted!', 'Return Processed')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to process return', 'Return Error')
  }
}

const handleRenewLoan = async (id: number | string) => {
  try {
    const res: any = await $fetch('/api/loans/renew', {
      method: 'POST',
      body: { transactionId: id, additionalDays: 7 },
    })
    await Promise.all([refreshLoans(), refreshStats()])
    toast.success(res?.message || 'Loan duration extended for +7 days!', 'Renewed')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Failed to renew loan', 'Renewal Error')
  }
}

const checkMobileScreen = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) {
      isSidebarOpen.value = false
    }
  }
}

onMounted(() => {
  if (process.client) {
    checkMobileScreen()
    window.addEventListener('resize', checkMobileScreen)
    authStore.init()
    statusStore.fetchStatus()
    if (!authStore.isAuthenticated) {
      navigateTo('/auth?redirect=/admin')
    } else if (!authStore.isAdmin) {
      if (authStore.isLibrarian) navigateTo('/librarian')
      else navigateTo('/my-borrows')
    }
  }
})

const selectTab = (tab: string) => {
  activeTab.value = tab
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const handleLogout = async () => {
  if (confirm('ከሲስተሙ መውጣት ይፈልጋሉ? (Are you sure you want to logout?)')) {
    await authStore.logout()
    navigateTo('/auth')
  }
}

// Book Handlers
const openEditBookModal = (book: any) => {
  selectedBookForEdit.value = book
  isEditBookOpen.value = true
}

const handleCreateBook = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/items', { method: 'POST', body: form })
    await refreshBooks()
    isAddBookOpen.value = false
    toast.success('Book cataloged successfully!', 'Book Added')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to add book', 'Error')
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateBook = async (form: any) => {
  if (!form.id) return
  isSubmitting.value = true
  try {
    await $fetch(`/api/items/${form.id}`, { method: 'PUT', body: form })
    await refreshBooks()
    isEditBookOpen.value = false
    toast.success('Book updated successfully!', 'Book Updated')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to update book', 'Error')
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteBook = async (id: number | string) => {
  if (!confirm('Are you sure you want to remove this book from catalog?')) return
  try {
    await $fetch(`/api/items/${id}`, { method: 'DELETE' })
    await refreshBooks()
    toast.success('Book removed from catalog', 'Book Deleted')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to delete book', 'Error')
  }
}

// Request Approvals
const handleApproveRequest = async (id: number | string) => {
  try {
    await $fetch('/api/requests', {
      method: 'PATCH',
      body: { id, status: 'issued' }
    })
    await Promise.all([refreshRequests(), refreshStats()])
    toast.success('Closed shelf borrow request approved!', 'Request Approved')
  } catch (err: any) {
    toast.error(err?.message || 'Approval failed', 'Error')
  }
}

const handleDenyRequest = async (id: number | string) => {
  try {
    await $fetch('/api/requests', {
      method: 'PATCH',
      body: { id, status: 'denied' }
    })
    await Promise.all([refreshRequests(), refreshStats()])
    toast.info('Closed shelf borrow request denied', 'Request Denied')
  } catch (err: any) {
    toast.error(err?.message || 'Denial failed', 'Error')
  }
}

// Loan Handlers
const handleIssueLoanSubmit = async (form: any) => {
  isSubmitting.value = true
  try {
    const res: any = await $fetch('/api/loans', { method: 'POST', body: form })
    isIssueLoanOpen.value = false
    await Promise.all([refreshLoans(), refreshStats(), refreshBooks()])
    toast.success(res?.message || 'Book loan issued successfully!', 'Loan Issued')
  } catch (err: any) {
    toast.error(err?.data?.statusMessage || err?.message || 'Loan issue failed', 'Notice')
  } finally {
    isSubmitting.value = false
  }
}



// Proposal Handlers
const openEditProposalModal = (item: any) => {
  selectedProposalForEdit.value = item
  isEditProposalOpen.value = true
}

const handleCreateProposal = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/research', { method: 'POST', body: form })
    await refreshProposals()
    isAddProposalOpen.value = false
    toast.success('Research proposal deposited successfully!', 'Proposal Added')
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save proposal', 'Error')
    isAddProposalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleUpdateProposal = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch(`/api/research/${form.id}`, { method: 'PUT', body: form })
    await refreshProposals()
    isEditProposalOpen.value = false
    toast.success('Research proposal updated successfully!', 'Proposal Updated')
  } catch (err: any) {
    toast.error(err?.message || 'Update failed', 'Error')
    isEditProposalOpen.value = false
  } finally {
    isSubmitting.value = false
  }
}

const handleDeleteProposal = async (id: number | string) => {
  if (!confirm('Are you sure you want to delete this research proposal?')) return
  try {
    await $fetch(`/api/research/${id}`, { method: 'DELETE' })
    await refreshProposals()
    toast.success('Research proposal deleted successfully', 'Proposal Deleted')
  } catch (err: any) {
    toast.error('Failed to delete proposal', 'Error')
  }
}
</script>
