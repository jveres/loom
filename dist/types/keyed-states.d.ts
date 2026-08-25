import { type NodeOptions, type State } from "./loom.js";
export interface KeyedStates {
    /** The cell for `key`, created on first touch. */
    cell<T>(key: string, initial: T | (() => State<T>)): State<T>;
    /** Drop cells whose key matches; returns how many were dropped. */
    prune(match: string | ((key: string) => boolean)): number;
    /** Is there a cell for `key`? */
    has(key: string): boolean;
}
export declare function keyedStates(options?: NodeOptions): KeyedStates;
