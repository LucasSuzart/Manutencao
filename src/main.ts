import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { persistencePlugin } from './plugins/persist'
import { seedInitialData } from './seed'
import UIComponents from './modules/shared/ui'
import './assets/css/main.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(persistencePlugin())
app.use(pinia)
app.use(router)
app.use(UIComponents)

// Executa seed após inicialização (apenas se vazio / primeira vez)
if (typeof window !== 'undefined') {
  // Defer para garantir restauração de estado antes do seed
  queueMicrotask(() => seedInitialData())
}

app.mount('#app')