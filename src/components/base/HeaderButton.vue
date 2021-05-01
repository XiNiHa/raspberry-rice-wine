<template>
  <button :class="hoverBg" class="px-4 focus:outline-none h-full">
    <slot />
  </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    hoverBg: {
      type: String,
      default: 'hover:bg-gray-200'
    }
  }
})
</script>
