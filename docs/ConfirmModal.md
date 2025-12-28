# ConfirmModal

A reusable, app-styled confirmation dialog with focus trapping and keyboard support.

## Props
- `open` (boolean, required): Controls visibility (use `v-model:open`).
- `title` (string, optional): Heading text. Default: "Are you sure?".
- `message` (string, optional): Body copy under the title.
- `confirmText` (string, optional): Confirm button label. Default: "Confirm".
- `cancelText` (string, optional): Cancel button label. Default: "Cancel".
- `destructive` (boolean, optional): Switches confirm button to red styling.

## Events
- `update:open` (boolean): Emitted when the modal requests closing or opening.
- `confirm`: Fired on confirm button click.
- `cancel`: Fired on cancel button click or backdrop click.

## Accessibility
- Focus is trapped inside the dialog while open.
- Escape closes the dialog (fires `cancel`).
- Focus returns to the previously focused element on close.
- Backdrop click closes the dialog.

## Usage
```vue
<template>
  <ConfirmModal
    v-model:open="showConfirm"
    title="Delete step?"
    message="This will remove the step and reconnect surrounding steps."
    confirm-text="Delete"
    cancel-text="Cancel"
    :destructive="true"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>
```

```ts
import ConfirmModal from '@/components/common/ConfirmModal.vue'
import { ref } from 'vue'

const showConfirm = ref(false)
const handleConfirm = () => {
  // perform destructive action
}
const handleCancel = () => {
  // optional: track cancellation
}
```

Place the modal near the root of your component tree (it teleports to `body`).
