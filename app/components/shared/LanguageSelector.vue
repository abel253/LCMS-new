<template>
  <div class="relative inline-block text-left" ref="dropdownRef">
    <!-- Trigger Button -->
    <button
      type="button"
      @click="isOpen = !isOpen"
      :class="[
        'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer focus:outline-none',
        theme === 'light'
          ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
          : theme === 'mobile'
            ? 'w-full justify-between bg-white text-slate-800 border border-blue-200 py-2 px-3 rounded-lg text-xs'
            : 'bg-white/20 hover:bg-white/30 text-white border border-white/30 hover:border-amber-300 backdrop-blur-xs'
      ]"
      :title="`Current Language: ${currentLanguageOption.name} (${currentLanguageOption.nativeName})`"
    >
      <div class="flex items-center gap-1.5">
        <!-- Crisp Universal SVG Flag -->
        <span class="w-4 h-3 rounded-xs shrink-0 inline-flex items-center justify-center overflow-hidden shadow-2xs">
          <svg v-if="currentLang === 'en'" class="w-full h-full object-cover" viewBox="0 0 60 30">
            <clipPath id="uk-trig"><path d="M0 0v30h60V0z"/></clipPath>
            <path d="M0 0v30h60V0z" fill="#012169"/>
            <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>
            <path d="M0 0l60 30m0-30L0 30" clip-path="url(#uk-trig)" stroke="#C8102E" stroke-width="4"/>
            <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>
            <path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/>
          </svg>
          <svg v-else-if="currentLang === 'so'" class="w-full h-full object-cover" viewBox="0 0 60 30">
            <rect width="60" height="30" fill="#4189DD"/>
            <polygon points="30,7 32.5,13 38.5,13 33.5,16.5 35.5,22.5 30,18.5 24.5,22.5 26.5,16.5 21.5,13 27.5,13" fill="#ffffff"/>
          </svg>
          <svg v-else class="w-full h-full object-cover" viewBox="0 0 60 30">
            <rect width="60" height="10" fill="#078930"/>
            <rect y="10" width="60" height="10" fill="#FCDD09"/>
            <rect y="20" width="60" height="10" fill="#DA121A"/>
            <circle cx="30" cy="15" r="7" fill="#0F47AF"/>
            <polygon points="30,9 32,13 36.5,13 33,16 34.5,20.5 30,17.5 25.5,20.5 27,16 23.5,13 28,13" fill="#FCDD09"/>
          </svg>
        </span>
        <span class="font-bold tracking-wide">{{ currentLanguageOption.nativeName }}</span>
      </div>

      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        :class="['h-3 w-3 transition-transform duration-200 opacity-80', isOpen ? 'rotate-180' : '']" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu matching Screenshot 2 -->
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-1"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-1"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute z-50 mt-1.5 w-60 rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 py-1 text-slate-800 focus:outline-none divide-y divide-slate-100 border border-slate-100',
          dropUp ? 'bottom-full mb-1.5 right-0' : 'right-0 origin-top-right'
        ]"
      >
        <!-- Header matching Screenshot 2 -->
        <div class="px-3.5 py-2 text-slate-400 text-[10px] font-semibold tracking-wide">
          Ethiopian Languages & English
        </div>

        <!-- Language Items List -->
        <div class="py-1">
          <button
            v-for="lang in languages"
            :key="lang.code"
            type="button"
            @click="handleSelect(lang.code)"
            :class="[
              'w-full flex items-center justify-between px-3.5 py-2 text-xs transition-colors text-left cursor-pointer hover:bg-blue-50',
              currentLang === lang.code ? 'bg-blue-50/80 text-[#006ea6] font-bold' : 'text-slate-700'
            ]"
          >
            <div class="flex items-center gap-2.5">
              <!-- Always-Consistent SVG Flag -->
              <span class="w-5 h-3.5 rounded-xs shrink-0 inline-flex items-center justify-center overflow-hidden shadow-2xs border border-slate-200/60">
                <svg v-if="lang.code === 'en'" class="w-full h-full object-cover" viewBox="0 0 60 30">
                  <clipPath :id="`uk-${lang.code}`"><path d="M0 0v30h60V0z"/></clipPath>
                  <path d="M0 0v30h60V0z" fill="#012169"/>
                  <path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/>
                  <path d="M0 0l60 30m0-30L0 30" :clip-path="`url(#uk-${lang.code})`" stroke="#C8102E" stroke-width="4"/>
                  <path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/>
                  <path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/>
                </svg>
                <svg v-else-if="lang.code === 'so'" class="w-full h-full object-cover" viewBox="0 0 60 30">
                  <rect width="60" height="30" fill="#4189DD"/>
                  <polygon points="30,7 32.5,13 38.5,13 33.5,16.5 35.5,22.5 30,18.5 24.5,22.5 26.5,16.5 21.5,13 27.5,13" fill="#ffffff"/>
                </svg>
                <svg v-else class="w-full h-full object-cover" viewBox="0 0 60 30">
                  <rect width="60" height="10" fill="#078930"/>
                  <rect y="10" width="60" height="10" fill="#FCDD09"/>
                  <rect y="20" width="60" height="10" fill="#DA121A"/>
                  <circle cx="30" cy="15" r="7" fill="#0F47AF"/>
                  <polygon points="30,9 32,13 36.5,13 33,16 34.5,20.5 30,17.5 25.5,20.5 27,16 23.5,13 28,13" fill="#FCDD09"/>
                </svg>
              </span>

              <div>
                <span class="block font-bold text-xs">{{ lang.nativeName }}</span>
                <span class="block text-[10px] text-slate-400">{{ lang.name }} • {{ lang.region }}</span>
              </div>
            </div>

            <!-- Active Checkmark Indicator matching Screenshot 2 -->
            <span v-if="currentLang === lang.code" class="text-emerald-600 font-bold flex items-center text-xs">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </span>
          </button>
        </div>

        <!-- Footer Note matching Screenshot 2 -->
        <div class="px-3 py-1.5 bg-slate-50/80 text-[10px] text-slate-500 flex items-center gap-1.5 rounded-b-2xl">
          <span class="text-amber-500 font-bold">✨</span>
          <span>Instant automatic full page translation</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useLanguage } from '~/composables/useLanguage';
import { useToast } from '~/composables/useToast';

const props = defineProps({
  theme: {
    type: String,
    default: 'dark' // 'dark' | 'light' | 'mobile'
  },
  dropUp: {
    type: Boolean,
    default: false
  }
});

const { languages, currentLang, currentLanguageOption, setLanguage } = useLanguage();
const toast = useToast();
const isOpen = ref(false);
const dropdownRef = ref(null);

const languageFeedback = {
  en: {
    title: 'Language Updated',
    message: 'Display language set to English (Default)'
  },
  am: {
    title: 'ቋንቋ ተመርጧል',
    message: 'የስርዓቱ ቋንቋ ወደ አማርኛ ተቀይሯል'
  },
  om: {
    title: 'Afaan Jijjiirameera',
    message: 'Afaan sirnichaa gara Afaan Oromootti jijjiirameera'
  },
  ti: {
    title: 'ቋንቋ ተቐይሩ',
    message: 'ናይዚ ስርዓት ቋንቋ ናብ ትግርኛ ብትክክል ተቐይሩ'
  },
  so: {
    title: 'Luqadda waa la beddelay',
    message: 'Luqadda nidaamka waxaa loo beddelay Soomaali'
  }
};

const handleSelect = (code) => {
  setLanguage(code);
  isOpen.value = false;
  const feedback = languageFeedback[code] || languageFeedback.en;
  toast.success(feedback.message, feedback.title);
};

const handleClickOutside = (e) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>
