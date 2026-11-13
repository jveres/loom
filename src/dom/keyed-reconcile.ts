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

const keyedPass = /* @__PURE__ */ Symbol();
const keyedItem = /* @__PURE__ */ Symbol();
type StampedElement<T = unknown> = Element &
  Record<symbol, number | T | undefined>;
let nextPass = 0;

function dupKey(k: LoomKey): never {
  throw new Error(`Duplicate Loom key "${k}".`);
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
  update?: ListUpdate<T>,
): void {
  const length = items.length;
  const previousSize = nodes.size;
  const pass = ++nextPass;
  const ordered = new Array<Element>(length);
  let keys: LoomKey[] | undefined;
  let reused = 0;
  let newKeys: Set<LoomKey> | undefined;

  for (let index = 0; index < length; index++) {
    const k = key(items[index] as T);
    const existing =
      previousSize > 0
        ? (nodes.get(k) as StampedElement<T> | undefined)
        : undefined;
    if (existing !== undefined) {
      if (existing[keyedPass] === pass) dupKey(k);
      existing[keyedPass] = pass;
      ordered[index] = existing;
      reused++;
      if (keys !== undefined) keys[index] = k;
    } else {
      newKeys ??= new Set();
      if (newKeys.has(k)) dupKey(k);
      newKeys.add(k);
      keys ??= new Array<LoomKey>(length);
      keys[index] = k;
    }
  }

  const place = (): void => {
    if (reorder) positionOrdered(parent, ordered, before);
    else
      for (const node of ordered)
        if (!node.parentNode) parent.appendChild(node);
  };

  if (reused === length && update === undefined) {
    if (length !== 0) place();
  } else {
    let created: [LoomKey, StampedElement<T>][] | undefined;
    withConstructionRollback(() => {
      try {
        untrack(() => {
          for (let index = 0; index < length; index++) {
            let node = ordered[index] as StampedElement<T> | undefined;
            const item = items[index] as T;
            if (node === undefined) {
              const k = (keys as LoomKey[])[index] as LoomKey;
              const keyText = String(k);
              node = render(item, keyText) as StampedElement<T>;
              created ??= [];
              created.push([k, node]);
              node.setAttribute("data-loom-key", keyText);
              ordered[index] = node;
            } else if (update && item !== (node[keyedItem] as T)) {
              update(node, item, node[keyedItem] as T);
            }
          }
        });
        if (previousSize === 0 && length !== 0) {
          const fragment = (
            parent.ownerDocument ?? document
          ).createDocumentFragment();
          for (const node of ordered) fragment.appendChild(node);
          parent.insertBefore(fragment, before);
        } else {
          place();
        }
      } catch (error) {
        removeNodes(created ? created.map((pair) => pair[1]) : [], [error]);
      }
    });
    if (created) {
      for (const [k, node] of created) {
        node[keyedPass] = pass;
        nodes.set(k, node);
      }
    }
    if (update) {
      for (let index = 0; index < length; index++) {
        (ordered[index] as StampedElement<T>)[keyedItem] = items[index] as T;
      }
    }
  }

  if (reused !== previousSize) {
    const outgoing: Element[] = [];
    for (const [k, node] of nodes) {
      if ((node as StampedElement<T>)[keyedPass] === pass) continue;
      nodes.delete(k);
      outgoing.push(node);
    }
    removeNodes(outgoing);
  }
}
