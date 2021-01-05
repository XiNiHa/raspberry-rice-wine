import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import i18n from './i18n'
import './assets/tailwind.css'
import '@fortawesome/fontawesome-free/js/all'
import '@fortawesome/fontawesome-free/js/fontawesome'

createApp(App).use(store).use(i18n).mount('#app')
