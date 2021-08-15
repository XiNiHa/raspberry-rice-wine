<template>
  <div class="flex flex-col items-center justify-between h-full py-10 relative">
    <h1 class="text-2xl text-gray-200">
      {{ t('importScriptModal.title') }}
    </h1>
    <button class="absolute top-2 right-4" @click="closeModal">
      <i class="fas fa-times" />
    </button>
    <div class="flex-grow min-h-0 w-full p-6 flex">
      <div class="w-1/2 bg-gray-200 rounded h-full p-2 whitespace-pre overflow-y-auto">
        {{ importText }}
      </div>
      <div class="w-1/2 pl-4 flex flex-col h-full">
        <div class="flex flex-col h-1/2">
          <h2 class="text-md text-gray-200 pb-2">
            {{ t('importScriptModal.fields') }}
          </h2>
          <div class="flex flex-col items-stretch flex-grow overflow-y-auto bg-gray-600 rounded">
            <div v-for="(_, i) in fieldsLengthArr" :key="i + 1" class="p-2 flex items-center">
              <input v-model="state.fields[i]" class="flex-grow rounded p-1">
              <button
                class="ml-1 w-6 h-6 rounded-full hover:bg-gray-500 focus:outline-none focus:bg-gray-500"
                @click="state.fields.splice(i, 1)">
                <i class="fas fa-times" />
              </button>
            </div>
            <button
              class="py-1 rounded hover:bg-gray-500 focus:outline-none focus:bg-gray-500"
              @click="state.fields.push('')">
              <i class="fas fa-plus" />
            </button>
          </div>
        </div>
        <div class="flex flex-col h-1/2">
          <h2 class="text-md text-gray-200 py-2">
            {{ t('importScriptModal.pattern') }}
          </h2>
          <div class="flex flex-col items-stretch flex-grow bg-gray-600 p-2 rounded">
            <div
              ref="patternInput"
              contenteditable
              class="rounded-md py-2 px-2 bg-white overflow-x-auto whitespace-nowrap" />
            <div class="flex flex-wrap py-1 overflow-y-auto">
              <div
                v-for="(field, i) in state.fields"
                :key="i"
                class="rounded-lg bg-gray-400 my-1 px-2 py-1 mx-1 select-none whitespace-pre hover:bg-opacity-90"
                @click="addBadge(field)">
                {{ field || ' ' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="w-4/5 py-2 rounded bg-gray-400" @click="importScript">
      {{ t('importScriptModal.import') }}
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import type { State } from '@/store'
import { loadScript } from '@/common/loader'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const state = reactive({
      fields: [] as string[]
    })

    const patternInput = ref<HTMLDivElement | null>(null)

    const importText = computed(() => store.state.importText)
    const fieldsLengthArr = computed(() => Array(state.fields.length).fill(0))

    const addBadge = (field: string) => {
      const selection = window.getSelection()

      const badge = document.createElement('span')
      badge.setAttribute('contenteditable', 'false')
      badge.className = 'rounded-lg bg-gray-400 p-1 select-none'
      badge.innerText = field
      badge.onclick = () => patternInput.value?.removeChild(badge)

      if (selection?.anchorNode && patternInput.value && selection.type === 'Caret' && (selection.anchorNode === patternInput.value || Array.from<Node>(patternInput.value?.childNodes).includes(selection.anchorNode))) {
        if (selection.anchorNode === patternInput.value) {
          patternInput.value.appendChild(badge)
        } else if (selection.anchorNode.nodeType === Node.TEXT_NODE) {
          if (!selection.anchorNode.textContent || selection.anchorOffset === selection.anchorNode.textContent.length) {
            const nextNode = selection.anchorNode.nextSibling
            nextNode ? patternInput.value.insertBefore(badge, nextNode) : patternInput.value.appendChild(badge)
          } else {
            const beforeText = selection.anchorNode.textContent.substring(0, selection.anchorOffset)
            const afterText = selection.anchorNode.textContent.substring(selection.anchorOffset)

            const beforeNode = document.createTextNode(beforeText)
            const afterNode = document.createTextNode(afterText)

            patternInput.value.insertBefore(beforeNode, selection.anchorNode)
            patternInput.value.insertBefore(badge, selection.anchorNode)
            patternInput.value.insertBefore(afterNode, selection.anchorNode)
            patternInput.value.removeChild(selection.anchorNode)
          }
        } else {
          patternInput.value.insertBefore(badge, selection.anchorNode)
        }
      } else {
        patternInput.value?.appendChild(badge)
      }
    }

    const importScript = () => {
      const parts: string[] = []
      const mappings: Record<number, string> = {}
      let fieldCount = 0

      patternInput.value?.childNodes.forEach(node => {
        switch (node.nodeType) {
          case Node.TEXT_NODE: {
            if (node.textContent) {
              parts.push(node.textContent)
            }
            break
          }
          case Node.ELEMENT_NODE: {
            const el = node as HTMLElement
            fieldCount++
            mappings[fieldCount] = el.innerText
            parts.push('(.+)')
          }
        }
      })

      const scripts = loadScript({
        input: importText.value ?? '',
        // &nbsp; to normal space
        pattern: parts.join('').replaceAll(' ', ' '),
        mappings
      })

      store.state.currentFile?.scripts.push(...scripts)
      closeModal()
    }

    const closeModal = () => {
      store.state.importText = null
      store.state.activeModal = ''
    }

    return { t, state, patternInput, importText, fieldsLengthArr, addBadge, importScript, closeModal }
  }
})
</script>
