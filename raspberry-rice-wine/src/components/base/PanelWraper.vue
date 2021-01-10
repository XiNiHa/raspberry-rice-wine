<script lang="tsx">
/// <reference types="resize-observer-browser" />
import { computed, defineComponent, reactive } from 'vue'
import { insertBetween } from '../../common/utils'
import { Tab } from './LayoutTypes'

enum EdgeDragType { Row, Column, Both }

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
  setup (props) {
    const state = reactive({
      wrapperWidth: 0,
      wrapperHeight: 0,
      colWidths: new Array(props.initialCols).fill(0),
      rowHeights: new Array(props.initialRows).fill(0),
      resizeObserver: null as ResizeObserver | null,

      currentDrag: null as Tab | null,
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

    return { state, handleResize, cols, rows }
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

    const slot = this.$slots.default?.({
      drag: this.state.currentDrag,
      setDrag: (drag: Tab) => { this.state.currentDrag = drag }
    })
    if (slot) {
      for (let i = 0; i < colCount * rowCount; i++) {
        if (i % colCount > 0) {
          children.push(getEdge(EdgeDragType.Column, Math.floor(i / colCount), i % colCount))
        } else if (i !== 0) {
          for (let j = 0; j < colCount; j++) {
            if (j !== 0) {
              children.push(getEdge(EdgeDragType.Both, i / colCount, j))
            }

            children.push(getEdge(EdgeDragType.Row, i / colCount, j))
          }
        }

        if (i < slot.length) children.push(slot[i])
        else children.push(<div />)
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
      onMousemove={(e) => { if (this.state.currentEdgeDrag) onEdgeMove(e) }}>
      { children }
    </div>
  }
})
</script>
