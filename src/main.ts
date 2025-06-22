import './assets/main.css'
import 'iconify-icon'

import 'mapbox-gl/dist/mapbox-gl.css'

import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'
import './registerSW'

const app = createApp(App)

app.use(router)
app.use(DataLoaderPlugin, { router })

app.mount('#app')
