export function Render(_a) {
    var children = _a.children;
    return children();
}
var patched = "dhmk/react/effect";
var effects = patched;
function patch(self, name, newFn) {
    var _a;
    if (!((_a = self[name]) === null || _a === void 0 ? void 0 : _a[patched])) {
        var original_1 = self[name];
        var fn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            original_1 === null || original_1 === void 0 ? void 0 : original_1.apply(self, args);
            newFn.apply(void 0, args);
        };
        fn[patched] = true;
        self[name] = fn;
    }
}
var arraysEqual = function (a, b) {
    return a.length === b.length && a.every(function (x, i) { return x === b[i]; });
};
function runEffects(self) {
    var _a;
    (_a = self[effects]) === null || _a === void 0 ? void 0 : _a.forEach(function (ef) {
        var _a;
        var prevDeps = ef.prevDeps;
        var nextDeps = ef.deps();
        if (!prevDeps || !nextDeps || !arraysEqual(ef.prevDeps, nextDeps)) {
            (_a = ef.dispose) === null || _a === void 0 ? void 0 : _a.call(ef);
            ef.dispose = ef.fn();
            ef.prevDeps = nextDeps;
        }
    });
}
export function effect(self, fn, deps) {
    var _a;
    if (deps === void 0) { deps = function () { return undefined; }; }
    patch(self, "componentDidMount", function () {
        if (self[effects].size)
            throw new Error("effects cannot run before `componentDidMount`");
    });
    patch(self, "componentDidUpdate", function () {
        runEffects(self);
    });
    patch(self, "componentWillUnmount", function () {
        var _a;
        (_a = self[effects]) === null || _a === void 0 ? void 0 : _a.forEach(function (e) { var _a; return (_a = e.dispose) === null || _a === void 0 ? void 0 : _a.call(e); });
    });
    var entry = { fn: fn, deps: deps, prevDeps: deps(), dispose: fn() };
    (_a = self[effects]) !== null && _a !== void 0 ? _a : (self[effects] = new Set());
    self[effects].add(entry);
    return function () { return self[effects].delete(entry); };
}
