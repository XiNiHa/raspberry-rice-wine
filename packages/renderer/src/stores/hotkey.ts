import { defineStore } from 'pinia'

type HotkeyCategoryType<T extends string> = {
  [K in T]: Set<string>
}

type HotkeyIdMap = {
  scriptEditor: 'newField'
}

type HotkeyMap = {
  scriptEditor: HotkeyCategoryType<HotkeyIdMap['scriptEditor']>
}

export type HotkeyCategoryId = keyof HotkeyMap
export type HotkeyId<T extends HotkeyCategoryId> = HotkeyIdMap[T]

export const useHotkeyStore = defineStore('hotkey', {
  state: () => ({
    keybinds: {
      scriptEditor: {
        newField: new Set(['Shift', '+'])
      }
    } as HotkeyMap
  }),

  actions: {
    updateKeybind <T extends HotkeyCategoryId> (category: T, id: HotkeyId<T>, comb: Set<string>) {
      const oldSet = this.keybinds[category][id]

      oldSet.clear()
      comb.forEach(key => oldSet.add(key))
    }
  }
})
