<script setup lang="ts">
import Button from 'primevue/button'

defineProps<{
  label: string
}>()

defineEmits<{
  add: []
}>()
</script>

<template>
  <div class="section-header">
    <label class="section-label">{{ label }}</label>
    <Button @click="$emit('add')" label="Add" icon="pi pi-plus" text size="small" />
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--p-text-color);
}
</style>
