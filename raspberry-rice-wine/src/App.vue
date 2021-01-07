<template>
  <div class="w-full h-full max-h-screen flex flex-col">
    <Header v-if="showHeader" class="flex-shrink-0" />
    <PanelWrapper class="flex-grow" v-slot="{drag, setDrag}" :initial-rows="2">
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
      <Panel :drag="drag" @set-drag="setDrag" @complete-drag="setDrag(null)" />
    </PanelWrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Header from './components/base/Header.vue'
import PanelWrapper from './components/base/PanelWraper.vue'
import Panel from './components/base/Panel.vue'

export default defineComponent({
  name: 'App',
  components: { Header, PanelWrapper, Panel },
  setup () {
    const showHeader = ref(true)

    window.ipcRenderer.on('enter-fullscreen', () => { showHeader.value = false })
    window.ipcRenderer.on('leave-fullscreen', () => { showHeader.value = true })

    return { showHeader }
  }
})
</script>
