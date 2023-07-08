import React, {
  useContext,
  useRef,
  useEffect,
  useLayoutEffect,
  useState,
  useImperativeHandle,
  useCallback,
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { applyProps } from './utils'

export const stateContext = React.createContext()
export const parentContext = React.createContext()

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
  const [node] = useState(() => new primitive(props))

  useImperativeHandle(ref, () => node)
  useLayoutEffect(() => {
    applyProps(node, props)
    if (parent) {
      state.current.illu.updateRenderGraph()
    }
  }, [props])

  useLayoutEffect(() => {
    if (parent) {
      parent.addChild(node)
      state.current.illu.updateGraph()
      return () => {
        parent.removeChild(node)
        parent.updateFlatGraph()
        state.current.illu.updateGraph()
      }
    }
  }, [parent])
  return [<parentContext.Provider value={node} children={children} />, node]
}

export function useInvalidate() {
  const state = useZdog()

  const invalidate = useCallback(() => state.illu.updateRenderGraph(), [state])

  return invalidate
}
