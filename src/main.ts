import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import './style.css'
import App from './App.vue'
import { useThemeStore } from './stores/theme'
import { useWorkflowStore } from './stores/workflow'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue, {
  // Use default PrimeVue styling
})

// Initialize theme system after pinia is installed
const themeStore = useThemeStore()
themeStore.initialize()

// Initialize workflow store to load saved workflows
const workflowStore = useWorkflowStore()
workflowStore.initializeStore()

app.mount('#app')
