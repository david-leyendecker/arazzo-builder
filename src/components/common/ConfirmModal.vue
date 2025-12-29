<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  destructive?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const confirmLabel = computed(() => props.confirmText || 'Confirm')
const cancelLabel = computed(() => props.cancelText || 'Cancel')

const close = () => emit('update:open', false)

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleConfirm = () => {
  emit('confirm')
  close()
}
</script>

<template>
  <Dialog
    :visible="open"
    @update:visible="(value) => emit('update:open', value)"
    :header="title || 'Are you sure?'"
    modal
    :style="{ width: '28rem' }"
  >
    <p v-if="message" class="confirm-message">{{ message }}</p>
    
    <template #footer>
      <Button
        :label="cancelLabel"
        @click="handleCancel"
        outlined
      />
      <Button
        :label="confirmLabel"
        @click="handleConfirm"
        :severity="destructive ? 'danger' : 'primary'"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.confirm-message {
  margin: 0;
  color: var(--p-text-secondary-color);
  font-size: 0.875rem;
  line-height: 1.5;
}
</style>
