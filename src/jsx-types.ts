import type { Child, Props } from "./dom.js";

type Component = (props: never) => Child;

export namespace JSX {
  export type Element = HTMLElement;
  export type ElementType = string | Component;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export type IntrinsicElementProps = Props & {
    children?: Child;
    htmlFor?: string;
    key?: string | number;
    [name: string]: unknown;
  };

  export interface IntrinsicElements {
    [name: string]: IntrinsicElementProps;
  }
}
