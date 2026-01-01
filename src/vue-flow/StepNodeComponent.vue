<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import Button from 'primevue/button'
import { useWorkflowStore } from '../stores/workflow'
import type { ArazzoStep } from '../types/arazzo'
import ConfirmModal from '../components/common/ConfirmModal.vue'
import { BUTTON_CLASSES } from '../components/common/ui-classes'

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
        <Button 
          @click="addNextStep" 
          v-bind="BUTTON_CLASSES.addButton"
          label="Next Step"
        />
        <Button 
          @click="deleteStep" 
          v-bind="BUTTON_CLASSES.deleteButton"
          label="Delete"
        />
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
@import './node-styles.css';

.step-node {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border: 2px solid var(--p-primary-color);
  min-width: 220px;
  max-width: 320px;
}

/* Step-specific override: reduce bottom margin on criteria section */
.criteria-section {
  margin-bottom: 0.5rem;
}
</style>
