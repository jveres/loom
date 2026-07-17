export interface FoldHeightOptions {
    /** Runs before the first height write of this toggle. */
    onStart?(open: boolean): void;
    /** Runs once the fold settles (also on interrupt/no-transition). */
    onSettle?(open: boolean): void;
}
export declare function foldHeight(el: HTMLElement, open: boolean, options?: FoldHeightOptions): void;
