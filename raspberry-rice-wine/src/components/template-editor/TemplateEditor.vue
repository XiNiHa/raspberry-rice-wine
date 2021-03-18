<template>
  <PanelWrapper
    :initial-rows="2"
    :initial-cols="2">
    <template #0-0>
      <LayerPreview
        key="LayerPreview"
        :title="t('layerPreview.title')" />
    </template>
    <template #0-1>
      <PropEditor
        key="PropEditor"
        :title="t('propEditor.title')" />
      <TemplateList
        key="TemplateList"
        :title="t('templateList.title')" />
    </template>
    <template #1-0>
      <LayerList
        key="LayerList"
        :title="t('layerList.title')" />
    </template>
  </PanelWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelWrapper from '../base/PanelWrapper.vue'
import LayerPreview from './LayerPreview.vue'
import PropEditor from './PropEditor.vue'
import TemplateList from './TemplateList.vue'
import LayerList from './LayerList.vue'

export default defineComponent({
  components: { PanelWrapper, LayerPreview, PropEditor, TemplateList, LayerList },
  setup () {
    const { t } = useI18n()

    return { t }
  }
})
</script>
