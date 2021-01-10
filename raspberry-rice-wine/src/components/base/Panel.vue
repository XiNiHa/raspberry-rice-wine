<template>
  <div class="m-1 shadow flex flex-col">
    <div class="flex">
      <div
        v-for="(tab, i) in state.tabs"
        :key="i"
        draggable="true"
        class="px-2"
        :class="[
          ...getTempDropClasses(i),
          ...getActiveClasses(i)
        ]"
        @dragstart="setDrag(tab)"
        @dragenter.stop="addTempDrop(i)"
        @dragleave="removeTempDrop(i)"
        @dragover.prevent
        @drop.prevent.stop="dropAt(i)"
        @mousedown="state.activeIndex = i">
        {{ tab.title }}
      </div>
      <div
        class="flex-grow bg-gray-200"
        :class="getTempDropClasses(state.tabs.length)"
        @dragenter.stop="addTempDrop(state.tabs.length)"
        @dragleave="removeTempDrop(state.tabs.length)"
        @dragover.prevent
        @drop.prevent.stop="dropAt(state.tabs.length)" />
    </div>
    <div class="flex-grow bg-white">

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, Prop, reactive, watch } from 'vue'
import { Tab } from './LayoutTypes'

export default defineComponent({
  props: {
    drag: {
      type: Object,
      default: null
    } as Prop<Tab | null>
  },
  emits: ['set-drag', 'complete-drag'],
  setup (props, { emit }) {
    const state = reactive({
      tabs: [
        { title: Math.random().toFixed(2) },
        { title: Math.random().toFixed(2) },
        { title: Math.random().toFixed(2) }
      ] as Tab[],
      tempDrops: [] as number[],
      activeIndex: 0,
      selfHandled: false
    })

    const setDrag = (tab: Tab) => emit('set-drag', tab)

    const dropAt = (index: number) => {
      if (props.drag) {
        const old = state.tabs.indexOf(props.drag)

        if (old !== -1) {
          state.tabs.splice(index, 0, state.tabs.splice(old, 1)[0])
        } else {
          state.tabs.splice(index, 0, props.drag)
        }

        state.selfHandled = true
        state.activeIndex = Math.min(index, state.tabs.length - 1)
        emit('complete-drag')
      }
    }

    const addTempDrop = (index: number) => state.tempDrops.push(index)

    const removeTempDrop = (index: number) => {
      const innerIndex = state.tempDrops.indexOf(index)
      if (innerIndex !== -1) {
        state.tempDrops.splice(innerIndex, 1)
      }
    }

    const handleDrop = (prev?: Tab | null) => {
      if (state.selfHandled) {
        state.selfHandled = false
      } else if (prev) {
        const index = state.tabs.indexOf(prev)
        if (index !== -1) {
          if (index >= state.tabs.length - 1) {
            state.activeIndex = state.tabs.length - 2
          }
          state.tabs.splice(index, 1)
        }
      }
      state.tempDrops.splice(0)
    }

    const getActiveClasses = (index: number) => state.activeIndex === index
      ? ['bg-white', 'border-l', 'border-t', 'border-r', 'border-gray-400', 'rounded-t-sm']
      : ['bg-gray-200', 'border', 'border-transparent']
    const getTempDropClasses = (index: number) => state.tempDrops.includes(index) && state.activeIndex !== index ? ['bg-gray-300'] : []

    watch(() => props.drag, (v, prev) => {
      if (v == null) { handleDrop(prev) }
    })

    return { state, setDrag, dropAt, addTempDrop, removeTempDrop, getActiveClasses, getTempDropClasses, nextTick }
  }
})
</script>
