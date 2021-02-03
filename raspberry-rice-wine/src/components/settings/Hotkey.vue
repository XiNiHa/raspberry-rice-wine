<template>
  <div class="flex flex-col text-white w-full h-full">
    <h1 class="text-2xl">
      {{ t('settings.hotkey') }}
    </h1>
    <ul class="flex flex-col w-full flex-grow my-4 bg-gray-700 overflow-y-auto shadow-inner">
      <li v-for="(hotkeys, category) in state.hotkeyBinds" :key="category" class="flex flex-col mx-4 my-2">
        <h2 class="text-xl mx-1">
          {{ t(`hotkey.${category}.title`) }}
        </h2>
        <ul class="flex flex-col w-full flex-grow my-2">
          <li v-for="(comb, key) in hotkeys" :key="key" class="flex bg-gray-800 px-2 py-1">
            <h3 class="w-1/2 px-2">
              {{ t(`hotkey.${category}.${key}`) }}
            </h3>
            <h3 class="w-1/2 border-l border-gray-500 px-2 select-none" @click="bindKeyComb(comb)">
              {{ listening ? t('settings.listening') : Array.from(comb.values()).map(s => `"${s}"`).join(' + ') }}
            </h3>
          </li>
        </ul>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { State } from '@/store'
import { computed, defineComponent, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore()

    const state = computed(() => store.state as State)
    const listening = ref(false)

    const bindKeyComb = async (originComb: Set<string>) => {
      listening.value = true

      const newComb = new Set<string>()

      /* eslint-disable prefer-const */
      let timeout: NodeJS.Timeout
      let cleanup: () => void
      let completed = false
      /* eslint-enable prefer-const */

      const clickListener = () => cleanup()
      const keyDownListener = (e: KeyboardEvent) => newComb.add(e.key)
      const keyUpListener = () => {
        if (listening.value && !completed) {
          cleanup()
          originComb.clear()
          newComb.forEach(s => originComb.add(s))
        }
      }

      cleanup = () => {
        listening.value = false
        completed = true
        window.removeEventListener('click', clickListener)
        window.removeEventListener('keydown', keyDownListener)
        window.removeEventListener('keyup', keyUpListener)
        clearTimeout(timeout)
      }

      window.addEventListener('keydown', keyDownListener)
      window.addEventListener('keyup', keyUpListener)
      setTimeout(() => window.addEventListener('click', clickListener), 0)
      timeout = setTimeout(cleanup, 5000)
    }

    return { t, state, listening, bindKeyComb }
  }
})
</script>
