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
/** The standard CODECS — pass one as `options` (or spread it under
 *  your own `label`/`validate`): the "1"/"0" boolean dialect, a finite
 *  number with an optional range, a string drawn from an allowed set. A
 *  hand-written serialize/parse/validate triple per call site drifts
 *  the stored format; these keep one dialect per kind. */
export declare const codecs: {
    readonly boolean: {
        serialize: (v: boolean) => string;
        parse: (raw: string) => boolean;
        validate: (v: boolean) => boolean;
    };
    readonly number: (range?: {
        min?: number;
        max?: number;
    }) => {
        serialize: StringConstructor;
        parse: NumberConstructor;
        validate: (v: number) => boolean;
    };
    readonly string: <T extends string>(allowed?: readonly T[]) => {
        serialize: (v: T) => string;
        parse: (raw: string) => T;
        validate: (v: T) => boolean;
    };
};
export declare function persisted<T>(key: string, initial: T, options?: PersistedOptions<T>): State<T>;
