<script setup lang="ts">
import { computed } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import Button from 'primevue/button'
import { useWorkflowStore } from '../stores/workflow'
import { BUTTON_CLASSES } from '../components/common/ui-classes'

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
      <Button 
        @click="addStep" 
        v-bind="BUTTON_CLASSES.addButton"
        label="Add Step"
      />
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
@import './node-styles.css';

.workflow-node {
  background: var(--p-violet-500);
  color: var(--p-violet-contrast-color);
  border: 2px solid var(--p-violet-500);
  min-width: 200px;
}

/* Workflow-specific: remove bottom margin from subtitle */
.workflow-node .node-subtitle {
  margin-bottom: 0;
}

.node-stats {
  margin-top: 0.25rem;
  display: flex;
  gap: 0.5rem;
}
</style>
