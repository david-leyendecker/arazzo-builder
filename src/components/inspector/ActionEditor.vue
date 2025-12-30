<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import type { ArazzoReusableRef } from '../../types/arazzo'

defineProps<{
  actions: (Record<string, any> | ArazzoReusableRef)[]
}>()

defineEmits<{
  'toggle-ref': [index: number, useRef: boolean]
  'update:ref': [index: number, refValue: string]
  'update:json': [index: number, value: string]
  remove: [index: number]
}>()
</script>

<template>
  <div class="items-list">
    <div v-for="(action, index) in actions" :key="index" class="parameter-item">
      <div class="parameter-row">
        <label class="text-xs">
          <Checkbox
            binary
            :modelValue="(action as any).$ref !== undefined"
            @update:modelValue="(value) => $emit('toggle-ref', index, !!value)"
          />
          Use $ref
        </label>
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
      <div v-if="(action as any).$ref !== undefined" class="items-list">
        <InputText
          :value="(action as any).$ref"
          @input="(e) => $emit('update:ref', index, (e.target as HTMLInputElement).value)"
          placeholder="#/components/successActions/MyAction"
          size="small"
        />
      </div>
      <div v-else>
        <label class="field-sublabel">Action (JSON)</label>
        <Textarea
          :value="JSON.stringify(action, null, 2)"
          @blur="(e) => $emit('update:json', index, (e.target as HTMLTextAreaElement).value)"
          rows="3"
          class="code-textarea"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.items-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.parameter-item {
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: 0.375rem;
  border: 1px solid var(--p-surface-200);
}

.parameter-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.text-xs {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.field-sublabel {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  display: block;
  margin-bottom: 0.25rem;
}

.code-textarea {
  font-family: monospace;
  font-size: 0.85em;
  width: 100%;
}
</style>
