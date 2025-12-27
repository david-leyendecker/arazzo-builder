<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const selectedStep = computed(() => workflowStore.selectedStep)
const hasSelection = computed(() => selectedNode.value !== null && selectedNode.value.type === 'step')

const updateOperationId = (event: Event) => {
  const value = (event.target as HTMLInputElement).value
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { operationId: value })
  }
}

const updateDescription = (event: Event) => {
  const value = (event.target as HTMLTextAreaElement).value
  if (selectedNode.value) {
    workflowStore.updateNode(selectedNode.value.id, { description: value })
  }
}
</script>

<template>
  <div class="contextual-inspector p-4">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">Inspector</h2>

    <!-- No Selection State -->
    <div v-if="!hasSelection" class="text-center py-8 text-gray-500">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-sm">Select a node to view details</p>
    </div>

    <!-- Node Details -->
    <div v-else class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Step ID</label>
        <input
          type="text"
          :value="selectedStep?.stepId"
          readonly
          class="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Operation ID</label>
        <input
          type="text"
          :value="selectedStep?.operationId"
          @input="updateOperationId"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., getUserById"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          :value="selectedStep?.description || ''"
          @input="updateDescription"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Describe this step..."
        ></textarea>
      </div>

      <!-- Parameters Section -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">Parameters</label>
          <button class="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
        </div>
        <div class="text-sm text-gray-500 italic">
          No parameters defined
        </div>
      </div>

      <!-- Success Criteria -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">Success Criteria</label>
          <button class="text-sm text-blue-600 hover:text-blue-700">+ Add</button>
        </div>
        <div class="text-sm text-gray-500 italic">
          No criteria defined
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles */
</style>
