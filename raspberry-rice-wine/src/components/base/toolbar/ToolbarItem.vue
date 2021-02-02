<template>
  <li>
    <button class="whitespace-nowrap mx-1 px-2 py-1 min-w-min rounded-md text-left text-sm text-gray-800 cursor-default hover:bg-blue-500 hover:text-gray-100 focus:outline-none" style="min-width: 150px;">
      <span v-if="checked != null" class="inline-block w-5 mr-0.5">
        <i v-show="checked" class="fas fa-check text-xs" />
      </span>
      <slot />
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    checked: {
      type: Boolean,
      default: null
    }
  }
})
</script>
