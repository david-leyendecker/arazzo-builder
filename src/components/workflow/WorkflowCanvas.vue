<script setup lang="ts">
import { ref, watch, markRaw } from 'vue'
import { VueFlow, useVueFlow, type Node, type Edge, type Connection } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MiniMap } from '@vue-flow/minimap'
import { useWorkflowStore } from '../../stores/workflow'
import WorkflowNodeComponent from '../../vue-flow/WorkflowNodeComponent.vue'
import StepNodeComponent from '../../vue-flow/StepNodeComponent.vue'
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import Card from 'primevue/card'

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
  step: StepNodeComponent
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
    label: node.type,
    deletable: node.type !== 'workflow' // Workflow node cannot be deleted
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
    // Ignore UI-only nodes (start/end)
    if (event.node.id === 'start' || event.node.id === 'end') return
    
    const node = workflowStore.nodes.find(n => n.id === event.node.id)
    if (node) {
      node.position = event.node.position
      workflowStore.saveWorkflowToStorage()
    }
  }
}

// Handle pane click (deselect nodes)
const onPaneClick = () => {
  workflowStore.selectNode(null)
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
</script>

<template>
  <div class="workflow-canvas-wrapper">
    <!-- Header Bar -->
    <Toolbar class="header-toolbar">
      <template #start>
        <h1 class="app-title">Arazzo Workflow Builder</h1>
      </template>
      <template #end>
        <Button 
          @click="handleExportYAML"
          label="Export YAML"
          icon="pi pi-download"
        />
      </template>
    </Toolbar>

    <!-- Vue Flow Canvas -->
    <div class="canvas-container">
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
        <Background :pattern-color="'var(--p-text-muted-color)'" :gap="20" />
        <Controls />
        <MiniMap />
      </VueFlow>
    </div>

    <!-- Help Text -->
    <Card class="help-card">
      <template #title>
        <span class="help-title">Quick Tips</span>
      </template>
      <template #content>
        <ul class="help-list">
          <li>• Add an OpenAPI source to auto-create the workflow node</li>
          <li>• Select nodes to see action toolbar</li>
          <li>• Click and drag to connect nodes</li>
          <li>• Select a node to view details in the inspector</li>
        </ul>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.workflow-canvas-wrapper {
  height: 100%;
  width: 100%;
  position: relative;
}

.header-toolbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.canvas-container {
  position: absolute;
  top: 4rem;
  left: 0;
  right: 0;
  bottom: 0;
}

.help-card {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  z-index: 10;
  width: 22rem;
}

.help-card :deep(.p-card-body) {
  padding: 0.75rem;
}

.help-card :deep(.p-card-content) {
  padding: 0;
}

.help-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.help-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.875rem;
  color: var(--p-text-muted-color);
}

.workflow-canvas {
  background-color: var(--p-surface-900);
  background-size: 20px 20px;
}

/* Vue Flow Controls styling using PrimeVue theme variables */
.workflow-canvas-wrapper :deep(.vue-flow__controls) {
  background-color: var(--p-surface-900) !important;
  border-color: var(--p-surface-200) !important;
}

.workflow-canvas-wrapper :deep(.vue-flow__controls-button) {
  background-color: var(--p-surface-950) !important;
  border-color: var(--p-surface-200) !important;
  color: var(--p-text-color) !important;
}

.workflow-canvas-wrapper :deep(.vue-flow__controls-button):hover {
  background-color: var(--p-surface-100) !important;
}

.workflow-canvas-wrapper :deep(.vue-flow__controls-button svg) {
  fill: var(--p-text-color) !important;
}
</style>
