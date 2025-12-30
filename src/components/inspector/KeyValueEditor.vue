<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { floatLabelConfig } from '../../config/float-label.config'

const props = defineProps<{
  items: Record<string, any>
  keyPlaceholder?: string
  valuePlaceholder?: string
}>()

const emit = defineEmits<{
  'update:key': [oldKey: string, newKey: string]
  'update:value': [key: string, value: any]
  remove: [key: string]
}>()

const entries = computed(() => Object.entries(props.items))
</script>

<template>
  <div class="items-list">
    <div v-for="[key, value] in entries" :key="key" class="output-item">
      <div class="output-row">
        <FloatLabel :variant="floatLabelConfig.variant" class="flex-1">
          <InputText
            :id="'key-' + key"
            :value="key"
            @blur="(e) => $emit('update:key', key, (e.target as HTMLInputElement).value)"
            size="small"
            class="w-full"
          />
          <label :for="'key-' + key">{{ keyPlaceholder || 'Key' }}</label>
        </FloatLabel>
        <Button
          @click="$emit('remove', key)"
          icon="pi pi-times"
          text
          rounded
          severity="danger"
          size="small"
          title="Remove"
        />
      </div>
      <FloatLabel :variant="floatLabelConfig.variant">
        <InputText
          :id="'value-' + key"
          :value="value"
          @input="(e) => $emit('update:value', key, (e.target as HTMLInputElement).value)"
          size="small"
          class="w-full"
        />
        <label :for="'value-' + key">{{ valuePlaceholder || 'Value' }}</label>
      </FloatLabel>
    </div>
  </div>
</template>

<style scoped>
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.output-item {
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 0.375rem;
  border: 1px solid var(--p-surface-200);
}

.output-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.flex-1 {
  flex: 1;
}
</style>
