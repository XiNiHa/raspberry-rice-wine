<template>
  <PanelWrapper
    :initial-rows="2"
    :initial-cols="2">
    <template #0-0>
      <ScriptList
        :title="t('scriptList.title')"
        :scripts="state.scriptSet.scripts"
        :current-index="state.scriptIndex"
        @select="state.scriptIndex = $event"
        @add="addScript" />
    </template>
    <template #0-1>
      <ScriptEditor
        v-model="state.scriptSet.scripts[state.scriptIndex]"
        :title="t('scriptEditor.title')" />
    </template>
  </PanelWrapper>
</template>

<script lang="ts">
import { ScriptSet } from '@/common/script'
import { defineComponent, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelWrapper from '../base/PanelWrapper.vue'
import ScriptList from './ScriptList.vue'
import ScriptEditor from './ScriptEditor.vue'

export default defineComponent({
  components: { PanelWrapper, ScriptList, ScriptEditor },
  setup () {
    const { t } = useI18n()
    const state = reactive({
      scriptSet: {
        name: 'My Script Set',
        scripts: [
          {
            fields: [
              {
                name: 'Main Text',
                value: 'Hello, World!'
              },
              {
                name: 'Speaker',
                value: 'XiNiHa'
              }
            ]
          },
          {
            fields: [
              {
                name: 'Main Text',
                value: 'Hello, World!'
              },
              {
                name: 'Speaker',
                value: 'XiNiHa'
              }
            ]
          },
          {
            fields: [
              {
                name: 'Main Text',
                value: 'Hello, World!'
              },
              {
                name: 'Speaker',
                value: 'XiNiHa'
              }
            ]
          }
        ]
      } as ScriptSet,
      scriptIndex: 0
    })

    const addScript = () => {
      state.scriptSet.scripts.push({
        fields: state.scriptSet.scripts[state.scriptSet.scripts.length - 1].fields.map(field => ({
          name: field.name,
          value: ''
        }))
      })
    }

    return { t, state, addScript }
  }
})
</script>
