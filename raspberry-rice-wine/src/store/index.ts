import { createStore } from 'vuex'

const state = {
  hotkeyBinds: {
    scriptEditor: {
      newField: new Set(['Shift', '+'])
    }
  }
}

export type State = typeof state

export default createStore({
  state,
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
