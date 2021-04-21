import { createApp } from 'vue'
import { IpcRenderer } from 'electron'
import App from './App.vue'
import store from './store'
import vueI18n from './i18n/vueI18n'
import router from './router'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/js/all'
import '@fortawesome/fontawesome-free/js/fontawesome'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    platform: string;
  }
}

createApp(App).use(store).use(router).use(vueI18n).mount('#app')
