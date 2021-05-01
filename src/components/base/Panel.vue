<template>
  <div
    class="max-w-full max-h-full shadow flex flex-col border border-gray-900"
    @drop.prevent="drop">
    <div class="tabbar flex-shrink-0 flex items-stretch h-7 bg-gray-800 overflow-x-auto overflow-y-hidden">
      <div
        v-for="(tab, i) in tabs"
        :key="i"
        draggable="true"
        class="px-2"
        :class="getTabClasses(i)"
        @dragstart="setDrag(tab)"
        @dragenter.stop="setDropIndex(i)"
        @dragleave="removeDropIndex"
        @dragover="(e) => dragging && e.preventDefault()"
        @mousedown="$emit('select-tab', i)">
        {{ tab.title }}
      </div>
      <div
        class="flex-grow bg-gray-800"
        :class="getTabClasses(tabs.length)"
        @dragenter.stop="setDropIndex(tabs.length)"
        @dragleave="removeDropIndex"
        @dragover="(e) => dragging && e.preventDefault()" />
    </div>
    <div class="flex-grow flex-shrink bg-gray-700 relative overflow-auto">
      <div
        v-if="dragging"
        class="absolute top-0 left-0 right-0 bottom-0 transition-all bg-white"
        :class="state.tempDrop === index ? 'opacity-20' : 'opacity-0'" />
      <div
        v-if="dragging"
        class="absolute top-0 left-0 right-0 bottom-0 flex"
        @dragenter.stop="setDropIndex(index)"
        @dragleave="removeDropIndex"
        @dragover="(e) => dragging && e.preventDefault()" />
      <VNodeRenderer :vnode="currentTab?.vnode" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, nextTick, PropType, reactive, watch, computed } from 'vue'
import { Tab } from './LayoutTypes'
import VNodeRenderer from './VNodeRenderer.vue'

export default defineComponent({
  components: { VNodeRenderer },
  props: {
    dragging: {
      type: Boolean,
      default: false
    },
    index: {
      type: Number,
      default: 0
    },
    setDrag: {
      type: Function as PropType<(tab: Tab) => void>,
      default: null
    },
    tabs: {
      type: Array as PropType<Tab[]>,
      default: () => []
    },
    onDrop: {
      type: Function as PropType<(index: number) => void>,
      default: null
    },
    onSelectTab: {
      type: Function as PropType<(index: number) => void>,
      default: null
    }
  },
  emits: ['drop', 'select-tab'],
  setup (props, { emit }) {
    const state = reactive({
      tempDrop: Number.MIN_SAFE_INTEGER,
      tempDropLock: false
    })

    const drop = () => {
      if (props.dragging) {
        emit('drop', state.tempDrop)
      }
    }

    const setDropIndex = (index: number) => {
      state.tempDrop = index
      state.tempDropLock = true
      setTimeout(() => { state.tempDropLock = false }, 0)
    }

    const removeDropIndex = () => {
      if (state.tempDropLock) {
        state.tempDropLock = false
      } else {
        state.tempDrop = Number.MIN_SAFE_INTEGER
      }
    }

    watch(() => props.dragging, (v) => {
      if (!v) {
        state.tempDrop = Number.MIN_SAFE_INTEGER
      }
    })

    const getTabClasses = (index: number) => {
      const active = props.index === index
      const tempDrop = state.tempDrop === index

      if (active) {
        return ['bg-gray-700', 'rounded-t-sm', 'text-white']
      } else if (tempDrop) {
        return ['bg-gray-700', 'text-gray-400']
      } else {
        return ['bg-gray-800', 'text-gray-400']
      }
    }

    const currentTab = computed(() => props.tabs[props.index])

    return { state, drop, setDropIndex, removeDropIndex, getTabClasses, currentTab, nextTick }
  }
})
</script>

<style scoped>
.tabbar::-webkit-scrollbar {
  display: none;
  height: 200%;
}
</style>
