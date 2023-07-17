import Zdog from 'zdog'
import React, { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useMeasure, useZdogPrimitive, stateContext } from './hooks'
import { applyProps, getMousePos, getPixel } from './utils'

export const Illustration = React.memo(
  ({
    children,
    style,
    resize,
    element: Element = 'svg',
    frameloop = 'always',
    dragRotate,
    onDragMove = () => {},
    pointerEvents = false,
    ...rest
  }) => {
    const canvas = useRef()

    //ref to secondary canvas and 2d context
    const canvas_ghost = useRef()

    const [ghostCanvasContext, setGhostCanvasContext] = useState(null)

    useEffect(() => {
      setGhostCanvasContext(canvas_ghost.current.getContext('2d', { willReadFrequently: true }))
    }, [])

    const [bind, size] = useMeasure()
    const [result, scene, ghostScene] = useZdogPrimitive(Zdog.Anchor, children)

    const state = useRef({
      scene,
      illu: undefined,
      size: {},
      subscribers: [],
      subscribe: fn => {
        state.current.subscribers.push(fn)
        return () => (state.current.subscribers = state.current.subscribers.filter(s => s !== fn))
      },
      illu_ghost: undefined,
      itemMap: {},
      clickEventMap: {},
      pointerMoveEventMap: {},
      pointerEnterEventMap: {},
      pointerLeaveEventMap: {},
      pointerEvents,
    })

    useEffect(() => {
      state.current.size = size
      if (state.current.illu) {
        state.current.illu.setSize(size.width, size.height)
        state.current.illu_ghost.setSize(size.width, size.height)
        if (frameloop === 'demand') {
          state.current.illu.updateRenderGraph()
          state.current.illu_ghost.updateRenderGraph()
        }
      }
    }, [size])

    useEffect(() => {
      state.current.illu = new Zdog.Illustration({
        element: canvas.current,
        dragRotate,
        onDragMove: () => {
          state.current.illu_ghost.rotate = {
            x: state.current.illu.rotate.x,
            y: state.current.illu.rotate.y,
            z: state.current.illu.rotate.z,
          }
          onDragMove()
        },
        ...rest,
      })
      state.current.illu.addChild(scene)
      state.current.illu.updateGraph()

      state.current.illu_ghost = new Zdog.Illustration({
        element: canvas_ghost.current,
        ...rest,
      })
      state.current.illu_ghost.addChild(ghostScene)
      state.current.illu_ghost.updateGraph()

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
    useLayoutEffect(() => {
      state.current.illu && applyProps(state.current.illu, rest)
      state.current.illu_ghost && applyProps(state.current.illu_ghost, rest)
    }, [rest])

    const click = e => {
      if (!pointerEvents) return

      state.current.illu_ghost && state.current.illu_ghost.updateRenderGraph()
      const coords = getMousePos(canvas.current, e, canvas_ghost.current)
      const pixel = getPixel({ ...coords, canvasContext: ghostCanvasContext })
      const colorId = pixel.toUpperCase()
      const clickEvent = state.current.clickEventMap[colorId]
      clickEvent && clickEvent(e, state.current.itemMap[colorId])
    }

    const prevColorId = useRef(null)
    const pointerOnObj = useRef(null)

    const setPointerOnObj = newState => {
      pointerOnObj.current = newState
    }

    const pointerMove = e => {
      if (!pointerEvents) return

      state.current.illu_ghost && state.current.illu_ghost.updateRenderGraph()
      const coords = getMousePos(canvas.current, e, canvas_ghost.current)
      const pixel = getPixel({ ...coords, canvasContext: ghostCanvasContext })
      const colorId = pixel.toUpperCase()

      if (colorId !== '#000000' && prevColorId.current !== colorId && pointerOnObj.current !== colorId) {
        const pointerEnterEvent = state.current.pointerEnterEventMap[colorId]
        pointerEnterEvent && pointerEnterEvent(e, state.current.itemMap[colorId])
        setPointerOnObj(prevColorId.current)
      }

      if (
        prevColorId.current &&
        prevColorId.current !== '#000000' &&
        prevColorId.current !== colorId &&
        pointerOnObj.current
      ) {
        const pointerLeaveEvent = state.current.pointerLeaveEventMap[prevColorId.current]
        pointerLeaveEvent && pointerLeaveEvent(e, state.current.itemMap[prevColorId.current])
      }

      const pointerMoveEvent = state.current.pointerMoveEventMap[colorId]
      pointerMoveEvent && pointerMoveEvent(e, state.current.itemMap[colorId])

      prevColorId.current = colorId
    }

    return (
      <>
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
            onClick={click}
            onPointerMove={pointerMove}
          />
          {state.current.illu && <stateContext.Provider value={state} children={result} />}
        </div>
        <canvas
          ref={canvas_ghost}
          style={{
            display: 'block',
            boxSizing: 'border-box',
            opacity: '0',
            position: 'fixed',
            zIndex: '1000',
            pointerEvents: 'none',
            background: 'black',
          }}
          width={size.width}
          height={size.height}
        />
      </>
    )
  }
)
