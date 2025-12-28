import { defineStore } from 'pinia'

export type Theme = 'light' | 'dark' | 'auto'

/**
 * Store for managing theme state and preferences
 * Supports automatic system preference detection and manual theme selection
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    // User's selected theme preference ('auto' follows system preference)
    selectedTheme: 'auto' as Theme,
    // Current active theme (resolved from selectedTheme and system preference)
    currentTheme: 'light' as 'light' | 'dark',
    // System preference for color scheme
    systemPreference: 'light' as 'light' | 'dark'
  }),

  getters: {
    isDark: (state) => state.currentTheme === 'dark',
    isLight: (state) => state.currentTheme === 'light',
    isAuto: (state) => state.selectedTheme === 'auto'
  },

  actions: {
    /**
     * Initialize theme system
     * - Loads saved preference from localStorage
     * - Sets up system preference listener
     * - Applies initial theme
     */
    initialize() {
      // Load saved preference
      const saved = localStorage.getItem('theme-preference') as Theme | null
      if (saved && ['light', 'dark', 'auto'].includes(saved)) {
        this.selectedTheme = saved
      }

      // Detect system preference
      this.detectSystemPreference()

      // Listen for system preference changes
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQuery.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light'
        this.applyTheme()
      })

      // Apply initial theme
      this.applyTheme()
    },

    /**
     * Detect current system color scheme preference
     */
    detectSystemPreference() {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      this.systemPreference = prefersDark ? 'dark' : 'light'
    },

    /**
     * Set theme preference (light, dark, or auto)
     */
    setTheme(theme: Theme) {
      this.selectedTheme = theme
      localStorage.setItem('theme-preference', theme)
      this.applyTheme()
    },

    /**
     * Toggle between light and dark mode (sets to manual preference)
     */
    toggle() {
      const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark'
      this.setTheme(newTheme)
    },

    /**
     * Apply the current theme to the document
     * Resolves 'auto' to system preference
     * Updates DOM classes and color-scheme property
     */
    applyTheme() {
      // Determine active theme
      if (this.selectedTheme === 'auto') {
        this.currentTheme = this.systemPreference
      } else {
        this.currentTheme = this.selectedTheme
      }

      // Update document classes
      const html = document.documentElement
      if (this.currentTheme === 'dark') {
        html.classList.add('dark')
        html.style.colorScheme = 'dark'
      } else {
        html.classList.remove('dark')
        html.style.colorScheme = 'light'
      }
    }
  }
})
