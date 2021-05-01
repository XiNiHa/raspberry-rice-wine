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
import { computed, defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { State } from '@/store'

export default defineComponent({
  setup () {
    const { t } = useI18n()
    const store = useStore()

    const state = computed(() => store.state as State)
    const listening = ref(false)

    const bindKeyComb = async (originComb: Set<string>) => {
      listening.value = true

      const newComb = new Set<string>()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const listeners = {} as Record<string, (e: any) => unknown>

      // eslint-disable-next-line prefer-const
      let timeout: ReturnType<typeof setTimeout>
      let completed = false

      const cleanup = () => {
        listening.value = false
        completed = true
        for (const [type, handler] of Object.entries(listeners)) {
          window.removeEventListener(type, handler)
        }
        clearTimeout(timeout)
      }

      listeners.click = () => cleanup()
      listeners.keydown = (e: KeyboardEvent) => newComb.add(e.key)
      listeners.keyup = () => {
        if (listening.value && !completed) {
          cleanup()
          originComb.clear()
          newComb.forEach(s => originComb.add(s))
        }
      }

      setTimeout(() => {
        for (const [type, handler] of Object.entries(listeners)) {
          window.addEventListener(type, handler)
        }
      }, 0)
      timeout = setTimeout(cleanup, 5000)
    }

    return { t, state, listening, bindKeyComb }
  }
})
</script>
