<template>
  <div class="w-full h-full max-h-screen flex flex-col">
    <Header
      v-if="showHeader"
      class="flex-shrink-0" />
    <RouterView class="flex-grow" />
    <ModalRenderer v-if="store.state.activeModal" class="absolute z-50 w-screen h-screen bg-black bg-opacity-50" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { State } from './store'
import Header from './components/base/Header.vue'
import ModalRenderer from './components/modal/ModalRenderer.vue'

export default defineComponent({
  name: 'App',
  components: { Header, ModalRenderer },
  setup () {
    const store = useStore<State>()

    const showHeader = ref(true)

    window.ipcRenderer.on('enter-fullscreen', () => { showHeader.value = false })
    window.ipcRenderer.on('leave-fullscreen', () => { showHeader.value = true })

    return { store, showHeader }
  }
})
</script>
