import './assets/main.css'

import { createApp } from 'vue'

import App from '@/App.vue'
import router from '@/router'
import { createYmaps } from 'vue-yandex-maps'

const app = createApp(App)

app.use(router)
app.use(createYmaps({
  apikey: import.meta.env.VITE_YANDEX_MAPS_API_KEY,
  lang: 'ru_RU',
}))

app.mount('#app')
