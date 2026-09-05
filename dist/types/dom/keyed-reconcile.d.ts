import { type Read } from "../loom.js";
/** Called untracked for a reused key whose item changed by reference/value (===). */
export type ListUpdate<T> = (node: Element, item: T, previous: T) => void;
export interface EachOptions<T> {
    readonly update?: ListUpdate<T>;
}
export interface ListOptions<T> extends EachOptions<T> {
    readonly key: (item: T) => string | number;
    readonly render: (item: T, key: string) => Element;
    readonly reorder?: Read<boolean>;
}
export type LoomKey = string | number;
export interface RowUpdates<T> {
    readonly update: ListUpdate<T>;
    readonly items: Map<LoomKey, T>;
}
export declare function reconcileKeyed<T>(parent: Node, before: Node | null, items: readonly T[], nodes: Map<LoomKey, Element>, key: (item: T) => LoomKey, render: (item: T, key: string) => Element, reorder?: boolean, updates?: RowUpdates<T>): void;
