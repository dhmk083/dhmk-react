import React from "react";

export function Render({
  children,
}: {
  children: () => React.ReactElement | null;
}) {
  return children();
}

const patched = "dhmk/react/effect";
const effects = patched;

function patch(self, name, newFn) {
  if (!self[name]?.[patched]) {
    const original = self[name];

    const fn = (...args) => {
      original?.apply(self, args);
      newFn(...args);
    };

    fn[patched] = true;
    self[name] = fn;
  }
}

const arraysEqual = (a, b) =>
  a.length === b.length && a.every((x, i) => x === b[i]);

function runEffects(self) {
  self[effects]?.forEach((ef) => {
    const prevDeps = ef.prevDeps;
    const nextDeps = ef.deps();

    if (!prevDeps || !nextDeps || !arraysEqual(ef.prevDeps, nextDeps)) {
      ef.dispose?.();
      ef.dispose = ef.fn();
      ef.prevDeps = nextDeps;
    }
  });
}

export function effect(
  self,
  fn,
  deps: () => ReadonlyArray<any> | undefined = () => undefined
) {
  patch(self, "componentDidMount", () => {
    if (self[effects].size)
      throw new Error("effects cannot run before `componentDidMount`");
  });

  patch(self, "componentDidUpdate", () => {
    runEffects(self);
  });

  patch(self, "componentWillUnmount", () => {
    self[effects]?.forEach((e) => e.dispose?.());
  });

  const entry = { fn, deps, prevDeps: deps(), dispose: fn() };
  self[effects] ??= new Set();
  self[effects].add(entry);
  return () => self[effects].delete(entry);
}
