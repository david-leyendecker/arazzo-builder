<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
</script>

<template>
  <div class="app-container">
    <!-- Main Canvas Area -->
    <div class="canvas-area">
      <WorkflowCanvas />
    </div>

    <!-- Right Sidebar -->
    <div class="sidebar">
      <!-- Source Manager Section -->
      <div class="sidebar-section">
        <SourceManager />
      </div>

      <!-- Contextual Inspector Section -->
      <div class="inspector-section">
        <ContextualInspector />
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background: var(--p-surface-0);
}

.canvas-area {
  flex: 1;
  position: relative;
  background: var(--p-surface-0);
}

.sidebar {
  width: 20rem;
  background: var(--p-surface-0);
  border-left: 1px solid var(--p-surface-200);
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  border-bottom: 1px solid var(--p-surface-200);
}

.inspector-section {
  flex: 1;
  overflow: auto;
}
</style>
