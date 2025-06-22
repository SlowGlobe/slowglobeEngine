// src/registerSW.ts
/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    // Show a prompt to the user
    console.log('New content available, click on reload button to update.')
    alert('New content available, click on reload button to update.')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    alert('App ready to work offline')
  }
})

export { updateSW }
