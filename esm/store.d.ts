import React from "react";
declare type Store<T> = {
    getState(): T;
    subscribe(fn: () => void): () => void;
};
export declare function Provider({ state, children }: {
    state: any;
    children: any;
}): React.FunctionComponentElement<React.ProviderProps<Store<any>>>;
export declare const useSelector: <T, S = any>(fn: (state: S) => T, eq?: (value1: any, value2: any) => boolean) => T | undefined;
export declare const createSelectorHook: <S>() => <T>(fn: (state: S) => T) => T;
export {};
