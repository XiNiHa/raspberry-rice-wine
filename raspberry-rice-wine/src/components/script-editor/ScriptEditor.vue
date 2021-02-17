<template>
  <table v-if="selectedScript" class="w-full my-4">
    <colgroup>
      <col class="w-1/3">
      <col>
      <col>
    </colgroup>
    <tr
      v-for="(field, i) in selectedScript.fields"
      :key="i"
      class="items-center">
      <td class="px-2">
        <input
          v-model="field.name"
          class="text-white py-1 text-right bg-transparent text-lg w-full"
          type="text"
          :tabindex="-1">
      </td>
      <td>
        <input
          v-model="field.value"
          class="my-1 p-2 rounded-md border-2 border-gray-500 w-full"
          type="text">
      </td>
      <td>
        <button class="mx-2 px-2" @click="removeField(field)">
          <i class="fas fa-trash-alt text-red-600" />
        </button>
      </td>
    </tr>
    <tr>
      <td
        class="text-center select-none px-4"
        :colspan="3">
        <p
          class="block w-full my-4 py-2 text-lg text-white font-bold transition-colors duration-150 rounded-md cursor-pointer hover:bg-gray-300 hover:text-gray-800"
          @click="addField">
          <i class="fas fa-plus" />
        </p>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useHotkey } from 'vue-use-hotkey'
import { useStore } from 'vuex'
import { State } from '@/store'
import { Field } from '@/common/script'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const selectedScript = computed(() => store.state.currentFile.selectedScript)

    const addField = () => {
      const _ = selectedScript.value?.fields.push({
        name: t('scriptEditor.newFieldName'),
        value: ''
      })
    }

    const removeField = (field: Field) => {
      const index = selectedScript.value?.fields.indexOf(field) ?? -1
      if (index !== -1) {
        const _ = selectedScript.value?.fields.splice(index, 1)
      }
    }

    useHotkey([
      {
        keys: Array.from(store.state.hotkeyBinds.scriptEditor.newField.values()),
        exact: true,
        handler: () => addField()
      }
    ])

    return { t, store, selectedScript, addField, removeField }
  }
})
</script>
