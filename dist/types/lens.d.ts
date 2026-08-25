import { type State } from "./loom.js";
export declare function lens<T extends object, K extends keyof T>(source: State<T>, key: K): State<T[K]>;
