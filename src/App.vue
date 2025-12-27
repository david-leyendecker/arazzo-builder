<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
</script>

<template>
  <div class="flex h-screen w-screen bg-gray-50">
    <!-- Main Canvas Area -->
    <div class="flex-1 relative">
      <WorkflowCanvas />
    </div>

    <!-- Right Sidebar -->
    <div class="w-80 bg-white border-l border-gray-200 flex flex-col">
      <!-- Source Manager Section -->
      <div class="border-b border-gray-200">
        <SourceManager />
      </div>

      <!-- Contextual Inspector Section -->
      <div class="flex-1 overflow-auto">
        <ContextualInspector />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Component-specific styles if needed */
</style>
