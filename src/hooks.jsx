import React, {
  useContext,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useImperativeHandle,
  useCallback,
  useMemo,
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { applyProps, createProxy, generateRandomHexColor } from './utils'

export const stateContext = React.createContext()
export const parentContext = React.createContext()
const ghostParentContext = React.createContext()

export function useMeasure() {
  const ref = useRef()
  const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
  useEffect(() => {
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref.current])
  return [{ ref }, bounds]
}

export function useRender(fn, deps = []) {
  const state = useContext(stateContext)
  useEffect(() => {
    // Subscribe to the render-loop
    const unsubscribe = state.current.subscribe(fn)
    // Call subscription off on unmount
    return () => unsubscribe()
  }, deps)
}

export function useZdog() {
  const state = useContext(stateContext)
  return state.current
}

export function useZdogPrimitive(primitive, children, props, ref) {
  const state = useContext(stateContext)
  const parent = useContext(parentContext)

  const ghostParent = useContext(ghostParentContext)

  const colorId = useMemo(() => generateRandomHexColor(), [])

  const hiddenNodeProps = useMemo(() => {
    return {
      stroke: false,
      ...props,
      color: colorId,
      leftFace: colorId,
      rightFace: colorId,
      topFace: colorId,
      bottomFace: colorId,
    }
  }, [colorId, props])

  const [node] = useState(() => new primitive(props))
  const [ghost_node] = useState(() => new primitive(hiddenNodeProps))

  const syncGhostNode = (obj, prop, value, parentProp) => {
    if (parentProp) {
      ghost_node[parentProp][prop] = value
    } else {
      ghost_node[prop] = value
    }

    state.current.illu.updateRenderGraph()
  }

  const [proxyNode] = useState(() => createProxy(node, syncGhostNode))

  useImperativeHandle(ref, () => proxyNode)

  useLayoutEffect(() => {
    applyProps(node, props)
    if (parent) {
      state.current.illu.updateRenderGraph()
    }
  }, [props])

  useLayoutEffect(() => {
    applyProps(ghost_node, hiddenNodeProps)
  }, [hiddenNodeProps])

  useLayoutEffect(() => {
    if (!parent) return

    parent.addChild(node)
    state.current.illu.updateGraph()

    return () => {
      parent.removeChild(node)
      parent.updateFlatGraph()
      state.current.illu.updateGraph()
    }
  }, [parent])

  useEffect(() => {
    if (!parent) return

    state.current.itemMap[colorId] = node
    if (props.onClick) {
      state.current.clickEventMap[colorId] = props.onClick
    }
    if (props.onPointerMove) {
      state.current.pointerMoveEventMap[colorId] = props.onPointerMove
    }
    if (props.onPointerEnter) {
      state.current.pointerEnterEventMap[colorId] = props.onPointerEnter
    }
    if (props.onPointerLeave) {
      state.current.pointerLeaveEventMap[colorId] = props.onPointerLeave
    }

    return () => {
      delete state.current.itemMap[colorId]
      delete state.current.clickEventMap[colorId]
      delete state.current.pointerMoveEventMap[colorId]
      delete state.current.pointerEnterEventMap[colorId]
      delete state.current.pointerLeaveEventMap[colorId]
    }
  }, [props])

  useLayoutEffect(() => {
    if (!ghostParent) return

    ghostParent.addChild(ghost_node)
    state.current.illu_ghost.updateGraph()

    return () => {
      ghostParent.removeChild(ghost_node)
      ghostParent.updateFlatGraph()
      state.current.illu_ghost.updateGraph()
    }
  }, [ghostParent])

  return [
    <ghostParentContext.Provider key={colorId} value={ghost_node}>
      <parentContext.Provider value={node}>{children}</parentContext.Provider>
    </ghostParentContext.Provider>,
    node,
    ghost_node,
  ]
}

export function useInvalidate() {
  const state = useZdog()

  const invalidate = useCallback(() => state.illu.updateRenderGraph(), [state])

  return invalidate
}
