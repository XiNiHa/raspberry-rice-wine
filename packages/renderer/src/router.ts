import { createRouter, createWebHashHistory } from 'vue-router'
import ScriptSetEditor from './components/script-editor/ScriptSetEditor.vue'
import TemplateEditor from './components/template-editor/TemplateEditor.vue'
import Settings from './components/settings/Settings.vue'
import HotkeySettings from './components/settings/Hotkey.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: ScriptSetEditor
    },
    {
      path: '/template-editor',
      component: TemplateEditor
    },
    {
      path: '/settings',
      component: Settings,
      children: [
        {
          path: 'hotkey',
          component: HotkeySettings
        }
      ]
    }
  ]
})
