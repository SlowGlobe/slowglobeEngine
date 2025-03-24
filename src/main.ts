import './assets/main.css'
import 'iconify-icon'

import 'mapbox-gl/dist/mapbox-gl.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(DataLoaderPlugin, { router })

app.mount('#app')
