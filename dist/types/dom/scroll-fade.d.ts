export interface ScrollFadeOptions {
    /** Fade length in px (default 14). */
    readonly size?: number;
    /** Scroll axis to fade (default "y"). */
    readonly axis?: "x" | "y";
    /** Edge transition duration in ms (default 0). */
    readonly transition?: number;
}
export declare function scrollFade(el: HTMLElement, options?: ScrollFadeOptions): () => void;
