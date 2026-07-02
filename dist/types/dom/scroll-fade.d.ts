export interface ScrollFadeOptions {
    /** Fade length in px (default 14). */
    readonly size?: number;
}
export declare function scrollFade(el: HTMLElement, options?: ScrollFadeOptions): () => void;
