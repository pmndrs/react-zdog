import { useRef, useContext, useEffect, useMemo, useState } from 'react'
import { stateContext, CanvasContext } from './canvas'

export function useRender(fn, takeOverRenderloop = false, deps = []) {
  const { subscribe, setManual } = useContext(stateContext)

  // This calls into the host to inform it whether the render-loop is manual or not
  useMemo(() => takeOverRenderloop && setManual(true), [takeOverRenderloop])

  useEffect(() => {
    // Subscribe to the render-loop
    const unsubscribe = subscribe(fn)

    return () => {
      // Call subscription off on unmount
      unsubscribe()
      if (takeOverRenderloop) setManual(false)
    }
  }, deps)
}

export function useZdog() {
  const { subscribe, ...props } = useContext(stateContext)
  return props
}
