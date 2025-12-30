import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import FloatLabel from 'primevue/floatlabel'
import './style.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import App from './App.vue'
import { useWorkflowStore } from './stores/workflow'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system', // currently force light mode
      cssLayer: false
    }
  }
})

// Register FloatLabel globally
app.component('FloatLabel', FloatLabel)

// Initialize workflow store to load saved workflows
const workflowStore = useWorkflowStore()
workflowStore.initializeStore()

app.mount('#app')
