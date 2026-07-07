import { type Read } from "../loom.js";
export declare function attrRead(el: Element, name: string): Read<string | null>;
export declare function classRead(el: Element, name: string): Read<boolean>;
export declare function styleRead(el: Element, prop: string): Read<string>;
