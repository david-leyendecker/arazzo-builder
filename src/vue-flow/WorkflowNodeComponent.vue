<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useWorkflowStore } from '../stores/workflow'

interface Props {
  id: string
  data: {
    workflowId: string
  }
}

const props = defineProps<Props>()
const workflowStore = useWorkflowStore()

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
      successCriteria: []
    },
    position
  })
}
</script>

<template>
  <div class="workflow-node bg-purple-500 text-white rounded-lg shadow-lg p-4 min-w-[200px]">
    <NodeToolbar :is-visible="true" :position="Position.Top">
      <button @click="addStep" class="toolbar-button">
        ➕ Add Step
      </button>
    </NodeToolbar>
    <div class="font-bold text-sm mb-1">Workflow</div>
    <div class="text-xs">{{ data.workflowId }}</div>
    <Handle type="source" :position="Position.Right" id="steps" class="!bg-purple-300" />
  </div>
</template>

<style scoped>
.workflow-node {
  border: 2px solid #7c3aed;
}

.toolbar-button {
  background-color: white;
  color: #7c3aed;
  padding: 0.375rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid #7c3aed;
  cursor: pointer;
  transition: all 0.2s;
}

.toolbar-button:hover {
  background-color: #7c3aed;
  color: white;
}
</style>
