<template>
  <div class="w-full h-full">
    <Header v-if="showHeader" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import Header from './components/base/Header.vue'

export default defineComponent({
  name: 'App',
  components: { Header },
  setup () {
    const showHeader = ref(true)

    window.ipcRenderer.on('enter-fullscreen', () => { showHeader.value = false })
    window.ipcRenderer.on('leave-fullscreen', () => { showHeader.value = true })

    return { showHeader }
  }
})
</script>
