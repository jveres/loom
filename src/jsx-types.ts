import type { Child, Props } from "./dom.js";

type Component = (props: never) => Child;
type EventHandler<TElement extends Element, TEvent extends Event> = (
  event: TEvent & { readonly currentTarget: TElement },
) => void;
type EventProps<TElement extends HTMLElement> = {
  onBlur?: EventHandler<TElement, FocusEvent>;
  onChange?: EventHandler<TElement, Event>;
  onClick?: EventHandler<TElement, MouseEvent>;
  onDblClick?: EventHandler<TElement, MouseEvent>;
  onFocus?: EventHandler<TElement, FocusEvent>;
  onInput?: EventHandler<TElement, InputEvent>;
  onKeyDown?: EventHandler<TElement, KeyboardEvent>;
  onKeyUp?: EventHandler<TElement, KeyboardEvent>;
  onMouseDown?: EventHandler<TElement, MouseEvent>;
  onMouseUp?: EventHandler<TElement, MouseEvent>;
  onSubmit?: EventHandler<TElement, SubmitEvent>;
};
type ElementProps<TElement extends HTMLElement> = Props &
  EventProps<TElement> & {
    children?: Child;
    htmlFor?: string;
    key?: string | number;
    [name: `aria-${string}`]: unknown;
    [name: `data-${string}`]: unknown;
  };

export namespace JSX {
  export type Element = HTMLElement;
  export type ElementType = string | Component;

  export interface ElementChildrenAttribute {
    children: unknown;
  }

  export interface IntrinsicAttributes {
    key?: string | number;
  }

  export interface IntrinsicElements {
    article: ElementProps<HTMLElement>;
    aside: ElementProps<HTMLElement>;
    b: ElementProps<HTMLElement>;
    button: ElementProps<HTMLButtonElement>;
    div: ElementProps<HTMLDivElement>;
    header: ElementProps<HTMLElement>;
    h2: ElementProps<HTMLHeadingElement>;
    input: ElementProps<HTMLInputElement>;
    label: ElementProps<HTMLLabelElement>;
    p: ElementProps<HTMLParagraphElement>;
    section: ElementProps<HTMLElement>;
    small: ElementProps<HTMLElement>;
    span: ElementProps<HTMLSpanElement>;
    strong: ElementProps<HTMLElement>;
  }
}
