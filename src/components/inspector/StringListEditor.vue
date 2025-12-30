<script setup lang="ts">
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import { floatLabelConfig } from '../../config/float-label.config'

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
  <div class="flex flex-column gap-3">
    <div v-for="(item, index) in items" :key="index" class="flex align-items-center gap-2">
      <FloatLabel :variant="floatLabelConfig.variant">
        <InputText
          :id="'item-' + index"
          :value="item"
          @input="(e) => $emit('update:item', index, (e.target as HTMLInputElement).value)"
          size="small"
          class="w-full"
        />
        <label :for="'item-' + index">{{ placeholder || 'Value' }}</label>
      </FloatLabel>
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
  </div>
</template>

<style scoped>

</style>
