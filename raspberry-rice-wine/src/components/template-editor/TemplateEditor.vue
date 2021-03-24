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
    </template>
    <template #1-0>
      <Hierarchy
        key="Hierarchy"
        :title="t('hierarchy.title')" />
    </template>
  </PanelWrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelWrapper from '../base/PanelWrapper.vue'
import LayerPreview from './LayerPreview.vue'
import PropEditor from './PropEditor.vue'
import Hierarchy from './Hierarchy.vue'

export default defineComponent({
  components: { PanelWrapper, LayerPreview, PropEditor, Hierarchy },
  setup () {
    const { t } = useI18n()

    return { t }
  }
})
</script>
