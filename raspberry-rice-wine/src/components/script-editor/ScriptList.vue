<template>
  <ol class="w-full">
    <li
      v-for="(script, i) in scripts"
      :key="i"
      class="flex justify-between select-none w-full px-2 hover:bg-gray-500"
      :class="{'bg-gray-500': currentIndex === i}"
      draggable="true"
      @click="$emit('select', i)"
      @dragstart.stop="setDrag(i)"
      @dragover.prevent
      @drop.stop="dropAt(i)">
      <span class="text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {{ i + 1 + '. ' + formatScript(script) }}
      </span>
      <button class="float-right px-1 focus:outline-none" @click.stop="$emit('remove', i)">
        <i class="fas fa-times" />
      </button>
    </li>
    <li
      class="select-none w-full text-center text-sm py-1 text-gray-200 hover:bg-gray-500"
      @dragover.prevent
      @drop.stop="dropAt(scripts.length)"
      @click="$emit('add')">
      <i class="fas fa-plus" />
    </li>
  </ol>
</template>

<script lang="ts">
import { Script } from '@/common/script'
import { defineComponent, PropType, ref } from 'vue'
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
  emits: ['select', 'add', 'remove', 'drop'],
  setup (props, { emit }) {
    const { t } = useI18n()

    const drag = ref(-1)

    const formatScript = (script: Script) => {
      return script.fields.map(field => `${field.name}: ${field.value}`).join(', ') || t('scriptList.emptyScript')
    }

    const setDrag = (index: number) => { drag.value = index }
    const dropAt = (index: number) => {
      emit('drop', {
        target: drag.value,
        at: index
      })
      drag.value = -1
    }

    return { formatScript, setDrag, dropAt }
  }
})
</script>
