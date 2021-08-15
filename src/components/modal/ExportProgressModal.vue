<template>
  <div class="flex flex-col items-center h-full">
    <h1 class="text-2xl text-gray-200 my-10">
      {{ t('exportProgressModal.title') }}
    </h1>
    <div class="flex flex-col justify-center items-center w-full flex-grow">
      <div class="w-4/5 h-2 rounded-full bg-white overflow-hidden">
        <div class="bg-green-400 h-full border-gray-400 border-r" :style="{ width: `${progress}%`, transition: 'width 1s' }" />
      </div>
      <span class="my-2 text-lg text-white">
        {{ `${state.currentIndex + 1} / ${totalCount}` }}
      </span>
    </div>
    <div class="w-0 h-0 overflow-hidden">
      <div ref="renderArea" class="flex justify-center items-center relative" :style="renderAreaStyles">
        <Renderer :root="currentTemplate" :textbox-mappings="textboxMappings" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, nextTick, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import html2canvas from 'html2canvas'
import type { State } from '@/store'
import Renderer from '../base/Renderer.vue'

export default defineComponent({
  components: { Renderer },
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const state = reactive({
      currentIndex: 0
    })

    const renderArea = ref<HTMLElement | null>()

    const currentScript = computed(() => store.state.currentFile.scripts[state.currentIndex])
    const currentTemplate = computed(() => currentScript.value.template)
    const textboxMappings = computed(() => Object.fromEntries(
      Object.entries(currentScript.value.mappings)
        .map(([fieldName, box]) =>
          [box, currentScript.value.fields.filter(field => field.name === fieldName)[0].value])))
    const totalCount = computed(() => store.state.currentFile.scripts.length)
    const progress = computed(() => (state.currentIndex + 1) / totalCount.value * 100)
    const renderAreaStyles = computed(() => ({
      width: currentTemplate.value?.width + 'px',
      height: currentTemplate.value?.height + 'px'
    }))

    ;(async () => {
      for (; state.currentIndex < totalCount.value; state.currentIndex++) {
        await nextTick()

        if (renderArea.value) {
          const result = await html2canvas(renderArea.value, { backgroundColor: null })
          const dataUrl = result.toDataURL('image/png')
          await window.fileIo.save({
            path: `${store.state.exportData.targetDir}/${store.state.exportData.formatter?.(state.currentIndex + 1)}`,
            encoding: 'base64url',
            data: dataUrl
          })
        }
      }

      store.state.activeModal = ''
    })()

    return { t, state, progress, currentTemplate, textboxMappings, renderArea, totalCount, renderAreaStyles }
  }
})
</script>
