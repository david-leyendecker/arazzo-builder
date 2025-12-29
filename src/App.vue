<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
import ThemeToggle from './components/common/ThemeToggle.vue'
</script>

<template>
  <div class="app-container">
    <!-- Header Toolbar -->
    <div class="app-header">
      <div class="app-title">
        <h1>Arazzo Builder</h1>
      </div>
      <div class="app-controls">
        <ThemeToggle />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="app-main">
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
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100vw;
  background: var(--p-surface-0);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  min-height: 3.5rem;
}

.app-title h1 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.app-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
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
