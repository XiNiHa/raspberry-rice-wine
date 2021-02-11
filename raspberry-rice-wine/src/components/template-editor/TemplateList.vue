<template>
  <ul class="w-full">
    <li
      v-for="(template, i) in templates"
      :key="i"
      class="select-none w-full px-2 text-gray-200 hover:bg-gray-500"
      :class="{'bg-gray-500': currentIndex === i}"
      @click="$emit('select', i)">
      {{ template.name }}
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { Template } from '@/common/template'

export default defineComponent({
  props: {
    templates: {
      type: Array as PropType<Template[]>,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: -1
    }
  },
  emits: ['select']
})
</script>
