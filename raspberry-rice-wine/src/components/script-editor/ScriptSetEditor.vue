<template>
  <PanelWrapper
    :initial-rows="2"
    :initial-cols="2">
    <template #0-0>
      <ScriptList
        key="ScriptList"
        :title="t('scriptList.title')" />
    </template>
    <template #0-1>
      <ScriptEditor
        key="ScriptEditor"
        :title="t('scriptEditor.title')" />
    </template>
    <template #1-0>
      <ScriptMapper
        key="ScriptMapper"
        :title="t('scriptMapper.title')" />
    </template>
  </PanelWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelWrapper from '../base/PanelWrapper.vue'
import ScriptList from './ScriptList.vue'
import ScriptEditor from './ScriptEditor.vue'
import ScriptMapper from './ScriptMapper.vue'

export default defineComponent({
  components: { PanelWrapper, ScriptList, ScriptEditor, ScriptMapper },
  setup () {
    const { t } = useI18n()

    return { t }
  }
})
</script>
