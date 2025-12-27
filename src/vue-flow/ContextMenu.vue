<script setup lang="ts">
import { computed } from 'vue'

export interface ContextMenuItem {
  label: string
  key: string
  handler: () => void
}

interface Props {
  visible: boolean
  x: number
  y: number
  items: ContextMenuItem[]
}

interface Emits {
  (e: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const handleItemClick = (item: ContextMenuItem) => {
  item.handler()
  emit('close')
}

const menuStyle = computed(() => ({
  left: `${props.x}px`,
  top: `${props.y}px`
}))
</script>

<template>
  <div 
    v-if="visible" 
    class="fixed inset-0 z-50" 
    @click="emit('close')"
    @contextmenu.prevent
  >
    <div 
      class="absolute bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[200px]"
      :style="menuStyle"
      @click.stop
    >
      <div
        v-for="item in items"
        :key="item.key"
        class="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm text-gray-700 transition-colors"
        @click="handleItemClick(item)"
      >
        {{ item.label }}
      </div>
      <div v-if="items.length === 0" class="px-4 py-2 text-sm text-gray-400 italic">
        No actions available
      </div>
    </div>
  </div>
</template>
