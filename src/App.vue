<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
import ThemeToggle from './components/theme/ThemeToggle.vue'
</script>

<template>
  <div class="app-container">
    <!-- Main Canvas Area -->
    <div class="canvas-area">
      <!-- Theme Toggle - positioned at top-right -->
      <div class="theme-toggle-wrapper">
        <ThemeToggle />
      </div>
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
  background: var(--bg-secondary);
}

.canvas-area {
  flex: 1;
  position: relative;
}

.theme-toggle-wrapper {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 10;
}

.sidebar {
  width: 20rem;
  background: var(--bg-primary);
  border-left: 1px solid var(--border-primary);
  display: flex;
  flex-direction: column;
}

.sidebar-section {
  border-bottom: 1px solid var(--border-primary);
}

.inspector-section {
  flex: 1;
  overflow: auto;
}
</style>
