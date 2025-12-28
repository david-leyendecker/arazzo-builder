<script setup lang="ts">
import { computed } from 'vue'
import MdDialog from 'vue-material-3/src/components/dialog/MdDialog.vue'
import MdTextButton from 'vue-material-3/src/components/button/MdTextButton.vue'
import MdFilledButton from 'vue-material-3/src/components/button/MdFilledButton.vue'

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
  <MdDialog
    :open="open"
    @closed="handleCancel"
  >
    <div slot="headline" class="dialog-title">{{ title || 'Are you sure?' }}</div>
    <div slot="content" class="dialog-content">
      <p v-if="message">{{ message }}</p>
    </div>
    <div slot="actions" class="dialog-actions">
      <MdTextButton @click="handleCancel">
        {{ cancelLabel }}
      </MdTextButton>
      <MdFilledButton 
        @click="handleConfirm"
        :class="{ 'destructive-action': destructive }"
      >
        {{ confirmLabel }}
      </MdFilledButton>
    </div>
  </MdDialog>
</template>

<style scoped>
.dialog-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--md-sys-color-on-surface);
}

.dialog-content {
  color: var(--md-sys-color-on-surface-variant);
  font-size: 0.875rem;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

.destructive-action {
  --md-sys-color-primary: var(--md-sys-color-error);
  --md-sys-color-on-primary: var(--md-sys-color-on-error);
}
</style>
