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

    window.shell.registerEnterFullscreenHandler(() => { showHeader.value = false })
    window.shell.registerLeaveFullscreenHandler(() => { showHeader.value = true })
    window.shell.registerToolbarHandler((_, { path }) => toolbarHandler(path, { router, store }))

    return { store, showHeader }
  }
})
</script>
