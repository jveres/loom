import type { Stop } from "../loom.js";
export declare function listen<K extends keyof WindowEventMap>(owner: Node, target: Window, type: K, handler: (event: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function listen<K extends keyof DocumentEventMap>(owner: Node, target: Document, type: K, handler: (event: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function listen<K extends keyof HTMLElementEventMap>(owner: Node, target: HTMLElement, type: K, handler: (event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function listen(owner: Node, target: EventTarget, type: string, handler: (event: Event) => void, options?: boolean | AddEventListenerOptions): Stop;
