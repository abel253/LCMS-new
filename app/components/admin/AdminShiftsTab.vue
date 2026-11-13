<template>
  <div class="space-y-6">
    <!-- ══════════════ 1. HEADER & SHIFT SYSTEM OVERVIEW ══════════════ -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black uppercase tracking-wider">
              Circulation Duty & Roster
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Cross-Shift Universal Access
            </span>
          </div>
          <h2 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarClock :size="26" class="text-blue-600" />
            Librarian Shifts & Duty Schedule Management
          </h2>
          <p class="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Manage multi-shift library circulation, re-order librarian assignments, and announce the active on-duty officer for today. All library staff have shared access to view and return patron loans across all shifts.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <button 
            @click="openAddShiftModal"
            class="px-4 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#1b62db] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Plus :size="16" />
            <span>+ Add Librarian to Shift</span>
          </button>

          <button 
            @click="fetchShifts" 
            :disabled="isLoading"
            class="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer disabled:opacity-50"
            title="Refresh Shift Roster"
          >
            <RefreshCw :size="16" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>
      </div>

      <!-- Quick Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Today's On-Duty Officer -->
        <div class="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border border-blue-200/80 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-blue-800 tracking-wider">Today's Duty Officer</span>
            <span class="text-[10px] bg-blue-600 text-white font-black px-2 py-0.5 rounded-full uppercase">On Duty</span>
          </div>
          <div class="mt-2.5">
            <p class="text-base font-black text-slate-900 leading-tight">
              {{ currentAnnouncement?.dutyLibrarianName || activeLibrarian?.librarianName || 'Not Assigned' }}
            </p>
            <p class="text-xs text-blue-700 font-semibold mt-0.5">
              {{ currentAnnouncement?.shiftType || activeLibrarian?.shiftType || 'MORNING' }} ({{ currentAnnouncement?.shiftHours || activeLibrarian?.shiftHours || '8:00 AM - 2:00 PM' }})
            </p>
          </div>
          <span class="text-[10px] text-slate-500 font-medium mt-2">
            📍 {{ currentAnnouncement?.stationDesk || activeLibrarian?.stationDesk || 'Main Circulation Desk' }}
          </span>
        </div>

        <!-- Card 2: Shift Slots -->
        <div class="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-amber-900 tracking-wider">Active Shift Slots</span>
            <span class="text-[10px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">24/7 Coverage</span>
          </div>
          <div class="flex items-baseline justify-between mt-2">
            <span class="text-2xl font-black text-amber-900 font-mono">{{ roster.length }}</span>
            <span class="text-[10px] text-amber-800 font-medium">Rotating Shifts</span>
          </div>
          <p class="text-[10px] text-amber-700 mt-2 font-medium">Morning • Afternoon • Night • Weekend</p>
        </div>

        <!-- Card 3: Universal Loan Policy -->
        <div class="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-emerald-900 tracking-wider">Universal Loan Access</span>
            <span class="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-1.5 py-0.5 rounded">Enabled</span>
          </div>
          <div class="mt-2">
            <p class="text-sm font-bold text-emerald-900">Zero-Barrier Circulation</p>
            <p class="text-[10px] text-emerald-700 mt-1 leading-snug">
              Any librarian can return or renew books issued in any shift. Students are never delayed.
            </p>
          </div>
          <span class="text-[10px] text-emerald-600 font-semibold mt-2">✓ Without library loan barriers</span>
        </div>

        <!-- Card 4: Last Announcement Broadcast -->
        <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold uppercase text-slate-700 tracking-wider">Duty Announcement</span>
            <span class="text-[10px] bg-slate-200 text-slate-700 font-mono font-bold px-1.5 py-0.5 rounded">LIVE</span>
          </div>
          <div class="mt-2">
            <p class="text-xs text-slate-700 line-clamp-2 italic">
              "{{ currentAnnouncement?.broadcastNotice || 'Universal loan and circulation desks active.' }}"
            </p>
          </div>
          <span class="text-[10px] text-slate-400 font-mono mt-2">
            Updated: {{ formatTime(currentAnnouncement?.updatedAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- ══════════════ 2. ANNOUNCE TODAY'S ON-DUTY LIBRARIAN ══════════════ -->
    <div class="bg-gradient-to-r from-blue-900 via-[#06387d] to-indigo-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
      <!-- Decorative background glow -->
      <div class="absolute -right-12 -top-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="relative z-10 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider mb-2">
              <Megaphone :size="12" /> Official Daily Duty Broadcast
            </div>
            <h3 class="text-xl font-black text-white tracking-tight">
              Announce & Assign Today's On-Duty Librarian
            </h3>
            <p class="text-xs text-blue-200/90 mt-0.5">
              Select who is working today. This will immediately display on all librarian dashboards, student portals, and library desks.
            </p>
          </div>
        </div>

        <!-- Broadcast Form -->
        <form @submit.prevent="handleBroadcastDuty" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <!-- Select Librarian -->
          <div>
            <label class="block text-[11px] font-black uppercase text-blue-200 mb-1">Select Librarian *</label>
            <select 
              v-model="dutyForm.librarianId" 
              required
              class="w-full px-3 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 transition cursor-pointer"
            >
              <option value="" disabled>Choose Librarian...</option>
              <option v-for="lib in librarianOptions" :key="lib.userId || lib.id" :value="lib.userId || lib.id">
                {{ lib.name }} ({{ lib.userId }})
              </option>
            </select>
          </div>

          <!-- Select Shift Slot -->
          <div>
            <label class="block text-[11px] font-black uppercase text-blue-200 mb-1">Shift Slot *</label>
            <select 
              v-model="dutyForm.shiftType" 
              class="w-full px-3 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 transition cursor-pointer"
            >
              <option value="MORNING">☀️ Morning Shift (08:00 AM - 02:00 PM)</option>
              <option value="AFTERNOON">⛅ Afternoon Shift (02:00 PM - 08:00 PM)</option>
              <option value="NIGHT">🌙 Night / Evening Shift (08:00 PM - 08:00 AM)</option>
              <option value="WEEKEND">⭐ Weekend Special Duty (09:00 AM - 06:00 PM)</option>
            </select>
          </div>

          <!-- Station / Circulation Desk -->
          <div>
            <label class="block text-[11px] font-black uppercase text-blue-200 mb-1">Desk Station</label>
            <input 
              v-model="dutyForm.stationDesk"
              type="text" 
              placeholder="e.g. Main Circulation Desk (Ground Floor)"
              class="w-full px-3 py-2.5 bg-white text-slate-900 font-medium rounded-xl text-xs outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>

          <!-- Action Button -->
          <div class="flex items-end">
            <button 
              type="submit"
              :disabled="isBroadcasting"
              class="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Megaphone :size="15" />
              <span>{{ isBroadcasting ? 'Broadcasting...' : 'Broadcast Shift Announcement' }}</span>
            </button>
          </div>

          <!-- Custom Notice (Full Row) -->
          <div class="sm:col-span-2 lg:col-span-4 mt-1">
            <label class="block text-[11px] font-black uppercase text-blue-200 mb-1">
              Duty Announcement Notice to All Librarians & Students
            </label>
            <input 
              v-model="dutyForm.announcementText"
              type="text"
              placeholder="e.g. Duty Notice: Abebe Kebede is stationed at the main circulation desk today. All student checkouts and returns are processed without delay."
              class="w-full px-3.5 py-2.5 bg-white/10 text-white placeholder-blue-200/60 border border-white/20 rounded-xl text-xs outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition"
            />
          </div>
        </form>
      </div>
    </div>

    <!-- ══════════════ 3. REORDERABLE SHIFT ROSTER TABLE ══════════════ -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 sm:p-7 space-y-5">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <ListOrdered :size="20" class="text-blue-600" />
            Librarian Shift Roster & Queue Re-Ordering
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">
            Use the Move Up (⬆️) and Move Down (⬇️) buttons to adjust the shift order and schedule rotation.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-slate-400">
            Total Shifts: {{ roster.length }}
          </span>
          <button 
            @click="saveRosterOrder"
            :disabled="isSavingRoster"
            class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
          >
            <Check :size="14" />
            <span>{{ isSavingRoster ? 'Saving Order...' : 'Save Roster Order' }}</span>
          </button>
        </div>
      </div>

      <!-- Roster Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 uppercase font-black">
              <th class="py-3 px-3 text-center">Order</th>
              <th class="py-3 px-4">Librarian Details</th>
              <th class="py-3 px-4">Assigned Shift</th>
              <th class="py-3 px-4">Shift Hours & Schedule</th>
              <th class="py-3 px-4">Desk Station</th>
              <th class="py-3 px-3 text-center">Today's Duty</th>
              <th class="py-3 px-4 text-right">Reorder & Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr 
              v-for="(shift, index) in roster" 
              :key="shift.id || index"
              :class="shift.isOnDutyToday ? 'bg-blue-50/50' : ''"
              class="hover:bg-slate-50/80 transition group"
            >
              <!-- Order Column -->
              <td class="py-3.5 px-3 text-center whitespace-nowrap">
                <span class="w-7 h-7 rounded-full bg-slate-100 font-mono font-black text-slate-700 inline-flex items-center justify-center text-xs">
                  #{{ index + 1 }}
                </span>
              </td>

              <!-- Librarian Details -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-2xs">
                    {{ shift.librarianName?.charAt(0).toUpperCase() || 'L' }}
                  </div>
                  <div>
                    <p class="font-bold text-slate-900 leading-tight">{{ shift.librarianName }}</p>
                    <p class="text-[10px] text-slate-500 font-mono">{{ shift.librarianId }} • {{ shift.librarianEmail }}</p>
                  </div>
                </div>
              </td>

              <!-- Assigned Shift Badge -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span 
                  v-if="shift.shiftType === 'MORNING'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200"
                >
                  ☀️ Morning Shift
                </span>
                <span 
                  v-else-if="shift.shiftType === 'AFTERNOON'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200"
                >
                  ⛅ Afternoon Shift
                </span>
                <span 
                  v-else-if="shift.shiftType === 'NIGHT'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-200"
                >
                  🌙 Night / Evening
                </span>
                <span 
                  v-else
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-200"
                >
                  ⭐ Weekend Duty
                </span>
              </td>

              <!-- Shift Hours & Days -->
              <td class="py-3.5 px-4 whitespace-nowrap">
                <p class="font-mono font-bold text-slate-800">{{ shift.shiftHours || '08:00 AM - 02:00 PM' }}</p>
                <p class="text-[10px] text-slate-400 font-medium">{{ shift.day || 'Monday - Friday' }}</p>
              </td>

              <!-- Desk Station -->
              <td class="py-3.5 px-4">
                <p class="text-slate-800 font-medium leading-tight">{{ shift.stationDesk || 'Main Circulation Desk' }}</p>
                <p v-if="shift.handoverNotes" class="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                  📝 {{ shift.handoverNotes }}
                </p>
              </td>

              <!-- Today's Duty Toggle -->
              <td class="py-3.5 px-3 text-center whitespace-nowrap">
                <button
                  type="button"
                  @click="toggleOnDuty(shift)"
                  :class="shift.isOnDutyToday ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                  class="px-2.5 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer inline-flex items-center gap-1"
                >
                  <span :class="['w-1.5 h-1.5 rounded-full', shift.isOnDutyToday ? 'bg-white' : 'bg-slate-400']"></span>
                  <span>{{ shift.isOnDutyToday ? 'On Duty Today' : 'Mark On Duty' }}</span>
                </button>
              </td>

              <!-- Reorder & Actions -->
              <td class="py-3.5 px-4 text-right whitespace-nowrap">
                <div class="flex items-center justify-end gap-1">
                  <!-- Move Up -->
                  <button 
                    @click="moveShift(index, -1)" 
                    :disabled="index === 0"
                    class="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Shift Up"
                  >
                    <ArrowUp :size="14" />
                  </button>

                  <!-- Move Down -->
                  <button 
                    @click="moveShift(index, 1)" 
                    :disabled="index === roster.length - 1"
                    class="p-1.5 rounded-lg text-slate-600 hover:bg-blue-50 hover:text-blue-700 transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Shift Down"
                  >
                    <ArrowDown :size="14" />
                  </button>

                  <!-- Edit Shift -->
                  <button 
                    @click="openEditModal(shift)" 
                    class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                    title="Edit Shift Details"
                  >
                    <Edit3 :size="14" />
                  </button>

                  <!-- Remove -->
                  <button 
                    @click="removeShift(index)" 
                    class="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    title="Remove from Schedule"
                  >
                    <Trash2 :size="14" />
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="roster.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 text-xs">
                No librarian shifts scheduled. Click "+ Add Librarian to Shift" to create your roster.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ══════════════ 4. ADD / EDIT SHIFT MODAL ══════════════ -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-lg font-black text-slate-900 flex items-center gap-2">
            <CalendarClock :size="20" class="text-blue-600" />
            <span>{{ isEditing ? 'Edit Librarian Shift' : 'Add Librarian to Shift Roster' }}</span>
          </h3>
          <button @click="isModalOpen = false" class="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition cursor-pointer">
            <X :size="18" />
          </button>
        </div>

        <form @submit.prevent="saveShiftForm" class="space-y-3.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Librarian *</label>
            <select 
              v-model="editForm.librarianId" 
              @change="onLibrarianSelected"
              required 
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
            >
              <option value="" disabled>Choose Librarian...</option>
              <option v-for="lib in librarianOptions" :key="lib.userId || lib.id" :value="lib.userId || lib.id">
                {{ lib.name }} ({{ lib.userId }})
              </option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Shift Type *</label>
              <select 
                v-model="editForm.shiftType" 
                @change="onShiftTypeChange"
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-600 focus:bg-white cursor-pointer"
              >
                <option value="MORNING">Morning Shift</option>
                <option value="AFTERNOON">Afternoon Shift</option>
                <option value="NIGHT">Night / Evening Shift</option>
                <option value="WEEKEND">Weekend Duty</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Working Hours *</label>
              <input 
                v-model="editForm.shiftHours" 
                required 
                type="text" 
                placeholder="e.g. 08:00 AM - 02:00 PM" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Desk Station</label>
              <input 
                v-model="editForm.stationDesk" 
                type="text" 
                placeholder="e.g. Main Circulation Desk" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Assigned Days</label>
              <input 
                v-model="editForm.day" 
                type="text" 
                placeholder="e.g. Monday - Friday" 
                class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Handover Notes / Instructions</label>
            <textarea 
              v-model="editForm.handoverNotes" 
              rows="2" 
              placeholder="e.g. Cross-shift clearance active. Verify barcode tags before book shelving."
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-600 focus:bg-white resize-none"
            ></textarea>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <input 
              v-model="editForm.isOnDutyToday" 
              type="checkbox" 
              id="duty-checkbox"
              class="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label for="duty-checkbox" class="text-xs font-bold text-slate-700 cursor-pointer">
              Set this librarian as On-Duty Officer for today
            </label>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button 
              type="button" 
              @click="isModalOpen = false" 
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
            >
              {{ isEditing ? 'Update Shift' : 'Add to Roster' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  CalendarClock, Megaphone, Plus, RefreshCw, ListOrdered, 
  ArrowUp, ArrowDown, Edit3, Trash2, Check, X 
} from 'lucide-vue-next'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  librarians?: any[]
}>()

const toast = useToast()
const isLoading = ref(false)
const isBroadcasting = ref(false)
const isSavingRoster = ref(false)
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingIndex = ref(-1)

const roster = ref<any[]>([])
const currentAnnouncement = ref<any>(null)
const activeLibrarian = ref<any>(null)

// Broadcast duty form
const dutyForm = reactive({
  librarianId: '',
  shiftType: 'MORNING',
  stationDesk: 'Main Circulation Desk (Ground Floor)',
  announcementText: '',
})

// Modal form
const editForm = reactive({
  id: '',
  librarianId: '',
  librarianName: '',
  librarianEmail: '',
  shiftType: 'MORNING',
  shiftHours: '08:00 AM - 02:00 PM',
  stationDesk: 'Main Circulation Desk (Ground Floor)',
  day: 'Monday - Friday',
  isOnDutyToday: false,
  handoverNotes: '',
})

// Librarians list for select dropdown
const librarianOptions = computed(() => {
  if (props.librarians && props.librarians.length > 0) {
    return props.librarians
  }
  return [
    { userId: 'LIB-001', name: 'Librarian Desk Officer', email: 'librarian@mkau.edu.et' },
    { userId: 'LIB-002', name: 'Abebe Tadesse (Senior Cataloger)', email: 'abebe.t@mkau.edu.et' },
    { userId: 'LIB-003', name: 'Sara Mohammed (Circulation Assistant)', email: 'sara.m@mkau.edu.et' },
    { userId: 'LIB-004', name: 'Chala Gemechu (Weekend Officer)', email: 'chala.g@mkau.edu.et' },
  ]
})

// Fetch shifts from backend
const fetchShifts = async () => {
  isLoading.value = true
  try {
    const res: any = await $fetch('/api/shifts')
    if (res.success) {
      roster.value = res.roster || []
      currentAnnouncement.value = res.announcement || null
      activeLibrarian.value = res.activeLibrarian || null

      if (res.activeLibrarian?.librarianId) {
        dutyForm.librarianId = res.activeLibrarian.librarianId
        dutyForm.shiftType = res.activeLibrarian.shiftType || 'MORNING'
        dutyForm.stationDesk = res.activeLibrarian.stationDesk || 'Main Circulation Desk'
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch shifts:', err)
  } finally {
    isLoading.value = false
  }
}

// Broadcast duty announcement
const handleBroadcastDuty = async () => {
  if (!dutyForm.librarianId) {
    toast.warning('Please select a librarian to assign on duty', 'Required')
    return
  }

  isBroadcasting.value = true
  const selectedLib = librarianOptions.value.find(l => (l.userId || l.id) === dutyForm.librarianId)

  try {
    const res: any = await $fetch('/api/shifts', {
      method: 'POST',
      body: {
        action: 'set-duty',
        librarianId: dutyForm.librarianId,
        librarianName: selectedLib?.name || 'Assigned Officer',
        shiftType: dutyForm.shiftType,
        stationDesk: dutyForm.stationDesk,
        announcementText: dutyForm.announcementText || undefined,
      },
    })

    if (res.success) {
      toast.success(res.message || 'On-duty shift announced successfully!', 'Shift Broadcasted')
      if (res.roster) roster.value = res.roster
      if (res.announcement) currentAnnouncement.value = res.announcement
      if (res.activeLibrarian) activeLibrarian.value = res.activeLibrarian
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to broadcast shift', 'Error')
  } finally {
    isBroadcasting.value = false
  }
}

// Toggle on-duty for a specific shift in table
const toggleOnDuty = async (shift: any) => {
  dutyForm.librarianId = shift.librarianId
  dutyForm.shiftType = shift.shiftType
  dutyForm.stationDesk = shift.stationDesk
  dutyForm.announcementText = `Official Notice: ${shift.librarianName} is on duty today at ${shift.stationDesk}. Universal loan and return services are open.`
  await handleBroadcastDuty()
}

// Move shift in array (Re-ordering)
const moveShift = (index: number, direction: number) => {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= roster.value.length) return
  const temp = roster.value[index]
  roster.value[index] = roster.value[newIndex]
  roster.value[newIndex] = temp
  toast.info(`Moved ${temp.librarianName} to position #${newIndex + 1}`, 'Reordered')
}

// Save Roster Order
const saveRosterOrder = async () => {
  isSavingRoster.value = true
  try {
    const res: any = await $fetch('/api/shifts', {
      method: 'POST',
      body: {
        action: 'reorder',
        roster: roster.value,
      },
    })
    if (res.success) {
      toast.success('Shift roster rotation order saved permanently!', 'Saved')
    }
  } catch (err: any) {
    toast.error(err?.message || 'Failed to save shift order', 'Error')
  } finally {
    isSavingRoster.value = false
  }
}

// Add/Edit Modal
const openAddShiftModal = () => {
  isEditing.value = false
  editingIndex.value = -1
  const firstLib = librarianOptions.value[0]
  Object.assign(editForm, {
    id: `shift-${Date.now()}`,
    librarianId: firstLib?.userId || 'LIB-001',
    librarianName: firstLib?.name || 'Librarian Officer',
    librarianEmail: firstLib?.email || '',
    shiftType: 'MORNING',
    shiftHours: '08:00 AM - 02:00 PM',
    stationDesk: 'Main Circulation Desk (Ground Floor)',
    day: 'Monday - Friday',
    isOnDutyToday: false,
    handoverNotes: '',
  })
  isModalOpen.value = true
}

const openEditModal = (shift: any) => {
  isEditing.value = true
  editingIndex.value = roster.value.findIndex(s => s.id === shift.id)
  Object.assign(editForm, { ...shift })
  isModalOpen.value = true
}

const onLibrarianSelected = () => {
  const found = librarianOptions.value.find(l => (l.userId || l.id) === editForm.librarianId)
  if (found) {
    editForm.librarianName = found.name
    editForm.librarianEmail = found.email || ''
  }
}

const onShiftTypeChange = () => {
  switch (editForm.shiftType) {
    case 'MORNING':
      editForm.shiftHours = '08:00 AM - 02:00 PM'
      editForm.stationDesk = 'Main Circulation Desk (Ground Floor)'
      break
    case 'AFTERNOON':
      editForm.shiftHours = '02:00 PM - 08:00 PM'
      editForm.stationDesk = 'Reference & Closed Shelf Desk (1st Floor)'
      break
    case 'NIGHT':
      editForm.shiftHours = '08:00 PM - 08:00 AM'
      editForm.stationDesk = '24/7 Digital Commons & Study Hall Desk'
      break
    case 'WEEKEND':
      editForm.shiftHours = '09:00 AM - 06:00 PM'
      editForm.stationDesk = 'Universal Student Service Desk'
      break
  }
}

const removeShift = (index: number) => {
  const removed = roster.value.splice(index, 1)
  toast.warning(`Removed ${removed[0]?.librarianName} from schedule`, 'Removed')
  saveRosterOrder()
}

const saveShiftForm = async () => {
  if (isEditing.value && editingIndex.value >= 0) {
    roster.value[editingIndex.value] = { ...editForm }
  } else {
    roster.value.push({ ...editForm, order: roster.value.length + 1 })
  }
  isModalOpen.value = false
  await saveRosterOrder()
}

const formatTime = (iso?: string) => {
  if (!iso) return 'Recent'
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return 'Recent'
  }
}

onMounted(() => {
  fetchShifts()
})
</script>
