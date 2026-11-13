<template>
  <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileText :size="24" class="text-teal-600" /> Student Research & Proposals
        </h2>
        <p class="text-xs text-slate-500">Manage student capstone proposals, theses, and faculty research papers.</p>
      </div>

      <button 
        @click="$emit('add-proposal')"
        class="px-4 py-2.5 rounded-xl bg-[#06387d] hover:bg-[#0b4db0] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all self-start sm:self-auto"
      >
        <Plus :size="16" /> Add New Proposal
      </button>
    </div>

    <!-- Filter Pills & Search -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100">
      <div class="flex flex-wrap items-center gap-2">
        <button 
          v-for="t in ['All', 'Proposal', 'Thesis', 'Research']" :key="t"
          @click="typeFilter = t"
          :class="typeFilter === t ? 'bg-[#06387d] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {{ t }}
        </button>
      </div>

      <div class="relative w-full md:w-72">
        <Search :size="16" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by topic, author, college..."
          class="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-blue-600 focus:bg-white"
        />
      </div>
    </div>

    <!-- Proposals Table -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase text-slate-400 font-black">
            <th class="py-3 px-4">Research Topic & Author</th>
            <th class="py-3 px-4">College & Department</th>
            <th class="py-3 px-4">Document Type</th>
            <th class="py-3 px-4">Year</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in filteredList" :key="item.id || item.dbId" class="hover:bg-slate-50 transition-colors">
            <td class="py-3.5 px-4">
              <p class="font-bold text-slate-900 leading-snug">{{ item.title }}</p>
              <p class="text-xs text-slate-500">{{ item.author || item.authorName }}</p>
            </td>
            <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">
              <p>{{ item.college || 'College of Informatics' }}</p>
              <p class="text-[10px] text-slate-400 font-normal">{{ item.department || 'Software Engineering' }}</p>
            </td>
            <td class="py-3.5 px-4 whitespace-nowrap">
              <span 
                :class="item.documentType === 'Thesis' ? 'bg-blue-100 text-blue-800' : (item.documentType === 'Proposal' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')"
                class="px-2.5 py-1 rounded-full text-xs font-extrabold"
              >
                {{ item.documentType || 'Proposal' }}
              </span>
            </td>
            <td class="py-3.5 px-4 font-mono text-xs text-slate-600">{{ item.year || 2026 }}</td>
            <td class="py-3.5 px-4 text-right whitespace-nowrap">
              <div class="flex items-center justify-end gap-1">
                <!-- 1. VIEW FULL DOCUMENT BUTTON -->
                <button 
                  type="button"
                  @click="openViewModal(item)"
                  class="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
                  title="View Full Document Details"
                >
                  <Eye :size="16" />
                </button>

                <!-- 2. EDIT PROPOSAL BUTTON -->
                <button 
                  type="button"
                  @click="$emit('edit-proposal', item)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                  title="Edit Proposal"
                >
                  <Pencil :size="16" />
                </button>

                <!-- 3. DELETE PROPOSAL BUTTON -->
                <button 
                  type="button"
                  @click="$emit('delete-proposal', item.id || item.dbId)"
                  class="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Delete Proposal"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="filteredList.length === 0">
            <td colspan="5" class="py-12 text-center text-slate-400 text-xs">
              No research or proposals found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ================= FULL DOCUMENT INSPECTION MODAL ================= -->
    <div v-if="isViewModalOpen && selectedItem" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-start justify-between border-b border-slate-100 pb-3 gap-3">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span 
                :class="selectedItem.documentType === 'Thesis' ? 'bg-blue-100 text-blue-800' : (selectedItem.documentType === 'Proposal' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800')"
                class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
              >
                {{ selectedItem.documentType || 'Proposal' }}
              </span>
              <span class="text-xs text-slate-400 font-mono">ID: #{{ selectedItem.id || selectedItem.dbId }}</span>
            </div>
            <h3 class="font-black text-slate-900 text-base sm:text-lg leading-snug">
              {{ selectedItem.title }}
            </h3>
          </div>
          <button @click="isViewModalOpen = false" class="text-slate-400 hover:text-slate-700 font-bold p-1 cursor-pointer">✕</button>
        </div>

        <!-- Academic & Author Metadata Grid -->
        <div class="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Author / Researcher</span>
            <p class="font-bold text-slate-900 mt-0.5">{{ selectedItem.author || selectedItem.authorName || 'Student Researcher' }}</p>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Academic Year</span>
            <p class="font-bold text-slate-900 font-mono mt-0.5">{{ selectedItem.year || 2026 }} G.C</p>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase block">College</span>
            <p class="font-bold text-slate-800 mt-0.5">{{ selectedItem.college || 'College of Informatics' }}</p>
          </div>
          <div>
            <span class="text-[10px] font-bold text-slate-400 uppercase block">Department</span>
            <p class="font-bold text-slate-800 mt-0.5">{{ selectedItem.department || 'Software Engineering' }}</p>
          </div>
        </div>

        <!-- Abstract / Description -->
        <div class="space-y-1.5">
          <h4 class="text-xs font-bold uppercase text-slate-700 tracking-wider">
            Abstract & Synopsis
          </h4>
          <div class="p-4 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs leading-relaxed text-slate-700 max-h-48 overflow-y-auto">
            <p v-if="selectedItem.abstract || selectedItem.synopsis || selectedItem.description">
              {{ selectedItem.abstract || selectedItem.synopsis || selectedItem.description }}
            </p>
            <p v-else class="text-slate-400 italic">
              Official research manuscript registered in the Mekdela Amba University Institutional Repository. Full document available in the library stacks.
            </p>
          </div>
        </div>

        <!-- Attached Document File Card -->
        <div class="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
              PDF
            </div>
            <div>
              <p class="font-bold text-slate-900">{{ selectedItem.fileName || `${selectedItem.title.replace(/\s+/g, '_').substring(0, 30)}.pdf` }}</p>
              <p class="text-[10px] text-slate-500 font-mono">Full Research Manuscript • Academic Record</p>
            </div>
          </div>
          <button 
            type="button"
            @click="downloadDocument(selectedItem)"
            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download :size="13" />
            <span>Download</span>
          </button>
        </div>

        <!-- Modal Footer Actions -->
        <div class="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <div class="flex items-center gap-2">
            <button
              type="button"
              @click="$emit('edit-proposal', selectedItem); isViewModalOpen = false"
              class="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Pencil :size="13" />
              <span>Edit Proposal</span>
            </button>
            <button
              type="button"
              @click="$emit('delete-proposal', selectedItem.id || selectedItem.dbId); isViewModalOpen = false"
              class="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 :size="13" />
              <span>Delete</span>
            </button>
          </div>

          <button
            type="button"
            @click="isViewModalOpen = false"
            class="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { FileText, Plus, Search, Pencil, Trash2, Eye, Download } from 'lucide-vue-next'

const props = defineProps<{
  proposals: any[]
}>()

const emit = defineEmits<{
  (e: 'add-proposal'): void
  (e: 'edit-proposal', item: any): void
  (e: 'delete-proposal', id: number | string): void
}>()

const typeFilter = ref('All')
const searchQuery = ref('')
const isViewModalOpen = ref(false)
const selectedItem = ref<any>(null)

const openViewModal = (item: any) => {
  selectedItem.value = item
  isViewModalOpen.value = true
}

const downloadDocument = (item: any) => {
  const content = `Mekdela Amba University\nInstitutional Repository\n\nTitle: ${item.title}\nAuthor: ${item.author || item.authorName}\nCollege: ${item.college}\nDepartment: ${item.department}\nType: ${item.documentType}\nYear: ${item.year}\n\nAbstract:\n${item.abstract || item.synopsis || item.description || 'Full academic text archived in Mekdela Amba University Central Library.'}`
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(item.title || 'research').replace(/\s+/g, '_')}_document.txt`
  a.click()
  URL.revokeObjectURL(url)
}

const filteredList = computed(() => {
  let list = props.proposals || []
  if (typeFilter.value !== 'All') {
    list = list.filter(p => (p.documentType || 'Proposal') === typeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p => 
      p.title?.toLowerCase().includes(q) ||
      (p.author || p.authorName)?.toLowerCase().includes(q) ||
      p.college?.toLowerCase().includes(q) ||
      p.department?.toLowerCase().includes(q)
    )
  }
  return list
})
</script>
