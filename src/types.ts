import type { ComponentType } from "react";

export type Props<T> = T extends ComponentType<infer P> ? P : never;
