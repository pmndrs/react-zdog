import * as ZDOG from 'zdog'
import React, { useState, useEffect } from 'react'
import { Illustration, Ellipse, Shape } from 'react-zdog'

export default function Content() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    // Test taking an object away
    setTimeout(() => setVisible(false), 1000)
  }, [])

  return (
    <Illustration zoom={10}>
      <Shape
        path={[{ x: 0, y: -8 }, { x: 8, y: 8 }, { x: -8, y: 8 }]}
        translate={{ z: 10 }}
        color="#E62"
        stroke={3}
        fill
      />
      {visible && <Ellipse diameter={20} translate={{ z: -10 }} stroke={5} color="#636" />}
    </Illustration>
  )
}
