import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import vueI18n from './i18n/vueI18n'
import router from './router'
import { BridgeApi } from './preload'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/js/all'
import '@fortawesome/fontawesome-free/js/fontawesome'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends BridgeApi {}
}

createApp(App).use(store).use(router).use(vueI18n).mount('#app')
