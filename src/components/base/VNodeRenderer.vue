<script lang="ts">
import { defineComponent } from 'vue'
import type { PropType, VNode } from 'vue'

export default defineComponent({
  props: {
    vnode: {
      type: Object as PropType<VNode>,
      default: null
    }
  },
  render () {
    return this.vnode
  }
})
</script>
