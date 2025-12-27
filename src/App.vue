<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
import ThemeToggle from './components/theme/ThemeToggle.vue'
</script>

<template>
  <div class="flex h-screen w-screen bg-gray-50 dark:bg-slate-950">
    <!-- Main Canvas Area -->
    <div class="flex-1 relative">
      <!-- Theme Toggle - positioned at top-right -->
      <div class="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      <WorkflowCanvas />
    </div>

    <!-- Right Sidebar -->
    <div class="w-80 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-700 flex flex-col">
      <!-- Source Manager Section -->
      <div class="border-b border-gray-200 dark:border-slate-700">
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
