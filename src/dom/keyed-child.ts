// keyedChild(host) — the imperative sibling of match()/when() for hosts
// driven by LAYOUT PASSES instead of signals: (key, build) rebuilds the
// host's single child only when the key moves. A relayout that runs per
// resize delivery or per document edit would otherwise replaceChildren
// (a remove+insert — a repaint) on every pass, flashing unchanged
// content. The previous child is torn down the Loom way (its owned
// bindings die), and the host's teardown releases the current one.
import { replaceChildren } from "./index.js";

export function keyedChild(
  host: Element,
): (key: string, build: () => Node) => void {
  let held: string | undefined;
  return (key, build) => {
    if (held === key) return;
    held = key;
    replaceChildren(host, build());
  };
}
