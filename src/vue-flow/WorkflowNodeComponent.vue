<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useWorkflowStore } from '../stores/workflow'

interface Props {
  id: string
  selected?: boolean
  data: {
    workflowId: string
  }
}

const props = defineProps<Props>()
const workflowStore = useWorkflowStore()
const mw = computed(() => workflowStore.mainWorkflow!)

const addStep = () => {
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

  // Visually connect workflow root to the new step
  workflowStore.addConnection({
    id: `conn-${props.id}-${id}-${timestamp}`,
    source: props.id,
    target: id,
    sourceHandle: 'steps',
    targetHandle: 'prev'
  })
}
</script>

<template>
  <div class="workflow-node">
    <NodeToolbar :is-visible="selected" :position="Position.Top">
      <button @click="addStep" class="toolbar-button">
        ➕ Add Step
      </button>
    </NodeToolbar>
    <div class="node-title">Workflow</div>
    <div class="node-subtitle">{{ data.workflowId }}</div>
    <div v-if="mw" class="node-info">
      <div v-if="mw.summary">{{ mw.summary }}</div>
      <div class="node-stats">
        <span>Steps: {{ mw.steps.length }}</span>
        <span v-if="mw.dependsOn && mw.dependsOn.length > 0">Deps: {{ mw.dependsOn.length }}</span>
      </div>
    </div>
    <Handle type="source" :position="Position.Right" id="steps" class="handle-steps" />
  </div>
</template>

<style scoped>
.workflow-node {
  background: var(--p-violet-500);
  color: var(--p-violet-contrast-color);
  border: 2px solid var(--p-violet-500);
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  padding: 1rem;
  min-width: 200px;
}

.node-title {
  font-weight: 700;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.node-subtitle {
  font-size: 0.75rem;
}

.node-info {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  opacity: 0.9;
}

.node-stats {
  margin-top: 0.25rem;
  display: flex;
  gap: 0.5rem;
}

.handle-steps {
  background: var(--p-violet-300) !important;
}

.toolbar-button {
  background-color: var(--p-surface-0);
  color: var(--p-violet-500);
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--p-violet-500);
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background-color: var(--p-violet-500);
  color: var(--p-violet-contrast-color);
}
</style>
