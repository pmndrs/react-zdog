import React, { useRef, useState, useEffect } from 'react'
import { Illustration, Ellipse } from 'react-zdog'

export default function App() {
  const [visible, set] = useState(true)
  useEffect(() => {
    setTimeout(() => set(false), 1000)
    setTimeout(() => set(true), 2000)
  }, [])
  console.log(visible)
  return <Illustration zoom={1}>{visible && <Ellipse diameter={80} stroke={20} color="#ded89a" />}</Illustration>
}
