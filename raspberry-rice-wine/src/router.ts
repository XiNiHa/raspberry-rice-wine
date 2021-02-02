import { createRouter, createWebHashHistory } from 'vue-router'
import ScriptSetEditor from './components/script-editor/ScriptSetEditor.vue'
import Settings from './components/settings/Settings.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: ScriptSetEditor
    },
    {
      path: '/settings',
      component: Settings
    }
  ]
})
