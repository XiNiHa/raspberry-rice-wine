<template>
  <div class="flex w-full bg-gray-700 items-center z-50" @click.stop>
    <ToolbarSection
      :title="t('toolbar.file.title')"
      :show-items="active === 0"
      @click="clickActivate(0)"
      @mouseenter="hoverActivate(0)"
      @close-items="closeItems">
      <ToolbarItem path="file.newFile" />
      <ToolbarItem path="file.openFile" />
      <ToolbarSeparator />
      <ToolbarItem path="file.importScript" />
      <ToolbarItem path="file.export" />
    </ToolbarSection>
    <ToolbarSection
      :title="t('toolbar.view.title')"
      :show-items="active === 1"
      @click="clickActivate(1)"
      @mouseenter="hoverActivate(1)"
      @close-items="closeItems">
      <ToolbarItem :checked="currentPath === '/'" path="view.scriptEditor" />
      <ToolbarItem :checked="currentPath === '/template-editor'" path="view.templateEditor" />
      <ToolbarSeparator />
      <ToolbarItem :checked="currentPath === '/settings'" path="view.settings" />
    </ToolbarSection>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { State } from '@/store'
import ToolbarSection from './ToolbarSection.vue'
import ToolbarItem from './ToolbarItem.vue'
import ToolbarSeparator from './ToolbarSeparator.vue'

export default defineComponent({
  components: { ToolbarSection, ToolbarItem, ToolbarSeparator },
  setup () {
    const { t } = useI18n()
    const router = useRouter()
    const store = useStore<State>()

    const currentPath = computed(() => router.currentRoute.value.path)

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

    return { t, currentPath, store, active, clickActivate, hoverActivate, closeItems }
  }
})
</script>
