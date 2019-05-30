```jsx
import * as ZDOG from 'zdog'
import React, { useState, useEffect } from 'react'
import { Illustration, Ellipse, Anchor } from 'react-zdog'

const Content = () => {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    // Test taking an object away
    setTimeout(() => setVisible(false), 1000)
  }, [])

  return (
    <Illustration>
      {visible && <Ellipse diameter={80} stroke={20} color="#C25" />}
    </Illustration>
  )
}
```