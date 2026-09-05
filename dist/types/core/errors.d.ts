/** Preserve a single thrown value; aggregate only when several operations failed. */
export declare function throwCollected(errors: readonly unknown[] | undefined, message: string): void;
