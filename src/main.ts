import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import './style.css'
import App from './App.vue'
import { useWorkflowStore } from './stores/workflow'
import { useTheme } from './composables/useTheme'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark-mode',
      cssLayer: false
    }
  }
})

// Initialize workflow store to load saved workflows
const workflowStore = useWorkflowStore()
workflowStore.initializeStore()

// Initialize theme
const { initTheme } = useTheme()
initTheme()

app.mount('#app')
