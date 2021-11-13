var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import React from "react";
export var useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
export var useRefLive = function (value) {
    var ref = React.useRef(value);
    React.useEffect(function () {
        ref.current = value;
    });
    return ref;
};
export var useCallbackLive = function (fn) {
    var ref = useRefLive(fn);
    return React.useRef(function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return ref.current.apply(ref, args);
    }).current;
};
export var useGetter = function (value) {
    var ref = useRefLive(value);
    return React.useRef(function () { return ref.current; }).current;
};
export var useUpdate = function () {
    var _a = React.useReducer(function (x) { return (x + 1) & 0xffffffff; }, 0), update = _a[1]; // Prevents reaching MAX_SAFE_INTEGER (can this ever be possible?)
    return update;
};
var id = function (x) { return x; };
export var map = function (arg, fn) {
    return function (prevState) {
        return fn(typeof arg === "function" ? arg(prevState) : arg, prevState);
    };
};
export function useState2(init, postProcess) {
    if (postProcess === void 0) { postProcess = id; }
    var _a = React.useState(init), state = _a[0], _setState = _a[1];
    var ref = React.useRef({
        postProcess: postProcess,
        setState: function (x) {
            return _setState(map(x, ref.current.postProcess));
        },
    });
    React.useEffect(function () {
        ref.current.postProcess = postProcess;
    });
    return [state, ref.current.setState];
}
var merge2 = function (nextState, prevState) {
    return (__assign(__assign({}, prevState), nextState));
};
export var useStateMerge = function (init) {
    return useState2(init, merge2);
};
