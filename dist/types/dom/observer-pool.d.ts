import type { Stop } from "../loom.js";
interface TargetObserver {
    unobserve(target: Element): void;
    disconnect(): void;
}
export interface ObserverPool<Entry> {
    /** Route `callback` the entries for `el`. The returned stop is idempotent; the last stop for a
     *  target unobserves it, and the last target disconnects the observer and calls `onEmpty`. */
    readonly add: (el: Element, callback: (entry: Entry) => void) => Stop;
}
export declare function observerPool<Entry extends {
    readonly target: Element;
}, Observer extends TargetObserver>(create: (dispatch: (entries: readonly Entry[]) => void) => Observer, observe: (observer: Observer, el: Element) => void, onEmpty: () => void): ObserverPool<Entry>;
export {};
