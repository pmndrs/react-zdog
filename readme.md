<p align="center">
  <img src="https://imgur.com/THk95vU.png" width="240" />
</p>

    npm install react-zdog
    
react-zdog is a declarative abstraction of [zdog](https://zzz.dog/), a cute pseudo 3d engine. Doing zdog in React allows you to break up your scene graph into declarative, re-usable components with clean, reactive semantics. Try a live demo [here](https://codesandbox.io/s/nervous-feather-vk9uh).

# How it looks like

```jsx
import ReactDOM from 'react-dom'
import React from 'react'
import { Illustration, Shape } from 'react-zdog'

ReactDOM.render(
  <Illustration zoom={8}>
    <Shape stroke={20} color="lightblue" />
  </Illustration>,
  document.getElementById('root')
)
```

# Api

Comming soon ... For now, this little demo [here](https://codesandbox.io/s/nervous-feather-vk9uh) has it all covered.

# Hooks

All hooks can only be used *inside* the Illustration element because they rely on context updates!

#### useRender(callback, dependencies=[])

If you're running effects that need to get updated every frame, useRender gives you access to the render-loop.

```jsx
import { useRender } from 'react-zdog'

function MyComponent() {
  // Subscribes to the render-loop, gets cleaned up automatically when the component unmounts
  useRender(t => console.log("I'm in the render-loop"))
```
