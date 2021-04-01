# Var Hooks

### Basic

- `usePrevious(x: T): T | undefined` - returns a value from previous render.

- `useUpdate(): () => void` - like class-based component's `forceUpdate`.

- `useLatestCallback(fn: T): T` - like `useCallback`, but always calls the latest provided `fn` (no stale closure).

  Additionally, returned function always has a stable identity, unlike the standard `useCallback`/`useMemo`,
  which may return a new function in some cases as stated in their docs.

  It's safe to omit the function from the `useEffect` or `useCallback` dependency list.

- `useGetter(x: T): () => T` - returns a function with a stable identity that returns an argument provided to it.

  It's safe to omit the function from the `useEffect` or `useCallback` dependency list.
