import React from "react";
import { render, act, fireEvent } from "@testing-library/react";

import * as hooks from "./index";

test("usePrevious", () => {
  const cb = jest.fn();

  const Comp = ({ count }) => {
    const prev = hooks.usePrevious(count);
    cb(prev, count);
    return null;
  };

  const { rerender } = render(<Comp count={1} />);
  rerender(<Comp count={2} />);

  expect(cb).toBeCalledTimes(2);
  expect(cb).nthCalledWith(1, undefined, 1);
  expect(cb).nthCalledWith(2, 1, 2);
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

test("useLiveCallback", () => {
  const cb = jest.fn();
  const idCb = jest.fn();

  const Comp = ({ prop }) => {
    const onClick = hooks.useLatestCallback((n) => {
      cb(n, prop);
    });

    idCb(onClick);

    return <button onClick={() => onClick(1)}>test</button>;
  };

  const { rerender, getByRole } = render(<Comp prop="one" />);
  rerender(<Comp prop="two" />);
  fireEvent.click(getByRole("button"));

  expect(cb).toBeCalledTimes(1);
  expect(cb).toBeCalledWith(1, "two");

  expect(idCb).toBeCalledTimes(2);
  // check that returned function has stable identity
  expect(idCb.mock.calls[0][0]).toBe(idCb.mock.calls[1][0]);
});

test("useGetter", () => {
  const cb = jest.fn();

  const Comp = ({ prop }) => {
    const getProp = hooks.useGetter(prop);
    cb(getProp);
    return <div>{getProp()}</div>;
  };

  const { container, rerender } = render(<Comp prop={1} />);
  const text = container.firstChild!;
  expect(text.textContent).toBe("1");

  rerender(<Comp prop={2} />);
  expect(text.textContent).toBe("2");

  expect(cb).toBeCalledTimes(2);
  // check that returned function has stable identity
  expect(cb.mock.calls[0][0]).toBe(cb.mock.calls[1][0]);
});
