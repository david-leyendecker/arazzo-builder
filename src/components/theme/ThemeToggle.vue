<script setup lang="ts">
import { useThemeStore } from '../../stores/theme'
import { computed } from 'vue'
import MdFilledButton from 'vue-material-3/src/components/button/MdFilledButton.vue'

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
  <MdFilledButton
    @click="cycleTheme"
    :title="`Current theme: ${currentLabel}. Click to cycle through themes.`"
    class="theme-toggle-btn"
  >
    <span class="theme-icon">{{ currentIcon }}</span>
    <span class="theme-label">{{ currentLabel }}</span>
  </MdFilledButton>
</template>

<style scoped>
.theme-toggle-btn {
  user-select: none;
}

.theme-icon {
  font-size: 1.125rem;
  margin-right: 0.5rem;
}

.theme-label {
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .theme-label {
    display: none;
  }
  .theme-icon {
    margin-right: 0;
  }
}
</style>
