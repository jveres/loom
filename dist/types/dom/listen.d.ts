import type { Stop } from "../loom.js";
export interface ListenOptions extends AddEventListenerOptions {
    readonly owner: Node;
}
/** Subscribe to a target with an explicit owner; callbacks run untracked. */
export declare function listen<K extends keyof WindowEventMap>(target: Window, type: K, handler: (event: WindowEventMap[K]) => void, options: ListenOptions): Stop;
export declare function listen<K extends keyof DocumentEventMap>(target: Document, type: K, handler: (event: DocumentEventMap[K]) => void, options: ListenOptions): Stop;
export declare function listen<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, handler: (event: HTMLElementEventMap[K]) => void, options: ListenOptions): Stop;
export declare function listen(target: EventTarget, type: string, handler: (event: Event) => void, options: ListenOptions): Stop;
