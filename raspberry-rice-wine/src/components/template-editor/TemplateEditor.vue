<template>
  <PanelWrapper
    :initial-rows="2"
    :initial-cols="2">
    <template #0-0>
      <LayerEditor
        :title="t('layerEditor.title')"
        :layer="state.selectedLayer" />
    </template>
    <template #0-1>
      <TemplateList
        :title="t('templateList.title')"
        :templates="state.templates"
        :current-index="state.selectedTemplate"
        @select="selectTemplate" />
    </template>
    <template #1-0>
      <LayerList
        :title="t('layerList.title')"
        :layers="state.templates[state.selectedTemplate].layers"
        :selected-layer="state.selectedLayer"
        @select="selectLayer" />
    </template>
  </PanelWrapper>
</template>

<script lang="ts">
import { defineComponent, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { Layer, Template } from '../../common/template'
import PanelWrapper from '../base/PanelWrapper.vue'
import LayerEditor from './LayerEditor.vue'
import TemplateList from './TemplateList.vue'
import LayerList from './LayerList.vue'

export default defineComponent({
  components: { PanelWrapper, LayerEditor, TemplateList, LayerList },
  setup () {
    const { t } = useI18n()

    const state = reactive({
      templates: [
        {
          name: '새 템플릿',
          layers: [
            {
              name: '새 레이어',
              isTextbox: false,
              children: [
                {
                  name: '텍스트 상자',
                  isTextbox: true
                }
              ],
              plainStyles: {
                width: '220px',
                height: '60px',
                backgroundColor: 'rgba(200, 40, 20, 0.7)'
              }
            }
          ]
        }
      ] as Template[],
      selectedTemplate: 0,
      selectedLayer: null as Layer | null
    })

    const selectTemplate = (index: number) => {
      state.selectedTemplate = index
      state.selectedLayer = null
    }

    const selectLayer = (layer: Layer) => {
      state.selectedLayer = layer
    }

    return { t, state, selectTemplate, selectLayer }
  }
})
</script>
