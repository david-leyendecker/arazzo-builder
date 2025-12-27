<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    workflowId: string
  }
}

defineProps<Props>()
</script>

<template>
  <div class="workflow-node bg-purple-500 text-white rounded-lg shadow-lg p-4 min-w-[200px]">
    <div class="font-bold text-sm mb-1">Workflow</div>
    <div class="text-xs">{{ data.workflowId }}</div>
    <Handle type="source" :position="Position.Right" id="steps" class="!bg-purple-300" />
  </div>
</template>

<style scoped>
.workflow-node {
  border: 2px solid #7c3aed;
}
</style>
