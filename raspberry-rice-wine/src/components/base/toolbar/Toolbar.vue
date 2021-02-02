<template>
  <div class="flex w-full bg-gray-700 items-center z-50">
    <ToolbarSection
      :title="t('toolbar.file.title')"
      :show-items="active === 0"
      @click="clickActivate(0)"
      @mouseenter="hoverActivate(0)"
      @close-items="closeItems">
      <ToolbarItem>{{ t('toolbar.file.newFile') }}</ToolbarItem>
      <ToolbarItem>{{ t('toolbar.file.openFile') }}</ToolbarItem>
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
      <ToolbarSeparator />
      <RouterLink v-slot="{ isActive }" to="/settings">
        <ToolbarItem :checked="isActive">
          {{ t('toolbar.view.settings') }}
        </ToolbarItem>
      </RouterLink>
    </ToolbarSection>
    <div v-if="active !== -1" class="absolute top-0 left-0 w-screen h-screen z-0" @click="active = -1" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ToolbarSection from './ToolbarSection.vue'
import ToolbarItem from './ToolbarItem.vue'
import ToolbarSeparator from './ToolbarSeparator.vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  components: { ToolbarSection, ToolbarItem, ToolbarSeparator },
  setup () {
    const { t } = useI18n()

    const active = ref(-1)
    const lock = ref(false)

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

    return { t, active, clickActivate, hoverActivate, closeItems }
  }
})
</script>
