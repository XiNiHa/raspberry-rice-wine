<template>
  <div class="flex flex-col items-center justify-between h-full py-10 overflow-y-auto relative">
    <h1 class="text-2xl text-gray-200">
      {{ t('exportOptionModal.title') }}
    </h1>
    <div class="flex flex-col w-4/5 max-w-sm items-stretch">
      <h2 class="text-xl text-gray-200 my-4">
        {{ t('exportOptionModal.targetDirectory') }}
      </h2>
      <input
        v-model="selectedDir"
        type="text"
        class="rounded-md py-2 px-2"
        readonly
        :placeholder="t('exportOptionModal.directoryInputPlaceholder')"
        @click="fileInput?.click()">
      <input
        ref="fileInput"
        class="w-0 h-0"
        type="file"
        webkitdirectory
        @input="updateDir">
    </div>
    <div class="flex flex-col w-4/5 max-w-sm items-stretch">
      <h2 class="text-xl text-gray-200 my-4">
        {{ t('exportOptionModal.nameFormat') }}
      </h2>
      <div
        ref="formatInput"
        contenteditable
        class="rounded-md py-2 px-2 bg-white overflow-x-auto whitespace-nowrap"
        @keydown.enter.prevent />
      <div class="flex my-2">
        <div
          v-for="key in badges"
          :key="key"
          class="rounded-lg bg-gray-400 px-2 py-1 mx-1 select-none hover:bg-opacity-90"
          @click="addBadge(key)">
          {{ t(`exportOptionModal.badge.${key}`) }}
        </div>
      </div>
    </div>
    <button class="bg-gray-400 rounded-lg w-48 p-4" @click="triggerExport">
      {{ t('exportOptionModal.export') }}
    </button>
    <button class="absolute top-0 right-0 mt-4 mr-8 text-xl" @click="store.state.activeModal = ''">
      <i class="fas fa-times" />
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import type { State } from '@/store'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore<State>()

    const fileInput = ref<HTMLInputElement | null>(null)
    const formatInput = ref<HTMLDivElement | null>(null)
    const selectedDir = ref<string | null>(null)

    const badges = reactive(['year', 'scriptIndex'])

    const updateDir = () => {
      const path = fileInput.value?.files?.[0]?.path

      if (path) {
        selectedDir.value = path.substring(0, path.lastIndexOf('/'))
      }
    }

    const addBadge = (key: string) => {
      const selection = window.getSelection()

      const badge = document.createElement('span')
      badge.setAttribute('contenteditable', 'false')
      badge.className = 'rounded-lg bg-gray-400 p-1 select-none'
      badge.setAttribute('badge-key', key)
      badge.innerText = t(`exportOptionModal.badge.${key}`)
      badge.onclick = () => formatInput.value?.removeChild(badge)

      if (selection?.anchorNode && formatInput.value && selection.type === 'Caret' && (selection.anchorNode === formatInput.value || Array.from<Node>(formatInput.value?.childNodes).includes(selection.anchorNode))) {
        if (selection.anchorNode === formatInput.value) {
          formatInput.value.appendChild(badge)
        } else if (selection.anchorNode.nodeType === Node.TEXT_NODE) {
          if (!selection.anchorNode.textContent || selection.anchorOffset === selection.anchorNode.textContent.length) {
            const nextNode = selection.anchorNode.nextSibling
            nextNode ? formatInput.value.insertBefore(badge, nextNode) : formatInput.value.appendChild(badge)
          } else {
            const beforeText = selection.anchorNode.textContent.substring(0, selection.anchorOffset)
            const afterText = selection.anchorNode.textContent.substring(selection.anchorOffset)

            const beforeNode = document.createTextNode(beforeText)
            const afterNode = document.createTextNode(afterText)

            formatInput.value.insertBefore(beforeNode, selection.anchorNode)
            formatInput.value.insertBefore(badge, selection.anchorNode)
            formatInput.value.insertBefore(afterNode, selection.anchorNode)
            formatInput.value.removeChild(selection.anchorNode)
          }
        } else {
          formatInput.value.insertBefore(badge, selection.anchorNode)
        }
      } else {
        formatInput.value?.appendChild(badge)
      }
    }

    const getFormatter = () => {
      const params = {
        year: new Date().getFullYear(),
        // eslint-disable-next-line no-template-curly-in-string
        scriptIndex: '${__SCRIPT__INDEX__}'
      }

      const parts: string[] = []

      formatInput.value?.childNodes.forEach(node => {
        switch (node.nodeType) {
          case Node.TEXT_NODE: {
            if (node.textContent) {
              parts.push(node.textContent)
            }
            break
          }
          case Node.ELEMENT_NODE: {
            const el = node as HTMLElement
            const param = params[(el.getAttribute('badge-key') ?? '') as keyof typeof params]
            if (param) {
              parts.push(param.toString())
            }
          }
        }
      })

      return (scriptIndex: number) => {
        let result = ''
        for (const part of parts) {
          // eslint-disable-next-line no-template-curly-in-string
          result += part === '${__SCRIPT__INDEX__}' ? scriptIndex : part
        }

        return result
      }
    }

    const triggerExport = () => {
      if (selectedDir.value) {
        store.state.exportData.targetDir = selectedDir.value
        store.state.exportData.formatter = getFormatter()
        store.state.activeModal = 'exportProgress'
      }
    }

    return { t, store, fileInput, formatInput, updateDir, addBadge, selectedDir, badges, getFormatter, triggerExport }
  }
})
</script>
