<script setup lang="ts">
import { ref, computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'

const workflowStore = useWorkflowStore()

const sources = computed(() => workflowStore.sourceDescriptions)
const showAddForm = ref(false)
const newSource = ref({
  name: '',
  url: '',
  type: 'openapi' as 'openapi' | 'arazzo'
})

const addSource = () => {
  if (newSource.value.name && newSource.value.url) {
    workflowStore.addSourceDescription({
      name: newSource.value.name,
      url: newSource.value.url,
      type: newSource.value.type
    })
    newSource.value = { name: '', url: '', type: 'openapi' }
    showAddForm.value = false
  }
}

const removeSource = (name: string) => {
  workflowStore.removeSourceDescription(name)
}

const cancelAdd = () => {
  newSource.value = { name: '', url: '', type: 'openapi' }
  showAddForm.value = false
}
</script>

<template>
  <div class="source-manager p-4">
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-lg font-semibold text-gray-800">OpenAPI Sources</h2>
      <button
        @click="showAddForm = true"
        v-if="!showAddForm"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        + Add
      </button>
    </div>

    <!-- Add Source Form -->
    <div v-if="showAddForm" class="mb-3 p-3 bg-gray-50 rounded-md border border-gray-200">
      <div class="space-y-2">
        <div>
          <input
            v-model="newSource.name"
            type="text"
            placeholder="Source name"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            v-model="newSource.url"
            type="text"
            placeholder="URL or path"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <select
            v-model="newSource.type"
            class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="openapi">OpenAPI</option>
            <option value="arazzo">Arazzo</option>
          </select>
        </div>
        <div class="flex gap-2">
          <button
            @click="addSource"
            class="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
          <button
            @click="cancelAdd"
            class="flex-1 px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Sources List -->
    <div v-if="sources.length === 0 && !showAddForm" class="text-sm text-gray-500 text-center py-4">
      No sources added yet
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="source in sources"
        :key="source.name"
        class="p-3 bg-white border border-gray-200 rounded-md hover:border-blue-300 transition-colors"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm text-gray-800 truncate">{{ source.name }}</span>
              <span class="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{{ source.type }}</span>
            </div>
            <p class="text-xs text-gray-500 truncate mt-1">{{ source.url }}</p>
          </div>
          <button
            @click="removeSource(source.name)"
            class="ml-2 text-gray-400 hover:text-red-500"
            title="Remove source"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
