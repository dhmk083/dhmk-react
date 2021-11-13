import React from "react";
export declare function Render({ children, }: {
    children: () => React.ReactElement | null;
}): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export declare function effect(self: any, fn: any, deps?: () => ReadonlyArray<any> | undefined): () => any;
