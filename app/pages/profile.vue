<!-- app/pages/profile.vue -->
<template>
  <div class="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-5xl mx-auto space-y-6">

      <!-- ================= 1. PROFILE HERO & PATRON IDENTIFICATION CARD ================= -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 relative overflow-hidden">
        <!-- Background Top Accent Banner -->
        <div class="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-[#06387d] via-[#006ea6] to-indigo-700"></div>

        <div class="relative pt-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6">
          
          <!-- Avatar with Instant Photo Upload -->
          <div class="flex flex-col sm:flex-row items-center sm:items-end gap-5">
            <div class="relative group">
              <div 
                class="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white p-1.5 shadow-xl border-4 border-white aspect-square"
              >
                <div class="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white text-3xl font-black aspect-square">
                  <img 
                    v-if="profileForm.avatar" 
                    :src="profileForm.avatar" 
                    :alt="profileForm.name" 
                    class="w-full h-full object-cover"
                  />
                  <span v-else>{{ userInitial }}</span>
                </div>
              </div>

              <!-- Camera Change Photo Trigger Button -->
              <button 
                type="button" 
                @click="triggerAvatarFile" 
                class="absolute bottom-1 right-1 p-2 rounded-xl bg-[#06387d] hover:bg-[#1b62db] text-white shadow-md border-2 border-white transition transform hover:scale-105 cursor-pointer"
                title="Upload Profile Picture"
              >
                <Camera :size="15" />
              </button>
              <input 
                ref="fileInputRef" 
                type="file" 
                accept="image/*" 
                @change="handleAvatarUpload" 
                class="hidden" 
              />
            </div>

            <!-- Patron Identity Summary -->
            <div class="space-y-1 text-center sm:text-left">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 class="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {{ profileForm.name || 'Patron Profile' }}
                </h1>
                <span 
                  :class="isFaculty ? 'bg-purple-100 text-purple-800 border-purple-200' : 'bg-blue-100 text-blue-800 border-blue-200'"
                  class="px-2.5 py-0.5 rounded-full text-xs font-black uppercase border tracking-wider"
                >
                  ✦ {{ profileForm.userType || 'STUDENT' }}
                </span>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  ID: {{ currentUserId }}
                </span>
              </div>
              
              <p class="text-xs text-slate-500 font-medium">
                {{ profileForm.department || 'General Academic Department' }} • Mekdela Amba University
              </p>

              <!-- Borrowing Status Badge -->
              <div class="pt-1 flex items-center justify-center sm:justify-start gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active Library Membership • Eligible to Borrow
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Actions & Shortcut to Borrows -->
          <div class="flex items-center gap-2 w-full sm:w-auto">
            <NuxtLink 
              to="/my-borrows" 
              class="flex-1 sm:flex-none px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-[#006ea6] border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <BookOpen :size="14" />
              <span>My Active Borrows</span>
            </NuxtLink>
            
            <button
              v-if="profileForm.avatar"
              type="button"
              @click="removeAvatar"
              class="px-3 py-2.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 rounded-xl text-xs font-bold transition border border-slate-200"
              title="Remove Profile Picture"
            >
              Remove Photo
            </button>
          </div>

        </div>

        <!-- Library Patron Quota Counters -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-100">
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span class="text-[10px] font-bold uppercase text-slate-400 block">Borrowing Limit</span>
            <p class="text-lg font-black text-slate-900 mt-0.5">
              {{ isFaculty ? '10 Books' : '5 Books' }}
            </p>
            <span class="text-[10px] text-slate-500">Max concurrent loans</span>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span class="text-[10px] font-bold uppercase text-slate-400 block">Short Loan Period</span>
            <p class="text-lg font-black text-purple-700 mt-0.5">3 Days</p>
            <span class="text-[10px] text-slate-500">Exam & reference books</span>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span class="text-[10px] font-bold uppercase text-slate-400 block">Standard Stacks Period</span>
            <p class="text-lg font-black text-blue-700 mt-0.5">
              {{ isFaculty ? '30 Days' : '14 Days' }}
            </p>
            <span class="text-[10px] text-slate-500">Regular stack circulation</span>
          </div>

          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
            <span class="text-[10px] font-bold uppercase text-slate-400 block">Online Renewal</span>
            <p class="text-lg font-black text-emerald-700 mt-0.5">Up to 2x</p>
            <span class="text-[10px] text-slate-500">Before due date</span>
          </div>
        </div>
      </div>

      <!-- ================= 2. TABBED EDIT SECTIONS ================= -->
      <div class="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200/90 space-y-6">
        
        <!-- Navigation Sub-Tabs -->
        <div class="flex items-center gap-2 border-b border-slate-100 pb-3">
          <button 
            type="button" 
            @click="activeTab = 'personal'" 
            :class="activeTab === 'personal' ? 'bg-[#06387d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <User :size="14" />
            <span>{{ isFaculty ? 'Faculty Information' : 'Student Information' }}</span>
          </button>

          <button 
            type="button" 
            @click="activeTab = 'security'" 
            :class="activeTab === 'security' ? 'bg-[#06387d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Lock :size="14" />
            <span>Password & Security</span>
          </button>

          <button 
            type="button" 
            @click="activeTab = 'notifications'" 
            :class="activeTab === 'notifications' ? 'bg-[#06387d] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'"
            class="px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <Bell :size="14" />
            <span>Alert Preferences</span>
          </button>
        </div>

        <!-- ================= TAB 1: PERSONAL & ACADEMIC INFO ================= -->
        <form v-if="activeTab === 'personal'" @submit.prevent="saveProfile" class="space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <!-- Full Name -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input 
                v-model="profileForm.name" 
                type="text" 
                required 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="Enter your full legal name"
              />
            </div>

            <!-- University ID (Institutional Verified) -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                {{ isFaculty ? 'Faculty Staff ID' : 'Student Identification Number' }}
              </label>
              <input 
                :value="currentUserId" 
                type="text" 
                disabled 
                class="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-500 cursor-not-allowed"
                title="Institutional ID assigned by the Registrar"
              />
              <p class="text-[10px] text-slate-400 mt-1">Institutional ID is permanently bound to your library patron card.</p>
            </div>

            <!-- Email Address -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                University Email Address *
              </label>
              <input 
                v-model="profileForm.email" 
                type="email" 
                required 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="student@mkau.edu.et"
              />
            </div>

            <!-- Phone Number -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Contact Phone Number
              </label>
              <input 
                v-model="profileForm.phone" 
                type="text" 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition font-mono"
                placeholder="+251 911 234 567"
              />
            </div>

            <!-- College Selection -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                College / Faculty
              </label>
              <select 
                v-model="profileForm.college" 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer"
              >
                <option value="College of Informatics">College of Informatics</option>
                <option value="College of Engineering">College of Engineering & Technology</option>
                <option value="College of Health Sciences">College of Health Sciences & Medicine</option>
                <option value="College of Business & Economics">College of Business & Economics</option>
                <option value="College of Agriculture">College of Agriculture & Natural Resources</option>
                <option value="College of Social Sciences">College of Social Sciences & Humanities</option>
              </select>
            </div>

            <!-- Department Selection -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Academic Department *
              </label>
              <input 
                v-model="profileForm.department" 
                type="text" 
                required 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="e.g. Software Engineering"
              />
            </div>

            <!-- Specific field for Student -->
            <div v-if="!isFaculty">
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Academic Year & Semester
              </label>
              <select 
                v-model="profileForm.academicYear" 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer"
              >
                <option value="1st Year">1st Year (Freshman)</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year (Graduating Class)</option>
                <option value="5th Year">5th Year (Engineering / Medicine)</option>
                <option value="Postgraduate (Masters)">Postgraduate (Masters)</option>
                <option value="PhD Candidate">PhD Candidate</option>
              </select>
            </div>

            <!-- Specific field for Faculty -->
            <div v-else>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Academic Rank / Faculty Title
              </label>
              <select 
                v-model="profileForm.facultyRank" 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition cursor-pointer"
              >
                <option value="Lecturer">Lecturer</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Professor">Professor</option>
                <option value="Department Chair">Department Chair</option>
                <option value="Research Fellow">Research Fellow</option>
              </select>
            </div>

            <!-- Program Type or Office Location -->
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                {{ isFaculty ? 'Faculty Office Location' : 'Enrollment Program' }}
              </label>
              <input 
                v-model="profileForm.extraInfo" 
                type="text" 
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                :placeholder="isFaculty ? 'e.g. Block 42, Office 204' : 'e.g. Regular Undergraduate Program'"
              />
            </div>

          </div>

          <!-- Alert Feedback -->
          <div v-if="saveMessage" class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check :size="15" />
            <span>{{ saveMessage }}</span>
          </div>

          <div v-if="saveError" class="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle :size="15" />
            <span>{{ saveError }}</span>
          </div>

          <!-- Submit Button -->
          <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button 
              type="submit" 
              :disabled="isSaving" 
              class="px-6 py-3 bg-[#06387d] hover:bg-[#1b62db] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Save :size="14" />
              <span>{{ isSaving ? 'Saving Profile...' : 'Save Profile Changes' }}</span>
            </button>
          </div>
        </form>

        <!-- ================= TAB 2: PASSWORD & SECURITY ================= -->
        <form v-else-if="activeTab === 'security'" @submit.prevent="updatePassword" class="space-y-5 max-w-lg">
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                New Password *
              </label>
              <input 
                v-model="securityForm.newPassword" 
                type="password" 
                required 
                minlength="6"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="Enter at least 6 characters"
              />
            </div>

            <div>
              <label class="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                Confirm New Password *
              </label>
              <input 
                v-model="securityForm.confirmPassword" 
                type="password" 
                required 
                minlength="6"
                class="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
                placeholder="Confirm your new password"
              />
            </div>
          </div>

          <!-- Alert Feedback -->
          <div v-if="securityMessage" class="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <Check :size="15" />
            <span>{{ securityMessage }}</span>
          </div>

          <div v-if="securityError" class="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle :size="15" />
            <span>{{ securityError }}</span>
          </div>

          <!-- Update Password Button -->
          <div class="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button 
              type="submit" 
              :disabled="isUpdatingPassword" 
              class="px-6 py-3 bg-[#06387d] hover:bg-[#1b62db] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer flex items-center gap-2"
            >
              <Lock :size="14" />
              <span>{{ isUpdatingPassword ? 'Updating Password...' : 'Update Password' }}</span>
            </button>
          </div>
        </form>

        <!-- ================= TAB 3: ALERT PREFERENCES ================= -->
        <div v-else-if="activeTab === 'notifications'" class="space-y-4 max-w-xl">
          <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-xs font-bold text-slate-900">Email Due Date Reminders</p>
                <p class="text-[11px] text-slate-500">Receive email notification 48 hours before borrowed books are due</p>
              </div>
              <input type="checkbox" v-model="notifications.emailDueDate" class="w-4 h-4 text-blue-600 rounded cursor-pointer" />
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 pt-3">
              <div>
                <p class="text-xs font-bold text-slate-900">SMS Return Alerts</p>
                <p class="text-[11px] text-slate-500">Instant SMS text message when a book return is officially cleared</p>
              </div>
              <input type="checkbox" v-model="notifications.smsAlerts" class="w-4 h-4 text-blue-600 rounded cursor-pointer" />
            </div>

            <div class="flex items-center justify-between border-t border-slate-200/60 pt-3">
              <div>
                <p class="text-xs font-bold text-slate-900">Department Thesis & Research Updates</p>
                <p class="text-[11px] text-slate-500">Get notified when new capstone projects or theses are uploaded in your field</p>
              </div>
              <input type="checkbox" v-model="notifications.researchAlerts" class="w-4 h-4 text-blue-600 rounded cursor-pointer" />
            </div>
          </div>

          <div class="pt-2">
            <button 
              type="button" 
              @click="savePreferences" 
              class="px-5 py-2.5 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            >
              Save Alert Preferences
            </button>
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { 
  User, 
  Lock, 
  Bell, 
  Camera, 
  BookOpen, 
  Check, 
  AlertCircle, 
  Save 
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()

const activeTab = ref<'personal' | 'security' | 'notifications'>('personal')
const fileInputRef = ref<HTMLInputElement | null>(null)
const isSaving = ref(false)
const saveMessage = ref('')
const saveError = ref('')

const isUpdatingPassword = ref(false)
const securityMessage = ref('')
const securityError = ref('')

const isFaculty = computed(() => {
  const type = String(authStore.user?.userType || authStore.user?.role || '').toLowerCase()
  return type === 'faculty'
})

const currentUserId = computed(() => {
  return String(authStore.user?.userId || authStore.user?.id || '1213')
})

const userInitial = computed(() => {
  const name = profileForm.name || 'User'
  return name.trim().charAt(0).toUpperCase()
})

const profileForm = reactive({
  name: '',
  email: '',
  phone: '',
  college: 'College of Informatics',
  department: 'Software Engineering',
  userType: 'STUDENT',
  academicYear: '3rd Year',
  facultyRank: 'Lecturer',
  extraInfo: 'Regular Undergraduate Program',
  avatar: '',
})

const securityForm = reactive({
  newPassword: '',
  confirmPassword: '',
})

const notifications = reactive({
  emailDueDate: true,
  smsAlerts: true,
  researchAlerts: false,
})

const triggerAvatarFile = () => {
  fileInputRef.value?.click()
}

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    if (file.size > 5 * 1024 * 1024) {
      saveError.value = 'Profile image size must be under 5MB.'
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.avatar = e.target?.result as string
      authStore.updateUserProfile({ avatar: profileForm.avatar })
      saveMessage.value = 'Profile photo updated successfully!'
      setTimeout(() => { saveMessage.value = '' }, 3000)
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  profileForm.avatar = ''
  authStore.updateUserProfile({ avatar: '' })
  saveMessage.value = 'Profile photo removed.'
  setTimeout(() => { saveMessage.value = '' }, 3000)
}

const saveProfile = async () => {
  isSaving.value = true
  saveMessage.value = ''
  saveError.value = ''

  try {
    // 1. Update in database via backend API
    const userId = currentUserId.value
    if (userId) {
      await $fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: {
          name: profileForm.name,
          email: profileForm.email,
          department: profileForm.department,
        }
      })
    }

    // 2. Persist in local reactive auth store
    authStore.updateUserProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      department: profileForm.department,
      avatar: profileForm.avatar,
    })

    saveMessage.value = 'Your profile information has been saved successfully!'
    setTimeout(() => { saveMessage.value = '' }, 3500)
  } catch (err: any) {
    saveError.value = err?.data?.statusMessage || err?.message || 'Failed to update profile.'
  } finally {
    isSaving.value = false
  }
}

const updatePassword = async () => {
  if (securityForm.newPassword !== securityForm.confirmPassword) {
    securityError.value = 'New password and confirmation password do not match.'
    return
  }

  if (securityForm.newPassword.length < 6) {
    securityError.value = 'Password must be at least 6 characters long.'
    return
  }

  isUpdatingPassword.value = true
  securityMessage.value = ''
  securityError.value = ''

  try {
    const userId = currentUserId.value
    if (userId) {
      await $fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        body: {
          password: securityForm.newPassword,
        }
      })
    }

    securityMessage.value = 'Password updated successfully! Your new password is now active.'
    securityForm.newPassword = ''
    securityForm.confirmPassword = ''
    setTimeout(() => { securityMessage.value = '' }, 3500)
  } catch (err: any) {
    securityError.value = err?.data?.statusMessage || err?.message || 'Failed to update password.'
  } finally {
    isUpdatingPassword.value = false
  }
}

const savePreferences = () => {
  saveMessage.value = 'Notification preferences updated.'
  setTimeout(() => { saveMessage.value = '' }, 3000)
}

onMounted(() => {
  authStore.init()
  if (!authStore.isAuthenticated) {
    router.push('/auth?redirect=/profile')
    return
  }

  // Populate from active auth store
  const u = authStore.user
  if (u) {
    profileForm.name = u.name || ''
    profileForm.email = u.email || ''
    profileForm.phone = u.phone || ''
    profileForm.department = u.department || 'Software Engineering'
    profileForm.userType = (u.userType || u.role || 'STUDENT').toUpperCase()
    profileForm.avatar = authStore.userAvatar || ''
  }
})
</script>
