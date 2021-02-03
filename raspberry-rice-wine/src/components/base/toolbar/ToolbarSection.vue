<template>
  <button
    class="relative text-white px-2 py-0.5 cursor-default z-40 hover:bg-gray-600 focus:outline-none"
    :class="{'bg-gray-600': showItems}">
    <h2>{{ title }}</h2>
    <ul
      v-if="showItems"
      class="absolute top-7 left-0 py-1 flex flex-col border-white bg-gray-300 bg-opacity-95 rounded-md shadow-md overflow-hidden z-50"
      @click="$emit('close-items')">
      <slot />
    </ul>
  </button>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    title: {
      type: String,
      default: ''
    },
    showItems: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close-items']
})
</script>
