export interface ScrollFadeOptions {
    /** Fade length in px (default 14). */
    readonly size?: number;
    /** Scroll axis to fade (default "y"). */
    readonly axis?: "x" | "y";
}
export declare function scrollFade(el: HTMLElement, options?: ScrollFadeOptions): () => void;
