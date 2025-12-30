<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import { Divider } from 'primevue'
import { floatLabelConfig } from '../../config/float-label.config'
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
    <div v-for="(param, index) in parameters" :key="index" class="flex flex-column gap-3">
      <div class="flex align-items-center justify-content-between mb-2">
        <FloatLabel :variant="floatLabelConfig.variant" class="flex-1">
          <InputText :id="'param-name-' + index" :value="param.name"
            @input="(e) => $emit('update:field', index, 'name', (e.target as HTMLInputElement).value)" size="small"
            class="w-full" />
          <label :for="'param-name-' + index">Name</label>
        </FloatLabel>
        <Button @click="$emit('remove', index)" icon="pi pi-times" text rounded severity="danger" size="small"
          title="Remove parameter" />
      </div>
      <FloatLabel :variant="floatLabelConfig.variant">
        <Select :id="'param-in-' + index" :modelValue="param.in"
          @update:modelValue="(value) => $emit('update:field', index, 'in', value)" :options="parameterInOptions"
          optionLabel="label" optionValue="value" size="small" class="w-full" />
        <label :for="'param-in-' + index">Location</label>
      </FloatLabel>
      <FloatLabel :variant="floatLabelConfig.variant">
        <InputText :id="'param-value-' + index" :value="param.value"
          @input="(e) => $emit('update:field', index, 'value', (e.target as HTMLInputElement).value)" size="small"
          class="w-full" />
        <label :for="'param-value-' + index">Value</label>
      </FloatLabel>

      <Divider v-if="index < parameters.length - 1" class="mb-0 mt-0" />
    </div>
  </div>
</template>
