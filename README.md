# React hooks and helpers

## Hooks

### `useRefLive(x: T): Ref<T>`

Returns a ref which is updated after each render.

### `useCallbackLive(fn: T): T`

Returns a function with a stable identity that calls the latest provided `fn` function passing all args to it.

> It's safe to omit the function from the `useEffect` or `useCallback` dependency list.

### `useUpdate(): Function`

Like class component `forceUpdate`.

### `useGetter(x: T): () => T`

Returns a function with a stable identity that returns an argument provided to it.

> It's safe to omit the function from the `useEffect` or `useCallback` dependency list.

### `useIsomorphicLayoutEffect`

`useLayoutEffect` without warning if used outside browser.

### `useState2(initial, postProcess: (newValue, oldValue) => finalValue): [state, setState, getState]`

Like `useState` but with mediation process. Also returns state getter function as the third item.

### `useStateMerge(initial): [state, setState, getState]`

Like `useState` but with shallow merging instead of replacing.

### `useEffect2(fn, deps)`

Like `useEffect` but `fn` is called with two arguments:

- `isInitial`: boolean
- `prevDeps`: [] | undefined

### `useEffectUpdate(fn, deps)`

Like `useEffect` but skips first effect invocation.

### `usePromise(p?: Promise): [PromiseState, setPromise(p?: Promise): Promise]`

```ts
PromiseState = {
  isPending: boolean
  value: T | undefined
  error: E | undefined
}
```

Tracks promise status.

## Other

### `<Render>{() => ...}</Render>`

Useful for using hooks inside a class component.

```jsx
class extends React.Component {
  render() {
    return <Render>{() => {
      const [count, setCount] = React.usecount(1)
      this.setCount = setCount // interop with class

      return <p>{count}</p>
    }}</Render>
  }
}
```

### `effect(reactClassInstance, effectFn, getDeps?): Dispose`

Registers and runs an effect. All effects are automatically disposed on unmount.

`getDeps` is a function that returns an array of dependencies, similar to `React.useEffect`.

```js
class extends React.Component {
  componentDidMount() {
    effect(
      this,
      () => {
        // I will run instantly and then in `componentDidUpdate` if my deps changed
        return () => {
          // optional dispose here
        }
      },
      () => [this.props.someValue, this.props.otherValue])
  }
}
```

## More inside...
