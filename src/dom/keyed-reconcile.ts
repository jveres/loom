import { untrack } from "../core/tracking.js";
import type { Read } from "../loom.js";
import { removeNodes, withConstructionRollback } from "./ownership-base.js";
import { positionOrdered } from "./place.js";

/** Called untracked for a reused key whose item changed by reference/value (===). */
export type ListUpdate<T> = (node: Element, item: T, previous: T) => void;

export interface EachOptions<T> {
  readonly update?: ListUpdate<T>;
}

export interface ListOptions<T> extends EachOptions<T> {
  readonly signal?: AbortSignal;
  readonly key: (item: T) => string | number;
  readonly render: (item: T, key: string) => Element;
  readonly reorder?: Read<boolean>;
}

export type LoomKey = string | number;

export interface RowUpdates<T> {
  readonly update: ListUpdate<T>;
  readonly items: Map<LoomKey, T>;
}

// Validate identities before rendering, stage new resources, then commit placement
// before retiring old rows. Both keyed APIs share these failure guarantees.
export function reconcileKeyed<T>(
  parent: Node,
  before: Node | null,
  items: readonly T[],
  nodes: Map<LoomKey, Element>,
  key: (item: T) => LoomKey,
  render: (item: T, key: string) => Element,
  reorder = true,
  updates?: RowUpdates<T>,
): void {
  const seen = new Set<LoomKey>();
  const keys = new Array<LoomKey>(items.length);
  for (let index = 0; index < items.length; index++) {
    const k = key(items[index] as T);
    if (seen.has(k)) throw new Error(`Duplicate Loom key "${k}".`);
    seen.add(k);
    keys[index] = k;
  }

  const created = new Map<LoomKey, Element>();
  const ordered = new Array<Element>(items.length);
  withConstructionRollback(() => {
    try {
      for (let index = 0; index < items.length; index++) {
        const k = keys[index] as LoomKey;
        let node = nodes.get(k);
        if (node === undefined) {
          const keyText = String(k);
          node = untrack(() => render(items[index] as T, keyText));
          created.set(k, node);
          node.setAttribute("data-loom-key", keyText);
        } else if (updates && items[index] !== updates.items.get(k)) {
          const current = items[index] as T;
          const previous = updates.items.get(k) as T;
          const existing = node;
          untrack(() => updates.update(existing, current, previous));
        }
        ordered[index] = node;
      }
      if (nodes.size === 0 && ordered.length !== 0) {
        const fragment = (
          parent.ownerDocument ?? document
        ).createDocumentFragment();
        for (const node of ordered) fragment.appendChild(node);
        parent.insertBefore(fragment, before);
      } else if (reorder) {
        positionOrdered(parent, ordered, before);
      } else {
        for (const node of ordered) {
          if (!node.parentNode) parent.appendChild(node);
        }
      }
    } catch (error) {
      // Existing rows remain owned and live; only staged additions are retired.
      removeNodes(created.values(), [error]);
    }
  });

  for (const [k, node] of created) nodes.set(k, node);
  if (updates) {
    for (let index = 0; index < items.length; index++) {
      updates.items.set(keys[index] as LoomKey, items[index] as T);
    }
  }
  if (seen.size !== nodes.size) {
    const outgoing: Element[] = [];
    for (const [k, node] of nodes) {
      if (seen.has(k)) continue;
      nodes.delete(k);
      updates?.items.delete(k);
      outgoing.push(node);
    }
    removeNodes(outgoing);
  }
}
