<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useWorkflowStore } from '../stores/workflow'
import type { ArazzoStep } from '../types/arazzo'
import ConfirmModal from '../components/common/ConfirmModal.vue'

interface Props {
  id: string
  selected?: boolean
  data: ArazzoStep
}

const props = defineProps<Props>()
const workflowStore = useWorkflowStore()

// Computed properties for inline display
const parameters = computed(() => props.data.parameters || [])
const outputs = computed(() => props.data.outputs ? Object.keys(props.data.outputs) : [])
const successCriteria = computed(() => props.data.successCriteria || [])

// Constants for truncation
const MAX_VISIBLE_ITEMS = 3

const visibleParameters = computed(() => parameters.value.slice(0, MAX_VISIBLE_ITEMS))
const hiddenParametersCount = computed(() => Math.max(0, parameters.value.length - MAX_VISIBLE_ITEMS))

const visibleOutputs = computed(() => outputs.value.slice(0, MAX_VISIBLE_ITEMS))
const hiddenOutputsCount = computed(() => Math.max(0, outputs.value.length - MAX_VISIBLE_ITEMS))

const visibleCriteria = computed(() => successCriteria.value.slice(0, MAX_VISIBLE_ITEMS))
const hiddenCriteriaCount = computed(() => Math.max(0, successCriteria.value.length - MAX_VISIBLE_ITEMS))

const showDeleteConfirm = ref(false)

const addNextStep = () => {
  const timestamp = Date.now()
  const id = `step-${timestamp}`
  
  // Find parent node position
  const parentNode = workflowStore.nodes.find(n => n.id === props.id)
  const parentPosition = parentNode?.position || { x: 100, y: 100 }
  
  // Calculate child position relative to parent
  const position = {
    x: parentPosition.x + 250,
    y: parentPosition.y
  }
  
  workflowStore.addNode({
    id,
    type: 'step',
    data: {
      stepId: id,
      operationId: '',
      description: '',
      parameters: [],
      successCriteria: []
    },
    position
  })

  // Connect current step to the newly created step to preserve visual and logical order
  workflowStore.addConnection({
    id: `conn-${props.id}-${id}-${timestamp}`,
    source: props.id,
    target: id,
    sourceHandle: 'success',
    targetHandle: 'prev'
  })
}

const deleteStep = () => {
  showDeleteConfirm.value = true
}

const confirmDeletion = () => {
  workflowStore.removeStepWithReconnect(props.id)
}
</script>

<template>
  <div class="step-node bg-blue-500 text-white rounded-lg shadow-lg p-4 min-w-[220px] max-w-[320px]">
    <NodeToolbar :is-visible="selected" :position="Position.Top">
      <div class="toolbar-buttons">
        <button @click="addNextStep" class="toolbar-button" title="Add Next Step">
          ➕ Next Step
        </button>
        <button @click="deleteStep" class="toolbar-button danger" title="Delete Step">
          ✖ Delete
        </button>
      </div>
    </NodeToolbar>
    
    <!-- Step Header -->
    <div class="font-bold text-sm mb-1">{{ data.operationId || data.stepId }}</div>
    <div class="text-xs opacity-80 mb-3">{{ data.stepId }}</div>
    
    <!-- Inline Parameters -->
    <div v-if="parameters.length > 0" class="mb-3">
      <div class="text-xs font-semibold mb-1 opacity-90">Parameters:</div>
      <div class="space-y-1">
        <div
          v-for="param in visibleParameters"
          :key="param.name"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-400 bg-opacity-60 mr-1 mb-1"
        >
          {{ param.name }} <span class="opacity-70 ml-1">({{ param.in || 'query' }})</span>
        </div>
        <div v-if="hiddenParametersCount > 0" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-400 bg-opacity-40 italic">
          +{{ hiddenParametersCount }} more
        </div>
      </div>
    </div>
    
    <!-- Inline Outputs -->
    <div v-if="outputs.length > 0" class="mb-3">
      <div class="text-xs font-semibold mb-1 opacity-90">Outputs:</div>
      <div class="space-y-1">
        <div
          v-for="output in visibleOutputs"
          :key="output"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-400 bg-opacity-60 mr-1 mb-1"
        >
          {{ output }}
        </div>
        <div v-if="hiddenOutputsCount > 0" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-400 bg-opacity-40 italic">
          +{{ hiddenOutputsCount }} more
        </div>
      </div>
    </div>
    
    <!-- Inline Success Criteria -->
    <div v-if="successCriteria.length > 0" class="mb-2">
      <div class="text-xs font-semibold mb-1 opacity-90">Success Criteria:</div>
      <div class="space-y-1">
        <div
          v-for="(criteria, index) in visibleCriteria"
          :key="index"
          class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-teal-400 bg-opacity-60 mr-1 mb-1 max-w-full truncate"
          :title="criteria"
        >
          {{ criteria }}
        </div>
        <div v-if="hiddenCriteriaCount > 0" class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-teal-400 bg-opacity-40 italic">
          +{{ hiddenCriteriaCount }} more
        </div>
      </div>
    </div>
    
    <!-- Connection Handles -->
    <Handle type="target" :position="Position.Left" id="prev" class="!bg-blue-300" />
    <Handle type="source" :position="Position.Right" id="success" class="!bg-green-400" style="top: 40%" />
    <Handle type="source" :position="Position.Right" id="failure" class="!bg-red-400" style="top: 60%" />
  </div>

  <ConfirmModal
    v-model:open="showDeleteConfirm"
    title="Delete step?"
    message="This will remove the step and reconnect surrounding steps."
    confirm-text="Delete"
    cancel-text="Cancel"
    :destructive="true"
    @confirm="confirmDeletion"
  />
</template>

<style scoped>
.step-node {
  border: 2px solid #3b82f6;
}

.toolbar-buttons {
  display: flex;
  gap: 0.375rem;
}

.toolbar-button {
  background-color: white;
  color: #3b82f6;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #3b82f6;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-button.danger {
  color: #ef4444;
  border-color: #ef4444;
}

.toolbar-button.danger:hover {
  background-color: #ef4444;
  color: white;
}

.toolbar-button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
