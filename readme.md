<p align="center">
  <img src="https://imgur.com/THk95vU.png" width="240" />
</p>

    npm install zdog react-zdog
    # or
    yarn add zdog react-zdog

![npm](https://img.shields.io/npm/v/react-zdog.svg?style=flat-square) ![npm](https://img.shields.io/npm/dt/react-zdog.svg?style=flat-square)

react-zdog is a declarative abstraction of [zdog](https://zzz.dog/), a cute pseudo 3d-engine. Doing zdog in React allows you to break up your scene graph into declarative, re-usable components with clean, reactive semantics. Try a live demo [here](https://codesandbox.io/s/nervous-feather-vk9uh).

# How it looks like

```jsx
import ReactDOM from 'react-dom'
import React from 'react'
import { Illustration, Shape } from 'react-zdog'

ReactDOM.render(
  <Illustration zoom={8}>
    <Shape stroke={20} color="lightblue" rotate={{ x: Math.PI }} />
  </Illustration>,
  document.getElementById('root')
)
```

# API

Coming soon ... For now, this little demo [here](https://codesandbox.io/s/nervous-feather-vk9uh) has it all covered. react-zdog basically forwards props to zdog primitives, anything you can do in zdog is possible here, too.

## Illustration

The `Illustration` object is your portal into zdog. It forwards unreserved properties to the internal Zdog.Illustration instance. The component auto adjusts to re-size changes and fills out the wrapping relative/absolute parent. 

```jsx
<Canvas element="svg" /> // Can be either 'svg' or 'canvas'
```

# Hooks

All hooks can only be used _inside_ the Illustration element because they rely on context updates!

#### useRender(callback, dependencies=[])

If you're running effects that need to get updated every frame, useRender gives you access to the render-loop.

```jsx
import { useRender } from 'react-zdog'

function Spin({ children }) {
  const ref = useRef(undefined)
  useRender(t => ref.current.rotate.y += 0.01)
  return (
    <Anchor ref={ref}>
      {children}
    </Anchor>
  )
}
```

#### useZdog()

Gives you access to the underlying state-model.

```jsx
import { useZdog } from 'react-zdog'

function MyComponent() {
  const {
    illu,             // The parent Zdog.Illustration object
    scene,            // The Zdog.Anchor object that's being used as the default scene
    size,             // Current canvas size
  } = useZdog()
```
