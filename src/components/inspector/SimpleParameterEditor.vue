<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import type { ArazzoParameter } from '../../types/arazzo'

defineProps<{
  parameters: ArazzoParameter[]
}>()

defineEmits<{
  'update:field': [index: number, field: keyof ArazzoParameter, value: any]
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
  <div class="flex flex-column gap-3">
    <div v-for="(param, index) in parameters" :key="index" class="p-2 border-1 border-surface-200 border-round surface-50">
      <div class="flex align-items-center justify-content-between gap-2 mb-2">
        <InputText
          :value="param.name"
          @input="(e) => $emit('update:field', index, 'name', (e.target as HTMLInputElement).value)"
          placeholder="Name"
          size="small"
          class="flex-1"
          style="min-width: 0;"
        />
        <Button
          @click="$emit('remove', index)"
          icon="pi pi-times"
          text
          rounded
          severity="danger"
          size="small"
          title="Remove parameter"
        />
      </div>
      <Select
        :modelValue="param.in"
        @update:modelValue="(value) => $emit('update:field', index, 'in', value)"
        :options="parameterInOptions"
        optionLabel="label"
        optionValue="value"
        size="small"
        class="w-full mb-2"
      />
      <InputText
        :value="param.value"
        @input="(e) => $emit('update:field', index, 'value', (e.target as HTMLInputElement).value)"
        placeholder="Value (e.g., $inputs.userId)"
        size="small"
        class="w-full"
      />
    </div>
  </div>
</template>
