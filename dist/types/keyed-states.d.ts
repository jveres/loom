import { type NodeOptions, type State } from "./loom.js";
export interface KeyedStates {
    /** @deprecated Use value() for literal values or factory() for state factories. */
    cell<T>(key: string, initial: T | (() => State<T>)): State<T>;
    /** Store a literal initial value, including a function. */
    value<T>(key: string, initial: T): State<T>;
    /** Create a state once, on first touch. */
    factory<T>(key: string, create: () => State<T>): State<T>;
    /** Drop cells whose key matches; returns how many were dropped. */
    prune(match: string | ((key: string) => boolean)): number;
    /** Is there a cell for `key`? */
    has(key: string): boolean;
}
export interface TypedKeyedStates<Schema extends object> {
    value<K extends Extract<keyof Schema, string>>(key: K, initial: NoInfer<Schema[K]>): State<Schema[K]>;
    factory<K extends Extract<keyof Schema, string>>(key: K, create: () => State<NoInfer<Schema[K]>>): State<Schema[K]>;
    prune(match: string | ((key: Extract<keyof Schema, string>) => boolean)): number;
    has(key: Extract<keyof Schema, string>): boolean;
}
export declare function keyedStates(options?: NodeOptions): KeyedStates;
export declare function keyedStates<Schema extends object>(options?: NodeOptions): TypedKeyedStates<Schema>;
