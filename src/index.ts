import React from "react";

export const usePrevious = <T>(value: T) => {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

export const useUpdate = () => {
  const [, update] = React.useState(0);
  return () => update((x) => (x + 1) & 0xffffffff); // Prevents reaching MAX_SAFE_INTEGER (can this ever be possible?)
};

export const useLatestCallback = <T extends Function>(fn: T): T => {
  const ref = React.useRef<any>();
  ref.current = fn;
  return React.useRef((...args) => ref.current(...args)).current as any;
};

export const useGetter = <T>(value: T) => {
  const ref = React.useRef<T>(value);
  ref.current = value;
  return React.useCallback(() => ref.current, []);
};
