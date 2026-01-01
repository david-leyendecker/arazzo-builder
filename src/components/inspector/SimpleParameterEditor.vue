<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Divider from 'primevue/divider'
import FloatLabel from 'primevue/floatlabel'
import { floatLabelConfig } from '../../config/float-label.config'
import { INSPECTOR_CLASSES, BUTTON_CLASSES } from './inspector-classes'
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
  <div :class="INSPECTOR_CLASSES.itemList">
    <div v-for="(param, index) in parameters" :key="index" :class="INSPECTOR_CLASSES.itemContainer">
      <div :class="INSPECTOR_CLASSES.itemHeader">
        <FloatLabel :variant="floatLabelConfig.variant" :class="INSPECTOR_CLASSES.flex1">
          <InputText
            :id="'param-name-' + index"
            :model-value="param.name"
            @update:modelValue="(value) => $emit('update:field', index, 'name', value)"
            fluid
          />
          <label :for="'param-name-' + index">Name</label>
        </FloatLabel>
        <Button
          @click="$emit('remove', index)"
          v-bind="BUTTON_CLASSES.removeAction"
          aria-label="Remove parameter"
        />
      </div>

      <div :class="INSPECTOR_CLASSES.itemContent">
        <FloatLabel :variant="floatLabelConfig.variant">
          <Select
            :id="'param-in-' + index"
            :modelValue="param.in"
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
            :model-value="String(param.value || '')"
            @update:modelValue="(value) => $emit('update:field', index, 'value', value)"
            fluid
          />
          <label :for="'param-value-' + index">Value</label>
        </FloatLabel>
      </div>

      <Divider v-if="index < parameters.length - 1" :class="`${INSPECTOR_CLASSES.mt3} ${INSPECTOR_CLASSES.mb0}`" />
    </div>
  </div>
</template>
