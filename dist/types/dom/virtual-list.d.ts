export interface ListSource<T> {
    readonly length: number;
    at(index: number): T | undefined;
}
export interface VirtualList<T> {
    /** The holder element to mount inside a scroll container. */
    readonly el: HTMLElement;
    /** Replace the backing source and re-window. */
    setItems(source: ListSource<T>): void;
    /** Recompute the window against the current scroll position. */
    refresh(): void;
    /** Scroll the parent container to the end of the list. */
    scrollToEnd(): void;
    /** Scroll so the row at `index` is centered in the viewport. */
    scrollToIndex(index: number): void;
    /** Detach listeners and clear mounted rows. */
    destroy(): void;
}
export interface VirtualListOptions<T> {
    /** Uniform row height in pixels. */
    readonly rowHeight: number;
    /** Stable identity for an item, so a row can be reused across windows. */
    readonly key: (item: T) => string | number;
    /** Build a row when `reuse` is null, else update `reuse` in place and return it. */
    readonly render: (item: T, reuse: HTMLElement | null) => HTMLElement;
    /** Extra rows rendered above and below the viewport (default 6). */
    readonly overscan?: number;
}
export declare function virtualList<T>(options: VirtualListOptions<T>): VirtualList<T>;
