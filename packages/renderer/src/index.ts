import { createApp } from 'vue'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import store from '@/store'
import router from '@/router'
import vueI18n from '@/vueI18n'
import '@fortawesome/fontawesome-free/js/all'
import '@fortawesome/fontawesome-free/js/fontawesome'
import 'virtual:windi.css'
import 'virtual:windi-devtools'

createApp(App)
  .use(createPinia())
  .use(store)
  .use(router)
  .use(vueI18n)
  .mount('#app')
