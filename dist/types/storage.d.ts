import { type State, type Stop } from "./loom.js";
/** Explicit decoding is required at the storage boundary. */
export interface StorageSlotOptions<T> {
    readonly serialize?: (value: T) => string;
    readonly parse: (raw: string) => T;
    readonly validate?: (value: T) => boolean;
    readonly storage?: Storage;
}
export interface StorageSlot<T> {
    /** The stored value, or undefined: nothing stored, unparsable, or rejected by validate. */
    load(): T | undefined;
    /** Store the value; false when storage is absent or refused (quota, permission). */
    store(value: T): boolean;
    /** Remove the entry (guarded). */
    clear(): void;
}
export declare function storageSlot<T>(key: string, options: StorageSlotOptions<T>): StorageSlot<T>;
declare function stringCodec(): StorageSlotOptions<string>;
declare function stringCodec<T extends string>(allowed: readonly T[]): StorageSlotOptions<T>;
/** Decoders reject invalid storage data. Spread a codec to select storage. */
export declare const codecs: {
    readonly json: <T>(validate: (value: unknown) => value is T) => StorageSlotOptions<T>;
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
        parse: (raw: string) => number;
        validate: (v: number) => boolean;
    };
    readonly string: typeof stringCodec;
};
export interface BindStorageOptions {
    readonly signal?: AbortSignal;
    readonly delayMs?: number;
}
export interface StorageBinding {
    /** Attempt the pending write now. True means no pending write or a successful write. */
    readonly flush: () => boolean;
    readonly stop: Stop;
}
/** Load once without write-back, then persist changes for this explicit lifetime. */
export declare function bindStorage<T>(cell: State<T>, slot: StorageSlot<NoInfer<T>>, options?: BindStorageOptions): StorageBinding;
export {};
