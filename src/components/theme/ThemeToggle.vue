<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'
import { computed } from 'vue'

const themeStore = useThemeStore()

const currentIcon = computed(() => {
  return themeStore.isDark ? '🌙' : '☀️'
})

const currentLabel = computed(() => {
  if (themeStore.selectedTheme === 'auto') {
    return `Auto (${themeStore.currentTheme})`
  }
  return themeStore.currentTheme.charAt(0).toUpperCase() + themeStore.currentTheme.slice(1)
})

const cycleTheme = () => {
  // Cycle through: auto -> light -> dark -> auto
  if (themeStore.selectedTheme === 'auto') {
    themeStore.setTheme('light')
  } else if (themeStore.selectedTheme === 'light') {
    themeStore.setTheme('dark')
  } else {
    themeStore.setTheme('auto')
  }
}
</script>

<template>
  <button
    @click="cycleTheme"
    class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
           bg-gray-100 hover:bg-gray-200 text-gray-700
           dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200"
    :title="`Current theme: ${currentLabel}. Click to cycle through themes.`"
  >
    <span class="text-lg">{{ currentIcon }}</span>
    <span class="hidden sm:inline">{{ currentLabel }}</span>
  </button>
</template>

<style scoped>
button {
  user-select: none;
}
</style>
