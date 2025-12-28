<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import { useWorkflowStore } from '../stores/workflow'

interface Props {
  id: string
  data: {
    stepId: string
    operationId: string
  }
}

const props = defineProps<Props>()
const workflowStore = useWorkflowStore()

const addParameter = () => {
  const timestamp = Date.now()
  const id = `parameter-${timestamp}`
  
  // Find parent node position
  const parentNode = workflowStore.nodes.find(n => n.id === props.id)
  const parentPosition = parentNode?.position || { x: 100, y: 100 }
  
  // Calculate child position relative to parent (above)
  const position = {
    x: parentPosition.x + 250,
    y: parentPosition.y - 100
  }
  
  workflowStore.addNode({
    id,
    type: 'parameter',
    data: {
      name: '',
      in: 'query',
      value: ''
    },
    position
  })
}

const addSuccessCriteria = () => {
  const timestamp = Date.now()
  const id = `criteria-${timestamp}`
  
  // Find parent node position
  const parentNode = workflowStore.nodes.find(n => n.id === props.id)
  const parentPosition = parentNode?.position || { x: 100, y: 100 }
  
  // Calculate child position relative to parent (below)
  const position = {
    x: parentPosition.x + 250,
    y: parentPosition.y + 100
  }
  
  workflowStore.addNode({
    id,
    type: 'criteria',
    data: {
      criteria: ''
    },
    position
  })
}

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
}
</script>

<template>
  <div class="step-node bg-blue-500 text-white rounded-lg shadow-lg p-4 min-w-[180px]">
    <NodeToolbar :is-visible="true" :position="Position.Top">
      <div class="toolbar-buttons">
        <button @click="addParameter" class="toolbar-button" title="Add Parameter">
          📝 Parameter
        </button>
        <button @click="addSuccessCriteria" class="toolbar-button" title="Add Success Criteria">
          ✓ Criteria
        </button>
        <button @click="addNextStep" class="toolbar-button" title="Add Next Step">
          ➕ Next Step
        </button>
      </div>
    </NodeToolbar>
    <div class="font-bold text-sm mb-1">{{ data.operationId || data.stepId }}</div>
    <div class="text-xs opacity-80">{{ data.stepId }}</div>
    <Handle type="target" :position="Position.Left" id="prev" class="!bg-blue-300" />
    <Handle type="source" :position="Position.Right" id="success" class="!bg-green-400" style="top: 40%" />
    <Handle type="source" :position="Position.Right" id="failure" class="!bg-red-400" style="top: 60%" />
  </div>
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

.toolbar-button:hover {
  background-color: #3b82f6;
  color: white;
}
</style>
