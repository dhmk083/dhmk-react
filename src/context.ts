import React from "react";

export function createContext<
  T,
  A extends any[] = [],
  G extends (...args) => any = () => T
>({
  fn,
  useArgs = () => [] as unknown as A,
  getter = ((x) => x) as G,
}: {
  fn: (...args: A) => T;
  useArgs?: () => [...A];
  getter?: (useValue: () => T) => G;
}) {
  let defaultValue: T;
  const Context = React.createContext(defaultValue!);

  function useContext() {
    const args = useArgs();
    return (
      React.useContext(Context) ?? defaultValue ?? (defaultValue = fn(...args))
    );
  }

  return [getter(useContext), Context.Provider] as const;
}
