<template>
  <table v-if="selectedScript.length > 0" class="w-full my-4">
    <colgroup>
      <col class="w-1/3">
      <col>
      <col>
    </colgroup>
    <tr
      v-for="(field, i) in overlapFields"
      :key="i"
      class="items-center">
      <td class="px-2">
        <input
          :value="field.name"
          class="text-white py-1 text-right bg-transparent text-lg w-full"
          type="text"
          :tabindex="-1"
          @input="updateName(field.name, $event)">
      </td>
      <td>
        <input
          :value="field.value"
          class="my-1 p-2 rounded-md border-2 border-gray-500 w-full"
          type="text"
          @input="updateValue(field.name, $event)">
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
import { computed, defineComponent, ref, watch } from 'vue'
import { useHotkey } from 'vue-use-hotkey'
import { useStore } from 'vuex'
import { getSelectedScripts, Mutations } from '@/store'
import type { State } from '@/store'
import { useHotkeyStore } from '@/stores/hotkey'

export default defineComponent({
  setup () {
    const store = useStore<State>()
    const hotkeyStore = useHotkeyStore()

    const overlapFields = ref<{ name: string; value?: string }[]>([])

    const selectedScript = computed(() => getSelectedScripts(store.state))

    watch(() => selectedScript.value, (v) => {
      const newOverlapFields: { name: string; value?: string }[] = []
      for (let i = 0; i < v.length; i++) {
        if (i === 0) {
          v[i].fields.forEach(field => newOverlapFields.push({
            name: field.name,
            value: field.value
          }))
        } else {
          for (let j = 0; j < newOverlapFields.length; j++) {
            const found = v[i].fields
              .filter(f => f.name === newOverlapFields[j].name)

            if (found.length <= 0) {
              newOverlapFields.splice(j, 1)
              j--
              if (newOverlapFields.length === 0) {
                break
              }
            } else if (found[0].value !== newOverlapFields[j].value) {
              newOverlapFields[j].value = undefined
            }
          }
        }
      }

      overlapFields.value = newOverlapFields
    }, { immediate: true, deep: true })

    const addField = () => store.commit(Mutations.AddField)

    const removeField = (field: { name: string }) => store.commit(
      Mutations.RemoveFields,
      { name: field.name }
    )

    const updateName = (origName: string, e: Event) => {
      const field = overlapFields.value.find(field => field.name === origName)
      if (field) {
        const newName = (e.target as HTMLInputElement).value

        store.commit(Mutations.UpdateNames, { origName, newName })
      }
    }

    const updateValue = (name: string, e: Event) => {
      const field = overlapFields.value.find(field => field.name === name)
      if (field) {
        const value = (e.target as HTMLInputElement).value

        store.commit(Mutations.UpdateValues, { name, value })
      }
    }

    useHotkey([
      {
        keys: Array.from(hotkeyStore.keybinds.scriptEditor.newField.values()),
        exact: true,
        handler: () => addField()
      }
    ])

    return { selectedScript, overlapFields, addField, removeField, updateName, updateValue }
  }
})
</script>
