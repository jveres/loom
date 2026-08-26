export interface OffsetRect {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
}
export declare function offsetIn(el: Element, box: HTMLElement): OffsetRect;
