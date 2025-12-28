import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import { useThemeStore } from './stores/theme'
import { useWorkflowStore } from './stores/workflow'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

// Initialize theme system after pinia is installed
const themeStore = useThemeStore()
themeStore.initialize()

// Initialize workflow store to load saved workflows
const workflowStore = useWorkflowStore()
workflowStore.initializeStore()

app.mount('#app')
