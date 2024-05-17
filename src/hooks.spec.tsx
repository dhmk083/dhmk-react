import React from "react";
import { render, act } from "@testing-library/react";

import * as hooks from "./index";

test("useRefLive", () => {
  const cb = jest.fn();

  const Comp = ({ count }) => {
    const countRef = hooks.useValueAsRef(count);
    React.useEffect(() => {
      cb(countRef.current, count);
    });
    return null;
  };

  const { rerender } = render(<Comp count={1} />);
  rerender(<Comp count={2} />);

  expect(cb).toBeCalledTimes(2);
  expect(cb).nthCalledWith(1, 1, 1);
  expect(cb).nthCalledWith(2, 2, 2);
});

test("useUpdate", () => {
  const cb = jest.fn();
  let update;

  const Comp = () => {
    update = hooks.useUpdate();
    cb();
    return null;
  };

  render(<Comp />);
  act(update);
  act(update);
  act(update);

  expect(cb).toBeCalledTimes(4);
});
