<template>
  <div class="w-full h-full max-h-screen flex flex-col">
    <Header v-if="showHeader" />
    <RouterView class="flex-grow" />
    <ModalRenderer v-if="store.state.activeModal" class="absolute z-50 w-screen h-screen bg-black bg-opacity-50" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import { State } from './store'
import toolbarHandler from './common/toolbarHandler'
import Header from './components/base/Header.vue'
import ModalRenderer from './components/modal/ModalRenderer.vue'

export default defineComponent({
  name: 'App',
  components: { Header, ModalRenderer },
  setup () {
    const router = useRouter()
    const store = useStore<State>()

    const showHeader = ref(true)

    window.ipcRenderer.on('enter-fullscreen', () => { showHeader.value = false })
    window.ipcRenderer.on('leave-fullscreen', () => { showHeader.value = true })
    window.ipcRenderer.on('toolbar', (_, path) => toolbarHandler(path, { router, store }))

    return { store, showHeader }
  }
})
</script>
