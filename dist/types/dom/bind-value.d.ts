import { type State, type Stop } from "../loom.js";
export interface BindValueOptions {
    readonly property?: "value" | "checked";
    readonly signal?: AbortSignal;
}
export declare function bindValue(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, cell: State<string>, options?: BindValueOptions & {
    readonly property?: "value";
}): Stop;
export declare function bindValue(el: HTMLInputElement, cell: State<boolean>, options: BindValueOptions & {
    readonly property: "checked";
}): Stop;
