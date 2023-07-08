import Zdog from 'zdog'
import React, { useRef, useEffect, useLayoutEffect } from 'react'
import { useMeasure, useZdogPrimitive, stateContext } from './hooks'
import { applyProps } from './utils'

export const Illustration = React.memo(
  ({ children, style, resize, element: Element = 'svg', frameloop = 'always', dragRotate, ...rest }) => {
    const canvas = useRef()
    const [bind, size] = useMeasure()
    const [result, scene] = useZdogPrimitive(Zdog.Anchor, children)

    const state = useRef({
      scene,
      illu: undefined,
      size: {},
      subscribers: [],
      subscribe: fn => {
        state.current.subscribers.push(fn)
        return () => (state.current.subscribers = state.current.subscribers.filter(s => s !== fn))
      },
    })

    useEffect(() => {
      state.current.size = size
      if (state.current.illu) {
        state.current.illu.setSize(size.width, size.height)
        if (frameloop === 'demand') {
          state.current.illu.updateRenderGraph()
        }
      }
    }, [size])

    useEffect(() => {
      state.current.illu = new Zdog.Illustration({
        element: canvas.current,
        dragRotate,
        ...rest,
      })
      state.current.illu.addChild(scene)
      state.current.illu.updateGraph()

      let frame
      let active = true
      function render(t) {
        const { size, subscribers } = state.current
        if (size.width && size.height) {
          // Run local effects
          subscribers.forEach(fn => fn(t))
          // Render scene
          if (frameloop !== 'demand') {
            state.current.illu.updateRenderGraph()
          }
        }
        if (active && frameloop !== 'demand') frame = requestAnimationFrame(render)
      }

      // Start render loop
      render()

      return () => {
        // Take no chances, the loop has got to stop if the component unmounts
        active = false
        cancelAnimationFrame(frame)
      }
    }, [frameloop])

    // Takes care of updating the main illustration
    useLayoutEffect(() => void (state.current.illu && applyProps(state.current.illu, rest)), [rest])

    return (
      <div
        ref={bind.ref}
        {...rest}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          boxSizing: 'border-box',
          ...style,
        }}>
        <Element
          ref={canvas}
          style={{ display: 'block', boxSizing: 'border-box' }}
          width={size.width}
          height={size.height}
        />
        {state.current.illu && <stateContext.Provider value={state} children={result} />}
      </div>
    )
  }
)
