import { type NodeOptions } from "./loom.js";
export interface Revisions {
    /** Tracked read of `path`'s revision — subscribes the caller. */
    read(path: string): number;
    /** Bump `paths` and their ancestors; one batch, each cell once. */
    invalidate(...paths: readonly string[]): void;
}
export interface RevisionsOptions extends NodeOptions {
    /** The path separator (default "."). */
    readonly separator?: string;
}
export declare function revisions(options?: RevisionsOptions): Revisions;
