import type { Stop } from "../loom.js";
export declare function deadline<K extends keyof WindowEventMap>(owner: Node, target: Window, type: K, ms: number, run: (event?: WindowEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function deadline<K extends keyof DocumentEventMap>(owner: Node, target: Document, type: K, ms: number, run: (event?: DocumentEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function deadline<K extends keyof HTMLElementEventMap>(owner: Node, target: HTMLElement, type: K, ms: number, run: (event?: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): Stop;
export declare function deadline(owner: Node, target: EventTarget, type: string, ms: number, run: (event?: Event) => void, options?: boolean | AddEventListenerOptions): Stop;
