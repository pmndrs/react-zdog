import Zdog from 'zdog'
import React from 'react'
import { useZdogPrimitive } from './hooks'

export function applyProps(instance, newProps) {
  Zdog.extend(instance, newProps)
}

export const createZdog = primitive =>
  React.forwardRef(({ children, ...rest }, ref) => useZdogPrimitive(primitive, children, rest, ref)[0])
