import { type Read } from "../loom.js";
export type PointerKind = "mouse" | "pen" | "touch" | "";
export declare function pointerKind(doc?: Document): Read<PointerKind>;
