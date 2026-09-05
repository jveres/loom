import { type NodeOptions, type State } from "./loom.js";
/** Identity-keyed states with an explicit key/value schema. */
export interface KeyedStates<Schema extends object> {
    value<K extends Extract<keyof Schema, string>>(key: K, initial: NoInfer<Schema[K]>): State<Schema[K]>;
    factory<K extends Extract<keyof Schema, string>>(key: K, create: () => State<NoInfer<Schema[K]>>): State<Schema[K]>;
    prune(match: string | ((key: Extract<keyof Schema, string>) => boolean)): number;
    has(key: Extract<keyof Schema, string>): boolean;
}
export declare function keyedStates<Schema extends object = never>(...args: [Schema] extends [never] ? [schemaRequired: never] : [options?: NodeOptions]): KeyedStates<Schema>;
