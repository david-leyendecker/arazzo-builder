<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'
import { computed } from 'vue'
import Button from 'primevue/button'

const themeStore = useThemeStore()

const currentIcon = computed(() => {
  return themeStore.isDark ? 'pi-moon' : 'pi-sun'
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
  <Button
    @click="cycleTheme"
    :icon="`pi ${currentIcon}`"
    :label="currentLabel"
    :title="`Current theme: ${currentLabel}. Click to cycle through themes.`"
    outlined
    size="small"
  />
</template>

<style scoped>
button {
  user-select: none;
}
</style>
