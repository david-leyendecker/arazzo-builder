<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    criteria: string
  }
}

defineProps<Props>()
</script>

<template>
  <div class="criteria-node bg-teal-500 text-white rounded-lg shadow-lg p-3 min-w-[150px]">
    <div class="font-bold text-xs mb-1">Success Criteria</div>
    <div class="text-xs">{{ data.criteria || 'No criteria set' }}</div>
    <Handle type="target" :position="Position.Left" id="step" class="!bg-teal-300" />
  </div>
</template>

<style scoped>
.criteria-node {
  border: 2px solid #14b8a6;
}
</style>
