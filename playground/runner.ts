// Compile-and-run pipeline for the editor buffer. Sucrase turns the sample's
// TypeScript + loom JSX into CommonJS in the browser; a require shim resolves
// the bare `loom` / `loom/*` specifiers against statically imported
// entrypoints (the same alias set the repo's tooling uses), so an edited
// sample executes against the live src. No bundler round-trip, no eval of
// remote code — only the buffer the user is typing into.

import * as loom from "loom";
import * as loomAsync from "loom/async";
// Importing the defer lane here installs it once for the whole playground;
// a sample's own `import "loom/defer"` then resolves to this module.
import * as loomDefer from "loom/defer";
import * as loomDevtools from "loom/devtools";
import * as loomDom from "loom/dom";
import * as loomScrollFade from "loom/dom/scroll-fade";
import * as loomVirtualList from "loom/dom/virtual-list";
import * as loomHtml from "loom/html";
import * as loomHtmlJsx from "loom/html/jsx-runtime";
import * as loomJsx from "loom/jsx-runtime";
import * as loomObserve from "loom/observe";
import * as loomSettle from "loom/settle";
import { transform } from "sucrase";

const modules: Record<string, unknown> = {
  loom,
  "loom/async": loomAsync,
  "loom/defer": loomDefer,
  "loom/devtools": loomDevtools,
  "loom/dom": loomDom,
  "loom/dom/scroll-fade": loomScrollFade,
  "loom/dom/virtual-list": loomVirtualList,
  "loom/html": loomHtml,
  "loom/html/jsx-runtime": loomHtmlJsx,
  "loom/html/jsx-dev-runtime": loomHtmlJsx,
  "loom/jsx-runtime": loomJsx,
  "loom/jsx-dev-runtime": loomJsx,
  "loom/observe": loomObserve,
  "loom/settle": loomSettle,
};

function requireShim(name: string): unknown {
  const mod = modules[name];
  if (mod === undefined) {
    throw new Error(
      `unknown module "${name}" — the playground resolves loom entrypoints only`,
    );
  }
  return mod;
}

export interface RunningSample {
  readonly el: Element;
  /** Removes the DOM (disposing node-owned bindings) and stops the scope. */
  dispose(): void;
}

/**
 * Compiles a sample source and mounts its default export — an `Element`, or
 * a function returning one. The whole module body runs inside a `scope()`,
 * so effects, `poll`s, `source`s, resources and settlements a sample creates
 * at top level are owned by the run and die with `dispose()` — a sample only
 * cleans up what loom cannot own (a raw `setInterval`, via `onUnmount`).
 * Throws with a readable message on both compile and runtime errors.
 */
export function runSample(source: string): RunningSample {
  const { code } = transform(source, {
    transforms: ["typescript", "jsx", "imports"],
    jsxRuntime: "automatic",
    jsxImportSource: "loom",
    production: true,
    disableESTransforms: true,
  });
  const moduleShim = { exports: {} as Record<string, unknown> };
  // The Function constructor is the point here: the playground executes the
  // buffer the user is editing, against modules resolved by the shim above.
  const run = new Function("require", "module", "exports", code);
  // Capture a module-body throw instead of letting it escape scope(), so the
  // partially built run can still be stopped before the error surfaces.
  let caught: unknown;
  let failed = false;
  const owner = loom.scope(() => {
    try {
      run(requireShim, moduleShim, moduleShim.exports);
    } catch (error) {
      caught = error;
      failed = true;
    }
  });
  if (failed) {
    owner.stop();
    throw caught;
  }
  const exported = moduleShim.exports["default"];
  const el = typeof exported === "function" ? exported() : exported;
  if (!(el instanceof Element)) {
    owner.stop();
    throw new Error(
      "a sample must `export default` an Element (or a function returning one)",
    );
  }
  return {
    el,
    dispose: () => {
      loomDom.remove(el);
      owner.stop();
    },
  };
}
