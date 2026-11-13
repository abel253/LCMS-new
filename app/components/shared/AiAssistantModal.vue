<!-- app/components/shared/AiAssistantModal.vue -->
<template>
  <div class="fixed z-[9999] pointer-events-none select-none font-sans" :style="rootStyle">
    
    <!-- ═════════════════════════════════════════════════════════ -->
    <!-- 1. DRAGGABLE FLOATING TRIGGER BUTTON (PORTABLE LAUNCHER) -->
    <!-- ═════════════════════════════════════════════════════════ -->
    <div
      v-if="!isOpen"
      ref="triggerRef"
      @mousedown="startDrag"
      @touchstart="startDrag"
      @click="handleTriggerClick"
      class="pointer-events-auto cursor-grab active:cursor-grabbing group relative transition-transform duration-150 hover:scale-105"
      :style="positionStyle"
      title="MAU Library Chatbot (Drag to move)"
    >
      <!-- Pulsing Aura Glow -->
      <span class="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-[#004b87] opacity-75 blur-sm group-hover:opacity-100 transition animate-pulse"></span>

      <!-- Main Pill / Orb Button -->
      <button
        type="button"
        class="relative flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#004b87] hover:bg-[#003b6b] text-white shadow-2xl border-2 border-white/90 backdrop-blur-md focus:outline-none transition cursor-pointer"
      >
        <!-- Chatbot Icon with Sparkle -->
        <div class="relative w-8 h-8 rounded-full bg-white p-1 flex items-center justify-center shrink-0 shadow-md">
          <svg class="w-5 h-5 text-[#004b87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            <path d="m9 10 1.5 1.5L14 8" stroke="#f59e0b" stroke-width="2.5"></path>
          </svg>
          <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white"></span>
        </div>

        <div class="text-left hidden sm:block">
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-black tracking-wide text-white">Chatbot</span>
            <span class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 uppercase">AI</span>
          </div>
          <span class="block text-[10px] text-sky-100 font-medium">MAU Library Assistant</span>
        </div>

        <!-- Draggable Grip Dots -->
        <div class="flex flex-col gap-0.5 opacity-50 group-hover:opacity-100 pl-1 text-[8px] text-white/80 cursor-grab">
          <span>⋮</span>
        </div>
      </button>
    </div>

    <!-- ═════════════════════════════════════════════════════════ -->
    <!-- 2. EXPANDED CHATBOT WINDOW (PERFECTLY VIEWPORT-CONSTRAINED) -->
    <!-- ═════════════════════════════════════════════════════════ -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 translate-y-3"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 translate-y-3"
    >
      <div
        v-if="isOpen"
        ref="chatWindowRef"
        class="pointer-events-auto flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-300/80 overflow-hidden transition-all duration-150"
        :class="[
          isFullscreen 
            ? 'fixed inset-2 sm:inset-5 z-[10000] rounded-2xl' 
            : 'w-[95vw] sm:w-[420px] max-w-[430px]'
        ]"
        :style="isFullscreen ? {} : chatWindowComputedStyle"
      >
        <!-- ── 1. HEADER (ALWAYS VISIBLE, NEVER CUT OFF) ── -->
        <div
          @mousedown="startWindowDrag"
          @touchstart="startWindowDrag"
          class="sticky top-0 z-30 px-3.5 py-2.5 bg-[#004b87] text-white flex items-center justify-between cursor-move select-none shadow-md shrink-0"
        >
          <!-- Left: Sparkle Icon + Title + Subtitle -->
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0">
              <svg class="w-full h-full text-[#004b87]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M9 10h.01M15 10h.01M12 10h.01" stroke="#004b87" stroke-width="3"></path>
              </svg>
            </div>
            
            <div>
              <h3 class="text-sm font-black tracking-tight text-white leading-tight">Chatbot</h3>
              <p class="text-[10px] text-sky-200 font-medium leading-tight">MAU Library AI Assistant</p>
            </div>
          </div>

          <!-- Right: Controls (Language, Restart, Fullscreen, Close X) -->
          <div class="flex items-center gap-1.5">
            <!-- Language Switcher Pill -->
            <div class="relative" ref="langDropdownRef">
              <button
                type="button"
                @click="showLangMenu = !showLangMenu"
                :title="'Change Language • ' + activeLanguageLabel"
                class="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <span>{{ activeLanguageCodeBadge }}</span>
                <span class="text-[8px] opacity-75">▼</span>
              </button>

              <!-- Language Menu Popup -->
              <div
                v-if="showLangMenu"
                class="absolute right-0 top-full mt-1.5 w-36 rounded-xl bg-white shadow-2xl border border-slate-200 py-1 text-slate-800 z-50 text-xs"
              >
                <button
                  v-for="l in languageOptions"
                  :key="l.code"
                  type="button"
                  @click="changeLanguage(l.code)"
                  :class="[
                    'w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-sky-50 transition cursor-pointer',
                    currentLang === l.code ? 'font-bold text-[#004b87] bg-sky-50/80' : 'text-slate-700'
                  ]"
                >
                  <span>{{ l.nativeName }}</span>
                  <span class="text-[10px] text-slate-400 uppercase">{{ l.code }}</span>
                </button>
              </div>
            </div>

            <!-- Restart / Reset Chat -->
            <button
              type="button"
              @click="resetChat"
              title="Restart Conversation"
              class="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center text-sm transition cursor-pointer"
            >
              ↻
            </button>

            <!-- Fullscreen / Window Toggle -->
            <button
              type="button"
              @click="isFullscreen = !isFullscreen"
              :title="isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'"
              class="hidden sm:flex w-7 h-7 rounded-lg hover:bg-white/20 text-white items-center justify-center text-xs transition cursor-pointer"
            >
              <span v-if="isFullscreen">🗗</span>
              <span v-else>⤢</span>
            </button>

            <!-- Close / Minimize (X Button - ALWAYS VISIBLE!) -->
            <button
              type="button"
              @click="closeChat"
              title="Close Chatbot"
              class="w-7 h-7 rounded-lg bg-white/15 hover:bg-rose-600 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- ── 2. COLLAPSIBLE FAQS SECTION (CLEAN & COMPACT) ── -->
        <div v-if="showFaqs" class="border-b border-slate-200 bg-white transition-all shrink-0">
          <div class="px-3.5 pt-2 pb-1 flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#004b87]">
              <span class="w-1 h-3 bg-[#004b87] rounded-full inline-block"></span>
              <span>FAQS</span>
            </div>
            <button
              type="button"
              @click="showFaqs = false"
              class="text-[10px] font-bold text-[#004b87] hover:underline cursor-pointer"
            >
              {{ activeLabels.hideFaqs }}
            </button>
          </div>

          <!-- FAQ Accordion List (Scrollable if needed) -->
          <div class="divide-y divide-slate-100 max-h-36 sm:max-h-40 overflow-y-auto chat-scroll">
            <div v-for="(faq, fIndex) in faqList" :key="fIndex" class="group">
              <button
                type="button"
                @click="toggleFaq(fIndex)"
                class="w-full text-left px-3.5 py-1.5 flex items-center justify-between hover:bg-slate-50 transition cursor-pointer"
              >
                <span class="text-[11px] font-semibold text-slate-800 pr-2 group-hover:text-[#004b87] line-clamp-1">
                  {{ faq.question }}
                </span>
                <span class="text-slate-400 group-hover:text-[#004b87] text-[10px] transition-transform duration-200" :class="expandedFaq === fIndex ? 'rotate-180' : ''">
                  ⌵
                </span>
              </button>

              <!-- Expanded Answer -->
              <div v-if="expandedFaq === fIndex" class="px-3.5 pb-2.5 pt-1 text-[11px] text-slate-600 bg-slate-50/70 border-t border-slate-100/60 leading-relaxed space-y-1.5">
                <p>{{ faq.answer }}</p>
                <button
                  type="button"
                  @click="sendPrompt(faq.question)"
                  class="inline-flex items-center gap-1 text-[10px] font-bold text-[#004b87] hover:underline cursor-pointer"
                >
                  <span>{{ activeLabels.askInChat }}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- ── 3. CHAT MESSAGES BODY (FULLY SCROLLABLE & ALWAYS CLEAR) ── -->
        <div 
          ref="messagesContainerRef" 
          class="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs text-slate-800 scroll-smooth bg-white min-h-0 chat-scroll"
        >
          <template v-for="(msg, idx) in messages" :key="idx">
            <!-- User Message Bubble -->
            <div v-if="msg.role === 'user'" class="flex justify-end pl-8">
              <div class="bg-[#0072b2] text-white px-3.5 py-2 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed max-w-[85%] break-words">
                {{ msg.content }}
              </div>
            </div>

            <!-- Assistant Message Bubble (Exact Look as Reference) -->
            <div v-else class="flex gap-2.5 pr-3 group items-start">
              <!-- Left Chat Avatar -->
              <div class="w-7 h-7 rounded-full border border-purple-200 bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                <svg class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  <path d="m9 10 1.5 1.5L14 8" stroke="#f59e0b" stroke-width="2.5"></path>
                </svg>
              </div>

              <!-- Message Bubble Card -->
              <div class="flex-1 max-w-[90%] space-y-1">
                <div class="bg-[#f0f4f9] hover:bg-[#ebf1f8] transition-colors border border-slate-200/70 text-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs text-xs leading-relaxed space-y-2">
                  <div class="prose prose-xs max-w-none break-words" v-html="renderMarkdown(msg.content)"></div>

                  <!-- Bottom Actions: Speaker & Copy -->
                  <div class="flex items-center justify-end gap-2.5 pt-1 border-t border-slate-200/50 text-slate-500">
                    <button
                      type="button"
                      @click="speakText(msg.content)"
                      class="hover:text-[#004b87] transition cursor-pointer p-0.5"
                      :title="isSpeaking ? 'Stop Audio' : 'Listen Aloud'"
                    >
                      <span v-if="isSpeaking" class="text-xs">⏹</span>
                      <span v-else class="text-xs">🔊</span>
                    </button>

                    <button
                      type="button"
                      @click="copyText(msg.content)"
                      class="hover:text-[#004b87] transition cursor-pointer p-0.5"
                      title="Copy message"
                    >
                      <span class="text-xs">⎘</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Thinking Loading Indicator -->
          <div v-if="isLoading" class="flex gap-2.5 pr-4 items-start">
            <div class="w-7 h-7 rounded-full border border-purple-200 bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 shadow-2xs">
              <svg class="w-4 h-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <div class="bg-[#f0f4f9] border border-slate-200/70 px-3.5 py-2 rounded-2xl rounded-tl-xs text-xs text-slate-600 flex items-center gap-2">
              <span class="flex gap-1 items-center">
                <span class="w-1.5 h-1.5 rounded-full bg-[#004b87] animate-bounce"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#004b87] animate-bounce [animation-delay:0.2s]"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-[#004b87] animate-bounce [animation-delay:0.4s]"></span>
              </span>
              <span class="text-[11px] font-medium">{{ activeLabels.thinking }}</span>
            </div>
          </div>
        </div>

        <!-- ── 4. FOOTER INPUT BAR (ALWAYS VISIBLE & STICKY AT BOTTOM) ── -->
        <div class="sticky bottom-0 z-30 p-2.5 sm:p-3 bg-white border-t border-slate-200 shrink-0 space-y-1.5">
          <!-- Input Form -->
          <form @submit.prevent="handleSubmit" class="flex items-center gap-2">
            <div class="relative flex-1">
              <input
                ref="inputRef"
                v-model="inputQuery"
                type="text"
                :disabled="isLoading"
                :placeholder="activeLabels.placeholder"
                class="w-full pl-3.5 pr-8 py-2 bg-slate-50 hover:bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#004b87] focus:bg-white transition shadow-2xs disabled:opacity-50"
              />
              <button
                v-if="inputQuery"
                type="button"
                @click="inputQuery = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <!-- Send Button -->
            <button
              type="submit"
              :disabled="!inputQuery.trim() || isLoading"
              class="w-9 h-9 rounded-xl bg-[#7da5c9] hover:bg-[#004b87] disabled:opacity-40 text-white flex items-center justify-center shadow-xs transition transform active:scale-95 cursor-pointer shrink-0"
              title="Send Message"
            >
              <svg class="h-4 w-4 transform rotate-45 -translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>

          <!-- Centered Toggle Link: "Show FAQs" / "Hide FAQs" -->
          <div class="text-center pt-0.5">
            <button
              type="button"
              @click="showFaqs = !showFaqs"
              class="text-[11px] font-bold text-[#004b87] hover:underline cursor-pointer"
            >
              {{ showFaqs ? activeLabels.hideFaqs : activeLabels.showFaqs }}
            </button>
          </div>
        </div>

      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRoute } from 'vue-router';
import { useLanguage, ETHIOPIAN_LANGUAGES } from '~/composables/useLanguage';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const { currentLang, setLanguage } = useLanguage();

// State
const isOpen = ref(false);
const isFullscreen = ref(false);
const isLoading = ref(false);
const inputQuery = ref('');
const showFaqs = ref(false); // Default compact FAQs so chat is front and center
const expandedFaq = ref<number | null>(null);
const showLangMenu = ref(false);
const isSpeaking = ref(false);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: string;
}

const messages = ref<Message[]>([]);

// Draggable Position State (Portable Feature)
const position = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });
const currentPos = ref({ x: 0, y: 0 });

const messagesContainerRef = ref<HTMLDivElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);
const langDropdownRef = ref<HTMLDivElement | null>(null);

const languageOptions = ETHIOPIAN_LANGUAGES;

// Language badge in header
const activeLanguageCodeBadge = computed(() => {
  if (currentLang.value === 'am') return 'አማ';
  if (currentLang.value === 'om') return 'OM';
  if (currentLang.value === 'ti') return 'ትግ';
  if (currentLang.value === 'so') return 'SO';
  return 'EN';
});

const activeLanguageLabel = computed(() => {
  const found = languageOptions.find(l => l.code === currentLang.value);
  return found ? found.nativeName : 'English';
});

// Multilingual labels for Chatbot UI
const activeLabels = computed(() => {
  if (currentLang.value === 'am') {
    return {
      placeholder: 'መልዕክትዎን እዚህ ይጻፉ...',
      hideFaqs: 'ጥያቄዎችን ደብቅ (Hide FAQs)',
      showFaqs: 'የተለመዱ ጥያቄዎችን አሳይ (Show FAQs)',
      askInChat: 'ይህን ጥያቄ በውይይቱ ጠይቅ',
      thinking: 'AI መልስ በማዘጋጀት ላይ ነው...',
      initialGreeting: 'ጤና ይስጥልኝ! እንኳን ወደ መቅደላ አምባ ዩኒቨርሲቲ ላይብረሪ AI ረዳት መጡ። ዛሬ እንዴት ልርዳዎት?',
    };
  }
  if (currentLang.value === 'om') {
    return {
      placeholder: 'Ergaa keessan asitti barreessaa...',
      hideFaqs: 'Gaaffiiwwan Dhoksi (Hide FAQs)',
      showFaqs: 'Gaaffiiwwan Agarsiisi (Show FAQs)',
      askInChat: 'Gaaffii kana gaafadhu',
      thinking: 'AI yaada qopheessaa jira...',
      initialGreeting: 'Akkam jirtu! Baga gara Gargaaraa AI Mana Kitaabaa Yuunivarsiitii Maqdalaa Ambaatti nagaan dhuftan. Akkamitti sin gargaaru?',
    };
  }
  if (currentLang.value === 'ti') {
    return {
      placeholder: 'መልእኽትኹም ኣብዚ ጸሓፉ...',
      hideFaqs: 'ሕቶታት ሕባእ (Hide FAQs)',
      showFaqs: 'ሕቶታት ኣርኢ (Show FAQs)',
      askInChat: 'እዚ ሕቶ ሕተት',
      thinking: 'AI ምላሽ የዳልው ኣሎ...',
      initialGreeting: 'ሰላም! እንቋዕ ናብ መቕደላ ኣምባ ዩኒቨርሲቲ ቤተ-መጻሕፍቲ AI ሓጋዚ ብደሓን መጻእኹም። ከመይ ገይረ ክሕግዘኩም?',
    };
  }
  if (currentLang.value === 'so') {
    return {
      placeholder: 'Halkan ku qor farriintaada...',
      hideFaqs: 'Qari Su\'aalaha (Hide FAQs)',
      showFaqs: 'Muuji Su\'aalaha (Show FAQs)',
      askInChat: 'Weydii su\'aashan',
      thinking: 'AI wuxuu diyaarinayaa jawaabta...',
      initialGreeting: 'Hello! Ku soo dhowow Kaaliyaha AI ee Maktabadda Jaamacadda Mekdela Amba. Sideen kuu caawin karaa maanta?',
    };
  }
  return {
    placeholder: 'Type a message...',
    hideFaqs: 'Hide FAQs',
    showFaqs: 'Show FAQs',
    askInChat: 'Ask this in chat',
    thinking: 'AI is thinking...',
    initialGreeting: 'Hello! How can I assist you today?',
  };
});

// FAQs list matching Reference
const faqList = computed(() => {
  if (currentLang.value === 'am') {
    return [
      {
        question: 'የመጻሕፍት ብድርና የመደርደሪያ ህጎች (Open Shelf vs Closed Stack)',
        answer: 'ክፍት መደርደሪያ (Open Shelf) በቀጥታ ከመደርደሪያው አንስተው ማንበብ ወይም በተማሪ መታወቂያዎ ወደ ስርጭት ጠረጴዛው በመውሰድ ለ14 ቀናት መዋስ ይችላሉ። ዝግ ማከማቻ (Closed Stack) በቅድሚያ ዲጂታል ጥያቄ ማስገባት ይጠይቃል።'
      },
      {
        question: 'የቅጣት ክፍያ በኢትዮጵያ ንግድ ባንክ (CBE Fine Settlement)',
        answer: 'የማርፈጃ ቅጣት በቀን 5 ብር ነው። በCBE አካውንት "Mekdela Amba University Library Revenue" ቁጥር 1000345678912 ከፍለው Ref ቁጥሩንና ደረሰኙን በተዋስኳቸው መጻሕፍት (My Borrows) ገጽ ላይ ይጫኑ።'
      },
      {
        question: 'የተማሪዎች ዲጂታል ክሊራንስ አሰራር (Digital Clearance)',
        answer: 'ሁሉንም የተዋሷቸውን መጻሕፍት መልሰው ያረፈደ ቅጣት ካለ በCBE ከፍለው ሲያጠናቅቁ በፖርታልዎ ላይ ክሊራንሱ በቀጥታ ይጸድቃል።'
      },
      {
        question: 'የላይብረሪ የስራ ሰዓትና የፈረቃ ፕሮግራም (Operating Hours)',
        answer: 'ከሰኞ-አርብ ከጠዋቱ 2:00 እስከ ማታ 4:00 (8:00 AM - 10:00 PM)፣ ቅዳሜ 2:30-12:00፣ እሁድ 3:00-11:00 ክፍት ነው። በፈተና ወቅት 24/7 ክፍት ይሆናል።'
      },
      {
        question: 'የምርምር ማህደርና ቴሲስ ማስገቢያ (Research Repository)',
        answer: 'የምርምርና ጥናት ገጽ (Research Portal) በመግባት የኮሌጅዎን የምርምር ወረቀቶች ማውረድ ወይም የራስዎን ቴሲስና ፕሮፖዛል ለግምገማ መጫን ይችላሉ።'
      }
    ];
  }
  return [
    {
      question: 'Book Borrowing & Rules (Open Shelf vs Closed Stack)',
      answer: 'Open Shelf books are directly accessible for reading or 14-day student checkout at the circulation desk. Closed Stack books require digital request or librarian authorization.'
    },
    {
      question: 'CBE Penalty Settlement & Overdue Fines',
      answer: 'Overdue fine is 5 ETB/day. Pay to CBE Account "Mekdela Amba University Library Revenue" (1000345678912) and upload your slip with Ref number under My Borrows.'
    },
    {
      question: 'Student Digital Clearance & Graduation',
      answer: 'Return all library books and clear fines to receive automatic clearance approval on your Student Portal.'
    },
    {
      question: 'Library Operating Hours & Shift Duty',
      answer: 'Mon-Fri: 8:00 AM - 10:00 PM. Saturday: 8:30 AM - 6:00 PM. Sunday: 9:00 AM - 5:00 PM. Exam periods: 24/7 extended study.'
    },
    {
      question: 'Research Repository & Proposal Archive',
      answer: 'Access faculty papers and senior theses, or upload your own research proposals at the Research Portal.'
    }
  ];
});

// Fixed Viewport Positioning: Always keeps the entire window (including the header & close button) fully visible
const rootStyle = computed(() => ({
  bottom: '16px',
  right: '16px',
}));

const positionStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
}));

// Strictly constrained height to guarantee header & close button are NEVER pushed off-screen
const chatWindowComputedStyle = computed(() => ({
  transform: `translate(${position.value.x}px, ${position.value.y}px)`,
  height: 'min(500px, calc(100vh - 32px))',
  maxHeight: 'calc(100vh - 32px)',
}));

const startDrag = (e: MouseEvent | TouchEvent) => {
  isDragging.value = false;
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  dragStart.value = { x: clientX, y: clientY };
  currentPos.value = { ...position.value };

  const onMove = (moveEvt: MouseEvent | TouchEvent) => {
    const moveX = 'touches' in moveEvt ? moveEvt.touches[0].clientX : moveEvt.clientX;
    const moveY = 'touches' in moveEvt ? moveEvt.touches[0].clientY : moveEvt.clientY;
    const dx = moveX - dragStart.value.x;
    const dy = moveY - dragStart.value.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      isDragging.value = true;
      // Clamp vertical dragging so the header can NEVER be dragged above the viewport!
      const newY = currentPos.value.y + dy;
      const clampedY = Math.min(newY, 150); // don't push below bottom
      position.value = {
        x: currentPos.value.x + dx,
        y: Math.max(clampedY, -(window.innerHeight - 530)), // never push header above top!
      };
    }
  };

  const onEnd = () => {
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onEnd);
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);
  };

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);
  window.addEventListener('touchmove', onMove);
  window.addEventListener('touchend', onEnd);
};

const startWindowDrag = (e: MouseEvent | TouchEvent) => {
  if (isFullscreen.value) return;
  startDrag(e);
};

const handleTriggerClick = () => {
  if (isDragging.value) return;
  isOpen.value = true;
  // Reset vertical offset if it was dragged off
  if (position.value.y < 0) {
    position.value.y = 0;
  }
  if (messages.value.length === 0) {
    initInitialGreeting();
  }
  nextTick(() => {
    inputRef.value?.focus();
    scrollToBottom();
  });
};

const closeChat = () => {
  isOpen.value = false;
  isFullscreen.value = false;
};

const toggleFaq = (index: number) => {
  expandedFaq.value = expandedFaq.value === index ? null : index;
};

const changeLanguage = (code: string) => {
  setLanguage(code);
  showLangMenu.value = false;
  if (messages.value.length <= 1) {
    initInitialGreeting();
  }
};

const resetChat = () => {
  messages.value = [];
  initInitialGreeting();
};

const initInitialGreeting = () => {
  messages.value = [
    {
      role: 'assistant',
      content: activeLabels.value.initialGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainerRef.value) {
      messagesContainerRef.value.scrollTop = messagesContainerRef.value.scrollHeight;
    }
  });
};

// Text to Speech
const speakText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (isSpeaking.value) {
    window.speechSynthesis.cancel();
    isSpeaking.value = false;
    return;
  }

  const clean = text.replace(/[*_#`[\]()]/g, '');
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = currentLang.value === 'am' ? 'am-ET' : 'en-US';
  utterance.onend = () => { isSpeaking.value = false; };
  utterance.onerror = () => { isSpeaking.value = false; };
  isSpeaking.value = true;
  window.speechSynthesis.speak(utterance);
};

// Copy Text
const copyText = (text: string) => {
  if (typeof navigator !== 'undefined') {
    navigator.clipboard.writeText(text);
  }
};

// Markdown Parser
const renderMarkdown = (text: string): string => {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-[#004b87]">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded-md bg-slate-200/80 font-mono text-[11px] text-[#004b87]">$1</code>')
    .replace(/^• (.*$)/gim, '<div class="flex items-start gap-1.5 my-1"><span class="text-[#004b87] font-bold">•</span><span>$1</span></div>')
    .replace(/^- (.*$)/gim, '<div class="flex items-start gap-1.5 my-1"><span class="text-[#004b87] font-bold">•</span><span>$1</span></div>')
    .replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-1.5 my-1"><span class="font-bold text-[#004b87]">$1.</span><span>$2</span></div>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="inline-flex items-center gap-0.5 font-bold text-[#0072b2] hover:underline">$1 ↗</a>')
    .replace(/\n\n/g, '<div class="h-2"></div>')
    .replace(/\n/g, '<br />');
};

const sendPrompt = (text: string) => {
  inputQuery.value = text;
  handleSubmit();
};

const handleSubmit = async () => {
  const query = inputQuery.value.trim();
  if (!query || isLoading.value) return;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  messages.value.push({
    role: 'user',
    content: query,
    time: timeStr,
  });

  inputQuery.value = '';
  isLoading.value = true;
  scrollToBottom();

  try {
    const payload = {
      messages: messages.value.map(m => ({ role: m.role, content: m.content })),
      language: currentLang.value,
      currentRoute: route.path,
      userRole: authStore.user?.userType || (authStore.isAdmin ? 'Admin' : authStore.isLibrarian ? 'Librarian' : 'Guest'),
    };

    const res: any = await $fetch('/api/ai/chat', {
      method: 'POST',
      body: payload,
    });

    if (res && res.reply) {
      messages.value.push({
        role: 'assistant',
        content: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  } catch (err: any) {
    messages.value.push({
      role: 'assistant',
      content: currentLang.value === 'am'
        ? 'ይቅርታ፣ ጥያቄዎን ለማስተናገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።'
        : 'Sorry, I could not complete your request. Please try again.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};

onMounted(() => {
  initInitialGreeting();

  document.addEventListener('click', (e) => {
    if (langDropdownRef.value && !langDropdownRef.value.contains(e.target as Node)) {
      showLangMenu.value = false;
    }
  });
});
</script>

<style scoped>
/* Sleek custom scrollbars */
.chat-scroll::-webkit-scrollbar {
  width: 5px;
}
.chat-scroll::-webkit-scrollbar-track {
  background: #f8fafc;
}
.chat-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
.chat-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
