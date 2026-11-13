// revisions(options?) — a keyed revision bus with ANCESTOR-PATH
// semantics: `read(path)` is a tracked read of the path's revision
// (a lazily created counter per path), `invalidate(...paths)` bumps
// each path AND its dotted ancestors up to the root (""), batched and
// de-duplicated so every dependent runs once. A dependent that reads
// "a.b" re-runs for writes at "a.b" or "a.b.c", never for "a.x"; a
// root reader ("") re-runs for everything. The one-key form (a single
// "document version") is `read("")`/`invalidate("")`.
//
// Paths with no cell cost nothing to invalidate (no reader, no work).
import {
  batch,
  hasStateSubscribers,
  type NodeOptions,
  type State,
  state,
  untrack,
  update,
} from "./loom.js";

export interface Revisions {
  /** Tracked read of `path`'s revision — subscribes the caller. */
  read(path: string): number;
  /** Bump `paths` and their ancestors; one batch, each cell once. */
  invalidate(...paths: readonly string[]): void;
  /** Retained path cells, including cells without subscribers. */
  readonly size: number;
  /** Drop matching unsubscribed paths (all by default). Recreated counters start at zero. */
  prune(match?: string | ((path: string) => boolean)): number;
}

export interface RevisionsOptions extends NodeOptions {
  /** The path separator (default "."). */
  readonly separator?: string;
}

const incrementRevision = (n: number): number => n + 1;

export function revisions(options: RevisionsOptions = {}): Revisions {
  const separator = options.separator ?? ".";
  if (separator.length === 0)
    throw new RangeError("Revision separator must not be empty.");
  const labelPrefix = options.label;
  const baseOptions: NodeOptions | undefined = options.internal
    ? { internal: true }
    : undefined;
  const cells = new Map<string, State<number>>();
  return {
    get size() {
      return cells.size;
    },
    prune(match) {
      return untrack(() => {
        const test =
          typeof match === "string"
            ? (path: string): boolean => path.includes(match)
            : match;
        let dropped = 0;
        for (const [path, found] of cells) {
          if (
            (test === undefined || test(path)) &&
            !hasStateSubscribers(found)
          ) {
            cells.delete(path);
            dropped++;
          }
        }
        return dropped;
      });
    },
    read(path) {
      let found = cells.get(path);
      if (found === undefined) {
        found = state(
          0,
          labelPrefix !== undefined
            ? {
                label: `${labelPrefix}.${path || "root"}`,
                ...(baseOptions ?? {}),
              }
            : baseOptions,
        );
        cells.set(path, found);
      }
      return found();
    },
    invalidate(...paths) {
      if (!cells.size || !paths.length) return;
      const seen = paths.length > 1 ? new Set<string>() : undefined;
      batch(() => {
        for (let current of paths) {
          for (;;) {
            if (seen) {
              if (seen.has(current)) break;
              seen.add(current);
            }
            const found = cells.get(current);
            if (found) update(found, incrementRevision);
            if (!current) break;
            const split = current.lastIndexOf(separator);
            current = split < 0 ? "" : current.slice(0, split);
          }
        }
      });
    },
  };
}
