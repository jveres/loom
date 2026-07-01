import type { HtmlChild } from "./index.js";

type Component = (props: never) => HtmlChild;

export namespace JSX {
  export type Element = HtmlChild;
  export type ElementType = string | Component;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  // Deliberately permissive: the common typed props below are documented for editor help, but the
  // `[name: string]: unknown` index accepts any attribute name and value. This SSR runtime does all
  // its real safety work at render time (renderAttribute validates names, filters URL schemes, and
  // escapes values), so the types stay a thin, non-obstructive layer rather than an exhaustive
  // per-element attribute model — a tag typo or an odd attribute is caught by that runtime, not the
  // compiler. Callers wanting strict attribute checking should type their own component props.
  export interface IntrinsicElementProps {
    children?: HtmlChild;
    class?: unknown;
    className?: unknown;
    htmlFor?: string;
    key?: string | number;
    style?: string | Record<string, unknown>;
    [name: string]: unknown;
  }

  export interface IntrinsicElements {
    [name: string]: IntrinsicElementProps;
  }
}
