<template>
  <ol class="w-full">
    <li
      v-for="(script, i) in scripts"
      :key="i"
      class="list-inside list-decimal select-none w-full px-2 text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis hover:bg-gray-500"
      :class="{'bg-gray-500': currentIndex === i}"
      @click="$emit('select', i)">
      {{ formatScript(script) }}
    </li>
    <li
      class="select-none w-full text-center text-gray-200 hover:bg-gray-500"
      @click="$emit('add')">
      +
    </li>
  </ol>
</template>

<script lang="ts">
import { Script } from '@/common/script'
import { defineComponent, PropType } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    scripts: {
      type: Array as PropType<Script[]>,
      default: () => []
    },
    currentIndex: {
      type: Number,
      default: -1
    }
  },
  emits: ['select', 'add'],
  setup () {
    const { t } = useI18n()

    const formatScript = (script: Script) => {
      return script.fields.map(field => `${field.name}: ${field.value}`).join(', ') || t('scriptList.emptyScript')
    }

    return { formatScript }
  }
})
</script>
