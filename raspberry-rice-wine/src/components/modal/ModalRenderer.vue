<template>
  <div class="flex justify-center items-center">
    <div class="relative w-3/4 h-3/4 bg-gray-700 rounded-2xl">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, shallowRef } from 'vue'
import { useStore } from 'vuex'
import { State } from '@/store'
import ExportOptionModal from './ExportOptionModal.vue'
import ExportProgressModal from './ExportProgressModal.vue'
import ColorPickerModal from './ColorPickerModal.vue'

export default defineComponent({
  setup () {
    const store = useStore<State>()

    const modalMap = shallowRef({
      exportOption: ExportOptionModal,
      exportProgress: ExportProgressModal,
      colorPicker: ColorPickerModal
    })

    const currentComponent = computed(() => modalMap.value[store.state.activeModal as keyof typeof modalMap.value])

    return { modalMap, currentComponent }
  }
})
</script>
