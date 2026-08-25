export interface PressClassOptions {
    /** A gate read at contact: return false and the press is ignored
     *  (Chrome 119+ dispatches pointer events to disabled controls —
     *  `() => !el.disabled` keeps the voice honest without a signal). */
    readonly when?: () => boolean;
}
export declare function pressClass(el: Element, name?: string, gate?: PressClassOptions): void;
