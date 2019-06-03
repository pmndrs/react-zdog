import * as Zdog from 'zdog'
import React, { useRef } from 'react'
import { Illustration, Anchor, Ellipse, Shape, RoundedRect, Group, useRender } from 'react-zdog'

const TAU = Zdog.TAU
const Hips = React.forwardRef(({ children }, ref) => (
  <Shape ref={ref} path={[{ x: -3 }, { x: 3 }]} translate={{ y: 2 }} stroke={4} color="#636" children={children} />
))
const Leg = ({ children, ...props }) => (
  <Shape
    path={[{ y: 0 }, { y: 12 }]}
    translate={{ x: -3 }}
    rotate={{ x: TAU / 4 }}
    color="#636"
    stroke={4}
    {...props}
    children={children}
  />
)
const Foot = props => (
  <RoundedRect
    width={2}
    height={4}
    cornerRadius={1}
    translate={{ y: 14, z: 2 }}
    rotate={{ x: TAU / 4 }}
    color="#C25"
    fill
    stroke={4}
    {...props}
  />
)
const Spine = ({ children }) => <Anchor rotate={{ x: TAU / 8 }}>{children}</Anchor>
const Chest = ({ children }) => (
  <Shape path={[{ x: -1.5 }, { x: 1.5 }]} translate={{ y: -6.5 }} stroke={9} color="#C25" children={children} />
)
const Eye = props => (
  <Ellipse
    diameter={2}
    quarters={2}
    translate={{ x: -2, y: 1, z: 4.5 }}
    rotate={{ z: -TAU / 4 }}
    color="#636"
    stroke={0.5}
    backface
    {...props}
  />
)
const Head = ({ children }) => (
  <Shape stroke={12} translate={{ y: -9.5 }} color="#EA0">
    {children}
    <Ellipse
      diameter={3}
      quarters={2}
      translate={{ y: 2.5, z: 4.5 }}
      rotate={{ z: TAU / 4 }}
      closed
      color={'#FED'}
      stroke={0.5}
      fill
      backface
    />
  </Shape>
)
const Arm = ({ ...props }) => (
  <Shape
    path={[{ y: 0 }, { y: 6 }]}
    translate={{ x: -5, y: -2 }}
    rotate={{ x: -TAU / 4 }}
    color="#636"
    stroke={4}
    {...props}>
    <Shape path={[{ y: 0 }, { y: 6 }]} translate={{ y: 6 }} rotate={{ x: TAU / 8 }} color="#EA0" stroke={4} />
    <Shape translate={{ z: 6, y: 11, x: 0 }} stroke={6} color="#EA0" />
  </Shape>
)

function Content() {
  const group = useRef()
  useRender(() => (group.current.rotate.y += 0.05))
  return (
    <Hips ref={group}>
      <Leg>
        <Foot />
      </Leg>
      <Leg translate={{ x: 3 }} rotate={{ x: -TAU / 8 }}>
        <Foot rotate={{ x: -TAU / 8 }} />
      </Leg>
      <Spine>
        <Chest>
          <Head>
            <Eye />
            <Eye translate={{ x: 2, y: 1, z: 4.5 }} />
          </Head>
          <Arm />
          <Arm translate={{ x: 5, y: -2 }} rotate={{ x: TAU / 4 }} />
        </Chest>
      </Spine>
    </Hips>
  )
}

export default function App() {
  return (
    <Illustration zoom={12}>
      <Content />
    </Illustration>
  )
}
