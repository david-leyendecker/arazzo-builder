import { ref } from 'vue'

export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'arazzo-builder-theme'

// Shared state across all component instances
const currentTheme = ref<Theme>('system')
const isDark = ref(false)

/**
 * Composable for managing application theme
 * Supports light, dark, and system themes with localStorage persistence
 */
export function useTheme() {
  /**
   * Get the effective theme based on current selection and system preference
   */
  const getEffectiveTheme = (): 'light' | 'dark' => {
    if (currentTheme.value === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return currentTheme.value
  }

  /**
   * Apply the theme to the document
   */
  const applyTheme = (theme: 'light' | 'dark') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-mode')
      isDark.value = true
    } else {
      document.documentElement.classList.remove('dark-mode')
      isDark.value = false
    }
  }

  /**
   * Set the theme preference
   */
  const setTheme = (theme: Theme) => {
    currentTheme.value = theme
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(getEffectiveTheme())
  }

  /**
   * Initialize theme from localStorage or system preference
   */
  const initTheme = () => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      currentTheme.value = stored
    } else {
      currentTheme.value = 'system'
    }

    applyTheme(getEffectiveTheme())

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (currentTheme.value === 'system') {
        applyTheme(getEffectiveTheme())
      }
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      // Fallback for older browsers (Safari < 14)
      // @ts-ignore - addListener is deprecated but needed for older browsers
      mediaQuery.addListener(handleChange)
    }
  }

  return {
    currentTheme,
    isDark,
    setTheme,
    initTheme,
    getEffectiveTheme
  }
}
