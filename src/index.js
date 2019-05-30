import * as Zdog from 'zdog'
import React, { useContext, useRef, useEffect, useLayoutEffect, useState } from 'react'

export const illuContext = React.createContext()
export const parentContext = React.createContext()

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

function useZdog(primitive, children, props, initial = () => undefined) {
  const [node, setNode] = useState()
  const illu = useContext(illuContext)
  const parent = useContext(parentContext)
  useLayoutEffect(() => node && void Zdog.extend(node, props))
  useLayoutEffect(() => void setNode(new primitive({ ...initial(), ...props })), [])
  useLayoutEffect(() => {
    if (node && parent) {
      window.node = node
      parent.addChild(node)
      illu.updateRenderGraph()
      return () => parent.removeChild(node)
    }
  }, [node, parent])
  return [node ? <parentContext.Provider value={node} children={children} /> : null, node]
}

export const Illustration = React.memo(({ children, config, style, ...rest }) => {
  const canvas = useRef()
  const [bind, size] = useMeasure()
  const [result, node] = useZdog(Zdog.Illustration, children, rest, () => ({ element: canvas.current }))

  /*useEffect(() => {
    if (node) {
      function animate() {
        node.updateRenderGraph()
        requestAnimationFrame(animate)
      }
      animate()
    }
  }, [node])*/

  return (
    <div
      ref={bind.ref}
      {...rest}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
      <canvas ref={canvas} style={{ display: 'block', width: '100%', height: '100%' }} />
      {node && <illuContext.Provider value={node} children={result} />}
    </div>
  )
})

export const Anchor = React.memo(({ children, ...rest }) => {
  const [bind, size] = useMeasure()
  const [result] = useZdog(Zdog.Anchor, children, rest)
  return result
})

export const Ellipse = React.memo(({ children, ...rest }) => {
  const [bind, size] = useMeasure()
  const [result] = useZdog(Zdog.Ellipse, children, rest)
  return result
})
