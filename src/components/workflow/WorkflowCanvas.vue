<script setup lang="ts">
import { ref, watch, markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '../../stores/workflow'
import type { ArazzoStep } from '../../types/arazzo'
import WorkflowNodeComponent from '../../vue-flow/WorkflowNodeComponent.vue'
import StartNodeComponent from '../../vue-flow/StartNodeComponent.vue'
import StepNodeComponent from '../../vue-flow/StepNodeComponent.vue'
import EndNodeComponent from '../../vue-flow/EndNodeComponent.vue'
import ParameterNodeComponent from '../../vue-flow/ParameterNodeComponent.vue'
import SuccessCriteriaNodeComponent from '../../vue-flow/SuccessCriteriaNodeComponent.vue'

// Import Vue Flow styles
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'
import '@vue-flow/minimap/dist/style.css'

const workflowStore = useWorkflowStore()

// Vue Flow composable
const { onConnect } = useVueFlow()

// Node types mapping - use markRaw to prevent Vue reactivity on components
const nodeTypes = markRaw({
  workflow: WorkflowNodeComponent,
  start: StartNodeComponent,
  step: StepNodeComponent,
  end: EndNodeComponent,
  parameter: ParameterNodeComponent,
  criteria: SuccessCriteriaNodeComponent
} as any)

// Use refs for nodes and edges instead of computed
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])

// Sync nodes from store to Vue Flow
watch(() => workflowStore.nodes, (newNodes) => {
  nodes.value = newNodes.map(node => ({
    id: node.id,
    type: node.type,
    position: node.position || { x: 100, y: 100 },
    data: node.data,
    label: node.type
  }))
}, { immediate: true, deep: true })

// Sync edges from store to Vue Flow
watch(() => workflowStore.connections, (newConnections) => {
  edges.value = newConnections.map(conn => ({
    id: conn.id,
    source: conn.source,
    target: conn.target,
    sourceHandle: conn.sourceHandle || 'success',
    targetHandle: conn.targetHandle || 'prev'
  }))
}, { immediate: true, deep: true })

// Handle YAML export
const handleExportYAML = () => {
  try {
    const validation = workflowStore.validateWorkflow()
    
    if (!validation.valid) {
      alert('Workflow validation failed:\n\n' + validation.errors.join('\n'))
      return
    }
    
    const yamlContent = workflowStore.exportToYAML()
    
    const blob = new Blob([yamlContent], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowStore.workflow.info.title.replace(/\s+/g, '-').toLowerCase()}.arazzo.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    alert('YAML file exported successfully!')
  } catch (error) {
    console.error('Export failed:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    alert('Failed to export YAML: ' + errorMessage)
  }
}

// Handle connections between nodes
onConnect((params: Connection) => {
  if (!params.source || !params.target) return
  
  const connectionId = `${params.source}-${params.target}-${Date.now()}`
  
  workflowStore.addConnection({
    id: connectionId,
    source: params.source,
    target: params.target,
    sourceHandle: params.sourceHandle || undefined,
    targetHandle: params.targetHandle || undefined
  })
})

// Handle node selection
const onNodeClick = (event: any) => {
  if (event.node) {
    workflowStore.selectNode(event.node.id)
  }
}

// Handle node drag end to update positions in store
const onNodeDragStop = (event: any) => {
  if (event.node) {
    const node = workflowStore.nodes.find(n => n.id === event.node.id)
    if (node) {
      node.position = event.node.position
    }
  }
}

// Handle pane click (deselect nodes)
const onPaneClick = () => {
  workflowStore.selectNode(null)
}

// Add node at cursor position (for canvas right-click, only workflow now)
const addNodeAtCursor = (nodeType: string) => {
  const timestamp = Date.now()
  const id = `${nodeType}-${timestamp}`
  
  // Position at center of viewport
  const position = { x: 250, y: 150 }
  
  const nodeData = createNodeData(nodeType, id)
  
  workflowStore.addNode({
    id,
    type: nodeType as any,
    data: nodeData,
    position
  })
}

// Create node data based on type
const createNodeData = (nodeType: string, id: string): any => {
  switch (nodeType) {
    case 'workflow':
      return { workflowId: id }
    case 'step':
      return {
        stepId: id,
        operationId: '',
        description: '',
        parameters: [],
        successCriteria: []
      } as ArazzoStep
    case 'parameter':
      return {
        name: '',
        in: 'query',
        value: ''
      }
    case 'criteria':
      return {
        criteria: ''
      }
    default:
      return {}
  }
}

// Watch for OpenAPI spec loading to auto-create workflow node
watch(() => workflowStore.triggerWorkflowNodeCreation, async (newVal, oldVal) => {
  if (newVal && newVal !== oldVal) {
    // Check if workflow node already exists
    const hasWorkflowNode = workflowStore.nodes.some(n => n.type === 'workflow')
    
    if (!hasWorkflowNode) {
      workflowStore.addNode({
        id: 'workflow-root',
        type: 'workflow',
        data: { workflowId: 'main-workflow' },
        position: { x: 100, y: 100 }
      })
    }
  }
})

// Add workflow node button (exposed for UI button)
const addWorkflowNode = () => {
  addNodeAtCursor('workflow')
}
</script>

<template>
  <div class="workflow-canvas-wrapper h-full w-full relative">
    <!-- Header Bar -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800 dark:text-gray-100">Arazzo Workflow Builder</h1>
        <div class="flex gap-2">
          <button 
            @click="handleExportYAML"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Export YAML
          </button>
        </div>
      </div>
    </div>

    <!-- Vue Flow Canvas -->
    <div class="absolute top-16 left-0 right-0 bottom-0">
      <VueFlow
        v-model:nodes="nodes"
        v-model:edges="edges"
        :node-types="nodeTypes"
        @node-click="onNodeClick"
        @pane-click="onPaneClick"
        @node-drag-stop="onNodeDragStop"
        class="workflow-canvas"
        :default-viewport="{ zoom: 1 }"
        :min-zoom="0.2"
        :max-zoom="4"
      >
        <Background pattern-color="#aaa" :gap="20" />
        <Controls />
        <MiniMap />
      </VueFlow>
    </div>

    <!-- Add Workflow Button (since we removed canvas right-click) -->
    <div class="absolute top-20 left-4 z-10">
      <button 
        @click="addWorkflowNode"
        class="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors shadow-lg"
      >
        ➕ Add Workflow
      </button>
    </div>

    <!-- Help Text -->
    <div class="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 text-sm text-gray-600 dark:text-gray-300 z-10">
      <p class="font-medium mb-1">Quick Tips:</p>
      <ul class="space-y-1">
        <li>• Click "Add Workflow" button to create a workflow node</li>
        <li>• Select nodes to see action toolbar</li>
        <li>• Click and drag to connect nodes</li>
        <li>• Select a node to view details in the inspector</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.workflow-canvas {
  background-image: 
    linear-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 0, 0, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Dark mode styles for Vue Flow Controls - using darker slate colors */
:global(.dark) .workflow-canvas-wrapper :deep(.vue-flow__controls) {
  background-color: rgb(15 23 42) !important;
  border-color: rgb(51 65 85) !important;
}

:global(.dark) .workflow-canvas-wrapper :deep(.vue-flow__controls-button) {
  background-color: rgb(15 23 42) !important;
  border-color: rgb(51 65 85) !important;
  color: rgb(229 231 235) !important;
}

:global(.dark) .workflow-canvas-wrapper :deep(.vue-flow__controls-button):hover {
  background-color: rgb(30 41 59) !important;
}

:global(.dark) .workflow-canvas-wrapper :deep(.vue-flow__controls-button svg) {
  fill: rgb(229 231 235) !important;
}

/* Dark mode background pattern */
:global(.dark) .workflow-canvas {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
