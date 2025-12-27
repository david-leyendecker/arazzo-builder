<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    stepId: string
    operationId: string
  }
}

defineProps<Props>()
</script>

<template>
  <div class="step-node bg-blue-500 text-white rounded-lg shadow-lg p-4 min-w-[180px]">
    <div class="font-bold text-sm mb-1">{{ data.operationId || data.stepId }}</div>
    <div class="text-xs opacity-80">{{ data.stepId }}</div>
    <Handle type="target" :position="Position.Left" id="prev" class="!bg-blue-300" />
    <Handle type="source" :position="Position.Right" id="success" class="!bg-green-400" style="top: 40%" />
    <Handle type="source" :position="Position.Right" id="failure" class="!bg-red-400" style="top: 60%" />
  </div>
</template>

<style scoped>
.step-node {
  border: 2px solid #3b82f6;
}
</style>
