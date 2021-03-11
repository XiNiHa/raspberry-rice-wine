<template>
  <ol class="w-full">
    <li
      v-for="(script, i) in scripts"
      :key="i"
      class="flex justify-between select-none w-full px-2 hover:bg-gray-500"
      :class="{
        'bg-gray-500': script === selectedScript.anchor,
        'bg-gray-600': selectedScript.rest?.includes(script)
      }"
      draggable="true"
      @click="selectScript(script, $event)"
      @dragstart.stop="setDrag(script)"
      @dragover.prevent
      @drop.stop="dropAt(i)">
      <span class="text-gray-200 whitespace-nowrap overflow-hidden overflow-ellipsis">
        {{ i + 1 + '. ' + formatScript(script) }}
      </span>
      <button class="float-right px-1 focus:outline-none" @click.stop="removeScript(script)">
        <i class="fas fa-times" />
      </button>
    </li>
    <li
      class="select-none w-full text-center text-sm py-1 text-gray-200 hover:bg-gray-500"
      @dragover.prevent
      @drop.stop="dropAt(scripts.length)"
      @click="addScript()">
      <i class="fas fa-plus" />
    </li>
  </ol>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Script } from '@/common/script'
import { useStore } from 'vuex'
import { Mutations, State } from '@/store'

export default defineComponent({
  emits: ['select', 'add', 'remove', 'drop'],
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const drag = ref<Script | null>(null)

    const formatScript = (script: Script) => {
      return script.fields.map(field => `${field.name}: ${field.value}`).join(', ') || t('scriptList.emptyScript')
    }

    const addScript = () => { store.commit(Mutations.AddScript) }
    const removeScript = (script: Script) => { store.commit(Mutations.RemoveScript, { script }) }
    const selectScript = (target: Script, e: MouseEvent) => {
      store.commit(Mutations.SelectScript, {
        target,
        multiSelect: e.shiftKey
      })
    }

    const setDrag = (script: Script) => { drag.value = script }
    const dropAt = (index: number) => {
      if (drag.value) {
        store.commit(Mutations.MoveScript, {
          target: drag.value,
          at: index
        })
      }
      drag.value = null
    }

    const scripts = computed(() => store.state.currentFile.scripts)
    const selectedScript = computed(() => store.state.currentFile.selectedScript)

    return { scripts, selectedScript, formatScript, addScript, removeScript, selectScript, setDrag, dropAt }
  }
})
</script>
