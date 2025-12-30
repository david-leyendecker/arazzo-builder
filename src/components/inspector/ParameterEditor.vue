<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { Panel } from 'primevue'
import type { ArazzoParameter, ArazzoReusableRef } from '../../types/arazzo'

const props = defineProps<{
  parameters: (ArazzoParameter | ArazzoReusableRef)[]
}>()

const emit = defineEmits<{
  'toggle-ref': [index: number, useRef: boolean]
  'update:field': [index: number, field: keyof ArazzoParameter, value: any]
  'update:ref': [index: number, refValue: string]
  remove: [index: number]
}>()

const parameterInOptions = [
  { label: 'Path', value: 'path' },
  { label: 'Query', value: 'query' },
  { label: 'Header', value: 'header' },
  { label: 'Cookie', value: 'cookie' },
  { label: 'Body', value: 'body' }
]
</script>

<template>
  <Panel>
    <div v-for="(param, index) in parameters" :key="index" class="parameter-item">
      <div class="parameter-row">
        <div class="parameter-inputs">
          <label class="text-xs">
            <Checkbox
              binary
              :modelValue="(param as any).$ref !== undefined"
              @update:modelValue="(value) => $emit('toggle-ref', index, !!value)"
            />
            Use $ref
          </label>
        </div>
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
      <div v-if="(param as any).$ref !== undefined" class="items-list">
        <InputText
          :value="(param as any).$ref"
          @input="(e) => $emit('update:ref', index, (e.target as HTMLInputElement).value)"
          placeholder="#/components/parameters/MyParam"
          size="small"
        />
      </div>
      <div v-else class="parameter-inputs">
        <InputText
          :value="(param as ArazzoParameter).name"
          @input="(e) => $emit('update:field', index, 'name', (e.target as HTMLInputElement).value)"
          placeholder="Parameter name"
          size="small"
        />
        <Select
          :modelValue="(param as ArazzoParameter).in"
          @update:modelValue="(value) => $emit('update:field', index, 'in', value)"
          :options="parameterInOptions"
          optionLabel="label"
          optionValue="value"
          size="small"
        />
        <InputText
          :value="(param as ArazzoParameter).value"
          @input="(e) => $emit('update:field', index, 'value', (e.target as HTMLInputElement).value)"
          placeholder="Value or expression"
          size="small"
          class="col-span-2"
        />
      </div>
    </div>
  </Panel>
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

.parameter-inputs {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.text-xs {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.col-span-2 {
  grid-column: span 2;
}
</style>
