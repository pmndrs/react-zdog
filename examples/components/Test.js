import * as ZDOG from 'zdog'
import React, { useState, useEffect, useMemo } from 'react'
import { Illustration, Ellipse, Anchor } from 'react-zdog'

const Content = () => {
  return (
    <Illustration>
      <Ellipse diameter={80} stroke={20} color="#C25" />
    </Illustration>
  )
}

export default Content
