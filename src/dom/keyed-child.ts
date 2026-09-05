import { untrack } from "../core/tracking.js";

import {
  onUnmount,
  removeNodes,
  withConstructionRollback,
} from "./ownership-base.js";

/** Replace a host's content only after a different key builds and inserts successfully. */
export function keyedChild(
  host: Element,
): (key: string, build: () => Node) => void {
  let held: string | undefined;
  let active = true;
  onUnmount(host, () => {
    active = false;
  });
  return (key, build) => {
    if (!active || held === key) return;
    const outgoing = [...host.childNodes];
    withConstructionRollback(() => {
      const next = untrack(build);
      host.replaceChildren(next);
    });
    // Placement committed. A failure retiring old content must not rebuild this key.
    held = key;
    removeNodes(outgoing.filter((node) => node.parentNode !== host));
  };
}
