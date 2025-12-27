<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useEditorStore } from '../../stores/editor'
import { createEditor, addNode, StartNode, EndNode } from '../../rete/editor'

const editorStore = useEditorStore()
const canvasContainer = ref<HTMLElement | null>(null)
let editorInstance: any = null

onMounted(async () => {
  if (canvasContainer.value) {
    try {
      // Initialize the Rete.js editor
      editorInstance = await createEditor(canvasContainer.value)
      editorStore.setEditor(editorInstance.editor)

      // Add initial Start and End nodes
      await addNode(
        editorInstance.editor,
        editorInstance.area,
        new StartNode('start-1'),
        { x: 100, y: 200 }
      )

      await addNode(
        editorInstance.editor,
        editorInstance.area,
        new EndNode('end-1'),
        { x: 600, y: 200 }
      )

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
          <button class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
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
