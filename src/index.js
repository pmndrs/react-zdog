import Zdog from 'zdog'
import { useRender, useInvalidate, useZdog } from './hooks'
import { createZdog } from './utils'
import { Illustration } from './Illustration'

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
  useInvalidate,
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
