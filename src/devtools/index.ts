// The inspector defers its heavy refreshes; loading the lane here keeps mountInspector self-contained.
import "loom/defer";

// loom/devtools — the floating dev panel (formerly loom/inspect). Public surface only; the
// implementation lives in ./panel and its sibling modules (css, …).
export {
  inspectorMounted,
  mountInspector,
  toggleInspector,
  unmountInspector,
} from "./panel.js";
