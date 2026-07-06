import { type NodeOptions, type State } from "../loom.js";
export interface PersistedOptions<T> extends NodeOptions {
    /** Value → stored string. Default JSON.stringify. */
    readonly serialize?: (value: T) => string;
    /** Stored string → value. Default JSON.parse. A throw falls back to `initial`. */
    readonly parse?: (raw: string) => T;
    /** Gate on the LOADED value: return false to discard it and start from `initial`. */
    readonly validate?: (value: T) => boolean;
    /** Storage to use. Default localStorage (guarded — absent storage means no persistence). */
    readonly storage?: Storage;
}
export declare function persisted<T>(key: string, initial: T, options?: PersistedOptions<T>): State<T>;
