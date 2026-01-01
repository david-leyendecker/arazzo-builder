<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import FloatLabel from 'primevue/floatlabel'
import { floatLabelConfig } from '../../config/float-label.config'
import { INSPECTOR_CLASSES, BUTTON_CLASSES, TEXT_CLASSES } from './inspector-classes'
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
  <div :class="INSPECTOR_CLASSES.itemList">
    <div v-for="(param, index) in parameters" :key="index" :class="INSPECTOR_CLASSES.itemContainer">
      <div :class="`flex align-items-center justify-content-between ${INSPECTOR_CLASSES.mb3}`">
        <label :class="`${INSPECTOR_CLASSES.inlineLabel} ${TEXT_CLASSES.small}`">
          <Checkbox
            binary
            :modelValue="(param as any).$ref !== undefined"
            @update:modelValue="(value) => $emit('toggle-ref', index, !!value)"
          />
          Use $ref
        </label>
        <Button
          @click="$emit('remove', index)"
          v-bind="BUTTON_CLASSES.removeAction"
          aria-label="Remove"
        />
      </div>

      <div v-if="(param as any).$ref !== undefined" :class="INSPECTOR_CLASSES.itemContent">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-ref-' + index"
            :model-value="(param as any).$ref"
            @update:modelValue="(value) => $emit('update:ref', index, value || '')"
            fluid
          />
          <label :for="'param-ref-' + index">Reference</label>
        </FloatLabel>
      </div>

      <div v-else :class="INSPECTOR_CLASSES.itemContent">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-name-' + index"
            :model-value="(param as ArazzoParameter).name"
            @update:modelValue="(value) => $emit('update:field', index, 'name', value)"
            fluid
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
            fluid
          />
          <label :for="'param-in-' + index">Location</label>
        </FloatLabel>

        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'param-value-' + index"
            :model-value="String((param as ArazzoParameter).value || '')"
            @update:modelValue="(value) => $emit('update:field', index, 'value', value)"
            fluid
          />
          <label :for="'param-value-' + index">Value or expression</label>
        </FloatLabel>
      </div>

      <Divider v-if="index < parameters.length - 1" :class="`${INSPECTOR_CLASSES.mt3} ${INSPECTOR_CLASSES.mb0}`" />
    </div>
  </div>
</template>
