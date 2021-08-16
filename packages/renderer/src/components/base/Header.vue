<template>
  <nav class="w-full h-10 flex-shrink-0 bg-gray-700 shadow-md flex justify-between items-center z-50">
    <div
      class="flex-grow"
      :class="{ 'pl-16': isMac }"
      style="-webkit-app-region: drag">
      <h1 class="px-5 text-gray-100 align-middle h-auto select-none">
        {{ t('app.title') }}
      </h1>
    </div>
    <div v-if="!isMac">
      <HeaderButton
        hover-bg="hover:bg-red-500"
        @click="close">
        <i class="fas fa-times" />
      </HeaderButton>
    </div>
  </nav>
  <Toolbar v-if="!isMac" />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import HeaderButton from './HeaderButton.vue'
import Toolbar from './toolbar/Toolbar.vue'

export default defineComponent({
  components: { HeaderButton, Toolbar },
  setup () {
    const { t } = useI18n()
    const close = window.bridgeApi.shell.close
    const isMac = window.bridgeApi.info.platform === 'darwin'

    return { close, isMac, t }
  }
})
</script>
