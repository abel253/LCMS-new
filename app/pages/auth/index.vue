<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const isLogin = ref(true)
const loading = ref(false)
const showPassword = ref(false)

const loginForm = reactive({
  identifier: '',
  password: '',
})

const registerForm = reactive({
  name: '',
  userId: '',
  email: '',
  department: 'Computer Science',
  userType: 'Student',
  password: '',
  passwordConfirm: '',
})

const resolveRedirect = (userRole?: string): string => {
  const q = route.query.redirect
  if (q && typeof q === 'string') return q

  const role = (userRole || authStore.user?.userType || authStore.user?.role || '').toLowerCase()
  if (role === 'admin' || role === 'administrator') return '/admin'
  if (role === 'librarian') return '/librarian'
  return '/my-borrows'
}

onMounted(() => {
  authStore.init()
  if (authStore.isAuthenticated) {
    router.push(resolveRedirect())
  }
})

// ───── HANDLE LOGIN ─────
const handleLogin = async () => {
  if (!loginForm.identifier || !loginForm.password) {
    toast.warning('Please enter your Student/Staff ID or Email and Password', 'Credentials Required')
    return
  }

  loading.value = true

  try {
    const res = await authStore.login({
      identifier: loginForm.identifier,
      password: loginForm.password,
    })

    if (res.success) {
      toast.success('Signed in successfully! Redirecting...', 'Welcome')
      const target = resolveRedirect(res.data?.user?.userType)
      setTimeout(() => {
        router.push(target)
      }, 500)
    }
  } catch (err: any) {
    toast.error(err.message || 'Login failed. Please verify your credentials.', 'Sign In Failed')
  } finally {
    loading.value = false
  }
}

// ───── HANDLE REGISTER (DIRECT ACCESS) ─────
const handleRegister = async () => {
  if (!registerForm.name || !registerForm.email || !registerForm.password) {
    toast.warning('Please fill in your name, email, and password.', 'Missing Fields')
    return
  }

  if (registerForm.password.length < 6) {
    toast.warning('Password must be at least 6 characters long.', 'Password Too Short')
    return
  }

  if (registerForm.password !== registerForm.passwordConfirm) {
    toast.error('Passwords do not match. Please re-type your password.', 'Password Mismatch')
    return
  }

  loading.value = true

  try {
    const res = await authStore.register({
      name: registerForm.name,
      userId: registerForm.userId || undefined,
      email: registerForm.email,
      department: registerForm.department,
      userType: registerForm.userType,
      password: registerForm.password,
      password_confirmation: registerForm.passwordConfirm,
    })

    if (res.success) {
      toast.success('Your account has been created successfully! Signed in.', 'Registration Successful')
      const target = resolveRedirect(res.data?.user?.userType)
      setTimeout(() => {
        router.push(target)
      }, 500)
    }
  } catch (err: any) {
    toast.error(err.message || 'Registration failed. Please try again.', 'Registration Failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-6 sm:py-10 px-4 sm:px-6 font-sans relative">
    
    <!-- Top-Right Language Selector -->
    <div class="absolute top-4 right-4 z-20">
      <SharedLanguageSelector theme="light" />
    </div>

    <!-- Top Branding with Official Logo -->
    <div class="text-center mb-5 flex flex-col items-center">
      <NuxtLink to="/" class="inline-flex items-center justify-center mb-2.5 group" title="Return to Home">
        <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white p-1.5 shadow-md border border-slate-200/80 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 overflow-hidden">
          <img src="/logo.png" alt="Mekdela Amba University Logo" class="w-full h-full object-contain" />
        </div>
      </NuxtLink>
      <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mekdela Amba University</h1>
      <p class="text-xs font-semibold text-slate-500 mt-0.5">Library Circulation & Information Management System</p>
    </div>

    <!-- Main Auth Card -->
    <div class="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
      
      <!-- Tab Buttons (Login vs Register) -->
      <div class="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-black">
        <button
          type="button"
          @click="isLogin = true"
          :class="isLogin ? 'bg-white text-[#06387d] shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="py-2.5 rounded-xl transition cursor-pointer text-center"
        >
          Sign In
        </button>
        <button
          type="button"
          @click="isLogin = false"
          :class="!isLogin ? 'bg-white text-[#06387d] shadow-sm' : 'text-slate-500 hover:text-slate-900'"
          class="py-2.5 rounded-xl transition cursor-pointer text-center"
        >
          Create Account
        </button>
      </div>

      <!-- ══════════════ 1. LOGIN FORM ══════════════ -->
      <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1.5">
            Student / Staff ID or University Email *
          </label>
          <input
            v-model="loginForm.identifier"
            required
            type="text"
            placeholder="e.g. UGR/1245/14 or student@mkau.edu.et"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="block text-xs font-bold uppercase text-slate-600">Password *</label>
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <input
            v-model="loginForm.password"
            required
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
            class="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'Signing In...' : 'Sign In' }}</span>
        </button>
      </form>

      <!-- ══════════════ 2. REGISTER FORM ══════════════ -->
      <form v-else @submit.prevent="handleRegister" class="space-y-3.5">
        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Full Legal Name *</label>
          <input
            v-model="registerForm.name"
            required
            type="text"
            placeholder="e.g. Abebe Bikila"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Student / Staff ID *</label>
            <input
              v-model="registerForm.userId"
              required
              type="text"
              placeholder="e.g. UGR/1245/14"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Role / Account Type</label>
            <select
              v-model="registerForm.userType"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition font-medium"
            >
              <option value="Student">🎓 Student</option>
              <option value="Faculty">👨‍🏫 Faculty Member</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Institutional Email *</label>
          <input
            v-model="registerForm.email"
            required
            type="email"
            placeholder="e.g. abebe@mkau.edu.et"
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div>
          <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Academic Department</label>
          <input
            v-model="registerForm.department"
            type="text"
            placeholder="e.g. Computer Science, Law, Medicine..."
            class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
          />
        </div>

        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Password *</label>
            <input
              v-model="registerForm.password"
              required
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
          <div>
            <label class="block text-xs font-bold uppercase text-slate-600 mb-1">Confirm Password *</label>
            <input
              v-model="registerForm.passwordConfirm"
              required
              type="password"
              placeholder="••••••••"
              class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 bg-[#06387d] hover:bg-[#1b62db] text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          <span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          <span>{{ loading ? 'Creating Account...' : 'Register & Sign In' }}</span>
        </button>
      </form>

      <!-- Back to Catalog link -->
      <div class="text-center pt-2">
        <NuxtLink to="/search" class="text-xs text-slate-500 hover:text-blue-700 font-semibold transition">
          ← Back to Books Catalog
        </NuxtLink>
      </div>

    </div>
  </div>
</template>
