/* eslint-disable react/prop-types */
import { TAU } from "zdog";
import { useEffect, useRef, useState } from "react";
import {
  Illustration,
  Anchor,
  Shape,
  useInvalidate,
  useZdog,
} from "react-zdog";

const side = [
  [-1, -1, 1],
  [-1, 0, 1],
  [-1, 1, 1],
  [0, -1, 1],
  [0, 1, 1],
  [1, -1, 1],
  [1, 0, 1],
  [1, 1, 1],
];
const middle = [
  [1, 1, 0],
  [1, -1, 0],
  [-1, 1, 0],
  [-1, -1, 0],
];

function Dots({ stroke = 2.5, color = "lightblue", coords, ...props }) {
  return (
    <Anchor {...props}>
      {coords.map(([x, y, z], index) => (
        <Shape
          key={index}
          stroke={stroke}
          color={color}
          translate={{ x, y, z }}
        />
      ))}
    </Anchor>
  );
}

function Box() {
  let ref = useRef(undefined);

  const [color, setColor] = useState("lightblue");

  useEffect(() => {
    const t = setInterval(() => {
      setColor((c) => (c === "lightblue" ? "red" : "lightblue"));
    }, 2000);

    return () => clearTimeout(t);
  }, []);

  return (
    <Anchor ref={ref} scale={8}>
      <Dots
        coords={side}
        translate={{ z: 0 }}
        rotate={{ y: 0 }}
        color={color}
      />
      <Dots coords={middle} />
      <Dots coords={side} translate={{ z: 0 }} rotate={{ x: TAU / 2 }} />
    </Anchor>
  );
}

const DragControl = () => {
  const invalidate = useInvalidate();

  const state = useZdog();

  useEffect(() => {
    if (state.illu) {
      state.illu.onDragMove = function () {
        invalidate();
      };
    }
  }, [state, invalidate]);

  return <></>;
};

export default function App() {
  return (
    <Illustration
      dragRotate={true}
      rotate={{ x: (TAU * -35) / 360, y: (TAU * 1) / 8 }}
      zoom={15}
      frameloop="demand"
    >
      <Box />
      <DragControl />
    </Illustration>
  );
}
