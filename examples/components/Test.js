import { TAU } from 'zdog'
import React, { useCallback, useMemo } from 'react'
import { Illustration } from 'react-zdog'
import { a, useSpring } from 'react-spring/zdog'

function makeZdogBezier(path) {
  let arr = []
  arr[0] = { x: path[0].x, y: path[0].y }
  for (let i = 1; i < path.length; i++)
    if (i % 3 === 0)
      arr.push({
        bezier: [
          { x: path[i - 2].x, y: path[i - 2].y },
          { x: path[i - 1].x, y: path[i - 1].y },
          { x: path[i].x, y: path[i].y },
        ],
      })
  const maxX = Math.max(...path.map(d => d.x))
  const maxY = Math.max(...path.map(d => d.y))
  return [arr, { x: -maxX / 2, y: -maxY / 2 }]
}

var holyeight = [
  { x: 206.4, y: 2 },
  { x: 231.6, y: 2 },
  { x: 252, y: 22.9 },
  { x: 252, y: 48.2 },
  { x: 252, y: 73.5 },
  { x: 231.6, y: 94 },
  { x: 206.4, y: 94 },
  { x: 133.6, y: 94 },
  { x: 113.6, y: 2 },
  { x: 47.6, y: 2 },
  { x: 22.4, y: 2 },
  { x: 2, y: 22.9 },
  { x: 2, y: 48.2 },
  { x: 2, y: 73.5 },
  { x: 22.4, y: 94 },
  { x: 47.6, y: 94 },
  { x: 113.6, y: 94 },
  { x: 133.6, y: 2 },
  { x: 206.4, y: 2 },
  { x: 206.4, y: 2 },
  { x: 206.4, y: 2 },
  { x: 206.4, y: 2 },
]

function SpinningBezier({ path, rotate, ...props }) {
  // Calculate & memoize bezier curve + mid-point transform
  const [curve, transform] = useMemo(() => makeZdogBezier(path), [path])
  return (
    <a.Anchor>
      <a.Shape {...props} path={curve} translate={transform} />
    </a.Anchor>
  )
}

export default function App() {
  const [{ top, ...props }, set] = useSpring(() => ({
    top: 0,
    stroke: 30,
    color: 'lightblue',
    config: { tension: 1200, friction: 100 },
  }))
  const onScroll = useCallback(e => set({ top: e.target.scrollTop }), [])
  const rotate = top.interpolate(t => ({ y: (t / (window.innerHeight * 5)) * Math.PI * 2 }))
  return (
    <>
      <Illustration
        rotate={{ x: (TAU * -35) / 360, y: (TAU * 1) / 8 }}
        element="canvas"
        zoom={2}
        onMouseEnter={e => set(true)}
        onMouseLeave={e => set(false)}>
        <SpinningBezier {...props} rotate={rotate} path={holyeight} />
      </Illustration>
      <div className="scroll-container" onScroll={onScroll}>
        <div style={{ height: '600vh' }} />
      </div>
    </>
  )
}
