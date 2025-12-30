<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'

defineProps<{
  items: string[]
  placeholder?: string
}>()

defineEmits<{
  'update:item': [index: number, value: string]
  remove: [index: number]
}>()
</script>

<template>
  <div class="items-list">
    <div v-for="(item, index) in items" :key="index" class="criteria-item">
      <InputText
        :value="item"
        @input="(e) => $emit('update:item', index, (e.target as HTMLInputElement).value)"
        :placeholder="placeholder || 'Value'"
        size="small"
        class="flex-1-input"
      />
      <Button
        @click="$emit('remove', index)"
        icon="pi pi-times"
        text
        rounded
        severity="danger"
        size="small"
        title="Remove"
      />
    </div>
  </div>
</template>

<style scoped>
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.criteria-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.flex-1-input {
  flex: 1;
}
</style>
