import React, {
  CSSProperties,
  ForwardRefExoticComponent,
  MutableRefObject,
  PropsWithChildren,
  ReactNode,
  Ref,
  RefAttributes,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import ResizeObserver from 'resize-observer-polyfill'
import * as Zdog from 'zdog'

interface Bounds {
  left: number
  top: number
  width: number
  height: number
}

type UnsubscribeFn = () => void
interface ZdogState<Primitive extends Zdog.Anchor = Zdog.Anchor> {
  scene: Primitive
  illu: Zdog.Illustration
  size: Bounds | {}
  subscribers: FrameRequestCallback[]
  subscribe: (fn: FrameRequestCallback) => UnsubscribeFn
}

type PrimitiveProps<Primitive extends typeof Zdog.Anchor> = PropsWithChildren<ConstructorParameters<Primitive>[0]>

const stateContext = React.createContext<MutableRefObject<ZdogState>>(null)
const parentContext = React.createContext<Zdog.Anchor>(null)

let globalEffects: Function[] = []
export function addEffect(callback) {
  globalEffects.push(callback)
}

export function invalidate(): void {
  // TODO: render loop has to be able to render frames on demand
}

export function applyProps(instance: Zdog.AnchorOptions, newProps: Zdog.AnchorOptions): void {
  Zdog.extend(instance, newProps)
  invalidate()
}

function useMeasure<T extends HTMLElement>(): [{ ref: MutableRefObject<T> }, Bounds] {
  const ref = useRef<T>()
  const [bounds, set] = useState<Bounds>({ left: 0, top: 0, width: 0, height: 0 })
  const [ro] = useState(() => new ResizeObserver(([entry]) => set(entry.contentRect)))
  useEffect(() => {
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [ref.current])

  return [{ ref }, bounds]
}

function useRender(fn: FrameRequestCallback, deps: any[] = []) {
  const state = useContext(stateContext)
  useEffect(() => {
    // Subscribe to the render-loop
    const unsubscribe = state.current.subscribe(fn)
    // Call subscription off on unmount
    return () => unsubscribe()
  }, deps)
}

function useZdog() {
  const state = useContext(stateContext)
  return state.current
}

function useZdogPrimitive<Primitive extends typeof Zdog.Anchor>(
  primitive: Primitive,
  children: ReactNode,
  props?: PrimitiveProps<Primitive>,
  ref?: Ref<InstanceType<Primitive>>
): [JSX.Element, InstanceType<Primitive>] {
  const state = useContext(stateContext)
  const parent = useContext(parentContext)
  const [node] = useState(() => new primitive(props) as InstanceType<Primitive>)

  useImperativeHandle(ref, () => node)
  useLayoutEffect(() => void applyProps(node, props), [props])
  useLayoutEffect(() => {
    if (parent) {
      parent.addChild(node)
      state.current.illu.updateGraph()

      return () => {
        parent.removeChild(node)
        //@ts-ignore updateFlatGraph missing in zdog types
        parent.updateFlatGraph()
        state.current.illu.updateGraph()
      }
    }
  }, [parent])
  return [<parentContext.Provider value={node} children={children} />, node]
}

export type IllustrationProps = Omit<Zdog.IllustrationOptions, 'element' | 'addTo'> &
  PropsWithChildren<{
    style?: CSSProperties
    element?: 'svg' | 'canvas'
  }>

const Illustration = React.memo<IllustrationProps>(
  ({ children, style, resize, element: Element = 'svg', dragRotate, ...rest }) => {
    const canvas = useRef()
    const [bind, size] = useMeasure<HTMLDivElement>()
    const [result, scene] = useZdogPrimitive(Zdog.Anchor, children)

    const state = useRef<ZdogState>({
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
      if (state.current.illu) state.current.illu.setSize(size.width, size.height)
    }, [size])

    useEffect(() => {
      state.current.illu = new Zdog.Illustration({ element: canvas.current, dragRotate, ...rest })
      state.current.illu.addChild(scene)
      state.current.illu.updateGraph()

      let frame
      let active = true
      const render: FrameRequestCallback = t => {
        const { size, subscribers } = state.current
        if (size.width && size.height) {
          // Run global effects
          globalEffects.forEach(fn => fn(t))
          // Run local effects
          subscribers.forEach(fn => fn(t))
          // Render scene
          state.current.illu.updateRenderGraph()
        }
        if (active) frame = requestAnimationFrame(render)
      }

      // Start render loop
      render(0)

      return () => {
        // Take no chances, the loop has got to stop if the component unmounts
        active = false
        cancelAnimationFrame(frame)
      }
    }, [])

    // Takes care of updating the main illustration
    useLayoutEffect(() => void (state.current.illu && applyProps(state.current.illu, rest)), [rest])

    return (
      <div
        ref={bind.ref}
        {...rest}
        style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}>
        <Element ref={canvas} style={{ display: 'block' }} width={size.width} height={size.height} />
        {state.current.illu && <stateContext.Provider value={state} children={result} />}
      </div>
    )
  }
)
type ZdogComponent<Primitive extends typeof Zdog.Anchor> = ForwardRefExoticComponent<
  Omit<PrimitiveProps<Primitive>, 'addTo'> & RefAttributes<InstanceType<Primitive>>
>
const createZdog = <Primitive extends typeof Zdog.Anchor>(primitive: Primitive): ZdogComponent<Primitive> =>
  React.forwardRef<InstanceType<Primitive>, PrimitiveProps<Primitive>>(
    ({ children, ...rest }, ref) => useZdogPrimitive(primitive, children, rest, ref)[0]
  )

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
  useZdog,
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
