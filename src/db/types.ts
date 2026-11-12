import type { Resource } from "../async/index.js";
import type { Read } from "../loom.js";

export type DbKey = string | number | readonly DbKey[];
export interface StoreShape {
  key: DbKey;
  value: unknown;
  indexes: Record<string, DbKey>;
}
export type Schema<S> = { [N in keyof S]: StoreShape };
export type StoreName<S> = Extract<keyof S, string>;

export type KeyRange<K extends DbKey> =
  | {
      only: K;
      lower?: never;
      upper?: never;
      lowerOpen?: never;
      upperOpen?: never;
    }
  | {
      only?: never;
      lower?: K;
      upper?: K;
      lowerOpen?: boolean;
      upperOpen?: boolean;
    };

export interface Scan<K extends DbKey> {
  range?: KeyRange<K>;
  direction?: "next" | "prev";
  limit: number;
}
export interface DbEntry<V, P extends DbKey> {
  readonly key: P;
  readonly value: V;
}
export interface IndexRead<V, K extends DbKey, P extends DbKey> {
  entries(options: Scan<K>): Promise<readonly DbEntry<V, P>[]>;
  keys(options: Scan<K>): Promise<readonly P[]>;
  scan(options: Scan<K>): Promise<readonly V[]>;
}
export interface ReadStore<D extends StoreShape>
  extends IndexRead<D["value"], D["key"], D["key"]> {
  get(key: D["key"]): Promise<D["value"] | undefined>;
  index<N extends Extract<keyof D["indexes"], string>>(
    name: N,
  ): IndexRead<D["value"], D["indexes"][N], D["key"]>;
}
export interface WriteStore<D extends StoreShape> extends ReadStore<D> {
  put(key: D["key"], value: D["value"]): Promise<void>;
  delete(key: D["key"]): Promise<void>;
  clear(): Promise<void>;
}
export interface ReadTransaction<S extends Schema<S>, N extends StoreName<S>> {
  store<K extends N>(name: K): ReadStore<S[K]>;
}
export interface WriteTransaction<S extends Schema<S>, N extends StoreName<S>> {
  store<K extends N>(name: K): WriteStore<S[K]>;
}
export interface Database<S extends Schema<S>> {
  readonly connection: Read<"open" | "closed" | "versionchange" | "terminated">;
  readonly crossTab: Read<"broadcast" | "manual">;
  read<N extends StoreName<S>, T>(
    stores: readonly N[],
    body: (tx: ReadTransaction<S, N>) => T | Promise<T>,
  ): Promise<T>;
  write<N extends StoreName<S>, T>(
    stores: readonly N[],
    body: (tx: WriteTransaction<S, N>) => T | Promise<T>,
  ): Promise<T>;
  query<N extends StoreName<S>, T>(
    stores: readonly N[],
    body: (tx: ReadTransaction<S, N>) => T | Promise<T>,
  ): Resource<T>;
  refresh(): void;
  close(): void;
}
export interface DatabaseOptions {
  name: string;
  version: number;
  signal?: AbortSignal;
  upgrade?: (
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number,
    transaction: IDBTransaction,
  ) => undefined;
  onBlocked?: (oldVersion: number, requestedVersion: number) => void;
}
