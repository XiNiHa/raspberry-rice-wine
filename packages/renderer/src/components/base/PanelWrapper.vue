<script lang="tsx">
import { computed, defineComponent, reactive, watch } from 'vue'
import type { VNode } from 'vue'
import { useI18n } from 'vue-i18n'
import { insertBetween } from '@/common/utils'
import type { Tab } from './LayoutTypes'
import Panel from './Panel.vue'

enum EdgeDragType { Row, Column, Both }

interface PanelData {
  index: number;
  tabs: Tab[];
}

export default defineComponent({
  props: {
    initialRows: {
      type: Number,
      default: 3
    },
    initialCols: {
      type: Number,
      default: 3
    }
  },
  setup (props, { slots }) {
    const { t } = useI18n()

    const state = reactive({
      wrapperWidth: 0,
      wrapperHeight: 0,
      colWidths: new Array(props.initialCols).fill(0),
      rowHeights: new Array(props.initialRows).fill(0),
      resizeObserver: null as ResizeObserver | null,
      panels: [] as (PanelData | null)[][],
      keyedTabs: new Map<unknown, Tab>(),

      currentDrag: null as Tab | null,
      currentDragRow: -1,
      currentDragCol: -1,
      currentEdgeDrag: null as {
        element: Element;
        type: EdgeDragType;
        rowIndex: number;
        colIndex: number;
      } | null
    })

    const cols = computed(() => insertBetween(state.colWidths, 0))
    const rows = computed(() => insertBetween(state.rowHeights, 0))

    const handleResize = (els: readonly ResizeObserverEntry[]) => {
      if (els.length === 0) return

      const el = els[0]
      if (state.wrapperWidth !== 0) {
        const widthFraction = el.contentRect.width / state.wrapperWidth
        state.colWidths = state.colWidths.map(i => i * widthFraction)
      }
      if (state.wrapperHeight !== 0) {
        const heightFraction = el.contentRect.height / state.wrapperHeight
        state.rowHeights = state.rowHeights.map(i => i * heightFraction)
      }
      state.wrapperWidth = el.contentRect.width
      state.wrapperHeight = el.contentRect.height
    }

    const dragging = computed(() => state.currentDrag != null)

    const updatePanelTabs = (panel: PanelData, newVNodes: VNode[]) => {
      const tabs: Tab[] = panel.tabs.filter(tab => tab.vnode?.key)

      newVNodes.forEach(vnode => {
        const tab = {
          title: vnode.props?.title ?? t('common.tab'),
          vnode
        }

        if (vnode.key) {
          const tabInMap = state.keyedTabs.get(vnode.key)

          if (tabInMap) {
            tabInMap.title = tab.title
            tabInMap.vnode = vnode
          } else {
            state.keyedTabs.set(vnode.key, tab)
            tabs.push(tab)
          }
        } else {
          tabs.push(tab)
        }
      })

      panel.tabs = tabs
    }

    watch(() => ({ slots, slotContents: Object.values(slots).map(slot => slot?.()), rows: props.initialRows, cols: props.initialCols }), ({ slots, rows, cols }) => {
      for (let i = 0; i < rows; i++) {
        if (!state.panels[i]) {
          state.panels[i] = []
        }

        for (let j = 0; j < cols; j++) {
          if (!state.panels[i][j]) {
            state.panels[i][j] = {
              index: 0,
              tabs: []
            }
          }

          const currSlot = slots[`${i}-${j}`]
          if (currSlot) {
            const panelData = state.panels[i][j]
            if (panelData) {
              updatePanelTabs(panelData, currSlot())

              if (panelData.index === -1) {
                panelData.index = 0
              } else if (panelData.index >= panelData.tabs.length) {
                panelData.index = panelData.tabs.length - 1
              }
            }
          }
        }
      }
    }, { immediate: true, deep: true })

    return { state, handleResize, cols, rows, dragging }
  },
  mounted () {
    const wrapper = this.$refs.wrapper as HTMLElement
    const initColWidth = wrapper.clientWidth / this.initialCols
    const initRowHeight = wrapper.clientHeight / this.initialRows
    this.state.colWidths = this.state.colWidths.map(() => initColWidth)
    this.state.rowHeights = this.state.rowHeights.map(() => initRowHeight)

    this.state.resizeObserver = new ResizeObserver(this.handleResize)
    this.state.resizeObserver.observe(wrapper)
  },
  render () {
    const colCount = this.state.colWidths.length
    const rowCount = this.state.rowHeights.length

    const setDrag = (drag: Tab | null, i: number, j: number) => {
      this.state.currentDrag = drag
      if (drag == null) {
        this.state.currentDragRow = -1
        this.state.currentDragCol = -1
      } else {
        this.state.currentDragRow = i
        this.state.currentDragCol = j
      }
    }

    const getEdge = (type: EdgeDragType, rowIndex: number, colIndex: number) => {
      const cursor = type === EdgeDragType.Row
        ? 'row-resize'
        : type === EdgeDragType.Column
          ? 'col-resize'
          : 'move'

      return <div class="bg-black relative">
        <div class="absolute top-0 left-0 w-full h-full p-1 -m-1" style={{ cursor, zIndex: type === EdgeDragType.Both ? 2 : 1 }} onMousedown={(e) => {
          if (e.target) {
            this.state.currentEdgeDrag = { type, rowIndex, colIndex, element: e.target as Element }
          }
        }} />
      </div>
    }

    const children: ReturnType<typeof getEdge>[] = []

    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < colCount; j++) {
        const current = this.state.panels[i][j]
        if (current != null) {
          if (j > 0) {
            children.push(getEdge(EdgeDragType.Column, i, j))
          } else if (i !== 0) {
            for (let k = 0; k < colCount; k++) {
              if (k !== 0) {
                children.push(getEdge(EdgeDragType.Both, i, k))
              }

              children.push(getEdge(EdgeDragType.Row, i, k))
            }
          }

          const vnode = <Panel
            dragging={this.dragging}
            index={current.index}
            tabs={current.tabs}
            setDrag={(tab) => setDrag(tab, i, j)}
            onSelectTab={(index: number) => {
              current.index = index
            }}
            onDrop={(index: number) => {
              if (this.state.currentDrag) {
                const from = this.state.panels[this.state.currentDragRow][this.state.currentDragCol]
                const to = current

                if (!from || !to) return

                from.tabs.splice(from.tabs.indexOf(this.state.currentDrag), 1)
                to.tabs.splice(index, 0, this.state.currentDrag)
                from.index = Math.min(Math.max(index - 1, 0), from.tabs.length - 1)
                to.index = Math.min(Math.max(index, 0), to.tabs.length - 1)
                this.state.currentDrag = null
              }
            }} />

          children.push(vnode)
        }
      }
    }

    const onEdgeMove = (e: MouseEvent) => {
      const drag = this.state.currentEdgeDrag
      if (!drag) return

      if (drag.type === EdgeDragType.Column || drag.type === EdgeDragType.Both) {
        this.state.colWidths[drag.colIndex - 1] += e.movementX
        this.state.colWidths[drag.colIndex] -= e.movementX
      }
      if (drag.type === EdgeDragType.Row || drag.type === EdgeDragType.Both) {
        this.state.rowHeights[drag.rowIndex - 1] += e.movementY
        this.state.rowHeights[drag.rowIndex] -= e.movementY
      }
    }

    return <div
      class="grid overflow-hidden h-full"
      style={{
        gridTemplateColumns: this.cols.map(i => i + 'px').join(' '),
        gridTemplateRows: this.rows.map(i => i + 'px').join(' ')
      }}
      ref="wrapper"
      onMouseup={() => { this.state.currentEdgeDrag = null }}
      onMousemove={(e) => { if (this.state.currentEdgeDrag) onEdgeMove(e) }}
      onDragend={() => setDrag(null, -1, -1)}>
      { children }
    </div>
  }
})
</script>
