import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import './style.css'
import App from './App.vue'
import router from './router'
import { auth } from './lib/firebase'
import { useAuthStore } from './modules/auth/stores/auth'

// Import stores to ensure they're registered with Pinia
import './shared/stores'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Set up auth state listener
const authStore = useAuthStore()
onAuthStateChanged(auth, async (user) => {
  await authStore.setUser(user)
})

app.mount('#app')
