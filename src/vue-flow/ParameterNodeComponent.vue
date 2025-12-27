<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'

interface Props {
  data: {
    name: string
    in: string
    value: string
  }
}

defineProps<Props>()
</script>

<template>
  <div class="parameter-node bg-yellow-500 text-gray-900 rounded-lg shadow-lg p-3 min-w-[150px]">
    <div class="font-bold text-xs mb-1">Parameter</div>
    <div class="text-xs">{{ data.name || 'unnamed' }}</div>
    <div class="text-xs opacity-70">{{ data.in || 'query' }}</div>
    <Handle type="target" :position="Position.Left" id="step" class="!bg-yellow-300" />
  </div>
</template>

<style scoped>
.parameter-node {
  border: 2px solid #eab308;
}
</style>
