<template>
  <li class="flex" @click="handleClick">
    <button class="whitespace-nowrap flex-grow mx-1 px-2 py-1 min-w-min rounded-md text-left text-sm text-gray-800 cursor-default hover:bg-blue-500 hover:text-gray-100 focus:outline-none" style="min-width: 150px;">
      <span v-if="checked != null" class="inline-block w-5 mr-0.5">
        <i v-show="checked" class="fas fa-check text-xs" />
      </span>
      {{ t(`toolbar.${path}`) }}
    </button>
  </li>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { State } from '@/store'
import toolbarHandler from '@/common/toolbarHandler'

export default defineComponent({
  props: {
    path: {
      type: String,
      default: ''
    },
    checked: {
      type: Boolean,
      default: null
    }
  },
  setup (props) {
    const { t } = useI18n()
    const router = useRouter()
    const store = useStore<State>()

    const handleClick = () => toolbarHandler(props.path, { router, store })

    return { t, handleClick }
  }
})
</script>
