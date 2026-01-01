<script setup lang="ts">
import { useWorkflowStore } from './stores/workflow'
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import Toolbar from 'primevue/toolbar'
import Button from 'primevue/button'
import { BUTTON_CLASSES } from './components/common/ui-classes'

const workflowStore = useWorkflowStore()

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
</script>

<template>
  <div class="h-full w-full flex flex-column">
    <!-- Header Toolbar -->
    <Toolbar class="app-toolbar border-round-0 border-left-none border-right-none border-top-none">
      <template #start>
        <h1 class="text-xl font-semibold m-0">Arazzo Workflow Builder</h1>
      </template>
      <template #end>
        <div class="flex flex-row gap-4">
          <SourceManager />
          <Button 
          v-bind="BUTTON_CLASSES.exportAction"
          @click="handleExportYAML"
          label="Export YAML"
        />
        </div>
      </template>
    </Toolbar>

    <!-- Main Content Area -->
    <Splitter class="flex-1">
      <!-- Main Canvas Area -->
      <SplitterPanel :size="70" :minSize="50">
        <WorkflowCanvas />
      </SplitterPanel>

      <!-- Right Sidebar -->
      <SplitterPanel :size="30" :minSize="20">
        <div class="flex flex-column h-full overflow-hidden">
          <ContextualInspector />
        </div>
      </SplitterPanel>
    </Splitter>
  </div>
</template>
