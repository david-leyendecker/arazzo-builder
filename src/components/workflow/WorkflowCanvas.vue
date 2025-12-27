<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../stores/editor'
import { useWorkflowStore } from '../../stores/workflow'
import { createEditor, addNode, StartNode, StepNode, EndNode } from '../../rete/editor'
import type { ArazzoStep } from '../../types/arazzo'

const editorStore = useEditorStore()
const workflowStore = useWorkflowStore()
const canvasContainer = ref<HTMLElement | null>(null)
let editorInstance: any = null

const handleExportYAML = () => {
  try {
    const validation = workflowStore.validateWorkflow()
    
    if (!validation.valid) {
      // Show validation errors
      const errorMessage = 'Workflow validation failed:\n\n' + validation.errors.join('\n')
      alert(errorMessage)
      return
    }
    
    const yamlContent = workflowStore.exportToYAML()
    
    // Download the YAML file
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

onMounted(async () => {
  if (canvasContainer.value) {
    try {
      // Initialize the Rete.js editor
      editorInstance = await createEditor(canvasContainer.value)
      editorStore.setEditor(editorInstance.editor)

      // Listen for node additions
      editorInstance.editor.addPipe((context: any) => {
        if (context.type === 'nodeadded') {
          const node = context.data
          const nodeType = node instanceof StartNode ? 'start' 
                         : node instanceof StepNode ? 'step' 
                         : 'end'
          
          const workflowNode = {
            id: node.id,
            type: nodeType as 'start' | 'step' | 'end',
            data: nodeType === 'step' 
              ? {
                  stepId: (node as StepNode).stepId,
                  operationId: (node as StepNode).operationId || '',
                  description: '',
                  parameters: [],
                  successCriteria: []
                } as ArazzoStep
              : {}
          }
          
          workflowStore.addNode(workflowNode)
        }
        
        if (context.type === 'noderemoved') {
          const node = context.data
          workflowStore.removeNode(node.id)
        }
        
        if (context.type === 'connectionadded') {
          const conn = context.data
          const sourceKey = conn.sourceOutput
          const targetKey = conn.targetInput
          
          workflowStore.addConnection({
            id: conn.id,
            source: conn.source,
            target: conn.target,
            sourceHandle: sourceKey,
            targetHandle: targetKey
          })
        }
        
        if (context.type === 'connectionremoved') {
          const conn = context.data
          workflowStore.removeConnection(conn.id)
        }
        
        return context
      })

      // Listen for node selection
      editorInstance.area.addPipe((context: any) => {
        if (context.type === 'nodepicked') {
          const nodeId = context.data.id
          workflowStore.selectNode(nodeId)
        }
        return context
      })

      // Add initial Start and End nodes
      const startNode = new StartNode('start-1')
      await addNode(
        editorInstance.editor,
        editorInstance.area,
        startNode,
        { x: 100, y: 200 }
      )
      
      // Manually add start node to workflow store
      workflowStore.addNode({
        id: 'start-1',
        type: 'start',
        data: {}
      })

      const endNode = new EndNode('end-1')
      await addNode(
        editorInstance.editor,
        editorInstance.area,
        endNode,
        { x: 600, y: 200 }
      )
      
      // Manually add end node to workflow store
      workflowStore.addNode({
        id: 'end-1',
        type: 'end',
        data: {}
      })

      // Fit the view to show all nodes
      await editorInstance.area.area.zoom(1)
    } catch (error) {
      console.error('Failed to initialize editor:', error)
    }
  }
})

onBeforeUnmount(() => {
  if (editorInstance) {
    editorInstance.destroy()
    editorStore.clearEditor()
  }
})
</script>

<template>
  <div class="workflow-canvas-wrapper h-full w-full relative">
    <!-- Header Bar -->
    <div class="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
      <div class="flex items-center justify-between">
        <h1 class="text-xl font-semibold text-gray-800">Arazzo Workflow Builder</h1>
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

    <!-- Canvas Container -->
    <div ref="canvasContainer" class="workflow-canvas absolute top-16 left-0 right-0 bottom-0 bg-gray-50"></div>

    <!-- Help Text -->
    <div class="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg shadow-lg px-4 py-3 text-sm text-gray-600">
      <p class="font-medium mb-1">Quick Tips:</p>
      <ul class="space-y-1">
        <li>• Right-click on canvas to add nodes</li>
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
</style>
