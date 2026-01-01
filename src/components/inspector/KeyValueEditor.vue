<script setup lang="ts">
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import FloatLabel from 'primevue/floatlabel'
import { floatLabelConfig } from '../../config/float-label.config'
import { INSPECTOR_CLASSES, BUTTON_CLASSES } from './inspector-classes'

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
  <div :class="INSPECTOR_CLASSES.itemList">
    <div v-for="[key, value] in entries" :key="key" :class="INSPECTOR_CLASSES.itemContainer">
      <div :class="INSPECTOR_CLASSES.itemHeader">
        <FloatLabel :variant="floatLabelConfig.variant" :class="INSPECTOR_CLASSES.flex1">
          <InputText
            :id="'key-' + key"
            :model-value="key"
            @blur="(e) => $emit('update:key', key, (e.target as HTMLInputElement).value)"
            fluid
          />
          <label :for="'key-' + key">{{ keyPlaceholder || 'Key' }}</label>
        </FloatLabel>
        <Button
          @click="$emit('remove', key)"
          v-bind="BUTTON_CLASSES.removeAction"
          aria-label="Remove"
        />
      </div>
      <FloatLabel :variant="floatLabelConfig.variant">
        <InputText
          :id="'value-' + key"
          :model-value="value"
          @update:modelValue="(v) => $emit('update:value', key, v)"
          fluid
        />
        <label :for="'value-' + key">{{ valuePlaceholder || 'Value' }}</label>
      </FloatLabel>
    </div>
  </div>
</template>
