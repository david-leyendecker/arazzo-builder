<script setup lang="ts">
import WorkflowCanvas from './components/workflow/WorkflowCanvas.vue'
import ContextualInspector from './components/inspector/ContextualInspector.vue'
import SourceManager from './components/source-manager/SourceManager.vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
</script>

<template>
    <Splitter class="h-full w-full">
      <!-- Main Canvas Area -->
      <SplitterPanel :size="75" :minSize="50">
        <WorkflowCanvas />
      </SplitterPanel>

      <!-- Right Sidebar -->
      <SplitterPanel :size="25" :minSize="15">
        <div class="sidebar-container">
            <SourceManager />
            <ContextualInspector />
        </div>
      </SplitterPanel>
    </Splitter>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
