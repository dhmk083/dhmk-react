import React from "react";
export declare const useIsomorphicLayoutEffect: typeof React.useEffect;
export declare const useRefLive: <T>(value: T) => React.MutableRefObject<T>;
export declare const useCallbackLive: <T extends Function>(fn: T) => T;
export declare const useGetter: <T>(value: T) => () => T;
export declare const useUpdate: () => React.DispatchWithoutAction;
declare type Init<S> = S | (() => S);
declare type StateSetter<S, A = S> = {
    (value: A): void;
    (fn: (prevState: S) => A): void;
};
declare type StateSetterArg<S, A = S> = A | ((prevState: S) => A);
export declare const map: <S, A = S>(arg: StateSetterArg<S, A>, fn: (value: A, prevState: S) => S) => (prevState: S) => S;
export declare function useState2<S, A = S>(init: Init<S>, postProcess?: (value: A, prevState: S) => S): [S, StateSetter<S, A>];
export declare const useStateMerge: <T>(init: T | (() => T)) => [T, StateSetter<T, Partial<T>>];
export {};
