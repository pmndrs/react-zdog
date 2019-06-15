import React, { useState } from 'react'
import { Illustration } from 'react-zdog'
import { a, useSpring } from 'react-spring/zdog'
import { TAU } from 'zdog'

const boxCoords = [
  { y: -2, x: -1 },
  { y: -2, x: 3 },
  { y: -1, x: -2 },
  { y: -1, x: -1 },
  { y: -1, x: 0 },
  { y: -1, x: 2 },
  { y: 0, x: -3 },
  { y: 0, x: -2 },
  { y: 0, x: -1 },
  { y: 0, x: 0 },
  { y: 0, x: 1 },
  { y: 1, x: -2 },
  { y: 1, x: -1 },
  { y: 1, x: 0 },
  { y: 1, x: 2 },
  { y: 2, x: -1 },
  { y: 2, x: 3 },
]

function Blob({ x, y }) {
  const { translate } = useSpring({ translate: [x, y], from: { translate: [0, 0] } })
  return <a.Box translate={translate.interpolate((x, y) => ({ x, y }))} color="white" stroke={0} backface="#000" />
}

export default function App(props) {
  const [coords, setCoords] = useState({ x: -0.33 * TAU, y: -0.5 * TAU, z: -0.9 * TAU })
  return (
    <Illustration rotate={coords} zoom={98} {...props}>
      {boxCoords.map((props, i) => (
        <Blob key={i} {...props} />
      ))}
    </Illustration>
  )
}
