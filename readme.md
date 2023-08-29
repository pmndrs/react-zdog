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
import ReactDOM from "react-dom";
import React from "react";
import { Illustration, Shape } from "react-zdog";

ReactDOM.render(
  <Illustration zoom={8}>
    <Shape stroke={20} color="lightblue" rotate={{ x: Math.PI }} />
  </Illustration>,
  document.getElementById("root")
);
```

# Illustration

The `Illustration` object is your portal into zdog. It forwards unreserved properties to the internal Zdog.Illustration instance. The component auto adjusts to re-size changes and fills out the wrapping relative/absolute parent.

```jsx
<Illustration element="svg" /> // Can be either 'svg' or 'canvas'
```

- `element`: Sets the graphics rendering DOM Element. Can be either 'svg' or 'canvas'. Default is "svg"
- `frameloop`: Determins the render loop behavior, Can be either 'always' or 'demand'. default is 'always'.
- `pointerEvents`: enables pointer events on zdog elements if set to true. Default is False.
- `style`: styles for main renderer dom elemeent container.
- `onDragStart`: callback on illustration's on drag start event listener
- `onDragMove`: callback on illustration's on drag move event listener
- `onDragEnd`: callback on illustration's on drag end event listener

And all the other props you will pass will be attached to illustration object. So any other properties or methods that you wanna set on illustration can be passed as prop as it is.

# Hooks

All hooks can only be used _inside_ the Illustration element because they rely on context updates!

#### useRender(callback, dependencies=[])

If you're running effects that need to get updated every frame, useRender gives you access to the render-loop.

```jsx
import { useRender } from "react-zdog";

function Spin({ children }) {
  const ref = useRef(undefined);
  useRender((t) => (ref.current.rotate.y += 0.01));
  return <Anchor ref={ref}>{children}</Anchor>;
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

### useInvalidate()

Gives you access to function that updates the one scene frame on each call. It is useful only if you're setting `frameloop` props on _Illustration_ component as `demand`

```jsx
function MyComponent() {
  const invalidate = useInvalidate()
  const boxRef = useRef()
  const rotate = () => {
    boxRef.current.rotate.x += 0.03;
    boxRef.current.rotate.y += 0.03; //this will update underlying javascript object
    invalidate() //But you need to call invalidate to render the changes on screen
  }

  return (
    <Box
      ref={boxRef}
      {/* ...other props */}
    />
  )}
```

# Pointer Events

React-zdog supports the Click, Pointer Move, Pointer Enter and Pointer Leave events on Zdog elemets.
To use pointer events just enable the pointer events by setting `pointerEvents` prop to `true` on `Illustration` component.

```jsx
<Illustration pointerEvents={true} />
```

and use onClick, onPointerMove, onPointerEnter and OnPointerLeave on any zdog element.

```jsx
const onClick = (e, ele) => {
  //runs when user clicks on box
};

const onPointerMove = (e, ele) => {
  //runs when user moves pointer over box
};

const onPointerEnter = (e, ele) => {
  //runs when user's pointer enters the box
};

const onPointerLeave = (e, ele) => {
  //runs when user's pointer leaves the box
};

return (
  <Box
    onClick={onClick}
    onPointerMove={onPointerMove}
    onPointerEnter={onPointerEnter}
    onPointerLeave={onPointerLeave}
  />
);
```

<div style="background-color: #ffffcc; padding: 10px; border: 1px solid #ffcc00; border-radius: 5px; color: black ">
    <strong>Note</strong>: zdog dosen't support pointer events out of the box, it is react-zdog specific feature which is added recently and was tested, but if you find some issue with events (and with any other thing) please open a issue and let us know.
</div>

# Examples

<details>
  <summary>Basic Example</summary>
  
  ```jsx
  import React, { useRef, useEffect } from 'react';
  import { Illustration, useRender, useInvalidate, Box } from 'react-zdog';

// RotatingCube Component
const RotatingCube = () => {
const boxRef = useRef();

// Use the useRender hook to continuously update the rotation
useRender(() => {
if (boxRef.current) {
boxRef.current.rotate.x += 0.03;
boxRef.current.rotate.y += 0.03;
}
});

      return (
        <Box
          ref={boxRef}
          width={50}
          height={50}
          depth={50}
          color="#E44"
          leftFace="#4E4"
          rightFace="#44E"
          topFace="#EE4"
          bottomFace="#4EE"
        />
      );

};

// App Component
const App = () => {
return (
<Illustration zoom={4}>
<RotatingCube />
</Illustration>
);
};

export default App;

````
</details>

<details>
  <summary>Pointer Events Example</summary>

  ```jsx
  import React, { useRef, useState } from 'react';
import { Illustration, useRender, Box } from 'react-zdog';

// InteractiveCube Component
const InteractiveCube = () => {
  const [isClicked, setIsClicked] = useState(false);

  const colorsBeforeClick = {
    main: "#E44",
    left: "#4E4",
    right: "#44E",
    top: "#EE4",
    bottom: "#4EE"
  };

  const colorsAfterClick = {
    main: "#FF5733",
    left: "#33FF57",
    right: "#3357FF",
    top: "#FF33A1",
    bottom: "#A133FF"
  };

  const currentColors = isClicked ? colorsAfterClick : colorsBeforeClick;

  const handleBoxClick = () => {
    setIsClicked(!isClicked);
  };


  return (
    <Box
      width={50}
      height={50}
      depth={50}
      color={currentColors.main}
      leftFace={currentColors.left}
      rightFace={currentColors.right}
      topFace={currentColors.top}
      bottomFace={currentColors.bottom}
      onClick={handleBoxClick}
    />
  );
};

// App Component
const App = () => {
  return (
    <Illustration pointerEvents={true} zoom={4}>
      <InteractiveCube />
    </Illustration>
  );
};

export default App;

````

</details>

<details>
  <summary>On Demand rendering Example</summary>

```jsx
import React, { useRef, useEffect } from "react";
import { Illustration, useInvalidate, Box } from "react-zdog";

// RotatingCube Component
const RotatingCube = () => {
  const boxRef = useRef();
  const invalidate = useInvalidate();

  useEffect(() => {
    const animate = () => {
      if (boxRef.current) {
        boxRef.current.rotate.x += 0.03;
        boxRef.current.rotate.y += 0.03;
        invalidate(); // Manually trigger a render
      }
    };

    const intervalId = setInterval(animate, 1000); // only renders the scene graph one a second instead of 60 times per second

    return () => intervalId && clearInterval(intervalId);
  }, [invalidate]);

  return (
    <Box
      ref={boxRef}
      width={50}
      height={50}
      depth={50}
      color="#E44"
      leftFace="#4E4"
      rightFace="#44E"
      topFace="#EE4"
      bottomFace="#4EE"
    />
  );
};

// App Component
const App = () => {
  return (
    <Illustration zoom={4} frameloop="demand">
      <RotatingCube />
    </Illustration>
  );
};

export default App;
```

</details>

# Roadmap

- Create more Examples
- add More events support

# Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
