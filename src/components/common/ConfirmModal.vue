<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'

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

const dialogRef = ref<HTMLElement | null>(null)
const previouslyFocused = ref<HTMLElement | null>(null)

const close = () => emit('update:open', false)

const handleCancel = () => {
  emit('cancel')
  close()
}

const handleConfirm = () => {
  emit('confirm')
  close()
}

const focusFirst = () => {
  const dialog = dialogRef.value
  if (!dialog) return
  const focusables = dialog.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const first = focusables.item(0)
  if (first) {
    first.focus()
    return
  }
  dialog.focus()
}

const trapFocus = (event: KeyboardEvent) => {
  if (event.key !== 'Tab') return
  const dialog = dialogRef.value
  if (!dialog) return
  const focusables = Array.from(dialog.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )).filter(el => !el.hasAttribute('disabled'))
  if (focusables.length === 0) {
    event.preventDefault()
    dialog.focus()
    return
  }

  const first = focusables[0]
  const last = focusables[focusables.length - 1]
  if (!first || !last) return
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && active === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault()
    first.focus()
  }
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleCancel()
    return
  }
  trapFocus(event)
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused.value = document.activeElement as HTMLElement | null
      await nextTick()
      focusFirst()
    } else if (previouslyFocused.value) {
      previouslyFocused.value.focus()
    }
  }
)

onBeforeUnmount(() => {
  if (previouslyFocused.value) {
    previouslyFocused.value.focus()
  }
})
</script>

<template>
  <Teleport to="body">
    <transition name="fade">
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          role="presentation"
          @click.self="handleCancel"
        >
          <div
            ref="dialogRef"
            class="w-full max-w-sm rounded-lg bg-white dark:bg-slate-900 shadow-2xl border border-gray-200 dark:border-slate-700 focus:outline-none"
            role="dialog"
            aria-modal="true"
            tabindex="-1"
            @keydown="handleKeydown"
          >
          <div class="px-5 pt-4 pb-3">
            <h3 class="text-base font-semibold text-gray-900 dark:text-gray-100">{{ title || 'Are you sure?' }}</h3>
            <p v-if="message" class="mt-2 text-sm text-gray-600 dark:text-gray-300">{{ message }}</p>
          </div>
          <div class="flex justify-end gap-2 px-5 pb-4">
            <button
              type="button"
              class="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              @click="handleCancel"
            >
              {{ cancelLabel }}
            </button>
            <button
              type="button"
              class="px-4 py-2 text-sm font-semibold rounded-md text-white transition"
              :class="destructive
                ? 'bg-red-600 hover:bg-red-700 focus-visible:outline-red-600'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:outline-blue-600'"
              @click="handleConfirm"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
