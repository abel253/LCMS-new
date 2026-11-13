<!-- app/pages/[...slug].vue - Graceful Catch-All Route -->
<script setup lang="ts">
import { onMounted } from 'vue'

const route = useRoute()
const path = computed(() => route.path)

// Smart redirection based on attempted path
onMounted(() => {
  const p = route.path.toLowerCase()
  if (p.includes('news') || p.includes('academic') || p.includes('service')) {
    navigateTo('/about', { replace: true })
  } else if (p.includes('admission') || p.includes('register') || p.includes('join')) {
    navigateTo('/auth', { replace: true })
  } else if (p.includes('book') || p.includes('catalog') || p.includes('item') || p.includes('library')) {
    navigateTo('/search', { replace: true })
  } else {
    navigateTo('/', { replace: true })
  }
})
</script>

<template>
  <div class="min-h-[50vh] flex items-center justify-center p-6 text-center">
    <div class="space-y-3">
      <div class="w-8 h-8 mx-auto border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p class="text-xs text-slate-500 font-medium">Redirecting to page...</p>
    </div>
  </div>
</template>
