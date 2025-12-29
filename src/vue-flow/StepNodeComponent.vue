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
      successCriteria: [],
      onSuccess: [],
      onFailure: []
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
  <div class="step-node">
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
    <div class="node-title">{{ data.operationId || data.stepId }}</div>
    <div class="node-subtitle">{{ data.stepId }}</div>
    
    <!-- Inline Parameters -->
    <div v-if="parameters.length > 0" class="node-section">
      <div class="section-label">Parameters:</div>
      <div class="badge-container">
        <div
          v-for="param in visibleParameters"
          :key="param.name"
          class="param-badge"
        >
          {{ param.name }} <span class="param-location">({{ param.in || 'query' }})</span>
        </div>
        <div v-if="hiddenParametersCount > 0" class="param-badge-more">
          +{{ hiddenParametersCount }} more
        </div>
      </div>
    </div>
    
    <!-- Inline Outputs -->
    <div v-if="outputs.length > 0" class="node-section">
      <div class="section-label">Outputs:</div>
      <div class="badge-container">
        <div
          v-for="output in visibleOutputs"
          :key="output"
          class="output-badge"
        >
          {{ output }}
        </div>
        <div v-if="hiddenOutputsCount > 0" class="output-badge-more">
          +{{ hiddenOutputsCount }} more
        </div>
      </div>
    </div>
    
    <!-- Inline Success Criteria -->
    <div v-if="successCriteria.length > 0" class="node-section criteria-section">
      <div class="section-label">Success Criteria:</div>
      <div class="badge-container">
        <div
          v-for="(criteria, index) in visibleCriteria"
          :key="index"
          class="criteria-badge"
          :title="criteria"
        >
          {{ criteria }}
        </div>
        <div v-if="hiddenCriteriaCount > 0" class="criteria-badge-more">
          +{{ hiddenCriteriaCount }} more
        </div>
      </div>
    </div>
    
    <!-- Connection Handles -->
    <Handle type="target" :position="Position.Left" id="prev" class="handle-prev" />
    <Handle type="source" :position="Position.Right" id="success" class="handle-success" style="top: 40%" />
    <Handle type="source" :position="Position.Right" id="failure" class="handle-failure" style="top: 60%" />
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
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border: 2px solid var(--p-primary-color);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 1rem;
  min-width: 220px;
  max-width: 320px;
}

.node-title {
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.node-subtitle {
  font-size: 0.75rem;
  opacity: 0.8;
  margin-bottom: 0.75rem;
}

.node-section {
  margin-bottom: 0.75rem;
}

.criteria-section {
  margin-bottom: 0.5rem;
}

.section-label {
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  opacity: 0.9;
}

.badge-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.param-badge,
.param-badge-more,
.output-badge,
.output-badge-more,
.criteria-badge,
.criteria-badge-more {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

.param-badge {
  background: var(--p-primary-300);
  color: var(--p-primary-contrast-color);
}

.param-location {
  opacity: 0.7;
  margin-left: 0.25rem;
}

.param-badge-more {
  background: var(--p-primary-200);
  color: var(--p-primary-contrast-color);
  font-style: italic;
}

.output-badge {
  background: var(--p-green-300);
  color: var(--p-surface-950);
}

.output-badge-more {
  background: var(--p-green-200);
  color: var(--p-surface-950);
  font-style: italic;
}

.criteria-badge {
  background: var(--p-cyan-300);
  color: var(--p-surface-950);
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.criteria-badge-more {
  background: var(--p-cyan-200);
  color: var(--p-surface-950);
  font-style: italic;
}

.handle-prev {
  background: var(--p-primary-300) !important;
}

.handle-success {
  background: var(--p-green-400) !important;
}

.handle-failure {
  background: var(--p-red-400) !important;
}

.toolbar-buttons {
  display: flex;
  gap: 0.375rem;
}

.toolbar-button {
  background-color: var(--p-surface-0);
  color: var(--p-primary-color);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--p-primary-color);
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.toolbar-button.danger {
  color: var(--p-red-500);
  border-color: var(--p-red-500);
}

.toolbar-button.danger:hover {
  background-color: var(--p-red-500);
  color: var(--p-red-contrast-color);
}

.toolbar-button:hover {
  background-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}
</style>
