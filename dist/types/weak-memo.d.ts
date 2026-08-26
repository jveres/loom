import { type Read } from "./loom.js";
export declare function weakMemo<K extends object, V>(compute: (key: K) => V, version?: Read<unknown>): (key: K) => V;
