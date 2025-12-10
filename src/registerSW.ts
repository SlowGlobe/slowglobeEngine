// src/registerSW.ts
/// <reference types="vite-plugin-pwa/client" />
// import { registerSW } from 'virtual:pwa-register'
import { useRegisterSW } from 'virtual:pwa-register/vue'
// import { pwaInfo } from 'virtual:pwa-info'

// console.log(pwaInfo)

// replaced dyanmicaly
// const reloadSW: any = '__RELOAD_SW__'

const {
  offlineReady,
  needRefresh: swNeedRefresh,
  updateServiceWorker
} = useRegisterSW({
  onNeedRefresh() {
    // Show a prompt to the user
    console.log('New content available, click on reload button to update.')
    alert('New content available, click on reload button to update.')
  },
  onOfflineReady() {
    console.log('App ready to work offline')
    alert('App ready to work offline')
  },
  immediate: true
})
// console.log('reloadSW:', reloadSW)

export { offlineReady, swNeedRefresh, updateServiceWorker }
