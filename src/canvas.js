import * as ZDOG from 'zdog'
import * as React from 'react'
import { useRef, useEffect, useLayoutEffect, useState, useCallback } from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import { invalidate, applyProps, render, renderGl, unmountComponentAtNode } from './reconciler'

console.log(ZDOG)

export const stateContext = React.createContext(defaultRef)

function useMeasure() {
  const ref = useRef()
  const [bounds, set] = useState({ left: 0, top: 0, width: 0, height: 0 })
  const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
  useEffect(() => {
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref.current])
  return [{ ref }, bounds]
}

export const Illustration = React.memo(
  ({ children, config, style, onCreated, invalidateFrameloop = false, ...rest }) => {
    // Local, reactive state
    const canvas = useRef()
    const [ready, setReady] = useState(false)
    const [bind, size] = useMeasure()

    // Public state
    const state = useRef({
      ...defaultRef,
      subscribe: fn => {
        state.current.subscribers.push(fn)
        return () => (state.current.subscribers = state.current.subscribers.filter(s => s !== fn))
      },
      setManual: takeOverRenderloop => (state.current.manual = takeOverRenderloop),
      invalidate: () => invalidate(state),
    })

    // This is used as a clone of the current state, to be distributed through context and useThree
    const sharedState = useRef(state.current)

    // Writes locals into public state for distribution among subscribers, context, etc
    useEffect(() => {
      state.current.ready = ready
      state.current.size = size
      state.current.invalidateFrameloop = invalidateFrameloop
    }, [invalidateFrameloop, ready, size])

    // Component mount effect, creates the webGL render context
    useEffect(() => {
      state.current.illustration = new ZDOG.Illustration({ element: canvas.current, ...gl })

      // Start render-loop, either via RAF or setAnimationLoop for VR
      invalidate(state)

      // Clean-up
      return () => {
        state.current.active = false
        unmountComponentAtNode(state.current.scene)
      }
    }, [])

    // Adjusts default camera
    useEffect(() => {
      state.current.aspect = size.width / size.height || 0
      state.current.canvasRect = bind.ref.current.getBoundingClientRect()

      if (ready) {
        invalidate(state)
      }
      // Only trigger the context provider when necessary
      sharedState.current = { ...state.current }
    }, [ready, size, defaultCam])

    // This component is a bridge into the three render context, when it gets rendererd
    // we know we are ready to compile shaders, call subscribers, etc
    const IsReady = useCallback(() => {
      const activate = useCallback(() => void (setReady(true), invalidate(state)), [])
      useEffect(() => {
        if (onCreated) {
          const result = onCreated(state.current)
          if (result && result.then) return void result.then(activate)
        }
        activate()
      }, [])
      return null
    }, [])

    // Render v-dom into scene
    useLayoutEffect(() => {
      if (size.width > 0 && size.height > 0) {
        render(
          <stateContext.Provider value={sharedState.current}>
            <IsReady />
            {typeof children === 'function' ? children(state.current) : children}
          </stateContext.Provider>,
          state.current.illustration,
          state
        )
      }
    })

    // Render the canvas into the dom
    return (
      <div
        ref={bind.ref}
        {...rest}
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
        <canvas ref={canvas} style={{ display: 'block' }} />
      </div>
    )
  }
)
