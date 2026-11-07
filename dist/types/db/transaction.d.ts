import type { Schema, StoreName, WriteTransaction } from "./types.js";
/** A callback outlived its native transaction. Never retry a committed write. */
export declare class TransactionContractError extends Error {
    readonly committed: boolean;
    constructor(message: string, committed: boolean, options?: ErrorOptions);
}
export declare function storeNames(stores: readonly string[]): string[];
export declare function transact<S extends Schema<S>, N extends StoreName<S>, T>(database: IDBDatabase, stores: readonly N[], mode: IDBTransactionMode, body: (tx: WriteTransaction<S, N>) => T | Promise<T>, committed: (stores: readonly string[]) => void, settled: () => void): Promise<T>;
