<template>
  <div class="w-full h-full max-h-screen flex flex-col">
    <Header v-if="showHeader" class="flex-shrink-0" />
    <PanelWrapper class="flex-grow" :initial-rows="2">
    </PanelWrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Header from './components/base/Header.vue'
import PanelWrapper from './components/base/PanelWraper.vue'

export default defineComponent({
  name: 'App',
  components: { Header, PanelWrapper },
  setup () {
    const showHeader = ref(true)

    window.ipcRenderer.on('enter-fullscreen', () => { showHeader.value = false })
    window.ipcRenderer.on('leave-fullscreen', () => { showHeader.value = true })

    return { showHeader }
  }
})
</script>
