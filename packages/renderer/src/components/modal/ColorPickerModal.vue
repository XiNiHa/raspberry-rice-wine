<template>
  <button class="absolute top-1 right-3 focus:outline-none" @click="close">
    <i class="fas fa-times" />
  </button>
  <div class="p-6 h-full" @mousemove="mouseMove">
    <div
      ref="slBox"
      class="relative my-6 w-full h-2/3 rounded-lg"
      :style="boxStyle"
      @mousedown="slMouseDown">
      <div class="absolute top-0 left-0 w-full h-full rounded-lg" style="background: linear-gradient(to right, #fff 0%, rgba(255,255,255,0) 100%)" />
      <div class="absolute top-0 left-0 w-full h-full rounded-lg" style="background: linear-gradient(to bottom, transparent 0%, #000 100%)" />
      <div
        class="absolute -ml-1.5 -mt-1.5 w-3 h-3 rounded-full border-2 border-gray-300 pointer-events-none z-10"
        :style="slPointerStyle" />
    </div>
    <div
      ref="hueSlider"
      class="relative my-4 w-full h-6 rounded"
      style="background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%)"
      @mousedown="hueMouseDown">
      <div
        class="absolute top-0 -ml-1.5 w-3 h-full rounded-full border-2 border-gray-300 pointer-events-none"
        :style="huePointerStyle" />
    </div>
    <div
      ref="alphaSlider"
      class="relative my-4 w-full h-6 rounded"
      style="background: linear-gradient(45deg, #ccc 25%, transparent 25%),linear-gradient(-45deg, #ccc 25%, transparent 25%),linear-gradient(45deg, transparent 75%, #ccc 75%),linear-gradient(-45deg, transparent 75%, #ccc 75%); background-size: 16px 16px; background-position: 0 0, 0 8px, 8px -8px, -8px 0px;"
      @mousedown="alphaMouseDown">
      <div class="absolute top-0 left-0 w-full h-full rounded" :style="alphaStyle" />
      <div
        class="absolute top-0 -ml-1.5 w-3 h-full rounded-full border-2 border-gray-300 pointer-events-none"
        :style="alphaPointerStyle" />
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { Modals, useModalStore } from '@/stores/modal'
import type { ModalData } from '@/stores/modal'

export default defineComponent({
  setup () {
    const modalStore = useModalStore()

    const slBox = ref<HTMLDivElement | null>(null)
    const hueSlider = ref<HTMLDivElement | null>(null)
    const alphaSlider = ref<HTMLDivElement | null>(null)

    const state = reactive({
      slMouseDown: false,
      hueMouseDown: false,
      alphaMouseDown: false
    })

    const modalData = computed(() =>
      modalStore.activeModal === Modals.ColorPicker
        ? modalStore.data as ModalData<Modals.ColorPicker>
        : null
    )
    const targetColor = computed(() => modalData.value?.target)

    const fullAlpha = computed(() => targetColor.value?.alpha(1))
    const hueOnly = computed(() => fullAlpha.value?.saturationv(100).value(100))

    const boxStyle = computed(() => ({
      backgroundColor: hueOnly.value?.toString()
    }))
    const slPointerStyle = computed(() => ({
      left: `${targetColor.value?.saturationv()}%`,
      top: `${100 - (targetColor.value?.value() ?? 0)}%`,
      backgroundColor: fullAlpha.value?.toString()
    }))
    const huePointerStyle = computed(() => ({
      left: `${(targetColor.value?.hue() ?? 0) / 360 * 100}%`,
      backgroundColor: hueOnly.value?.toString()
    }))
    const alphaStyle = computed(() => ({
      background: `linear-gradient(to right, ${fullAlpha.value?.toString()} 0%, rgba(0, 0, 0, 0) 100%)`
    }))
    const alphaPointerStyle = computed(() => ({
      left: `${(1 - (targetColor.value?.alpha() ?? 0)) * 100}%`,
      backgroundColor: targetColor.value?.toString()
    }))

    const mouseUp = () => {
      state.slMouseDown = false
      state.hueMouseDown = false
      state.alphaMouseDown = false
    }
    const registerMouseUp = () => window.addEventListener(
      'mouseup',
      () => mouseUp(),
      { once: true }
    )

    const slMouseDown = () => {
      state.slMouseDown = true
      registerMouseUp()
    }
    const hueMouseDown = () => {
      state.hueMouseDown = true
      registerMouseUp()
    }
    const alphaMouseDown = () => {
      state.alphaMouseDown = true
      registerMouseUp()
    }

    const mouseMove = (e: MouseEvent) => {
      if (targetColor.value) {
        if (state.slMouseDown) {
          const rect = slBox.value?.getBoundingClientRect()
          const localX = e.pageX - (rect?.x ?? 0)
          const localY = e.pageY - (rect?.y ?? 0)
          modalStore.updateData(
            Modals.ColorPicker,
            { target: targetColor.value.saturationv(Math.max(0, Math.min(100, localX / (slBox.value?.clientWidth ?? 0) * 100))) }
          )
          modalStore.updateData(
            Modals.ColorPicker,
            { target: targetColor.value.value(Math.max(0, Math.min(100, (1 - localY / (slBox.value?.clientHeight ?? 0)) * 100))) }
          )
        } else if (state.hueMouseDown) {
          const localX = e.pageX - (hueSlider.value?.getBoundingClientRect().x ?? 0)
          modalStore.updateData(
            Modals.ColorPicker,
            { target: targetColor.value.hue(Math.max(0, Math.min(359.99, localX / (hueSlider.value?.clientWidth ?? 0) * 360))) }
          )
        } else if (state.alphaMouseDown) {
          const localX = e.pageX - (alphaSlider.value?.getBoundingClientRect().x ?? 0)
          modalStore.updateData(
            Modals.ColorPicker,
            { target: targetColor.value.alpha(Math.max(0, Math.min(1, 1 - localX / (alphaSlider.value?.clientWidth ?? 0)))) }
          )
        }
      }
    }

    const close = () => {
      if (targetColor.value) {
        modalData.value?.callback?.(targetColor.value)
      }
      modalStore.close()
    }

    return { slBox, hueSlider, alphaSlider, boxStyle, slPointerStyle, huePointerStyle, alphaStyle, alphaPointerStyle, mouseUp, slMouseDown, hueMouseDown, alphaMouseDown, mouseMove, close }
  }
})
</script>
