<template>
  <ol class="w-full">
    <li
      v-for="(script, i) in scripts"
      :key="i"
      class="flex justify-between select-none w-full px-2 hover:bg-gray-500"
      :class="{'bg-gray-500': currentIndex === i}"
      draggable="true"
      @click="$emit('select', i)"
      @dragover.prevent>
      <span class="text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {{ i + 1 + '. ' + formatScript(script) }}
      </span>
      <button class="float-right px-1 focus:outline-none" @click.stop="$emit('remove', i)">
        <i class="fas fa-times" />
      </button>
    </li>
    <li
      class="select-none w-full text-center text-sm py-1 text-gray-200 hover:bg-gray-500"
      @click="$emit('add')">
      <i class="fas fa-plus" />
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
  emits: ['select', 'add', 'remove'],
  setup () {
    const { t } = useI18n()

    const formatScript = (script: Script) => {
      return script.fields.map(field => `${field.name}: ${field.value}`).join(', ') || t('scriptList.emptyScript')
    }

    return { formatScript }
  }
})
</script>
