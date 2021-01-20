<template>
  <table class="w-full my-4">
    <tr
      v-for="(field, i) in state.script.fields"
      :key="i"
      class="items-center">
      <td class="px-3 w-1 whitespace-nowrap">
        <input
          v-model="field.name"
          class="text-white py-1 w-min text-right bg-transparent text-lg"
          type="text"
          :tabindex="-1"
          @blur="emitModel">
      </td>
      <td class="px-3">
        <input
          v-model="field.value"
          class="my-1 p-2 rounded-md border-2 border-gray-500 w-full"
          type="text"
          @blur="emitModel">
      </td>
    </tr>
    <tr>
      <td
        class="text-center select-none px-4"
        :colspan="2">
        <p
          class="block w-full my-4 py-2 text-2xl text-white font-bold transition-colors duration-150 rounded-md cursor-pointer hover:bg-gray-300 hover:text-gray-800"
          @click="addField">
          +
        </p>
      </td>
    </tr>
  </table>
</template>

<script lang="ts">
import { Script } from '@/common/script'
import { defineComponent, PropType, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  props: {
    modelValue: {
      type: Object as PropType<Script>,
      default: null
    }
  },
  emits: ['update:modelValue'],
  setup (props, { emit }) {
    const { t } = useI18n()

    const copyFrom = (script: Script) => ({
      ...script,
      fields: [...script.fields]
    })

    const state = reactive({
      script: copyFrom(props.modelValue)
    })

    watch(() => props.modelValue, (v) => {
      state.script = copyFrom(v)
    })

    const emitModel = () => emit('update:modelValue', state.script)

    const addField = () => {
      state.script.fields.push({
        name: t('scriptEditor.newFieldName'),
        value: ''
      })
      emitModel()
    }

    return { t, state, addField, emitModel }
  }
})
</script>
