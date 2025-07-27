import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { onAuthStateChanged } from 'firebase/auth'
import './style.css'
import App from './App.vue'
import router from './router'
import { auth } from './lib/firebase'
import { useAuthStore } from './stores/auth'

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
