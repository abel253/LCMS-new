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
        
        <!-- University Branding & Logo -->
        <div class="p-4 sm:p-5 flex flex-col items-center text-center border-b border-blue-800/40 shrink-0">
          <div class="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1 shadow-md mb-2 flex items-center justify-center overflow-hidden">
            <img src="/logo.png" class="w-full h-full object-contain" alt="MAU Logo" />
          </div>
          
          <div v-show="isSidebarOpen" class="transition-opacity duration-200">
            <h2 class="text-xs font-black tracking-wider uppercase leading-tight text-white">Mekdela Amba University</h2>
            <p class="text-[13px] font-black tracking-wider text-amber-300 mt-0.5">MAU-LCS</p>
            <p class="text-[9px] text-blue-200 uppercase tracking-widest font-medium">Librarian Circulation Desk</p>
          </div>
        </div>

        <!-- Sidebar Navigation Menu with Custom Hidden Sleek Scrollbar -->
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-sm font-medium">
          
          <!-- Dashboard -->
          <button 
            @click="selectTab('dashboard')"
            :class="activeTab === 'dashboard' ? 'bg-[#1b62db] text-white shadow-md' : 'hover:bg-white/10 text-blue-100/80 hover:text-white'"
            class="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <LayoutDashboard :size="18" class="shrink-0" />
            <span v-show="isSidebarOpen" class="font-semibold">Dashboard</span>
          </button>

          <!-- Closed Shelf Approvals -->
          <button 
            @click="selectTab('closedShelf')"
            :class="activeTab === 'closedShelf' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/90 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <Lock :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Closed Shelf Approvals</span>
            </div>
            <span v-if="pendingRequestsCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white">
              {{ pendingRequestsCount }}
            </span>
          </button>

          <!-- Books Management -->
          <button 
            @click="selectTab('books')"
            :class="activeTab === 'books' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <BookOpen :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Books Management</span>
            </div>
            <span v-show="isSidebarOpen" class="text-xs font-mono text-blue-200">{{ books.length }}</span>
          </button>

          <!-- Shift Schedule & Today's Duty -->
          <button 
            @click="selectTab('shifts')"
            :class="activeTab === 'shifts' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer group"
          >
            <div class="flex items-center gap-3">
              <CalendarClock :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Shift Schedule & Duty</span>
            </div>
            <span v-show="isSidebarOpen" class="text-[9px] px-1.5 py-0.5 rounded bg-amber-400 font-black uppercase text-slate-900 shadow-2xs">
              Duty
            </span>
          </button>

          <!-- Loans & Returns -->
          <button 
            @click="selectTab('borrowing')"
            :class="activeTab === 'borrowing' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <ArrowLeftRight :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Loans & Checkouts</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Book Returns -->
          <button 
            @click="selectTab('returns')"
            :class="activeTab === 'returns' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <RotateCcw :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Book Returns</span>
            </div>
            <span v-if="activeLoansCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white">
              {{ activeLoansCount }}
            </span>
          </button>

          <!-- Student Inquiries (Contact Form Messages) -->
          <button 
            @click="selectTab('inquiries')"
            :class="activeTab === 'inquiries' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <MessageSquareText :size="18" class="shrink-0 text-amber-300" />
              <span v-show="isSidebarOpen" class="font-semibold">Student Inquiries</span>
            </div>
            <span v-if="unreadInquiriesCount > 0 && isSidebarOpen" class="px-2 py-0.5 rounded-full text-[10px] bg-rose-500 font-black text-white animate-pulse">
              {{ unreadInquiriesCount }}
            </span>
          </button>

          <!-- Research & Proposals -->
          <button 
            @click="selectTab('proposals')"
            :class="activeTab === 'proposals' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <FileText :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Research & Proposals</span>
            </div>
            <span v-show="isSidebarOpen" class="text-xs font-mono text-blue-200">{{ proposals.length }}</span>
          </button>

          <!-- Reports & Analytics -->
          <button 
            @click="selectTab('reports')"
            :class="activeTab === 'reports' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <div class="flex items-center gap-3">
              <BarChart3 :size="18" class="shrink-0" />
              <span v-show="isSidebarOpen" class="font-semibold">Reports & Analytics</span>
            </div>
            <ChevronRight v-show="isSidebarOpen" :size="14" class="text-blue-300" />
          </button>

          <!-- Staff Video Meetings -->
          <button 
            @click="selectTab('meetings')"
            :class="activeTab === 'meetings' ? 'bg-[#1b62db] text-white shadow-md' : 'text-blue-100/80 hover:bg-white/10 hover:text-white'"
            class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer"
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
          <div class="rounded-2xl overflow-hidden relative shadow-lg border border-blue-400/20">
            <img 
              src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=500&q=80" 
              alt="Mekdela Amba University" 
              class="w-full h-20 object-cover"
            />
            <div class="absolute inset-x-0 bottom-0 h-5 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 opacity-90"></div>
          </div>
        </div>

      </div>
    </aside>

    <!-- ================= 2. MAIN SCROLLABLE WORKSPACE ================= -->
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
            <p class="text-xs text-slate-400 italic mt-0.5 font-medium hidden sm:block">Librarian Desk • Circulation & Stacks</p>
          </div>
        </div>

        <!-- Right Header Items: System status & Screenshot 2 Profile Dropdown -->
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
      <main class="flex-1 p-5 sm:p-7 lg:p-8 space-y-6">
        <!-- Active Library Status Announcement Banner -->
        <SharedLibraryServiceStatusBanner />

        <!-- Today's Active Shift & Duty Officer Announcement Banner -->
        <div class="bg-gradient-to-r from-[#06387d] via-blue-800 to-indigo-900 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start sm:items-center gap-3.5">
            <div class="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
              <CalendarClock :size="24" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black uppercase tracking-wider bg-white/20 text-amber-300 px-2 py-0.5 rounded-full">
                  Today's Shift Duty
                </span>
                <span class="text-[10px] font-bold text-emerald-300 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Universal Cross-Shift Loan Access Active
                </span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-white mt-0.5">
                On Duty: {{ shiftsData?.announcement?.dutyLibrarianName || shiftsData?.activeLibrarian?.librarianName || 'Circulation Desk Officer' }}
                <span class="text-xs font-semibold text-blue-200 ml-1">
                  ({{ shiftsData?.announcement?.shiftType || 'MORNING' }} • {{ shiftsData?.announcement?.shiftHours || '08:00 AM - 02:00 PM' }})
                </span>
              </h3>
              <p class="text-xs text-blue-100/80 mt-0.5 line-clamp-1">
                📢 {{ shiftsData?.announcement?.broadcastNotice || 'Universal student clearance and book return access open for all library staff across all shifts.' }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button 
              @click="selectTab('shifts')"
              class="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition cursor-pointer border border-white/20"
            >
              Shift Roster
            </button>
            <button 
              @click="selectTab('borrowing')"
              class="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition shadow-md cursor-pointer"
            >
              Universal Loan Lookup
            </button>
          </div>
        </div>

        <!-- 1. DASHBOARD TAB -->
        <AdminDashboardTab 
          v-if="activeTab === 'dashboard'" 
          :stats-data="statsData" 
          @select-tab="selectTab" 
          @open-status-modal="isStatusModalOpen = true"
        />

        <!-- SHIFT ROSTER & SCHEDULE TAB -->
        <div v-else-if="activeTab === 'shifts'" class="space-y-6">
          <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
                    Librarian Schedule
                  </span>
                  <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    ✓ Shared Loan Access Across All Shifts
                  </span>
                </div>
                <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2.5">
                  <CalendarClock :size="26" class="text-blue-600" />
                  Library Shift Roster & Today's Active Duty Schedule
                </h2>
                <p class="text-xs text-slate-500 mt-1">
                  View scheduled shifts, on-duty officers, desk assignments, and administrative handover instructions.
                </p>
              </div>

              <button 
                @click="refreshShifts"
                class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
              >
                <RefreshCw :size="14" />
                <span>Refresh Schedule</span>
              </button>
            </div>

            <!-- Active Announcement Card -->
            <div class="p-5 rounded-2xl bg-gradient-to-r from-blue-900 to-[#06387d] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
              <div class="space-y-1">
                <span class="text-[10px] font-black uppercase text-amber-300 tracking-wider">Admin Duty Broadcast</span>
                <h3 class="text-lg font-black">
                  Today's Primary Officer: {{ shiftsData?.announcement?.dutyLibrarianName || shiftsData?.activeLibrarian?.librarianName || 'Assigned Officer' }}
                </h3>
                <p class="text-xs text-blue-100">
                  {{ shiftsData?.announcement?.broadcastNotice || 'All library return desks and walk-in borrowing are fully operational.' }}
                </p>
              </div>
              <div class="text-left md:text-right shrink-0">
                <span class="inline-block px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase shadow-xs">
                  {{ shiftsData?.announcement?.shiftType || 'MORNING' }} SHIFT
                </span>
                <p class="text-xs text-blue-200 font-mono mt-1">
                  {{ shiftsData?.announcement?.shiftHours || '08:00 AM - 02:00 PM' }}
                </p>
                <p class="text-[11px] text-amber-300 font-medium">
                  📍 {{ shiftsData?.announcement?.stationDesk || 'Main Circulation Desk' }}
                </p>
              </div>
            </div>

            <!-- Shift Table -->
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse text-xs">
                <thead>
                  <tr class="border-b border-slate-200 text-slate-400 uppercase font-black">
                    <th class="py-3 px-3 text-center">Rotation #</th>
                    <th class="py-3 px-4">Librarian Name</th>
                    <th class="py-3 px-4">Shift Slot</th>
                    <th class="py-3 px-4">Hours</th>
                    <th class="py-3 px-4">Desk Station</th>
                    <th class="py-3 px-4">Handover Notes</th>
                    <th class="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr 
                    v-for="(shift, index) in (shiftsData?.roster || [])" 
                    :key="shift.id || index"
                    :class="shift.isOnDutyToday ? 'bg-blue-50/60 font-medium' : ''"
                    class="hover:bg-slate-50 transition"
                  >
                    <td class="py-3 px-3 text-center font-mono font-bold text-slate-500">#{{ index + 1 }}</td>
                    <td class="py-3 px-4">
                      <p class="font-bold text-slate-900">{{ shift.librarianName }}</p>
                      <p class="text-[10px] text-slate-400 font-mono">{{ shift.librarianEmail }}</p>
                    </td>
                    <td class="py-3 px-4 whitespace-nowrap">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                        {{ shift.shiftType }}
                      </span>
                    </td>
                    <td class="py-3 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">{{ shift.shiftHours }}</td>
                    <td class="py-3 px-4 text-slate-700">{{ shift.stationDesk }}</td>
                    <td class="py-3 px-4 text-slate-500 italic">{{ shift.handoverNotes || 'Standard circulation duty' }}</td>
                    <td class="py-3 px-3 text-center whitespace-nowrap">
                      <span 
                        v-if="shift.isOnDutyToday" 
                        class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white shadow-2xs"
                      >
                        ON DUTY TODAY
                      </span>
                      <span v-else class="text-[10px] text-slate-400 font-medium">Scheduled</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 2. CLOSED SHELF TAB -->
        <AdminClosedShelfTab 
          v-else-if="activeTab === 'closedShelf'" 
          :requests="requestsData || []"
          @refresh="refreshRequests"
          @approve="handleApproveRequest"
          @deny="handleDenyRequest"
        />

        <!-- 3. BOOKS MANAGEMENT TAB -->
        <AdminBooksTab 
          v-else-if="activeTab === 'books'" 
          :books="books" 
          @add-book="isAddBookOpen = true"
          @edit-book="openEditBookModal"
          @delete-book="handleDeleteBook"
        />

        <!-- 4. BORROWING & LOANS TAB (WITH UNIVERSAL PATRON ACCESS) -->
        <div v-else-if="activeTab === 'borrowing'" class="space-y-6">
          <UniversalBorrowAccessCard 
            :loans="loansList"
            @open-issue-modal="isIssueLoanOpen = true"
            @return-book="handleReturnLoan"
            @renew-loan="handleRenewLoan"
          />

          <AdminBorrowingTab 
            :loans="loansList"
            @issue-loan="isIssueLoanOpen = true"
            @return-book="handleReturnLoan"
            @renew-loan="handleRenewLoan"
          />
        </div>

        <!-- 5. BOOK RETURNS & OVERDUE FINES TAB -->
        <LibrarianReturnsTab 
          v-else-if="activeTab === 'returns'" 
          :loans="loansList"
          @refresh="refreshLoans"
          @return="handleReturnLoan"
        />

        <!-- 6. RESEARCH & PROPOSALS TAB -->
        <AdminProposalsTab 
          v-else-if="activeTab === 'proposals'" 
          :proposals="proposals"
          @add-proposal="isAddProposalOpen = true"
          @edit-proposal="openEditProposalModal"
          @delete-proposal="handleDeleteProposal"
        />

        <!-- 7. REPORTS TAB -->
        <AdminReportsTab 
          v-else-if="activeTab === 'reports'" 
          @refresh="refreshStats"
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

        <!-- 10. STUDENT INQUIRIES & HELPDESK (CONTACT FORM) TAB -->
        <LibrarianInquiriesTab 
          v-else-if="activeTab === 'inquiries'" 
          :inquiries="inquiriesList" 
          @refresh="refreshInquiries" 
          @update-status="handleUpdateInquiryStatus" 
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

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useServiceStatusStore } from '~/stores/serviceStatus'
import { useToast } from '~/composables/useToast'
import {
  GraduationCap,
  LayoutDashboard,
  Lock,
  BookOpen,
  ArrowLeftRight,
  RotateCcw,
  FileText,
  BarChart3,
  Video,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  Globe,
  ExternalLink,
  Megaphone,
  MessageSquareText,
  CalendarClock
} from 'lucide-vue-next'

const authStore = useAuthStore()
const statusStore = useServiceStatusStore()
const toast = useToast()
const { currentLang, translatePageDom } = useLanguage()

// State
const activeTab = ref('dashboard')

// Re-apply translation immediately whenever librarian switches tabs
watch(activeTab, () => {
  if (currentLang.value !== 'en') {
    setTimeout(() => translatePageDom(currentLang.value), 50)
    setTimeout(() => translatePageDom(currentLang.value), 200)
  }
})
const isSidebarOpen = ref(true)
const isMobile = ref(false)
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

// Dynamic Loans List fetched directly from database
const { data: loansData, refresh: refreshLoans } = await useFetch('/api/loans')
const loansList = computed(() => {
  const raw = loansData.value
  return Array.isArray(raw) ? raw : (raw?.data || [])
})

const activeLoansCount = computed(() => {
  return loansList.value.filter((l: any) => l.status === 'ISSUED' || l.status === 'issued').length
})

// 3. Contact Inquiries Fetching
const { data: inquiriesResponse, refresh: refreshInquiries } = await useFetch('/api/contact')
const inquiriesList = computed(() => {
  return inquiriesResponse.value?.data || inquiriesResponse.value || []
})
const unreadInquiriesCount = computed(() => {
  return inquiriesList.value.filter((i: any) => i.status === 'UNREAD').length
})

// 4. Librarian Shifts & Schedule Fetching
const { data: shiftsData, refresh: refreshShifts } = await useFetch('/api/shifts')

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

const checkMobileScreen = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 1024
    if (isMobile.value) {
      isSidebarOpen.value = false
    }
  }
}

let pollTimer: any = null

onMounted(() => {
  if (process.client) {
    checkMobileScreen()
    window.addEventListener('resize', checkMobileScreen)
    authStore.init()
    statusStore.fetchStatus()
    if (!authStore.isAuthenticated) {
      navigateTo('/auth?redirect=/librarian')
    } else if (!authStore.isLibrarian && !authStore.isAdmin) {
      navigateTo('/my-borrows')
    }

    // Auto-poll active loans every 4 seconds to catch new student payment slips in real time
    pollTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshLoans()
      }
    }, 4000)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (process.client && typeof window !== 'undefined') {
    window.removeEventListener('resize', checkMobileScreen)
  }
})

const selectTab = (tab: string) => {
  activeTab.value = tab
  if (isMobile.value) {
    isSidebarOpen.value = false
  }
}

const handleLogout = async () => {
  if (confirm('Are you sure you want to sign out?')) {
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
    toast.success('Closed shelf request approved!', 'Request Approved')
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
    toast.info('Closed shelf request denied', 'Request Denied')
  } catch (err: any) {
    toast.error(err?.message || 'Denial failed', 'Error')
  }
}

// Loan Handlers with Full DB Integration
const handleIssueLoanSubmit = async (form: any) => {
  isSubmitting.value = true
  try {
    await $fetch('/api/loans', { method: 'POST', body: form })
    await Promise.all([refreshLoans(), refreshBooks(), refreshStats()])
    isIssueLoanOpen.value = false
    toast.success('Book loan issued to patron successfully!', 'Loan Issued')
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || 'Loan issue failed', 'Issue Failed')
  } finally {
    isSubmitting.value = false
  }
}

const handleReturnLoan = async (payload: any) => {
  const transactionId = typeof payload === 'object' && payload !== null ? (payload.id || payload.transactionId) : payload
  const condition = typeof payload === 'object' && payload !== null ? (payload.condition || 'Good Condition') : 'Good Condition'
  const notes = typeof payload === 'object' && payload !== null ? (payload.notes || '') : ''
  const librarianName = authStore.user?.name || 'Circulation Librarian'

  if (!transactionId) {
    toast.error('Valid transaction ID is required', 'Error')
    return
  }

  try {
    const res: any = await $fetch('/api/loans/return', {
      method: 'POST',
      body: {
        transactionId: Number(transactionId),
        condition,
        notes,
        librarianName,
        paymentMethod: typeof payload === 'object' ? payload.paymentMethod : undefined,
        paymentReceipt: typeof payload === 'object' ? payload.paymentReceipt : undefined,
      }
    })
    await Promise.all([
      refreshLoans(),
      refreshRequests(),
      refreshBooks(),
      refreshStats()
    ])
    toast.success(`Book return confirmed! Official clearance receipt #${res?.receiptNo || transactionId} issued.`, 'Return Confirmed')
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || 'Return processing failed', 'Processing Error')
  }
}

const handleRenewLoan = async (id: number | string) => {
  try {
    await $fetch('/api/loans/renew', {
      method: 'POST',
      body: { transactionId: Number(id) }
    })
    await refreshLoans()
    toast.success('Book loan renewed for +7 additional days!', 'Loan Extended')
  } catch (err: any) {
    toast.error(err?.data?.message || err?.message || 'Renew failed', 'Renew Failed')
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
    toast.success('Research proposal deposited successfully!', 'Proposal Saved')
  } catch (err: any) {
    toast.error(err?.message || 'Proposal saved', 'Error')
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
