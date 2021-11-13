import React from "react";
import { useUpdate, useIsomorphicLayoutEffect } from "./hooks";
var StoreContext = React.createContext(undefined);
export function Provider(_a) {
    var state = _a.state, children = _a.children;
    var ctx = React.useRef({
        _state: state,
        getState: function () {
            return ctx.current._state;
        },
        _listeners: new Set(),
        subscribe: function (fn) {
            ctx.current._listeners.add(fn);
            return function () { return ctx.current._listeners.delete(fn); };
        },
    });
    React.useEffect(function () {
        ctx.current._state = state;
        ctx.current._listeners.forEach(function (x) { return x(); });
    });
    var PureChildren = React.useState(function () { return React.memo(function () { return children; }); })[0];
    return React.createElement(StoreContext.Provider, { value: ctx.current }, React.createElement(PureChildren));
}
export var useSelector = function (fn, eq) {
    if (eq === void 0) { eq = Object.is; }
    var _a = React.useContext(StoreContext), getState = _a.getState, subscribe = _a.subscribe;
    var update = useUpdate();
    var selectedStateRef = React.useRef();
    var fnRef = React.useRef();
    var nextSelectedState = fn(getState());
    // try to reuse the old value to keep references stable
    var result = eq(selectedStateRef.current, nextSelectedState)
        ? selectedStateRef.current
        : nextSelectedState;
    useIsomorphicLayoutEffect(function () {
        fnRef.current = fn;
        selectedStateRef.current = result;
    });
    useIsomorphicLayoutEffect(function () {
        return subscribe(function () {
            try {
                var prevSelectedState = selectedStateRef.current;
                var nextSelectedState_1 = fnRef.current(getState());
                if (eq(prevSelectedState, nextSelectedState_1))
                    return;
                selectedStateRef.current = nextSelectedState_1;
            }
            catch (e) { }
            update();
        });
    }, [getState, subscribe]);
    return result;
};
export var createSelectorHook = function () {
    return useSelector;
};
