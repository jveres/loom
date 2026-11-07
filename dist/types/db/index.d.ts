import type { Database, DatabaseOptions, Schema } from "./types.js";
export { TransactionContractError } from "./transaction.js";
export type { Database, DatabaseOptions, DbEntry, DbKey, IndexRead, KeyRange, ReadStore, ReadTransaction, Scan, Schema, StoreName, StoreShape, WriteStore, WriteTransaction, } from "./types.js";
/** Open an explicitly owned database. Importing this module installs nothing. */
export declare function openDatabase<S extends Schema<S>>(options: DatabaseOptions): Promise<Database<S>>;
