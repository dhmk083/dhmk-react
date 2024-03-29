import React from "react";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export const useRefLive = <T>(value: T) => {
  const ref = React.useRef(value);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref;
};

export const useCallbackLive = <T extends Function>(fn: T): T => {
  const ref = useRefLive(fn);
  return React.useRef((...args) => ref.current(...args)).current as any;
};

export const useGetter = <T>(value: T) => {
  const ref = useRefLive(value);
  return React.useRef(() => ref.current).current;
};

export const useUpdate = () => {
  const [, update] = React.useReducer((x) => (x + 1) & 0xffffffff, 0); // Prevents reaching MAX_SAFE_INTEGER (can this ever be possible?)
  return update;
};

const id = (x) => x;

type Init<S> = S | (() => S);

type StateSetter<S, A = S> = {
  (value: A): void;
  (fn: (prevState: S) => A): void;
};

type StateSetterArg<S, A = S> = A | ((prevState: S) => A);

type StateGetter<S> = () => S;

export const map =
  <S, A = S>(arg: StateSetterArg<S, A>, fn: (value: A, prevState: S) => S) =>
  (prevState: S): S =>
    fn(typeof arg === "function" ? (arg as any)(prevState) : arg, prevState);

export function useState2<S, A = S>(
  init: Init<S>,
  postProcess: (value: A, prevState: S) => S = id as any
): [S, StateSetter<S, A>, StateGetter<S>] {
  const [state, _setState] = React.useState(init);

  const ref = React.useRef({
    postProcess,
    state,

    getState: () => ref.current.state,

    setState: (x: StateSetterArg<S, A>) =>
      _setState((old) => {
        const next = map(x, ref.current.postProcess)(old);
        ref.current.state = next;
        return next;
      }),
  });

  React.useEffect(() => {
    ref.current.postProcess = postProcess;
  });

  return [state, ref.current.setState, ref.current.getState];
}

const merge2 = <T>(nextState: Partial<T>, prevState: T) =>
  ({ ...prevState, ...nextState } as T);

export const useStateMerge = <T>(init: T | (() => T)) =>
  useState2<T, Partial<T>>(init, merge2);

export const useIsDisposed = () => {
  const isDisposed = React.useRef(false);

  React.useEffect(() => {
    // without this line `isDisposed` can become `true`
    // in <StrictMode />, is it a bug?
    isDisposed.current = false;

    return () => {
      isDisposed.current = true;
    };
  }, []);

  return isDisposed as { readonly current: boolean };
};

type Capture<T> = {
  (): void;
  (p: Promise<T>): Promise<T>;
};

export function usePromise<T, E = Error>(p?: Promise<T>) {
  const [state, setState] = React.useState({
    isPending: false,
    value: undefined as T | undefined,
    error: undefined as E | undefined,
  });
  const [promise, setPromise] = React.useState(p);
  const capture: Capture<T> = React.useCallback((p?: Promise<T>) => {
    !isHookDisposed.current && setPromise(p);
    return p;
  }, []) as any;

  const isHookDisposed = useIsDisposed();

  React.useEffect(() => {
    if (!promise)
      return setState({
        isPending: false,
        value: undefined,
        error: undefined,
      });

    let isDisposed;

    setState({
      isPending: true,
      value: undefined,
      error: undefined,
    });

    promise.then(
      (value) =>
        !isDisposed && setState({ isPending: false, value, error: undefined }),
      (error) =>
        !isDisposed && setState({ isPending: false, value: undefined, error })
    );

    return () => {
      isDisposed = true;
    };
  }, [promise]);

  return [state, capture] as const;
}

export function useEffectUpdate(
  ...args: Parameters<typeof React.useEffect>
): void;
export function useEffectUpdate(fn, deps) {
  const skip = React.useRef(true);

  React.useEffect(() => {
    if (skip.current) {
      skip.current = false;
      return;
    }

    return fn();
  }, deps);
}

type EffectResult = ReturnType<Parameters<typeof React.useEffect>[0]>;

export function useEffect2<T extends any[]>(
  fn: (isInitial: boolean, prevDeps: readonly [...T]) => EffectResult,
  deps: readonly [...T]
): void;
export function useEffect2(fn: (isInitial: boolean) => EffectResult): void;
export function useEffect2(fn, deps?) {
  const state = React.useRef({
    isInitial: true,
    prevDeps: deps ? ([] as any) : undefined,
  });

  React.useEffect(() => {
    const { isInitial, prevDeps } = state.current;
    state.current = {
      isInitial: false,
      prevDeps: deps,
    };

    return fn(isInitial, prevDeps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
