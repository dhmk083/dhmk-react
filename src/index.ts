import React from 'react'

import * as _T from './types'

export const useGetter = <T>(value: T) => {
  const ref = React.useRef<T>(value)
  ref.current = value
  return React.useCallback(() => ref.current, [])
}

type thunk = <T extends Function>(fn: T) => Readonly<{ fn: T; isThunk: true }>
const thunk: thunk = fn => ({ fn, isThunk: true })

type merge = <T extends object = any>(
  x:
    | Partial<_T.DeepReadonly<T>>
    | ((x: _T.DeepReadonly<T>) => Partial<_T.DeepReadonly<T>>),
) => (o: _T.DeepReadonly<T>) => _T.DeepReadonly<T>
const merge: merge = x => o =>
  typeof x === 'function' ? { ...o, ...x(o) } : { ...o, ...x }

type LogicHelpers = _T.DeepReadonly<{
  thunk: typeof thunk
  merge: typeof merge
}>
type LogicEntries<T, S> = _T.DeepReadonly<Record<keyof T, LogicEntry<S>>>
type LogicEntry<S> = _T.Fn<any, _T.Fn1<S, S>> | ReturnType<typeof thunk>
type useLogic = <T extends object, S>(
  fn: (helpers: LogicHelpers) => LogicEntries<T, _T.DeepReadonly<S>>,
  initial: S extends Function
    ? never
    : _T.DeepReadonly<S> | (() => _T.DeepReadonly<S>),
) => [_T.DeepReadonly<S>, _T.DeepReadonly<Record<keyof T, Function>>]
export const useLogic: useLogic = (fn, initial) => {
  const actionsRef = React.useRef()
  const [state, setState] = React.useState(() => {
    const config: any = fn({ thunk, merge })
    const actions: any = {}

    for (const k in config) {
      const entry = config[k]
      const action = entry.isThunk
        ? (...args) => entry.fn(...args)(actions, getState)
        : (...args) => setState(entry(...args))

      actions[k] = action
    }

    actionsRef.current = actions
    return typeof initial === 'function' ? initial() : initial
  })
  const getState = useGetter(state)

  return [state, actionsRef.current] as any
}
