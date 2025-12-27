<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <div class="start-node bg-green-500 text-white rounded-full shadow-lg p-4 min-w-[100px] text-center">
    <div class="font-bold text-sm">Start</div>
    <Handle type="source" :position="Position.Right" id="next" class="!bg-green-300" />
  </div>
</template>

<style scoped>
.start-node {
  border: 2px solid #22c55e;
}
</style>
