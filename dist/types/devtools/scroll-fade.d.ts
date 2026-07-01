export interface ScrollFade {
    refresh(): void;
    dispose(): void;
}
export declare function wireScrollFade(scroller: HTMLElement, axis: "x" | "y"): ScrollFade;
