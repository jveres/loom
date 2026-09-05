import { type Read } from "../loom.js";
export interface MediaReadOptions {
    readonly window?: Pick<Window, "matchMedia">;
}
/** A shared reactive media query, isolated by its window. */
export declare function mediaRead(query: string, options?: MediaReadOptions): Read<boolean>;
