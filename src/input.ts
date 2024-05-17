import React from "react";
import { useStateMerge, useIsomorphicLayoutEffect } from "./hooks";

// useInput('a')
// useInput(true)
// useInput(['a', 'b', 'c'])
// useInput({a: true, b: false, c: false})

type Input = string | boolean | ReadonlyArray<string> | Record<string, boolean>;

export function useInput<T extends Input = string>(initial: T = "" as any) {
  const elRefs = React.useRef<any>(new Set());

  const [{ valueReal, ...props }, setState] = useStateMerge(() => {
    return {
      valueReal: initial,
      value: initial as any,
      onChange: (x) => {
        if (x.nativeEvent) {
          const el = x.target;

          if (el.type === "radio") {
            setState({ valueReal: el.value });
          } else if (el.type === "checkbox") {
            setState((prev) => ({
              valueReal: Array.isArray(prev.valueReal)
                ? prev.valueReal
                    .filter((x) => x !== el.value)
                    .concat(el.checked ? el.value : [])
                : typeof prev.valueReal === "object"
                ? { ...(prev.valueReal as {}), [el.value]: el.checked }
                : el.checked,
            }));
          } else if (el.tagName === "SELECT" && el.multiple) {
            const value: any = Array.from(
              el.selectedOptions,
              (x: any) => x.value
            );

            setState({
              value,
              valueReal: value,
            });
          } else
            setState({
              value: el.value,
              valueReal: el.value,
            });
        } else
          setState({
            value: x,
            valueReal: x,
          });
      },
      ref: (el: any) => {
        elRefs.current.add(el);
      },
    };
  });

  useIsomorphicLayoutEffect(() => {
    const els = elRefs.current;

    els.forEach((el) => {
      if (!el.parentNode) els.delete(el);

      if (el.type === "radio") {
        el.checked = el.value === valueReal;
      }

      if (el.type === "checkbox") {
        el.checked = Array.isArray(valueReal)
          ? valueReal.includes(el.value)
          : typeof valueReal === "object"
          ? !!valueReal[el.value]
          : !!valueReal;
      }
    });
  }, [valueReal, elRefs.current]);

  return [props, valueReal] as const;
}
