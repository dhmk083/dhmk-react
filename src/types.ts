export * from 'ts-essentials'

export type Fn<T, R> = (...args: T[]) => R
export type Fn0<T> = () => T
export type Fn1<A, B> = (x: A) => B
export type Fn2<A, B, C> = (x: A, y: B) => C
