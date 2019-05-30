import React, { useState, useEffect, useRef } from 'react'
import { Illustration, Ellipse, Shape, Group, useRender } from 'react-zdog'

function Content() {
  const group = useRef()
  useRender(() => (group.current.rotate.y += 0.1))

  return (
    <Group ref={group}>
      <Shape
        path={[{ x: 0, y: -8 }, { x: 8, y: 8 }, { x: -8, y: 8 }]}
        translate={{ z: 10 }}
        color="#E62"
        stroke={3}
        fill
      />
      <Ellipse diameter={20} translate={{ z: -10 }} stroke={5} color="#636" />
    </Group>
  )
}

export default function App() {
  return (
    <Illustration zoom={10}>
      <Content />
    </Illustration>
  )
}
