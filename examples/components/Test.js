import { TAU } from 'zdog'
import React, { useRef } from 'react'
import { Illustration, Anchor, Shape, useRender } from 'react-zdog'
import { a, useSpring, interpolate } from 'react-spring/zdog'

function Side({ color = 'lightblue', ...props }) {
  return (
    <Anchor {...props}>
      <Shape color={color} translate={{ x: -1, y: -1, z: 1 }} />
      <Shape color={color} translate={{ x: -1, z: 1 }} />
      <Shape color={color} translate={{ x: -1, y: 1, z: 1 }} />

      <Shape color={color} translate={{ x: 0, y: -1, z: 1 }} />
      <Shape color={color} translate={{ x: 0, y: 1, z: 1 }} />
      <Shape color={color} translate={{ x: 1, y: -1, z: 1 }} />

      <Shape color={color} translate={{ x: 1, z: 1 }} />
      <Shape color={color} translate={{ x: 1, y: 1, z: 1 }} />

      <Shape color={color} translate={{ x: 1, y: 1, z: 0 }} />
      <Shape color={color} translate={{ x: 1, y: -1, z: 0 }} />

      <Shape color={color} translate={{ x: -1, y: 1, z: 0 }} />
      <Shape color={color} translate={{ x: -1, y: -1, z: 0 }} />
    </Anchor>
  )
}

/*
var keyframes = [
  { x: 0, y: 0, z: 0 },
  { x: 0, y: 0, z: TAU/4 },
  { x: -TAU/4, y: 0, z: TAU/4 },
  { x: -TAU/4, y: 0, z: TAU/2 },
];

*/

function Box() {
  //const ref = useRef(undefined)
  //useRender(() => (ref.current.rotate.y += 0.05))

  const { x, y, z } = useSpring({
    from: { x: 0, y: 0, z: 0 },
    to: async next => {
      while (true) {
        await next({ x: 0, y: 0, z: 0 })
        await next({ x: 0, y: 0, z: TAU / 4 })
        await next({ x: -TAU / 4, y: 0, z: 0 })
        await next({ x: -TAU / 4, y: 0, z: TAU / 2 })
      }
    },
    config: { mass: 2, tension: 500, friction: 100 },
  })

  return (
    <a.Anchor scale={5} rotate={interpolate([x, y, z], (x, y, z) => ({ x, y, z }))}>
      <Side translate={{ z: 0 }} rotate={{ y: 0 }} />
      <Side translate={{ z: 0 }} rotate={{ x: TAU / 2 }} />
    </a.Anchor>
  )
}

export default function App() {
  return (
    <>
      <Illustration rotate={{ x: (TAU * -35) / 360, y: (TAU * 1) / 8 }} element="canvas" zoom={20}>
        <Box />
      </Illustration>
    </>
  )
}
