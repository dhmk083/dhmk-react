import React from "react";

export const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

export function useValueAsRef<T>(value: T) {
  const ref = React.useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}

export const useUpdate = () => {
  const [, update] = React.useReducer(() => ({}), {});
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

export function useState<S, A = S>(
  init: Init<S>,
  postProcess: (value: A, prevState: S) => S = id
): [S, StateSetter<S, A>, StateGetter<S>] {
  const [state, _setState] = React.useState(init);
  const postProcessRef = useValueAsRef(postProcess);
  const isMounted = useIsMounted();

  const ref = React.useRef({
    state,

    getState: () => ref.current.state,

    setState: (x: StateSetterArg<S, A>) => {
      const nextState = (ref.current.state = map(
        x,
        postProcessRef.current
      )(ref.current.state));

      isMounted() && _setState(nextState);
    },
  });

  return [state, ref.current.setState, ref.current.getState];
}

export const mergeLeft = <T>(nextState: Partial<T>, prevState: T) =>
  ({ ...prevState, ...nextState } as T);

export const useStateMerge = <S>(
  init: Init<S>,
  postProcess: (nextState: S, prevState: S) => Partial<S> = id
) =>
  useState<S, Partial<S>>(init, (value, prevState) => {
    const tmpState = mergeLeft(value, prevState);
    return mergeLeft(postProcess(tmpState, prevState), tmpState);
  });

export function useIsMounted() {
  const ref = React.useRef(false);

  useIsomorphicLayoutEffect(() => {
    ref.current = true;

    return () => {
      ref.current = false;
    };
  }, []);

  return React.useRef(() => ref.current).current;
}

type TrackPromise<T> = {
  (): void;
  (p: Promise<T>): Promise<T>;
};

export function usePromise<T, E = Error>(p?: Promise<T>) {
  const [state, setState] = useState({
    isPending: false,
    value: undefined as T | undefined,
    error: undefined as E | undefined,
  });
  const [promise, setPromise] = useState(p);
  const promiseRef = useValueAsRef(promise);
  const trackPromise = React.useCallback((p?: Promise<T>) => {
    setPromise(p);
    return p;
  }, []) as TrackPromise<T>;

  React.useEffect(() => {
    if (!promise)
      return setState({
        isPending: false,
        value: undefined,
        error: undefined,
      });

    setState({
      isPending: true,
      value: undefined,
      error: undefined,
    });

    const samePromise = () => promise === promiseRef.current;

    promise.then(
      (value) =>
        samePromise() &&
        setState({ isPending: false, value, error: undefined }),
      (error) =>
        samePromise() && setState({ isPending: false, value: undefined, error })
    );
  }, [promise, promiseRef]);

  return [state, trackPromise] as const;
}

export function useEffect<T extends any[] = []>(
  fn: (isInitial: boolean, prevDeps: readonly [...T]) => void | (() => void),
  deps?: readonly [...T]
) {
  const defaultDeps = [] as unknown as readonly [...T];

  const ref = React.useRef({
    isInitial: true,
    prevDeps: defaultDeps,
  });

  React.useEffect(() => {
    const { isInitial, prevDeps } = ref.current;
    ref.current = {
      isInitial: false,
      prevDeps: deps ?? defaultDeps,
    };
    return fn(isInitial, prevDeps);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const noop = () => {};

export function useRefCallback<T = HTMLElement>(
  fn: (node: T) => Function,
  deps = []
) {
  const dispose = React.useRef(noop);
  return React.useCallback((node) => {
    dispose.current(); // catch?
    dispose.current = (node && fn(node)) || noop;
  }, deps);
}
