export interface HoverClassOptions {
    readonly signal?: AbortSignal;
    /** The class. Default "is-hover". */
    readonly name?: string;
    /** Which element(s) wear the costume for this pointerover — null
     *  clears. Default: the event target itself. */
    readonly target?: (event: PointerEvent) => Element | readonly Element[] | null;
    /** A gate: return false and the pointer is left to CSS. */
    readonly when?: (event: PointerEvent) => boolean;
    /** Capture-phase listeners — a document-level channel. */
    readonly capture?: boolean;
}
export interface HoverClass {
    readonly stop: () => void;
    /** Dress `next` (and undress the rest); null undresses everything. */
    set(next: Element | readonly Element[] | null): void;
    /** The elements wearing the costume now. */
    current(): readonly Element[];
}
export declare function hoverClass(host: Element, options?: HoverClassOptions): HoverClass;
