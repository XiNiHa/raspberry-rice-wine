<template>
  <nav class="w-full h-10 shadow-md flex justify-between items-center z-50">
    <div class="flex-grow" style="-webkit-app-region: drag">
      <h1 class="font-semibold px-4 align-middle h-auto">{{ $t('app.title') }}</h1>
    </div>
    <HeaderButton hoverBg="hover:bg-red-500" @click="close">
      <i class="fas fa-times" />
    </HeaderButton>
  </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { IpcRenderer } from 'electron'
import HeaderButton from './HeaderButton.vue'

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}

export default defineComponent({
  components: { HeaderButton },
  setup () {
    const close = () => window.ipcRenderer.send('close')

    return {
      close
    }
  }
})
</script>
