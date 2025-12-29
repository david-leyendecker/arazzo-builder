<script setup lang="ts">
import { computed } from 'vue'
import { useTheme, type Theme } from '../../composables/useTheme'
import Button from 'primevue/button'

const { currentTheme, setTheme } = useTheme()

const themeIcon = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return 'pi pi-sun'
    case 'dark':
      return 'pi pi-moon'
    case 'system':
      return 'pi pi-desktop'
    default:
      return 'pi pi-desktop'
  }
})

const themeLabel = computed(() => {
  switch (currentTheme.value) {
    case 'light':
      return 'Light Mode'
    case 'dark':
      return 'Dark Mode'
    case 'system':
      return 'System Theme'
    default:
      return 'System Theme'
  }
})

const toggleTheme = () => {
  const themes: Theme[] = ['system', 'light', 'dark']
  const currentIndex = themes.indexOf(currentTheme.value)
  const nextIndex = (currentIndex + 1) % themes.length
  const nextTheme = themes[nextIndex]
  if (nextTheme) {
    setTheme(nextTheme)
  }
}
</script>

<template>
  <Button
    :icon="themeIcon"
    :label="themeLabel"
    @click="toggleTheme"
    text
    size="small"
    :aria-label="`Current theme: ${themeLabel}. Click to cycle themes.`"
    class="theme-toggle"
  />
</template>

<style scoped>
.theme-toggle {
  min-width: 120px;
}
</style>
