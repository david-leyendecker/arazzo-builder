<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import { floatLabelConfig } from '../../config/float-label.config'
import { INSPECTOR_CLASSES, BUTTON_CLASSES } from './inspector-classes'

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
  <div :class="INSPECTOR_CLASSES.fieldGroup">
    <div v-for="(item, index) in items" :key="index" :class="INSPECTOR_CLASSES.fieldRow">
      <FloatLabel :variant="floatLabelConfig.variant" :class="INSPECTOR_CLASSES.flex1">
        <InputText
          :id="'item-' + index"
          :model-value="item"
          @update:modelValue="(value) => $emit('update:item', index, value || '')"
          fluid
        />
        <label :for="'item-' + index">{{ placeholder || 'Value' }}</label>
      </FloatLabel>
      <Button
        @click="$emit('remove', index)"
        v-bind="BUTTON_CLASSES.removeAction"
        aria-label="Remove"
      />
    </div>
  </div>
</template>
