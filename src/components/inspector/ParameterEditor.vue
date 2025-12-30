<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import { Panel } from 'primevue'
import { floatLabelConfig } from '../../config/float-label.config'
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
    <div v-for="(param, index) in parameters" :key="index">
      <div class="flex align-items-start justify-content-between gap-2 mb-2">
        <label class="text-xs flex align-items-center gap-1 flex-1">
          <Checkbox
            binary
            :modelValue="(param as any).$ref !== undefined"
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
      <div v-if="(param as any).$ref !== undefined" class="flex flex-column gap-3">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-ref-' + index"
            :value="(param as any).$ref"
            @input="(e) => $emit('update:ref', index, (e.target as HTMLInputElement).value)"
            size="small"
            class="w-full"
          />
          <label :for="'param-ref-' + index">Reference</label>
        </FloatLabel>
      </div>
      <div v-else class="flex flex-column gap-3">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-name-' + index"
            :value="(param as ArazzoParameter).name"
            @input="(e) => $emit('update:field', index, 'name', (e.target as HTMLInputElement).value)"
            size="small"
            class="w-full"
          />
          <label :for="'param-name-' + index">Parameter name</label>
        </FloatLabel>
        <FloatLabel :variant="floatLabelConfig.variant">
          <Select
            :id="'param-in-' + index"
            :modelValue="(param as ArazzoParameter).in"
            @update:modelValue="(value) => $emit('update:field', index, 'in', value)"
            :options="parameterInOptions"
            optionLabel="label"
            optionValue="value"
            size="small"
            class="w-full"
          />
          <label :for="'param-in-' + index">Location</label>
        </FloatLabel>
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-value-' + index"
            :value="(param as ArazzoParameter).value"
            @input="(e) => $emit('update:field', index, 'value', (e.target as HTMLInputElement).value)"
            size="small"
            class="w-full"
          />
          <label :for="'param-value-' + index">Value or expression</label>
        </FloatLabel>
      </div>
    </div>
  </Panel>
</template>

<style scoped>
</style>
