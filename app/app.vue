<!-- app/app.vue -->
<template>
  <div id="app-root">
    <!-- Google Translate Element Mount (Off-screen, properly rendered for DOM hooks) -->
    <div id="google_translate_element" class="skiptranslate" style="position: absolute; left: -9999px; top: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; overflow: hidden;"></div>
    
    <!-- Modern Global Toast / Snack Notification Container -->
    <SharedGlobalToastContainer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <!-- Constant Global Portable AI Assistant (Available across ALL pages: Public & Every Role) -->
    <SharedAiAssistantModal />
  </div>
</template>

<script setup>
import { onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useLanguage } from '~/composables/useLanguage';
import { useToast } from '~/composables/useToast';

const { startDomWatcher, currentLang, translatePageDom } = useLanguage();
const toast = useToast();
const route = useRoute();

// Translate dynamically across route navigations with multi-stage checks
watch(() => route.path, () => {
  if (currentLang.value !== 'en') {
    setTimeout(() => translatePageDom(currentLang.value), 60);
    setTimeout(() => translatePageDom(currentLang.value), 250);
    setTimeout(() => translatePageDom(currentLang.value), 600);
  }
});

onMounted(() => {
  startDomWatcher();

  // Safely intercept native browser alert to modern animated toasts
  if (typeof window !== 'undefined') {
    window.alert = (msg) => {
      const text = String(msg || '');
      const lower = text.toLowerCase();
      if (lower.includes('fail') || lower.includes('error') || lower.includes('altechalem') || lower.includes('አልተቻለም')) {
        toast.error(text, 'Notification');
      } else if (lower.includes('warn') || lower.includes('ebakwo') || lower.includes('እባክዎ') || lower.includes('please')) {
        toast.warning(text, 'Notice');
      } else {
        toast.success(text, 'Success');
      }
    };
  }
});
</script>

<style>
/* Clean up Google Translate default injected elements */
.goog-te-banner-frame.skiptranslate,
.goog-te-banner-frame {
  display: none !important;
}

body {
  top: 0px !important;
  position: static !important;
}

.goog-tooltip,
.goog-tooltip:hover {
  display: none !important;
}

.goog-text-highlight {
  background-color: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

#google_translate_element {
  display: none !important;
}

.VIpgJd-ZVi9od-ORHb-OEVmcd {
  display: none !important;
}

.VIpgJd-ZVi9od-aZ2wEe-wOHMyf {
  display: none !important;
}

.goog-te-gadget {
  display: none !important;
}
</style>
