<!-- app/components/shared/GlobalToastContainer.vue -->
<template>
  <div 
    class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm sm:max-w-md w-full px-4 sm:px-0"
    role="region"
    aria-label="Notifications"
  >
    <transition-group
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform translate-y-[-20px] scale-95 opacity-0"
      enter-to-class="transform translate-y-0 scale-100 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="transform translate-y-0 scale-100 opacity-100"
      leave-to-class="transform translate-x-[20px] scale-95 opacity-0"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'pointer-events-auto overflow-hidden relative rounded-2xl border p-4 shadow-2xl transition-all backdrop-blur-md flex items-start gap-3.5',
          toast.type === 'success' 
            ? 'bg-white/95 border-emerald-200 text-slate-800 ring-1 ring-emerald-500/10' :
          toast.type === 'error' 
            ? 'bg-white/95 border-rose-200 text-slate-800 ring-1 ring-rose-500/10' :
          toast.type === 'warning' 
            ? 'bg-white/95 border-amber-200 text-slate-800 ring-1 ring-amber-500/10' :
            'bg-white/95 border-blue-200 text-slate-800 ring-1 ring-blue-500/10'
        ]"
      >
        <!-- Distinct State Icon Pill with Glow Effect -->
        <div 
          :class="[
            'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner',
            toast.type === 'success' ? 'bg-emerald-100/80 text-emerald-600' :
            toast.type === 'error' ? 'bg-rose-100/80 text-rose-600' :
            toast.type === 'warning' ? 'bg-amber-100/80 text-amber-600' :
            'bg-blue-100/80 text-blue-600'
          ]"
        >
          <CheckCircle2 v-if="toast.type === 'success'" :size="18" />
          <AlertOctagon v-else-if="toast.type === 'error'" :size="18" />
          <AlertTriangle v-else-if="toast.type === 'warning'" :size="18" />
          <Info v-else :size="18" />
        </div>

        <!-- Content Area -->
        <div class="flex-1 min-w-0 pr-1">
          <div class="flex items-center justify-between gap-2">
            <h4 
              :class="[
                'text-xs font-black tracking-tight leading-none',
                toast.type === 'success' ? 'text-emerald-900' :
                toast.type === 'error' ? 'text-rose-900' :
                toast.type === 'warning' ? 'text-amber-900' :
                'text-blue-900'
              ]"
            >
              {{ toast.title }}
            </h4>
            <span class="text-[9px] font-mono text-slate-400">just now</span>
          </div>

          <p class="text-xs text-slate-600 mt-1 leading-relaxed font-medium break-words">
            {{ toast.message }}
          </p>
        </div>

        <!-- Close Button -->
        <button
          type="button"
          @click="remove(toast.id)"
          class="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition hover:bg-slate-100 shrink-0 cursor-pointer"
          title="Dismiss notification"
        >
          <X :size="14" />
        </button>

        <!-- Progress bar countdown -->
        <div 
          v-if="toast.duration > 0"
          :class="[
            'absolute bottom-0 inset-x-0 h-0.5 opacity-60',
            toast.type === 'success' ? 'bg-emerald-500' :
            toast.type === 'error' ? 'bg-rose-500' :
            toast.type === 'warning' ? 'bg-amber-500' :
            'bg-blue-500'
          ]"
          :style="{
            animation: `shrinkWidth ${toast.duration}ms linear forwards`
          }"
        ></div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast } from '~/composables/useToast'
import { CheckCircle2, AlertOctagon, AlertTriangle, Info, X } from 'lucide-vue-next'

const { toasts, remove } = useToast()
</script>

<style scoped>
@keyframes shrinkWidth {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}
</style>
