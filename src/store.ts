import React from "react";
import { useUpdate, useIsomorphicLayoutEffect } from "./hooks";

type Store<T> = {
  getState(): T;
  subscribe(fn: () => void): () => void;
};

const StoreContext = React.createContext<Store<any>>(undefined!);

export function Provider({ state, children }) {
  const ctx = React.useRef<any>({
    _state: state,

    getState() {
      return ctx.current._state;
    },

    _listeners: new Set<Function>(),

    subscribe(fn: Function) {
      ctx.current._listeners.add(fn);
      return () => ctx.current._listeners.delete(fn);
    },
  });

  React.useEffect(() => {
    ctx.current._state = state;
    ctx.current._listeners.forEach((x) => x());
  });

  const [PureChildren] = React.useState(() => React.memo(() => children));

  return React.createElement(
    StoreContext.Provider,
    { value: ctx.current },
    React.createElement(PureChildren)
  );
}

export const useSelector = <T, S = any>(
  fn: (state: S) => T,
  eq = Object.is
) => {
  const { getState, subscribe } = React.useContext(StoreContext);
  const update = useUpdate();
  const selectedStateRef = React.useRef<T>();
  const fnRef = React.useRef<any>();

  const nextSelectedState = fn(getState());

  // try to reuse the old value to keep references stable
  const result = eq(selectedStateRef.current, nextSelectedState)
    ? selectedStateRef.current
    : nextSelectedState;

  useIsomorphicLayoutEffect(() => {
    fnRef.current = fn;
    selectedStateRef.current = result;
  });

  useIsomorphicLayoutEffect(
    () =>
      subscribe(() => {
        try {
          const prevSelectedState = selectedStateRef.current;
          const nextSelectedState = fnRef.current(getState());

          if (eq(prevSelectedState, nextSelectedState)) return;

          selectedStateRef.current = nextSelectedState;
        } catch (e) {}

        update();
      }),
    [getState, subscribe]
  );

  return result;
};

export const createSelectorHook = <S>() =>
  useSelector as <T>(fn: (state: S) => T) => T;
