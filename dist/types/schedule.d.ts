import { type Read, type State, type Stop } from "./loom.js";
export interface FrameClock {
    requestAnimationFrame?: (callback: FrameRequestCallback) => number;
    cancelAnimationFrame?: (id: number) => void;
}
export interface ScheduleOptions {
    readonly signal?: AbortSignal;
}
export interface FrameOptions extends ScheduleOptions {
    readonly window?: FrameClock;
}
export interface Coalescer {
    readonly request: () => void;
    readonly cancel: () => void;
    readonly stop: Stop;
}
/** Coalesce requests into one microtask. Cancel permits subsequent requests. */
export declare function microtaskCoalescer(run: () => void, options?: ScheduleOptions): Coalescer;
/** Coalesce requests into one frame of the selected window. */
export declare function frameCoalescer(run: () => void, options?: FrameOptions): Coalescer;
/** Run after a positive integer number of frames; no RAF means microtasks. */
export declare function afterFrames(count: number, run: () => void, options?: FrameOptions): Stop;
export interface EventOrTimeoutOptions extends ScheduleOptions {
    readonly timeoutMs: number;
    readonly capture?: boolean;
}
/** Race one event against a timeout. Teardown precedes the callback. */
export declare function eventOrTimeout<K extends keyof WindowEventMap>(target: Window, type: K, run: (event: WindowEventMap[K] | undefined) => void, options: EventOrTimeoutOptions): Stop;
export declare function eventOrTimeout<K extends keyof DocumentEventMap>(target: Document, type: K, run: (event: DocumentEventMap[K] | undefined) => void, options: EventOrTimeoutOptions): Stop;
export declare function eventOrTimeout<K extends keyof HTMLElementEventMap>(target: HTMLElement, type: K, run: (event: HTMLElementEventMap[K] | undefined) => void, options: EventOrTimeoutOptions): Stop;
export declare function eventOrTimeout(target: EventTarget, type: string, run: (event: Event | undefined) => void, options: EventOrTimeoutOptions): Stop;
export interface WatchSettledOptions<T> extends ScheduleOptions {
    readonly delayMs: number;
    readonly equals?: (value: T, previous: T) => boolean;
}
export interface SettledWatcher {
    readonly stop: Stop;
    readonly cancel: () => void;
    readonly flush: () => void;
}
/** Observe immediately, deliver changes after quiet time, and own the watcher explicitly. */
export declare function watchSettled<T>(read: State<T> | Read<T>, run: (value: NoInfer<T>, previous: NoInfer<T>) => void, options: WatchSettledOptions<T>): SettledWatcher;
