export type SyncResult<T> = T extends PromiseLike<unknown> ? never : T;
export declare function isPromiseLike(value: unknown): value is PromiseLike<unknown>;
export declare function ignorePromiseRejection(promise: PromiseLike<unknown>): void;
/** Preserve a single thrown value; aggregate only when several operations failed. */
export declare function throwCollected(errors: readonly unknown[] | undefined, message: string): void;
