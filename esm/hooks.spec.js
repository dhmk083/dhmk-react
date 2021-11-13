import React from "react";
import { render, act, fireEvent } from "@testing-library/react";
import * as hooks from "./index";
test("useRefLive", function () {
    var cb = jest.fn();
    var Comp = function (_a) {
        var count = _a.count;
        var countRef = hooks.useRefLive(count);
        React.useEffect(function () {
            cb(countRef.current, count);
        });
        return null;
    };
    var rerender = render(React.createElement(Comp, { count: 1 })).rerender;
    rerender(React.createElement(Comp, { count: 2 }));
    expect(cb).toBeCalledTimes(2);
    expect(cb).nthCalledWith(1, 1, 1);
    expect(cb).nthCalledWith(2, 2, 2);
});
test("useUpdate", function () {
    var cb = jest.fn();
    var update;
    var Comp = function () {
        update = hooks.useUpdate();
        cb();
        return null;
    };
    render(React.createElement(Comp, null));
    act(update);
    act(update);
    act(update);
    expect(cb).toBeCalledTimes(4);
});
test("useCallbackLive", function () {
    var cb = jest.fn();
    var idCb = jest.fn();
    var Comp = function (_a) {
        var prop = _a.prop;
        var onClick = hooks.useCallbackLive(function (n) {
            cb(n, prop);
        });
        idCb(onClick);
        return React.createElement("button", { onClick: function () { return onClick(1); } }, "test");
    };
    var _a = render(React.createElement(Comp, { prop: "one" })), rerender = _a.rerender, getByRole = _a.getByRole;
    rerender(React.createElement(Comp, { prop: "two" }));
    fireEvent.click(getByRole("button"));
    expect(cb).toBeCalledTimes(1);
    expect(cb).toBeCalledWith(1, "two");
    // check that returned function has stable identity
    expect(idCb.mock.calls[0][0]).toBe(idCb.mock.calls[1][0]);
});
test("useGetter", function () {
    var cb = jest.fn();
    var idCb = jest.fn();
    var Comp = function (_a) {
        var prop = _a.prop;
        var getProp = hooks.useGetter(prop);
        React.useEffect(function () {
            cb(getProp());
            idCb(getProp);
        });
        return React.createElement("div", null, getProp());
    };
    var _a = render(React.createElement(Comp, { prop: 1 })), container = _a.container, rerender = _a.rerender;
    var text = container.firstChild;
    expect(text.textContent).toBe("1");
    rerender(React.createElement(Comp, { prop: 2 }));
    expect(text.textContent).toBe("1");
    expect(cb).toBeCalledTimes(2);
    expect(cb).nthCalledWith(1, 1);
    expect(cb).nthCalledWith(2, 2);
    // check that returned function has stable identity
    expect(idCb.mock.calls[0][0]).toBe(idCb.mock.calls[1][0]);
});
