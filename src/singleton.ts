import React from "react";

function multikeyMap() {
  const root = {
    value: undefined,
    nodes: new Map(),
  };

  return {
    getOrCreate<T>(keys: unknown[], defaultValue: T) {
      let node = root;

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        const v = node.nodes.get(k) ?? {
          value: undefined,
          nodes: new Map(),
        };
        if (i === keys.length - 1 && v.value === undefined)
          v.value = defaultValue;
        node.nodes.set(k, v);
        node = v;
      }

      return node.value as unknown as T;
    },

    delete(keys: unknown[]) {
      let node = root;
      const nodes = [root];

      for (let i = 0; i < keys.length; i++) {
        const k = keys[i];
        node = node.nodes.get(k);
        if (!node) return;
        nodes.push(node);
      }

      node.value = undefined;

      for (let i = nodes.length - 1; i > 0; i--) {
        const n = nodes[i];

        if (n.value === undefined && n.nodes.size === 0) {
          nodes[i - 1].nodes.delete(keys[i - 1]);
        }
      }
    },
  };
}

const map = multikeyMap();

export function useSingletonEffect(
  fn: () => void | (() => void),
  deps: unknown[]
) {
  React.useEffect(() => {
    const state = map.getOrCreate(deps, { counter: 0, dispose: () => {} });

    if (state.counter++ === 0) {
      state.dispose = fn() ?? (() => {});
    }

    return () => {
      if (--state.counter === 0) {
        map.delete(deps);
        state.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
