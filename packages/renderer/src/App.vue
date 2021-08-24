<template>
  <div class="w-screen h-screen flex flex-col">
    <Header v-if="showHeader" />
    <RouterView class="flex-grow" />
    <ModalRenderer v-if="modalStore.activeModal" class="absolute z-50 w-screen h-screen bg-black bg-opacity-50" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'
import type { State } from './store'
import { useModalStore } from './stores/modal'
import toolbarHandler from './common/toolbarHandler'
import Header from './components/base/Header.vue'
import ModalRenderer from './components/modal/ModalRenderer.vue'

export default defineComponent({
  name: 'App',
  components: { Header, ModalRenderer },
  setup () {
    const router = useRouter()
    const store = useStore<State>()
    const modalStore = useModalStore()

    const showHeader = ref(true)

    window.bridgeApi.shell.registerEnterFullscreenHandler(() => { showHeader.value = false })
    window.bridgeApi.shell.registerLeaveFullscreenHandler(() => { showHeader.value = true })
    window.bridgeApi.shell.registerToolbarHandler((_, { path }) => toolbarHandler(path, { router, store }))

    return { showHeader, modalStore }
  }
})
</script>
