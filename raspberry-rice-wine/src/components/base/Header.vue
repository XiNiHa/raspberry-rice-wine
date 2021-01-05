<template>
  <nav class="w-full h-10 shadow-md flex justify-between items-center z-50">
    <div class="flex-grow" :class="{ 'pl-16': isMac }" style="-webkit-app-region: drag">
      <h1 class="font-semibold px-4 align-middle h-auto">{{ $t('app.title') }}</h1>
    </div>
    <div v-if="!isMac">
      <HeaderButton hoverBg="hover:bg-red-500" @click="close">
        <i class="fas fa-times" />
      </HeaderButton>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import HeaderButton from './HeaderButton.vue'

export default defineComponent({
  components: { HeaderButton },
  setup () {
    const close = () => window.ipcRenderer.send('close')
    const isMac = window.platform === 'darwin'

    return {
      close, isMac
    }
  }
})
</script>
