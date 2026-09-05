import type { Stop } from "../loom.js";
export interface AfterAnimationOptions {
    readonly name?: string;
    readonly signal?: AbortSignal;
}
export interface AfterTransitionOptions {
    readonly property: string;
    readonly signal?: AbortSignal;
}
/** Wait for selected CSS animations; infinite animations require end/cancel events. */
export declare function afterAnimation(el: HTMLElement, run: () => void, options?: AfterAnimationOptions): Stop;
/** Wait for one CSS property to finish transitioning, with a computed-time fallback. */
export declare function afterTransition(el: HTMLElement, run: () => void, options: AfterTransitionOptions): Stop;
