<script lang="tsx">
/// <reference types="resize-observer-browser" />
import { computed, defineComponent, reactive, watch } from 'vue'
import { insertBetween } from '../../common/utils'
import { Tab } from './LayoutTypes'
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
    const state = reactive({
      wrapperWidth: 0,
      wrapperHeight: 0,
      colWidths: new Array(props.initialCols).fill(0),
      rowHeights: new Array(props.initialRows).fill(0),
      resizeObserver: null as ResizeObserver | null,
      panels: [] as (PanelData | null)[][],

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

    const handleResize: ResizeObserverCallback = ([el]) => {
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

    const dragging = computed(() => !!state.currentDrag)

    watch(() => ({ slots, rows: props.initialRows, cols: props.initialCols }), ({ slots, rows, cols }) => {
      for (let i = 0; i < rows; i++) {
        state.panels[i] = []

        for (let j = 0; j < cols; j++) {
          const currSlot = slots[`${i}-${j}`]
          if (currSlot) {
            state.panels[i][j] = {
              index: 0,
              tabs: []
            }
          } else {
            state.panels[i][j] = {
              index: 0,
              tabs: [
                { title: Math.random().toFixed(4) },
                { title: Math.random().toFixed(4) },
                { title: Math.random().toFixed(4) }
              ]
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

    const children: JSX.Element[] = []

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
      const cursor = type === EdgeDragType.Row ? 'row-resize'
        : type === EdgeDragType.Column ? 'col-resize'
          : 'move'

      return <div class="bg-black relative">
        <div class="absolute top-0 left-0 w-full h-full p-1 -m-1" style={{ cursor, zIndex: type === EdgeDragType.Both ? 2 : 1 }} onMousedown={(e) => {
          if (e.target) {
            this.state.currentEdgeDrag = { type, rowIndex, colIndex, element: e.target as Element }
          }
        }} />
      </div>
    }

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
      class="grid overflow-hidden"
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
