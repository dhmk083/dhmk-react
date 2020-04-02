import React from 'react'
import { render, act } from '@testing-library/react'

import * as hooks from './index'

test('useGetter', () => {
  const cb = jest.fn()

  const Comp = ({ prop }) => {
    const getProp = hooks.useGetter(prop)
    cb(getProp)
    return <div>{getProp()}</div>
  }

  const { container, rerender } = render(<Comp prop={1} />)
  const text = container.firstChild!
  expect(text.textContent).toBe('1')

  rerender(<Comp prop={2} />)
  expect(text.textContent).toBe('2')

  expect(cb).toBeCalledTimes(2)
  // check that returned function has stable identity
  expect(cb.mock.calls[0][0]).toBe(cb.mock.calls[1][0])
})

test('useLogic', () => {
  const initCb = jest.fn()
  const actionsCb = jest.fn()
  let logicActions

  const Comp = () => {
    const [state, actions] = hooks.useLogic(
      ({ thunk, merge }) => {
        initCb()

        return {
          open: force =>
            merge({ isOpened: typeof force === 'boolean' ? force : true }),
          close: thunk(() => (actions, getState) => {
            expect(actions).toMatchObject({
              open: expect.any(Function),
              close: expect.any(Function),
            })
            expect(getState()).toMatchObject({
              isOpened: expect.any(Boolean),
            })
            actions.open(false)
          }),
        }
      },
      { isOpened: false },
    )

    actionsCb(actions)
    logicActions = actions
    return <div>{state.isOpened ? 'opened' : 'closed'}</div>
  }

  const { container } = render(<Comp />)
  const text = container.firstChild!
  expect(text.textContent).toBe('closed')

  act(() => logicActions.open())
  expect(text.textContent).toBe('opened')

  act(() => logicActions.close())
  expect(text.textContent).toBe('closed')

  expect(initCb).toBeCalledTimes(1)
  expect(actionsCb).toBeCalledTimes(3)
  // check that returned function has stable identity
  expect(
    actionsCb.mock.calls
      .map(call => call[0])
      .every(arg => {
        if (Object.keys(arg).length !== Object.keys(logicActions).length)
          return false
        for (const k in logicActions) {
          if (logicActions[k] !== arg[k]) return false
        }
        return true
      }),
  ).toBe(true)
})

test('usePrevious', () => {
  const cb = jest.fn()

  const Comp = ({ count }) => {
    const prev = hooks.usePrevious(count)
    cb(prev, count)
    return null
  }

  const { rerender } = render(<Comp count={1} />)
  rerender(<Comp count={2} />)

  expect(cb).toBeCalledTimes(2)
  expect(cb).nthCalledWith(1, undefined, 1)
  expect(cb).nthCalledWith(2, 1, 2)
})

test('useEffectPrevious', () => {
  const cb = jest.fn()

  const Comp = ({ a, b }) => {
    hooks.useEffectPrevious(cb, [a, b])
    return null
  }

  const { rerender } = render(<Comp a={1} b={1} />)
  rerender(<Comp a={2} b={1} />)
  rerender(<Comp a={2} b={2} />)

  expect(cb).toBeCalledTimes(3)
  rerender(<Comp a={2} b={2} />)
  expect(cb).toBeCalledTimes(3)

  rerender(<Comp a={2} b={3} />)

  expect(cb).toBeCalledTimes(4)

  expect(cb).nthCalledWith(1, [])
  expect(cb).nthCalledWith(2, [1, 1])
  expect(cb).nthCalledWith(3, [2, 1])
  expect(cb).nthCalledWith(4, [2, 2])
})

test('useUpdate', () => {
  const cb = jest.fn()
  let update

  const Comp = () => {
    update = hooks.useUpdate()
    cb()
    return null
  }

  render(<Comp />)
  act(update)
  act(update)
  act(update)

  expect(cb).toBeCalledTimes(4)
})
