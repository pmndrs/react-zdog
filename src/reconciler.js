import * as ZDOG from 'zdog'
import Reconciler from 'react-reconciler'
import {
  unstable_scheduleCallback as scheduleDeferredCallback,
  unstable_cancelCallback as cancelDeferredCallback,
  unstable_now as now,
  unstable_IdlePriority as idlePriority,
  unstable_runWithPriority as run,
} from 'scheduler'

const roots = new Map()
const emptyObject = {}
const is = {
  obj: a => a === Object(a),
  str: a => typeof a === 'string',
  num: a => typeof a === 'number',
  und: a => a === void 0,
  arr: a => Array.isArray(a),
  equ(a, b) {
    // Wrong type, doesn't match
    if (typeof a !== typeof b) return false
    // Atomic, just compare a against b
    if (is.str(a) || is.num(a) || is.obj(a)) return a === b
    // Array, shallow compare first to see if it's a match
    if (is.arr(a) && a == b) return true
    // Last resort, go through keys
    let i
    for (i in a) if (!(i in b)) return false
    for (i in b) if (a[i] !== b[i]) return false
    return is.und(i) ? a === b : true
  },
}

let globalEffects = []

export function addEffect(callback) {
  globalEffects.push(callback)
}

export function renderGl(state, timestamp, repeat = 0, runGlobalEffects = false) {
  // Run global effects
  if (runGlobalEffects) globalEffects.forEach(effect => effect(timestamp) && repeat++)

  // Decrease frame count
  state.current.frames = Math.max(0, state.current.frames - 1)
  repeat += !state.current.invalidateFrameloop ? 1 : state.current.frames
  // Run local effects
  state.current.subscribers.forEach(fn => fn(state.current, timestamp))
  // Render content
  if (!state.current.manual) state.current.illustration.updateRenderGraph()
  return repeat
}

let running = false
function renderLoop(timestamp) {
  running = true
  let repeat = 0

  // Run global effects
  globalEffects.forEach(effect => effect(timestamp) && repeat++)

  roots.forEach(root => {
    const state = root.containerInfo.__state
    // If the frameloop is invalidated, do not run another frame
    if (state.current.active && state.current.ready && (!state.current.invalidateFrameloop || state.current.frames > 0))
      repeat = renderGl(state, timestamp, repeat)
  })

  if (repeat !== 0) return requestAnimationFrame(renderLoop)
  // Flag end of operation
  running = false
}

export function invalidate(state, frames = 1) {
  if (state && state.current) {
    if (state.current.vr) return
    state.current.frames = frames
  } else if (state === true) roots.forEach(root => (root.containerInfo.__state.current.frames = frames))
  if (!running) {
    running = true
    requestAnimationFrame(renderLoop)
  }
}

let catalogue = {}
export const extend = objects => (catalogue = { ...catalogue, ...objects })

export function applyProps(instance, newProps, oldProps = {}, accumulative = false) {
  // Filter equals, events and reserved props
  const container = instance.__container
  const sameProps = Object.keys(newProps).filter(key => is.equ(newProps[key], oldProps[key]))
  const handlers = Object.keys(newProps).filter(key => typeof newProps[key] === 'function' && key.startsWith('on'))
  const leftOvers = accumulative ? Object.keys(oldProps).filter(key => newProps[key] === void 0) : []
  const filteredProps = [...sameProps, 'children', 'key', 'ref'].reduce((acc, prop) => {
    let { [prop]: _, ...rest } = acc
    return rest
  }, newProps)

  // Add left-overs as undefined props so they can be removed
  leftOvers.forEach(key => (filteredProps[key] = undefined))

  if (Object.keys(filteredProps).length > 0) {
    Object.entries(filteredProps).forEach(([key, value]) => {
      if (!handlers.includes(key)) {
        let root = instance
        let target = root[key]
        if (key.includes('-')) {
          const entries = key.split('-')
          target = entries.reduce((acc, key) => acc[key], instance)
          // If the target is atomic, it forces us to switch the root
          if (!(target && target.set)) {
            const [name, ...reverseEntries] = entries.reverse()
            root = reverseEntries.reverse().reduce((acc, key) => acc[key], instance)
            key = name
          }
        }
        // Special treatment for objects with support for set/copy
        if (target && target.set && target.copy) {
          if (target.constructor.name === value.constructor.name) target.copy(value)
          else if (Array.isArray(value)) target.set(...value)
          else target.set(value)
          // Else, just overwrite the value
        } else root[key] = value

        invalidateInstance(instance)
      }
    })
    // Call the update lifecycle when it is being updated, but only when it is part of the scene
    if (instance.parent) updateInstance(instance)
  }
}

function invalidateInstance(instance) {
  if (instance.__container && instance.__container.__state) invalidate(instance.__container.__state)
}

function updateInstance(instance) {
  if (instance.__handlers && instance.__handlers.update) instance.__handlers.update(instance)
}

function createInstance(type, { args = [], ...props }, container) {
  let name = `${type[0].toUpperCase()}${type.slice(1)}`
  const target = catalogue[name] || zdog[name]
  const instance = is.arr(args) ? new target(...args) : new target(args)
  // Apply initial props
  instance.__objects = []
  instance.__container = container
  // It should NOT call onUpdate on object instanciation, because it hasn't been added to the
  // view yet. If the callback relies on references for instance, they won't be ready yet, this is
  // why it passes "false" here
  applyProps(instance, props, {})
  return instance
}

function appendChild(parentInstance, child) {
  if (child) {
    parentInstance.add(child)
    updateInstance(child)
    invalidateInstance(child)
  }
}

function insertBefore(parentInstance, child, beforeChild) {
  if (child) {
    child.parent = parentInstance
    child.dispatchEvent({ type: 'added' })
    // TODO: the order is out of whack if data objects are present, has to be recalculated
    const index = parentInstance.children.indexOf(beforeChild)
    parentInstance.children = [
      ...parentInstance.children.slice(0, index),
      child,
      ...parentInstance.children.slice(index),
    ]
    updateInstance(child)
    invalidateInstance(child)
  }
}

function removeChild(parentInstance, child) {
  if (child) {
    parentInstance.remove(child)
    invalidateInstance(child)
    run(idlePriority, () => {
      // Remove interactivity
      if (child.__container) child.__container.__interaction = child.__container.__interaction.filter(x => x !== child)
      // Remove nested child objects
      if (child.__objects) child.__objects.forEach(obj => removeChild(child, obj))
      if (child.children) child.children.forEach(obj => removeChild(child, obj))
      // Dispose item
      if (child.dispose) child.dispose()
      // Remove references
      delete child.__container
      delete child.__objects
    })
  }
}

const Renderer = Reconciler({
  now,
  createInstance,
  removeChild,
  appendChild,
  insertBefore,
  supportsMutation: true,
  isPrimaryRenderer: false,
  schedulePassiveEffects: scheduleDeferredCallback,
  cancelPassiveEffects: cancelDeferredCallback,
  appendInitialChild: appendChild,
  appendChildToContainer: appendChild,
  removeChildFromContainer: removeChild,
  insertInContainerBefore: insertBefore,
  commitUpdate(instance, updatePayload, type, oldProps, newProps, fiber) {
    applyProps(instance, newProps, oldProps, true)
  },
  hideInstance(instance) {},
  unhideInstance(instance, props) {},
  getPublicInstance(instance) {
    return instance
  },
  getRootHostContext(rootContainerInstance) {
    return emptyObject
  },
  getChildHostContext(parentHostContext, type) {
    return emptyObject
  },
  createTextInstance() {},
  finalizeInitialChildren(instance, type, props, rootContainerInstance) {
    return false
  },
  prepareUpdate(instance, type, oldProps, newProps, rootContainerInstance, hostContext) {
    return emptyObject
  },
  shouldDeprioritizeSubtree(type, props) {
    return false
  },
  prepareForCommit() {},
  resetAfterCommit() {},
  shouldSetTextContent(props) {
    return false
  },
})

export function render(element, container, state) {
  let root = roots.get(container)
  if (!root) {
    root = Renderer.createContainer(container)
    container.__state = state
    roots.set(container, root)
  }
  Renderer.updateContainer(element, root, null, undefined)
  return Renderer.getPublicRootInstance(root)
}

export function unmountComponentAtNode(container) {
  const root = roots.get(container)
  if (root) Renderer.updateContainer(null, root, null, () => roots.delete(container))
}
