<template>
  <div class="w-full h-full flex justify-center items-center">
    <Renderer v-if="layer" :root="layer" />
    <span v-else class="select-none text-gray-300">
      {{ t('layerPreview.noLayerSelected') }}
    </span>
  </div>
</template>

<script lang="tsx">
import { computed, defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'
import Renderer from '../base/Renderer.vue'

export default defineComponent({
  components: { Renderer },
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const layer = computed(() => store.state.currentFile.selectedLayer)

    return { t, layer }
  }
})
</script>
