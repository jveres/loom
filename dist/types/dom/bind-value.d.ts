import { type State } from "../loom.js";
export interface BindValueOptions {
    /** The bound property: "value" (default) or "checked" — the
     *  checkbox/radio twin, a State<boolean> over `change`. */
    readonly property?: "value" | "checked";
}
export declare function bindValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, cell: State<string>, options?: {
    readonly property?: "value";
}): void;
export declare function bindValue(el: HTMLInputElement, cell: State<boolean>, options: {
    readonly property: "checked";
}): void;
