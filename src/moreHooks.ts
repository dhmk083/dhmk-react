import React from "react";
import { useEffectUpdate } from "./hooks";

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

export function useOnBlur(handleBlur) {
  const tid = React.useRef<NodeJS.Timeout>();

  return {
    tabIndex: -1,
    onFocus: () => clearTimeout(tid.current!),
    onBlur: () => (tid.current = setTimeout(handleBlur)),
  };
}

function defaultHandleChange(ev, setValue) {
  setValue(ev.target.value);
}

type BaseEvent = { target: { value: string } };

export function useInput(initial = "", handleChange = defaultHandleChange) {
  const [value, setValue] = React.useState(initial);
  const onChange = React.useCallback(
    (ev: BaseEvent) => handleChange(ev, setValue),
    [handleChange]
  );

  useEffectUpdate(() => setValue(initial), [initial]);

  return { value, onChange };
}
