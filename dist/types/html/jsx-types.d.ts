import type { HtmlChild } from "./index.js";
type Component = (props: never) => HtmlChild;
export declare namespace JSX {
    type Element = HtmlChild;
    type ElementType = string | Component;
    interface ElementChildrenAttribute {
        children: unknown;
    }
    interface IntrinsicAttributes {
        key?: string | number;
    }
    interface IntrinsicElementProps {
        children?: HtmlChild;
        class?: unknown;
        className?: unknown;
        htmlFor?: string;
        key?: string | number;
        style?: string | Record<string, unknown>;
        [name: string]: unknown;
    }
    interface IntrinsicElements {
        [name: string]: IntrinsicElementProps;
    }
}
export {};
