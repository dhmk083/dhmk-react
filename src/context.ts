import React from "react";

const None = {};

type StripProps<T> = Record<keyof T, never>;

type DefaultGetter<T> = T extends (...args) => any
  ? T & StripProps<T> & { useValue: T }
  : () => T;

export const defaultGetter = <T>(useValue: () => T): DefaultGetter<T> => {
  const useGetter = (...args) => {
    const value = useValue();
    return typeof value === "function" ? value(...args) : value;
  };

  useGetter.useValue = useValue;

  return useGetter as any;
};

export function createContext<
  T,
  A extends any[] = [],
  G extends (...args) => any = DefaultGetter<T>
>(conf: {
  useArgs?: () => [...A];
  fn: (...args: A) => T;
  getter?: (useValue: () => T) => G;
}) {
  let defaultValue = None as T;
  const context = React.createContext<T>(defaultValue);
  const useArgs = conf.useArgs ?? (() => [] as unknown as A);

  const useValue = () => {
    let value = React.useContext(context);
    const args = useArgs();

    if (value === None) {
      if (defaultValue === None) {
        defaultValue = conf.fn(...args);
      }

      value = defaultValue;
    }

    return value;
  };

  return [(conf.getter ?? defaultGetter)(useValue), context.Provider] as [
    G,
    typeof context.Provider
  ];
}
