<script setup lang="ts">
import { computed } from 'vue'
import { useWorkflowStore } from '../../stores/workflow'

// PrimeVue Components
import Badge from 'primevue/badge'
import Message from 'primevue/message'
import Card from 'primevue/card'

// Child Components
import WorkflowNodeInspector from './WorkflowNodeInspector.vue'
import StepNodeInspector from './StepNodeInspector.vue'

// Centralized Classes
import { INSPECTOR_CLASSES, MESSAGE_SEVERITY, TEXT_CLASSES } from './inspector-classes'

const workflowStore = useWorkflowStore()

const selectedNode = computed(() => workflowStore.selectedNode)
const hasSelection = computed(() => selectedNode.value !== null)
const isStepNode = computed(() => selectedNode.value?.type === 'step')
const isWorkflowNode = computed(() => selectedNode.value?.type === 'workflow')

// Validation
const validationResult = computed(() => workflowStore.validateWorkflow())
const validationErrors = computed(() => validationResult.value.errors)
</script>

<template>
  <div :class="INSPECTOR_CLASSES.root">
    <!-- Header -->
    <div :class="INSPECTOR_CLASSES.header">
      <h2 :class="INSPECTOR_CLASSES.title">Inspector</h2>
    </div>

    <!-- Validation Errors -->
    <Message v-if="validationErrors.length > 0" :severity="MESSAGE_SEVERITY.error" :closable="false">
      <div :class="INSPECTOR_CLASSES.fieldGroup">
        <strong>Validation Issues:</strong>
        <ul :class="`m-0 ${INSPECTOR_CLASSES.pl4}`">
          <li v-for="(err, idx) in validationErrors" :key="idx" :class="TEXT_CLASSES.small">{{ err }}</li>
        </ul>
      </div>
    </Message>

    <!-- No Selection State -->
    <Card v-if="!hasSelection" class="text-center">
      <template #content>
        <div :class="INSPECTOR_CLASSES.emptyStateContainer">
          <i :class="INSPECTOR_CLASSES.emptyStateIcon"></i>
          <p :class="INSPECTOR_CLASSES.emptyStateText">Select a node to view and edit its properties</p>
        </div>
      </template>
    </Card>

    <!-- Node Content -->
    <template v-else>
      <!-- Workflow Node Inspector -->
      <WorkflowNodeInspector
        v-if="isWorkflowNode && selectedNode"
        :node-id="selectedNode.id"
        :workflow-id="(selectedNode.data as { workflowId: string }).workflowId"
      />
      <!-- Step Node Inspector -->
      <StepNodeInspector
        v-else-if="isStepNode && selectedNode"
        :node-id="selectedNode.id"
      />
    </template>
  </div>
</template>

<style scoped>
/* No custom styles needed - uses centralized classes from inspector-classes.ts */
</style>
