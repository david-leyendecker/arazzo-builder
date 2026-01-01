<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Checkbox from 'primevue/checkbox'
import Divider from 'primevue/divider'
import FloatLabel from 'primevue/floatlabel'
import { floatLabelConfig } from '../../config/float-label.config'
import { INSPECTOR_CLASSES, BUTTON_CLASSES, TEXT_CLASSES } from './inspector-classes'
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
  <div :class="INSPECTOR_CLASSES.itemList">
    <div v-for="(action, index) in actions" :key="index" :class="INSPECTOR_CLASSES.itemContainer">
      <div :class="`flex align-items-center justify-content-between ${INSPECTOR_CLASSES.mb3}`">
        <label :class="`${INSPECTOR_CLASSES.inlineLabel} ${TEXT_CLASSES.small}`">
          <Checkbox
            binary
            :modelValue="(action as any).$ref !== undefined"
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

      <div v-if="(action as any).$ref !== undefined">
        <FloatLabel :variant="floatLabelConfig.variant">
          <InputText
            :id="'action-ref-' + index"
            :model-value="(action as any).$ref"
            @update:modelValue="(value) => $emit('update:ref', index, value || '')"
            fluid
          />
          <label :for="'action-ref-' + index">Reference</label>
        </FloatLabel>
      </div>

      <div v-else>
        <FloatLabel :variant="floatLabelConfig.variant">
          <Textarea
            :id="'action-json-' + index"
            :model-value="JSON.stringify(action, null, 2)"
            @blur="(e) => $emit('update:json', index, (e.target as HTMLTextAreaElement).value)"
            rows="4"
            fluid
            :class="INSPECTOR_CLASSES.fontMono"
          />
          <label :for="'action-json-' + index">Action (JSON)</label>
        </FloatLabel>
      </div>

      <Divider v-if="index < actions.length - 1" :class="`${INSPECTOR_CLASSES.mt3} ${INSPECTOR_CLASSES.mb0}`" />
    </div>
  </div>
</template>

<style scoped>
/* No custom styles needed - uses centralized classes */
</style>
