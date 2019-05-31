import Zdog from 'zdog'
import React, { useContext, useRef, useEffect, useLayoutEffect, useState, useImperativeHandle } from 'react'
import ResizeObserver from 'resize-observer-polyfill'

const illuContext = React.createContext()
const parentContext = React.createContext()

function useMeasure() {
  const ref = useRef()
  const [bounds, set] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  })
  const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
  useEffect(() => {
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref.current])
  return [{ ref }, bounds]
}

function useRender(fn, deps = []) {
  const illu = useContext(illuContext)
  useEffect(() => {
    // Subscribe to the render-loop
    const unsubscribe = illu.current.subscribe(fn)
    // Call subscription off on unmount
    return () => unsubscribe()
  }, deps)
}

function useZdog(Primitive, children, props, ref) {
  const illu = useContext(illuContext)
  const parent = useContext(parentContext)
  const [node] = useState(() => new Primitive(props))

  useImperativeHandle(ref, () => node)
  useLayoutEffect(() => void Zdog.extend(node, props))
  useLayoutEffect(() => {
    if (parent) {
      parent.addChild(node)
      illu.current.node.updateFlatGraph()
      illu.current.node.updateGraph()
      return () => {
        parent.removeChild(node)
        parent.updateFlatGraph()
        illu.current.node.updateFlatGraph()
        illu.current.node.updateGraph()
      }
    }

    return () => void 0
  }, [parent])
  return [<parentContext.Provider value={node}>{children}</parentContext.Provider>, node]
}

const Illustration = React.memo(({ children, config, style, zoom = 1, ...rest }) => {
  const canvas = useRef()
  const canvasRef = useRef()
  const [bind, size] = useMeasure()
  const [result, node] = useZdog(Zdog.Anchor, children, rest)

  const state = useRef({
    node,
    size: {},
    zoom: 1,
    subscribers: [],
    subscribe: fn => {
      state.current.subscribers.push(fn)
      return () => {
        state.current.subscribers = state.current.subscribers.filter(s => s !== fn)
        return state.current.subscribers
      }
    },
  })
  useEffect(() => {
    state.current.size = size
    state.current.zoom = zoom
  }, [size, zoom])

  useEffect(() => {
    canvas.current = canvasRef.current.getContext('2d')
  }, [])

  useEffect(() => {
    function render(t) {
      const { size, zoom, subscribers } = state.current
      if (size.width && size.height && zoom) {
        // clear canvas
        canvas.current.clearRect(0, 0, size.width, size.height)
        canvas.current.save()
        // Run local effects
        subscribers.forEach(fn => fn(t))
        // center canvas & zoom
        canvas.current.translate(size.width / 2, size.height / 2)
        canvas.current.scale(zoom, zoom)
        // set lineJoin and lineCap to round
        canvas.current.lineJoin = 'round'
        canvas.current.lineCap = 'round'
        // render scene graph
        node.renderGraphCanvas(canvas.current)
        canvas.current.restore()
      }
    }

    function animate(t) {
      node.updateGraph()
      render(t)
      requestAnimationFrame(animate)
    }

    animate()
  }, [])

  return (
    <div
      ref={bind.ref}
      {...rest}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        ...style,
      }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} width={size.width} height={size.height} />
      <illuContext.Provider value={state}>{result}</illuContext.Provider>
    </div>
  )
})

const createZdog = primitive =>
  React.forwardRef(({ children, ...rest }, ref) => useZdog(primitive, children, rest, ref)[0])

const Anchor = createZdog(Zdog.Anchor)
const Shape = createZdog(Zdog.Shape)
const Group = createZdog(Zdog.Group)
const Rect = createZdog(Zdog.Rect)
const RoundedRect = createZdog(Zdog.RoundedRect)
const Ellipse = createZdog(Zdog.Ellipse)
const Polygon = createZdog(Zdog.Polygon)
const Hemisphere = createZdog(Zdog.Hemisphere)
const Cylinder = createZdog(Zdog.Cylinder)
const Cone = createZdog(Zdog.Cone)
const Box = createZdog(Zdog.Box)

export {
  Illustration,
  useRender,
  Anchor,
  Shape,
  Group,
  Rect,
  RoundedRect,
  Ellipse,
  Polygon,
  Hemisphere,
  Cylinder,
  Cone,
  Box,
}
