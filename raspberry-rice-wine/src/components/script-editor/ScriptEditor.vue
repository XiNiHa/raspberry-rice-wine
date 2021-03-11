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
import { useI18n } from 'vue-i18n'
import { useHotkey } from 'vue-use-hotkey'
import { useStore } from 'vuex'
import { getSelectedScripts, State } from '@/store'
import { Field } from '@/common/script'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const overlapFields = ref<Field[]>([])

    const selectedScript = computed(() => getSelectedScripts(store.state))

    watch(() => selectedScript.value, (v) => {
      const newOverlapFields: Field[] = []
      for (let i = 0; i < v.length; i++) {
        if (i === 0) {
          v[i].fields.forEach(field => newOverlapFields.push({
            name: field.name,
            value: field.value
          }))
        } else {
          for (let j = 0; j < newOverlapFields.length; j++) {
            const found = v[i].fields
              .filter(f => f.name === newOverlapFields[j].name &&
                f.value === newOverlapFields[j].value).length > 0

            if (!found) {
              newOverlapFields.splice(j, 1)
              j--
              if (newOverlapFields.length === 0) {
                break
              }
            }
          }
        }
      }

      overlapFields.value = newOverlapFields
    }, { immediate: true, deep: true })

    const addField = () => {
      selectedScript.value
        .forEach(script => script.fields.push({
          name: t('scriptEditor.newFieldName'),
          value: ''
        }))
    }

    const removeField = (field: Field) => {
      selectedScript.value.forEach(script => {
        const sameName = script.fields.filter(f => f.name === field.name)[0]
        const index = (sameName && script.fields.indexOf(sameName)) ?? -1
        if (index !== -1) {
          script.fields.splice(index, 1)
        }
      })
    }

    const updateName = (origName: string, e: InputEvent) => {
      const field = overlapFields.value.find(field => field.name === origName)
      if (field) {
        field.name = (e.target as HTMLInputElement).value

        selectedScript.value.forEach(script => {
          const f = script.fields.find(f => f.name === origName)

          if (f) {
            f.name = field.name
          }
        })
      }
    }

    const updateValue = (name: string, e: InputEvent) => {
      const field = overlapFields.value.find(field => field.name === name)
      if (field) {
        field.value = (e.target as HTMLInputElement).value

        selectedScript.value.forEach(script => {
          const f = script.fields.find(f => f.name === name)

          if (f) {
            f.value = field.value
          }
        })
      }
    }

    useHotkey([
      {
        keys: Array.from(store.state.hotkeyBinds.scriptEditor.newField.values()),
        exact: true,
        handler: () => addField()
      }
    ])

    return { t, store, selectedScript, overlapFields, addField, removeField, updateName, updateValue }
  }
})
</script>
