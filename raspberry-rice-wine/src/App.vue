<template>
  <div class="w-full h-full">
    <Header />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Header from './components/base/Header.vue'

export default defineComponent({
  name: 'App',
  components: { Header }
})
</script>
