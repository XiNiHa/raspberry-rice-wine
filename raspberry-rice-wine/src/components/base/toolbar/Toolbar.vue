<template>
  <div class="flex w-full bg-gray-700 items-center z-50" @click.stop>
    <ToolbarSection
      :title="t('toolbar.file.title')"
      :show-items="active === 0"
      @click="clickActivate(0)"
      @mouseenter="hoverActivate(0)"
      @close-items="closeItems">
      <ToolbarItem>{{ t('toolbar.file.newFile') }}</ToolbarItem>
      <ToolbarItem>{{ t('toolbar.file.openFile') }}</ToolbarItem>
      <ToolbarSeparator />
      <ToolbarItem @click="importScript">
        {{ t('toolbar.file.importScript') }}
      </ToolbarItem>
      <ToolbarItem @click="store.state.activeModal = 'exportOption'">
        {{ t('toolbar.file.export') }}
      </ToolbarItem>
    </ToolbarSection>
    <ToolbarSection
      :title="t('toolbar.view.title')"
      :show-items="active === 1"
      @click="clickActivate(1)"
      @mouseenter="hoverActivate(1)"
      @close-items="closeItems">
      <RouterLink v-slot="{ isActive }" to="/">
        <ToolbarItem :checked="isActive">
          {{ t('toolbar.view.scriptEditor') }}
        </ToolbarItem>
      </RouterLink>
      <RouterLink v-slot="{ isActive }" to="/template-editor">
        <ToolbarItem :checked="isActive">
          {{ t('toolbar.view.templateEditor') }}
        </ToolbarItem>
      </RouterLink>
      <ToolbarSeparator />
      <RouterLink v-slot="{ isActive }" to="/settings">
        <ToolbarItem :checked="isActive">
          {{ t('toolbar.view.settings') }}
        </ToolbarItem>
      </RouterLink>
    </ToolbarSection>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'
import ToolbarSection from './ToolbarSection.vue'
import ToolbarItem from './ToolbarItem.vue'
import ToolbarSeparator from './ToolbarSeparator.vue'

export default defineComponent({
  components: { ToolbarSection, ToolbarItem, ToolbarSeparator },
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const active = ref(-1)
    const lock = ref(false)

    watch(() => active.value, (curr, prev) => {
      const handler = () => {
        active.value = -1
        window.removeEventListener('click', handler)
      }

      if (prev === -1) {
        window.addEventListener('click', handler)
      }
    })

    const clickActivate = (index: number) => {
      if (!lock.value) {
        active.value = index
      } else {
        lock.value = false
      }
    }

    const hoverActivate = (index: number) => {
      if (!lock.value) {
        if (active.value !== -1) {
          active.value = index
        }
      } else {
        lock.value = false
      }
    }

    const closeItems = () => {
      lock.value = true
      active.value = -1

      setTimeout(() => { lock.value = false }, 500)
    }

    const importScript = () => {
      const fileInput = document.createElement('input')
      fileInput.setAttribute('type', 'file')
      fileInput.setAttribute('accept', '.txt')
      fileInput.addEventListener('input', () => {
        if (fileInput.files) {
          window.ipcRenderer.on('readCompleted', (e, content) => {
            window.ipcRenderer.removeAllListeners('readCompleted')
            store.state.importText = content
            store.state.activeModal = 'importScript'
          })
          window.ipcRenderer.send('read', {
            path: fileInput.files[0].path
          })
        }
      })
      fileInput.click()
    }

    return { t, store, active, clickActivate, hoverActivate, closeItems, importScript }
  }
})
</script>
