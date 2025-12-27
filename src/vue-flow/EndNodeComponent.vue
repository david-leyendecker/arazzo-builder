<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
</script>

<template>
  <div class="end-node bg-red-500 text-white rounded-full shadow-lg p-4 min-w-[100px] text-center">
    <div class="font-bold text-sm">End</div>
    <Handle type="target" :position="Position.Left" id="prev" class="!bg-red-300" />
  </div>
</template>

<style scoped>
.end-node {
  border: 2px solid #ef4444;
}
</style>
