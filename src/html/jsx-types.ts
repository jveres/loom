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
