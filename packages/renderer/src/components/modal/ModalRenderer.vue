<template>
  <div class="flex justify-center items-center">
    <div class="relative w-3/4 h-3/4 bg-gray-700 rounded-2xl">
      <component :is="currentComponent" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, shallowRef } from 'vue'
import { Modals, useModalStore } from '@/stores/modal'
import ImportScriptModal from './ImportScriptModal.vue'
import ExportOptionModal from './ExportOptionModal.vue'
import ExportProgressModal from './ExportProgressModal.vue'
import ColorPickerModal from './ColorPickerModal.vue'

export default defineComponent({
  setup () {
    const modalStore = useModalStore()

    const modalMap = shallowRef({
      [Modals.ImportScript]: ImportScriptModal,
      [Modals.ExportOption]: ExportOptionModal,
      [Modals.ExportProgress]: ExportProgressModal,
      [Modals.ColorPicker]: ColorPickerModal
    })

    const currentComponent = computed(() => modalStore.activeModal && modalMap.value[modalStore.activeModal])

    return { currentComponent }
  }
})
</script>
